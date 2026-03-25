# Implement All Security Audit Findings

Implement every SEC finding (1–16) and STYLE violation (1–13) from [SECURITY_AUDIT.md](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/SECURITY_AUDIT.md) in a single pass. Total: **13 files modified, 2 npm packages installed**.

## User Review Required

> [!IMPORTANT]
> **STYLE-1 (error response `message` → `error` key)** changes the API contract. The frontend [error.utils.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/web/src/constants/error.utils.js) currently reads `data?.message` — it must be updated to `data?.error` in the same commit. All frontend stores and components that read error responses will automatically pick up the new key.

> [!WARNING]
> **SEC-2 (JWT type field)** will invalidate all existing access tokens and refresh tokens because the new [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#3-45) requires `decoded.type === 'access'`. All logged-in users will need to re-login after deployment.

> [!IMPORTANT]
> **SEC-4 (CORS)** — The plan uses `ALLOWED_ORIGINS` env var with fallback to `http://localhost:5173`. You will need to add `ALLOWED_ORIGINS` to your [.env](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/.env) file for production.

---

## Proposed Changes

### Dependencies

#### [MODIFY] [package.json](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/package.json)
- Install `helmet` and `express-rate-limit` via npm

---

### App Entry Point

#### [MODIFY] [app.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/app.js)

| Finding | Change |
|---------|--------|
| SEC-3 | Add `helmet()` middleware |
| SEC-4 | Add `cors()` with `ALLOWED_ORIGINS` env var |
| SEC-6 | Add `{ limit: '10kb' }` to `express.json()` |
| SEC-11 | Error handler: suppress 500 messages in production |
| STYLE-10 | Error handler: `message` → `error` key |
| STYLE-11 | 404 handler: `message` → `error` key |

---

### JWT Utility

#### [MODIFY] [jwt.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/jwt.js)

| Finding | Change |
|---------|--------|
| SEC-2 | Add `type: 'access'` to access token payload |
| SEC-2 | Add `type: 'refresh'` to refresh token payload |
| STYLE-5 | Add JSDoc to [generateTokens](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/jwt.js#3-25) |

---

### Auth Middleware

#### [MODIFY] [auth.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js)

| Finding | Change |
|---------|--------|
| SEC-1 | Pin `{ algorithms: ['HS256'] }` on `jwt.verify()` |
| SEC-2 | Validate `decoded.type === 'access'` after verify |
| STYLE-9 | All error responses: `message` → `error` key |
| STYLE-5 | Add JSDoc to [verifyToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js#3-45) |

---

### Roles Middleware

#### [MODIFY] [roles.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js)

| Finding | Change |
|---------|--------|
| SEC-15/STYLE-7 | Remove unused [ApiError](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/error.js#1-33) import |
| STYLE-8 | Replace template literal with string concatenation |
| STYLE-13 | `message` → `error` key in both responses |
| STYLE-5 | Add JSDoc to [requireRole](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js#3-20) |

---

### Auth Controller

#### [MODIFY] [auth.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js)

| Finding | Change |
|---------|--------|
| SEC-1 | Pin algorithm in [resetPassword](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#281-338) jwt.verify (line 294) |
| SEC-1 | Pin algorithm in [refreshToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#339-403) jwt.verify (line 345) |
| SEC-10 | [signIn](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#93-164): dummy bcrypt.compare + generic error on user-not-found |
| SEC-9 | [logout](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#550-574): wrap console.log in `NODE_ENV === 'development'` guard |
| SEC-14 | [deleteUser](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#575-601): require password confirmation before delete |
| STYLE-1 | All catch blocks: `message` → `error` key (~10 locations) |
| STYLE-12 | Move [sendEmail](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/send.mail.js#14-34) import before `db` import |
| STYLE-5 | Add JSDoc to all 10 exported functions |

---

### Auth Router

#### [MODIFY] [auth.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/auth.router.js)

| Finding | Change |
|---------|--------|
| SEC-5 | Add `express-rate-limit` authLimiter to sign-in, forgot-password, check-reset-code, reset-password |

---

### Cart Controller

#### [MODIFY] [cart.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js)

| Finding | Change |
|---------|--------|
| SEC-13 | [validateCoupon](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js#506-617): remove `userId` from req.body, use `req.user?.id` only |
| STYLE-1 | All catch blocks: `message` → `error` key (~6 locations) |
| STYLE-5 | Add JSDoc to all 6 exported functions |

---

### Orders Controller

#### [MODIFY] [orders.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js)

| Finding | Change |
|---------|--------|
| SEC-8 | [cancelOrder](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js#478-540): add `user_id, status` to SELECT query |
| STYLE-1 | All catch blocks: `message` → `error` key (~6 locations) |
| STYLE-5 | Add JSDoc to all 6 exported functions |

---

### Products Controller

#### [MODIFY] [products.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/products.controller.js)

| Finding | Change |
|---------|--------|
| STYLE-1 | Catch blocks: `message` → `error` key |
| STYLE-5 | Add JSDoc to [getProducts](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/products.controller.js#4-56), [getProductById](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/products.controller.js#57-95) |

---

### Branches Controller

#### [MODIFY] [branches.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/branches.controller.js)

| Finding | Change |
|---------|--------|
| STYLE-1 | Catch blocks: `message` → `error` key |
| STYLE-5 | Add JSDoc to [getBranches](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/branches.controller.js#4-38), [getBranchId](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/branches.controller.js#39-67) |

---

### Categories Controller

#### [MODIFY] [categories.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/categories.controller.js)

| Finding | Change |
|---------|--------|
| STYLE-1 | Catch blocks: `message` → `error` key |
| STYLE-5 | Add JSDoc to [getCategories](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/categories.controller.js#4-24), [getCategoryById](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/categories.controller.js#25-52) |

---

### Send Mail Utility

#### [MODIFY] [send.mail.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/send.mail.js)

| Finding | Change |
|---------|--------|
| SEC-12/STYLE-3 | Double quotes → single quotes (lines 16, 31) |
| STYLE-5 | Add JSDoc to [sendEmail](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/send.mail.js#14-34) |

---

### Coupon Utility

#### [MODIFY] [coupon.util.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/coupon.util.js)

| Finding | Change |
|---------|--------|
| STYLE-5 | Add JSDoc to [calculateCouponDiscount](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/coupon.util.js#3-84) |

---

### Frontend Error Handler

#### [MODIFY] [error.utils.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/web/src/constants/error.utils.js)

| Finding | Change |
|---------|--------|
| STYLE-1 compat | Change `data?.message` → `data?.error` (line 18) to match new API contract |

---

## Not Implementing

| Finding | Reason |
|---------|--------|
| SEC-7 (reset token reuse) | Requires DB schema change (nonce column) — out of scope for code-only fixes |
| SEC-16 (product availability check in createOrder) | Low severity, reliability concern — worth a follow-up PR |
| STYLE-4 (double-quoted SQL in categories) | Acceptable exception — SQL contains single quotes; no clean alternative without template literals |
| STYLE-6 (default export in error.js) | Intentionally kept — changing would break all imports for no functional benefit |

---

## Verification Plan

### Automated
- Run `node app.js` from `api/` to confirm the server starts without syntax/import errors
- Confirm no `helmet`, `cors`, `express-rate-limit` import failures

### Manual (your testing)
1. **POST** `/api/auth/sign-in` with wrong credentials — confirm response uses `error` key (not `message`)
2. **POST** `/api/auth/sign-in` 16 times quickly — confirm rate limiter responds with 429
3. Check response headers for `X-Content-Type-Options`, `Strict-Transport-Security` (helmet)
4. Hit any non-existent route — confirm 404 response uses `error` key
5. Frontend: trigger any error state — confirm error messages still display correctly
