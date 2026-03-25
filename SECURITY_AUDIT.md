# SECURITY_AUDIT.md

## Risk Assessment

**Overall: High**

The application has solid parameterized query usage throughout and proper IDOR checks on most user-owned resources. However, there are critical gaps: no `helmet()` middleware, no CORS configuration, no rate limiting on authentication endpoints, JWT algorithm is not pinned (algorithm confusion possible), refresh tokens can be used where access tokens are expected (no `type` field validation), error responses use `message` instead of `error` (violating AGENTS.md), and the `forgotPassword` endpoint leaks email existence via timing difference (fixed with generic response but still leaks via timing). PII is logged to console without environment guards. The `deleteUser` endpoint lacks confirmation and cascading JWT invalidation.

---

## Findings

---

### [SEC-1] Missing `algorithm` option in `jwt.verify()` — Algorithm Confusion Attack | Severity: Critical
- **Location**: `middlewares/auth.js` · `verifyToken` · line 13; `auth.controller.js` · `resetPassword` · line 294; `auth.controller.js` · `refreshToken` · line 345
- **The Exploit**: If the JWT_SECRET_KEY happens to be predictable or the server key is an RSA public key, an attacker can forge a token signed with `HS256` using the public key as the HMAC secret. Without specifying `algorithms: ['HS256']`, `jwt.verify()` accepts whatever algorithm the token header declares, including `none`.
- **The Fix**:
```js
// middlewares/auth.js
const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] });

// auth.controller.js · refreshToken
const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET_KEY, { algorithms: ['HS256'] });

// auth.controller.js · resetPassword
decoded = jwt.verify(temporary_token, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] });
```
- **agents.md Violation**: Not explicitly listed, but falls under auth safety expectations.

---

### [SEC-2] No JWT `type` validation — Refresh token accepted as access token | Severity: Critical
- **Location**: `middlewares/auth.js` · `verifyToken` · line 13; `utils/jwt.js` · `generateTokens` · lines 4–24
- **The Exploit**: Access tokens contain `{ userId, name, email, phone, role, is_active }` and are signed with `JWT_SECRET_KEY`. If `JWT_SECRET_KEY === JWT_REFRESH_SECRET_KEY` (a common misconfiguration), the refresh token (which contains only `{ userId }`) would pass `verifyToken`, giving a 7-day-lived token access token privileges. Even without key collision, there's no `type: 'access'` field to validate.
- **The Fix**: Add `type` to both tokens and validate it:
```js
// utils/jwt.js
const accessToken = jwt.sign(
    { userId: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, is_active: user.is_active, type: 'access' },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '15m' }
);

const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET_KEY,
    { expiresIn: '7d' }
);

// middlewares/auth.js
if (decoded.type !== 'access')
    return res.status(401).json({ success: false, error: 'Invalid token type.' });
```
- **agents.md Violation**: Yes — "JWT type field not checked" is explicitly flagged as a known concern.

---

### [SEC-3] No `helmet()` middleware — Missing security headers | Severity: High
- **Location**: `app.js` · lines 14–16
- **The Exploit**: Without `helmet()`, the server sends no `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, or `X-XSS-Protection` headers. This enables clickjacking, MIME sniffing attacks, and downgrades.
- **The Fix**:
```js
import helmet from 'helmet';
// ...
app.use(helmet());
```
- **agents.md Violation**: Yes — "Missing `helmet()` or security headers" is explicitly listed.

---

### [SEC-4] No CORS configuration | Severity: High
- **Location**: `app.js` — no `cors()` middleware present
- **The Exploit**: Without CORS middleware, the browser default is same-origin. If the API and frontend are on different origins (which they are — Vite dev server vs Express), requests will fail in development. More critically, if CORS is later added as `cors({ origin: '*' })` to fix this, all origins can access the API.
- **The Fix**:
```js
import cors from 'cors';
// ...
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
}));
```
- **agents.md Violation**: Yes — "CORS configured to `*` in production".

---

### [SEC-5] No rate limiting on auth endpoints | Severity: High
- **Location**: `routes/auth.router.js` · lines 18–23
- **The Exploit**: Endpoints `/sign-in`, `/forgot-password`, `/check-reset-code`, `/reset-password` have no rate limiting. An attacker can brute-force login, brute-force the 6-character hex reset code (16^6 = ~16.7M combinations, but bcrypt makes timing ~100ms/attempt so this is slower), or flood `forgotPassword` to cause email spam.
- **The Fix**:
```js
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { success: false, error: 'Too many requests. Please try again later.' },
});

