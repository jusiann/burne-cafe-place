# Security Audit Implementation

## Phase 1: Dependencies & Infrastructure
- [ ] Install `helmet` and `express-rate-limit`
- [ ] Update [app.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/app.js) — helmet, CORS, body limit, error handler, 404 handler

## Phase 2: JWT Hardening
- [ ] [jwt.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/jwt.js) — add `type` field to access and refresh tokens
- [ ] [auth.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/auth.js) middleware — pin algorithm, validate token type, fix error keys
- [ ] [auth.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js) — pin algorithm in [resetPassword](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#281-338) and [refreshToken](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#339-403)

## Phase 3: Auth Controller Fixes
- [ ] [signIn](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#93-164) — timing-safe email enumeration fix
- [ ] [logout](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#550-574) — PII console.log guard
- [ ] [deleteUser](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/auth.controller.js#575-601) — password confirmation
- [ ] Import order fix (sendEmail placement)
- [ ] All catch blocks: `message` → `error` key

## Phase 4: Other Controller Fixes
- [ ] [cart.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js) — remove `userId` from body in [validateCoupon](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/cart.controller.js#506-617), fix catch blocks
- [ ] [orders.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js) — fix [cancelOrder](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/orders.controller.js#478-540) SELECT to include `user_id`, fix catch blocks
- [ ] [products.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/products.controller.js) — fix catch blocks
- [ ] [branches.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/branches.controller.js) — fix catch blocks
- [ ] [categories.controller.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/controllers/categories.controller.js) — fix catch blocks

## Phase 5: Middleware & Utility Fixes
- [ ] [roles.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/middlewares/roles.js) — remove unused import, fix error keys, remove template literal
- [ ] [send.mail.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/utils/send.mail.js) — double quotes → single quotes
- [ ] [auth.router.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/api/src/routes/auth.router.js) — add rate limiter to auth routes

## Phase 6: Frontend Compatibility
- [ ] [error.utils.js](file:///c:/Users/adil/Documents/My%20Projects/burne-cafe-place/web/src/constants/error.utils.js) — update `data?.message` → `data?.error`

## Phase 7: JSDoc Comments
- [ ] Add JSDoc to all exported functions

## Phase 8: Verification
- [ ] Start the server and verify no startup errors
- [ ] Update SECURITY_AUDIT.md hardening checklist
