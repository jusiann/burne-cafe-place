# AGENTS.md

## Must-follow constraints
- **Strict Stack Usage:** 
  - Backend: Node.js, Express, PostgreSQL via native `pg` client. **Do NOT use any ORM** (e.g., Sequelize, Prisma).
  - Frontend: React 19, Vite, Tailwind CSS 4, Zustand. **Do NOT use Context API** for application state management.
- **Architectural Boundary:** All backend business logic and request parsing MUST reside in Controllers (`api/src/controllers/`). **There is no Service layer.** Do not abstract logic away from controllers.
- **SQL Execution Safety:** MUST use parameterized queries via the `pg` pool for all database interactions. Never inject variables using template literals or string concatenation to prevent SQL injection.
- **Schema & DDL Management:** Do NOT execute DDL queries (e.g., `CREATE TABLE IF NOT EXISTS`) at runtime via API calls. Manage all schema changes exclusively in `api/src/lib/db/schema.sql`.
- **Auth & Session Context:** Guest carts and guest orders are NOT supported by the database schema. A valid `userId` (via JWT) is mandatory for ALL cart and order operations.
- **Middleware Safety:** Do NOT `throw` errors directly inside non-async middleware functions (e.g., `roles.js`). Use `return res.status().json()` or `return next(error)` to prevent application crashes.

## Repo-specific conventions
- **API Response Contracts:**
  - **Success:** MUST follow `{ success: true, message: '...', [dynamic_data_key]: ... }`.
  - **Error:** MUST follow `{ success: false, error: '...' }` (Crucial: Use the key `error`, not `message`).
- **Backend Code Formatting:** MUST use **single quotes** (`'`), mandatory **semicolons** (`;`), and **4 spaces** for indentation.
- **Controller Exports:** MUST use named exports mapped to async arrow functions (`export const handler = async (req, res) => { ... };`).
- **Error Handling (Backend):** Every controller function MUST wrap its entire logic in a `try/catch` block. Catch blocks should safely forward errors.
- **Documentation:** Every exported backend function MUST include an overarching JSDoc comment explaining its behavior and constraints.

## Important locations (only non-obvious)
- **SQL Schema & Seed data:** `api/src/lib/db/schema.sql` and `api/src/lib/db/seed.sql`
- **Frontend Stores (Zustand):** `web/src/stores/` (Specifically: `cartStore.js`, `authStore.js`, `locationStore.js`)
- **HTTP/Axios Client:** `web/src/services/api.js`

## Change safety rules
- **Preserve Endpoint Signatures:** Do not change existing API endpoint paths or HTTP methods unless explicitly requested. The frontend tightly couples to these exact paths via Axios services.
- **Preserve Roles:** The RBAC system strictly expects `customer`, `staff`, or `admin` roles. Do not introduce new role identifiers without updating `roles.js`, `auth.controller.js`, and the database ENUM.
- **Product Options Handling:** Product options (sizes, milks, extras) are stored in a flattened `product_options` table. Ensure any API modifying products correctly handles this relational structure.

## Known gotchas
- **Runtime crashes from `ApiError` in Middlewares:** The codebase has a history of throwing `ApiError.unauthorized()` synchronously from inside Express middlewares without catching them. This causes the Node.js process to exit. Always return an error JSON object with the correct HTTP code in synchronous middlewares.
- **JWT vs Database User Validation:** The `verifyToken` middleware relies entirely on the decoded token payload and does NOT perform a database lookup for the user. Do not assume `req.user` contains up-to-date database columns besides what was signed at login.