router.post('/sign-in', authLimiter, signIn);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/check-reset-code', authLimiter, checkResetCode);
router.post('/reset-password', authLimiter, resetPassword);
```
- **agents.md Violation**: Yes — "Rate limiting absent on auth endpoints".

---

### [SEC-6] No `express.json()` body size limit | Severity: High
- **Location**: `app.js` · line 16
- **The Exploit**: `app.use(express.json())` defaults to `100kb` (Express 4.x), but this is not explicitly configured. An attacker could send a large JSON body to cause high memory usage. More importantly, JSONB fields like `extras` or `conditions` accept arbitrary JSON structures without size constraints.
- **The Fix**:
```js
app.use(express.json({ limit: '10kb' }));
```
- **agents.md Violation**: No explicit rule, but falls under security misconfiguration.

---

### [SEC-7] Reset code not invalidated after password reset | Severity: Medium
- **Location**: `auth.controller.js` · `resetPassword` · lines 281–337
- **The Exploit**: `checkResetCode` clears the `reset_code` (line 255–258), then issues a temporary JWT. However, `resetPassword` does not invalidate the temporary token after use. An attacker who intercepts the temporary token has a 5-minute window to reset the password multiple times. Additionally, there's no mechanism to invalidate pending temporary tokens if the user requests a new reset code.
- **The Fix**: After password reset, invalidate all existing sessions by updating the user's `updated_at` timestamp and include it in the JWT for verification. Or, use a single-use nonce stored in the DB and checked at `resetPassword` time.
- **agents.md Violation**: Yes — "Temporary tokens reusable after password reset".

---

### [SEC-8] `cancelOrder` IDOR — missing `user_id` in SELECT for customer role | Severity: Medium
- **Location**: `orders.controller.js` · `cancelOrder` · lines 490–520
- **The Exploit**: The query only selects `id, branch_id` from orders. Then line 516 checks `order.user_id !== user.id`, but `order.user_id` was never selected — it's always `undefined`. This means the IDOR check `!order.user_id || order.user_id !== user.id` will always evaluate to `true` (since `!undefined === true`), causing the error to always trigger for customers.
- **Wait**: Actually, this means customers can NEVER cancel orders — the check always throws. This is a **bug**, not an IDOR vulnerability per se. But it was reported as fixed in conversation `3d892ee1`. Let me re-read: `order.user_id` — the SELECT does not include `user_id`. So `order.user_id` is `undefined`. `!undefined` is `true`, so it throws. This is a **denial of feature**, not a security hole.
- **The Fix**: Include `user_id` in the SELECT:
```js
const { rows: orderRows } = await db.query(
    'SELECT id, user_id, branch_id, status FROM orders WHERE id = $1 LIMIT 1',
    [id],
);
```
- **agents.md Violation**: No, but it's a correctness bug that breaks RBAC logic.

---

### [SEC-9] PII in `console.log` without environment guard | Severity: Medium
- **Location**: `auth.controller.js` · `logout` · line 560
- **The Exploit**: `console.log(\`User ${userId} logged out at ${...}\`);` — logs user UUID on every logout. While UUIDs are not directly PII, combined with other logs they can be used for user tracking. No `NODE_ENV` guard.
- **The Fix**:
```js
if (process.env.NODE_ENV === 'development')
    console.log(`User ${userId} logged out at ${new Date().toISOString()}`);
```
- **agents.md Violation**: Yes — "PII console.log only in development".

---

### [SEC-10] Email enumeration via timing in `signIn` | Severity: Medium
- **Location**: `auth.controller.js` · `signIn` · lines 118–123
- **The Exploit**: When a user is not found, the response is immediate (`throw ApiError.notFound`). When a user IS found, `bcrypt.compare` runs (~100ms). An attacker can measure response time to determine if an email/phone exists.
- **The Fix**: Always run a dummy `bcrypt.compare` when user is not found to normalize timing:
```js
if (!existingUser) {
    await bcrypt.compare(password, '$2a$10$invalidhashpaddingtomakeitwork');
    throw ApiError.unauthorized('Invalid credentials.');
}
```
Also change the error from `notFound` to `unauthorized` with a generic message.
- **agents.md Violation**: Yes — "Email enumeration" concern.

---

### [SEC-11] Global error handler leaks `err.message` in production | Severity: Medium
- **Location**: `app.js` · lines 53–58
- **The Exploit**: `err.message` may contain internal details like SQL errors, file paths, or stack traces. Sending this to the client in production leaks implementation details.
- **The Fix**:
```js
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 && process.env.NODE_ENV !== 'development'
        ? 'Internal server error'
        : err.message || 'Internal server error';
    res.status(statusCode).json({ success: false, error: message });
});
```
- **agents.md Violation**: Yes — "Full error objects (stack traces) leaking in production responses".

---

### [SEC-12] `send.mail.js` uses double quotes | Severity: Low
- **Location**: `utils/send.mail.js` · lines 16, 31
- **The Exploit**: Not a security issue per se. But flagged under `send.mail.js` · `sendEmail` · line 16: `console.warn("Email configuration is missing...")` — uses double quotes.
- **agents.md Violation**: Style rule: single quotes only.

---

### [SEC-13] `validateCoupon` accepts `userId` from `req.body` | Severity: Medium
- **Location**: `cart.controller.js` · `validateCoupon` · line 508–509
- **The Exploit**:
```js
const { code, cartId, userId } = req.body;
const effectiveUserId = userId || req.user?.id || null;
```
A customer can pass `userId: '<another-user-uuid>'` in the body. The `effectiveUserId` is then used in `calculateCouponDiscount` for the `ILK15` first-order check. An attacker with existing orders can bypass the first-order check by passing a different user's UUID who has zero orders.
- **The Fix**: Always use the authenticated user's ID:
```js
const effectiveUserId = req.user?.id;
```
Remove `userId` from `req.body` destructuring.
- **agents.md Violation**: Yes — IDOR / broken access control.

---

### [SEC-14] `deleteUser` has no confirmation step | Severity: Low
- **Location**: `auth.controller.js` · `deleteUser` · lines 575–600
- **The Exploit**: A single authenticated DELETE request permanently removes the user. If an attacker steals a valid JWT, they can irreversibly delete the account. There's no password confirmation or delay.
- **The Fix**: Require current password in the request body before deleting:
```js
const { password } = req.body;
if (!password) throw ApiError.badRequest('Password is required to delete account.');
const isValid = await bcrypt.compare(password, user.password);
if (!isValid) throw ApiError.unauthorized('Invalid password.');
```
- **agents.md Violation**: No explicit rule.

---

### [SEC-15] `ApiError` imported but unused in `roles.js` | Severity: Low
- **Location**: `middlewares/roles.js` · line 1
- **The Exploit**: No security risk, but `ApiError` is imported and never used. Previously it was likely used for `throw ApiError.unauthorized()` which is the known gotcha in AGENTS.md.
- **The Fix**: Remove the unused import.
- **agents.md Violation**: Dead code — code quality issue.

---

### [SEC-16] `createOrder` does not verify product availability for each cart item | Severity: Low
- **Location**: `orders.controller.js` · `createOrder` · lines 59–65
- **The Exploit**: Cart items are fetched, but only their existence is checked (length > 0). Individual products might have been marked `is_available = false` since being added to the cart. The order is created with potentially unavailable products.
- **The Fix**: Join with `products` and filter `WHERE p.is_available = true`, then compare counts.
- **agents.md Violation**: No explicit rule, but reliability concern.

---

## Style Violations

---

### [STYLE-1] Error response uses `message` key instead of `error` key in all catch blocks | Rule: Response contract
- **Location**: Every controller catch block across all files
- **Current code**:
```js
res.status(statusCode).json({
    success: false,
    message: error.message || 'Sign-up Failed',
});
```
- **Corrected code**:
```js
res.status(statusCode).json({
    success: false,
    error: error.message || 'Sign-up Failed',
});
```
- **Scope**: `auth.controller.js` (lines 86–90, 157–162, 225–230, 273–278, 331–336, 385–401, 504–517, 541–547, 566–572, 594–599), `cart.controller.js` (lines 193–198, 307–311, 417–423, 463–469, 497–503, 609–614), `orders.controller.js` (lines 195–199, 277–282, 343–348, 405–411, 469–475, 532–538), `products.controller.js` (lines 48–54, 87–93), `branches.controller.js` (lines 30–36, 59–65), `categories.controller.js` (lines 16–22, 44–50)

---

### [STYLE-2] Missing fallback on `error.message` in some catch blocks | Rule: `error.message || 'fallback'`
- **Location**: `auth.controller.js` · `getMe` · line 545, `auth.controller.js` · `logout` · line 570, `auth.controller.js` · `deleteUser` · line 597 — all have fallbacks. All controllers appear to have fallbacks. ✅ This rule is satisfied.

---

### [STYLE-3] Double quotes used instead of single quotes | Rule: Single quotes only
- **Location**: `send.mail.js` · line 16, 31
- **Current code**:
```js
console.warn("Email configuration is missing, skipping actual send logic.");
throw ApiError.internal("Failed to send email");
```
- **Corrected code**:
```js
console.warn('Email configuration is missing, skipping actual send logic.');
throw ApiError.internal('Failed to send email');
```

---

### [STYLE-4] Double quotes in `categories.controller.js` SQL strings | Rule: Single quotes only
- **Location**: `categories.controller.js` · lines 7, 32
- **Current code**: SQL strings wrapped in double quotes: `"SELECT c.id, ... AND po.option_type = 'size' ..."`
- **Corrected code**: Switch outer quotes to single quotes with escaped inner quotes, or use string concatenation to avoid escaping:
```js
const { rows } = await db.query(
    'SELECT c.id, c.name, c.description, c.sort_order, c.is_active, EXISTS(SELECT 1 FROM products p JOIN product_options po ON p.id = po.product_id WHERE p.category_id = c.id AND po.option_type = ' + "'size'" + ' AND po.is_available = true) AS has_sizes, EXISTS(SELECT 1 FROM products p JOIN product_options po ON p.id = po.product_id WHERE p.category_id = c.id AND po.option_type = ' + "'milk'" + ' AND po.is_available = true) AS has_milk_options FROM categories c WHERE c.is_active = true ORDER BY c.sort_order ASC',
    [],
);
```
**Note**: This is a tricky case — double quotes are used here because the SQL contains single quotes. The pragmatic fix is to keep double quotes for SQL strings that contain SQL single quotes, or use escaped single quotes (`\'`). Document this as an acceptable exception or use template literal (but that violates single-line SQL rule). Best approach: use `$$` dollar-quoting in PostgreSQL or accept double quotes as SQL-exception.

---

### [STYLE-5] Missing JSDoc on every exported function | Rule: JSDoc required
- **Location**: All exported functions across all controller files lack JSDoc comments:
  - `auth.controller.js`: `signUp`, `signIn`, `forgotPassword`, `checkResetCode`, `resetPassword`, `refreshToken`, `updateProfile`, `getMe`, `logout`, `deleteUser`
  - `cart.controller.js`: `getCart`, `addItemToCart`, `updateCartItem`, `removeCartItem`, `clearCart`, `validateCoupon`
  - `orders.controller.js`: `createOrder`, `getMyOrders`, `getOrders`, `getOrderById`, `updateOrderStatus`, `cancelOrder`
  - `products.controller.js`: `getProducts`, `getProductById`
  - `branches.controller.js`: `getBranches`, `getBranchId`
  - `categories.controller.js`: `getCategories`, `getCategoryById`
  - `utils/jwt.js`: `generateTokens`
  - `utils/coupon.util.js`: `calculateCouponDiscount`
  - `utils/send.mail.js`: `sendEmail`
  - `middlewares/auth.js`: `verifyToken`
  - `middlewares/roles.js`: `requireRole`
- **Example fix**:
```js
/**
 * Registers a new customer account.
 * Validates email format, password strength, and uniqueness.
 * Returns JWT tokens and user profile on success.
 */
export const signUp = async (req, res) => {
```

---

### [STYLE-6] `error.js` uses default export | Rule: Named exports in utility files
- **Location**: `utils/error.js` · line 34
- **Current code**: `export default ApiError;`
- **Note**: The canonical style specifies named exports for controllers. `error.js` is a utility class, and default export is the established pattern in this codebase. This is borderline — the existing import pattern `import ApiError from '../utils/error.js'` is used everywhere. **Recommend keeping as-is** since changing it would require updating all import statements for no functional benefit.

---

### [STYLE-7] Unused import `ApiError` in `roles.js` | Rule: No unused imports
- **Location**: `middlewares/roles.js` · line 1
- **Current code**: `import ApiError from '../utils/error.js';`
- **Corrected code**: Remove the import line entirely.

---

### [STYLE-8] Template literal in `roles.js` error message instead of string concatenation | Rule: Single quotes
- **Location**: `middlewares/roles.js` · line 14
- **Current code**:
```js
message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
```
- **Corrected code**:
```js
error: 'Access denied. Required roles: ' + allowedRoles.join(', '),
```
Note: Also fixes the `message` → `error` key issue.

---

### [STYLE-9] Error responses in `verifyToken` use `message` key instead of `error` | Rule: Error response contract
- **Location**: `middlewares/auth.js` · lines 9, 18, 36, 41
- **Current code**:
```js
return res.status(401).json({ success: false, message: 'Access token is required' });
```
- **Corrected code**:
```js
return res.status(401).json({ success: false, error: 'Access token is required' });
```

---

### [STYLE-10] `app.js` error handler uses `message` key | Rule: Error response contract
- **Location**: `app.js` · line 57
- **Current code**:
```js
.json({ success: false, message: err.message || 'Internal server error' });
```
- **Corrected code**:
```js
.json({ success: false, error: err.message || 'Internal server error' });
```

---

### [STYLE-11] `app.js` 404 handler uses `message` key | Rule: Error response contract
- **Location**: `app.js` · line 50
- **Current code**:
```js
res.status(404).json({ success: false, message: 'Route not found' });
```
- **Corrected code**:
```js
res.status(404).json({ success: false, error: 'Route not found' });
```

---

### [STYLE-12] Import order inconsistencies | Rule: local utils → local lib → named utils → third-party
- **Location**: `auth.controller.js` · lines 1–7
- **Current code**:
```js
import ApiError from '../utils/error.js';      // local util ✅
import db from '../lib/db/database.js';          // local lib ✅
import { generateTokens } from '../utils/jwt.js'; // named util ✅
import bcrypt from 'bcryptjs';                   // third-party ✅
import crypto from 'crypto';                     // third-party ✅
import jwt from 'jsonwebtoken';                  // third-party ✅
import sendEmail from '../utils/send.mail.js';   // ❌ local util after third-party
```
- **Corrected code**:
```js
import ApiError from '../utils/error.js';
import sendEmail from '../utils/send.mail.js';
import db from '../lib/db/database.js';
import { generateTokens } from '../utils/jwt.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
```

---

### [STYLE-13] `roles.js` error response uses `message` key in non-auth context | Rule: Error response contract
- **Location**: `middlewares/roles.js` · lines 8, 14
- **Current code**: `message: 'Authentication required.'` and `message: \`Access denied...\``
- **Corrected code**: Change `message` to `error` in both places.

---

## Hardening Checklist

- [x] Parameterized queries on all endpoints
- [x] IDOR checks on most user-owned resources (cart items, orders)
- [ ] JWT type validation in every token verify call
- [ ] Rate limiting on `/auth/*` routes
- [ ] `helmet()` middleware active
- [x] No password hashes in RETURNING clauses (verified — only returns safe fields)
- [x] No synchronous throws in middleware (roles.js uses `return res.json()`)
- [x] Email enumeration prevented in `forgotPassword` (generic response)
- [ ] Email enumeration prevented in `signIn` (timing leak)
- [ ] PII `console.log` only in development
- [ ] All dynamic UPDATE queries guarded against empty segments (verified ✅ in `updateProfile`)
- [ ] `algorithm` option specified in all `jwt.verify()` calls
- [ ] Error responses use `error` key (not `message`)
- [ ] `validateCoupon` userId from body removed (IDOR vector)
- [ ] Body size limit on `express.json()`
- [ ] CORS properly configured
