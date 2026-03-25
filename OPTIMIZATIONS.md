# OPTIMIZATIONS.md

## Summary

The codebase is early-stage but functional. Core CRUD operations are correctly parameterized and most queries have appropriate `LIMIT` clauses. However, there are several high-ROI improvements needed:

1. **N+1 Query in `createOrder`**: Order items are inserted one-by-one inside a `for…of` loop — a single `INSERT … VALUES` statement would cut round-trips proportionally to cart size.
2. **Sequential `await` calls on independent queries**: Multiple controllers (`getCartWithItems`, `clearCart`, `removeCartItem`, `validateCoupon`) issue independent queries sequentially that could be parallelized with `Promise.all`.
3. **Unbounded list endpoints**: `getProducts`, `getBranches`, `getCategories`, and `getOrders` (staff/admin) return all rows without pagination, creating an unbounded memory growth vector.

The biggest risk if unaddressed is the unbounded `getOrders` for staff, which will grow linearly with order volume and eventually cause OOM or timeouts in production.

---

## Findings

---

### [OPT-1] N+1 INSERT in `createOrder` | Category: DB
- **Severity**: High
- **File + Function**: `orders.controller.js` · `createOrder` · lines 143–161
- **Evidence**:
```js
for (const item of cartItemRows) {
    await client.query(
        'INSERT INTO order_items (...) VALUES ($1, $2, ...)',
        [...]
    );
}
```
- **Why it's a problem**: For a cart with N items, this issues N sequential round-trips to PostgreSQL inside a transaction. Each round-trip adds network + parse + execute latency.
- **Fix**: Use a single multi-row INSERT with dynamically built `VALUES` clauses:
```js
const values = [];
const placeholders = [];
let idx = 1;

for (const item of cartItemRows) {
    placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    values.push(
        order.id, item.product_id, item.product_name || 'Deleted Product',
        item.quantity, item.size_name, item.size_extra_price,
        item.milk_option_name, item.milk_option_extra_price,
        JSON.stringify(Array.isArray(item.extras) ? item.extras : []),
        item.unit_price, item.total_price, item.note
    );
}

await client.query(
    'INSERT INTO order_items (order_id, product_id, product_name, quantity, size_name, size_extra_price, milk_option_name, milk_option_extra_price, extras, unit_price, total_price, note) VALUES ' + placeholders.join(', '),
    values
);
```
- **Expected impact**: Reduces `createOrder` DB round-trips from N+8 to 9 (fixed). ~30–60% latency reduction on orders with 3+ items.
- **Removal Safety**: Safe

---

### [OPT-2] Sequential `findOptionPrice` calls in `addItemToCart` / `updateCartItem` | Category: DB
- **Severity**: Medium
- **File + Function**: `cart.controller.js` · `addItemToCart` (lines 238–248), `updateCartItem` (lines 364–377)
- **Evidence**:
```js
const sizeExtraPrice = await findOptionPrice(productId, 'size', sizeName);
const milkOptionExtraPrice = await findOptionPrice(productId, 'milk', milkOptionName);
const extrasData = await findExtras(productId, safeExtras);
```
Three independent queries executed sequentially.
- **Why it's a problem**: Each `findOptionPrice` and `findExtras` call is a separate DB round-trip. They don't depend on each other.
- **Fix**:
```js
const [sizeExtraPrice, milkOptionExtraPrice, extrasData] = await Promise.all([
    findOptionPrice(productId, 'size', sizeName),
    findOptionPrice(productId, 'milk', milkOptionName),
    findExtras(productId, safeExtras),
]);
```
Note: These run inside a transaction (`client`), but since they are read-only queries on `product_options`, `Promise.all` is safe. However, `findOptionPrice` and `findExtras` currently use the global `db` pool, not the `client`. This is actually a bug — in a transaction context they should use the `client`. Fix that first, then parallelize.
- **Expected impact**: ~30% latency reduction on add/update cart item (3 round-trips → 1 concurrent batch).
- **Removal Safety**: Safe (once `client` is passed through)

---

### [OPT-3] Unbounded `getOrders` (staff/admin) | Category: DB / Reliability
- **Severity**: High
- **File + Function**: `orders.controller.js` · `getOrders` · line 335
- **Evidence**:
```js
query += ' ORDER BY o.created_at DESC';
const { rows } = await db.query(query, values);
```
No `LIMIT` or `OFFSET`. Returns all orders for a branch (staff) or all orders in the system (admin).
- **Why it's a problem**: As order volume grows, this query will pull thousands of rows into Node.js memory. At scale this causes OOM, timeouts, and high DB load.
- **Fix**: Add pagination identical to `getMyOrders`:
```js
const page = Number(req.query.page || 1);
const limit = Number(req.query.limit || 20);

if (!Number.isInteger(page) || page < 1)
    throw ApiError.badRequest('page must be a positive integer.');
if (!Number.isInteger(limit) || limit < 1 || limit > 100)
    throw ApiError.badRequest('limit must be between 1 and 100.');

const offset = (page - 1) * limit;
values.push(limit, offset);
query += ' LIMIT $' + (values.length - 1) + ' OFFSET $' + values.length;
```
- **Expected impact**: Bounds memory usage. Consistent response times regardless of data volume.
- **Removal Safety**: Safe

---

### [OPT-4] Unbounded `getProducts` | Category: DB / Reliability
- **Severity**: Medium
- **File + Function**: `products.controller.js` · `getProducts` · line 39
- **Evidence**: No `LIMIT` on the products query.
- **Why it's a problem**: Although the product catalog is likely small, there's no upper bound. A search like `?search=a` could return every product.
- **Fix**: Add `LIMIT 100` at the end of the query, or implement pagination.
- **Expected impact**: Bounds worst-case response size.
- **Removal Safety**: Safe

---

### [OPT-5] Unbounded `getBranches` | Category: DB / Reliability
- **Severity**: Low
- **File + Function**: `branches.controller.js` · `getBranches` · line 23
- **Evidence**: No `LIMIT` on query. Returns all active branches.
- **Why it's a problem**: Low risk since branch count is typically small, but still unbounded.
- **Fix**: Add `LIMIT 200` as a safety cap.
- **Expected impact**: Defensive guard.
- **Removal Safety**: Safe

---

### [OPT-6] Sequential DELETE + UPDATE in `clearCart` | Category: DB
- **Severity**: Low
- **File + Function**: `cart.controller.js` · `clearCart` · lines 481–486
- **Evidence**:
```js
await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
await db.query('DELETE FROM cart_coupons WHERE cart_id = $1', [cart.id]);
await db.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cart.id]);
```
Three sequential independent queries.
- **Why it's a problem**: These don't depend on each other and can be parallel.
- **Fix**:
```js
await Promise.all([
    db.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]),
    db.query('DELETE FROM cart_coupons WHERE cart_id = $1', [cart.id]),
    db.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cart.id]),
]);
```
- **Expected impact**: ~2x faster clearCart. Minor.
- **Removal Safety**: Safe

---

### [OPT-7] Sequential DELETE + UPDATE in `removeCartItem` | Category: DB
- **Severity**: Low
- **File + Function**: `cart.controller.js` · `removeCartItem` · lines 450–454
- **Evidence**:
```js
await db.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
await db.query('UPDATE carts SET updated_at = ...', [item.cart_id]);
```
- **Fix**: `Promise.all` both queries.
- **Expected impact**: Minor latency improvement.
- **Removal Safety**: Safe

---

### [OPT-8] `getCartWithItems` — sequential cart → items → coupons queries | Category: DB
- **Severity**: Medium
- **File + Function**: `cart.controller.js` · `getCartWithItems` · lines 93–176
- **Evidence**: 3 sequential queries: get cart → get items → get coupon. Items and coupon queries depend on `cart.id` but are independent of each other.
- **Fix**: After getting the cart, parallelize items + coupon:
```js
const [{ rows: items }, { rows: appliedCouponRows }] = await Promise.all([
    db.query('SELECT ... FROM cart_items ... WHERE item.cart_id = $1 ...', [cart.id]),
    db.query('SELECT ... FROM cart_coupons ... WHERE cc.cart_id = $1 ...', [cart.id]),
]);
```
- **Expected impact**: ~30% faster `getCartWithItems` (used by getCart, addItem, updateItem, removeItem).
- **Removal Safety**: Safe

---

### [OPT-9] `findOptionPrice` uses global `db` pool inside transaction | Category: Reliability
- **Severity**: Medium
- **File + Function**: `cart.controller.js` · `findOptionPrice` (line 14), `findExtras` (line 28)
- **Evidence**: These helpers always use the global `db` pool. In `addItemToCart` and `updateCartItem`, they're called within a transaction, but the helpers query via the pool (outside the transaction).
- **Why it's a problem**: Reads outside the transaction can see stale data (not snapshot-isolated with the transaction). If product_options are being modified concurrently, the price calculations may be inconsistent with the transaction's view.
- **Fix**: Accept an optional client parameter: `const findOptionPrice = async (productId, optionType, optionName, queryClient = db) => { ... }` and pass `client` from within transaction handlers.
- **Expected impact**: Data consistency under concurrent writes.
- **Removal Safety**: Safe

---

### [OPT-10] Redundant `ensureActiveUserExists` in `addItemToCart` | Category: Dead Code
- **Severity**: Low
- **File + Function**: `cart.controller.js` · `addItemToCart` · line 218
- **Evidence**: `ensureActiveUserExists(userId, client)` is called, but `verifyToken` middleware already checked `is_active` from the JWT. Then `ensureActiveUserExists` hits the DB to SELECT the user again.
- **Why it's a problem**: Extra DB query on every add-to-cart. The user was already validated by middleware. Per AGENTS.md: "verifyToken middleware does NOT hit the database."
- **Fix**: Remove `ensureActiveUserExists` call from `addItemToCart`. If DB freshness is needed, keep it, but document the decision.
- **Expected impact**: 1 fewer query per add-to-cart.
- **Removal Safety**: Needs Verification — only safe if you accept that JWT `is_active` may be stale.

---

### [OPT-11] `validateCoupon` — sequential subtotal + product queries | Category: DB
- **Severity**: Low
- **File + Function**: `cart.controller.js` · `validateCoupon` · lines 545–556
- **Evidence**:
```js
const { rows: subtotalRows } = await db.query('SELECT COALESCE(SUM(...), 0) ...', [cartId]);
const { rows: productRows } = await db.query('SELECT product_id FROM cart_items ...', [cartId]);
```
- **Fix**: `Promise.all` for these two independent queries.
- **Expected impact**: Minor latency improvement.
- **Removal Safety**: Safe

---

### [OPT-12] Hardcoded `ILK15` coupon logic in `coupon.util.js` | Category: Reuse
- **Severity**: Medium
- **File + Function**: `coupon.util.js` · `calculateCouponDiscount` · line 46
- **Evidence**: `if (coupon.code.toUpperCase() === 'ILK15')` — special coupon logic is hardcoded.
- **Why it's a problem**: Adding new coupon types with special conditions requires modifying this utility. This should be data-driven via the `conditions` JSONB column (e.g., `conditions.first_order_only: true`).
- **Fix**: Check `conditions.first_order_only` instead of `coupon.code.toUpperCase() === 'ILK15'`.
- **Expected impact**: Maintainability. Coupon behavior becomes configurable without code changes.
- **Removal Safety**: Needs Verification — seed data must be updated to include `first_order_only` in conditions.

---

### [OPT-13] Categories query has expensive correlated subqueries | Category: DB
- **Severity**: Low
- **File + Function**: `categories.controller.js` · `getCategories` / `getCategoryById` · lines 7, 32
- **Evidence**: Two `EXISTS(SELECT 1 FROM products p JOIN product_options po ...)` subqueries per category row.
- **Why it's a problem**: For N categories, each one triggers 2 correlated subqueries. With proper indexing this is fast, but it's still O(2N) subquery evaluations.
- **Fix**: This is acceptable at current scale. For optimization, consider caching these results or using a single JOIN with `GROUP BY` and `bool_or`.
- **Expected impact**: Marginal at small scale.
- **Removal Safety**: Safe

---

### [OPT-14] `deleteUser` — redundant SELECT before DELETE | Category: DB
- **Severity**: Low
- **File + Function**: `auth.controller.js` · `deleteUser` · lines 579–587
- **Evidence**:
```js
const { rows } = await db.query('SELECT id FROM users WHERE id = $1 LIMIT 1', [userId]);
// ...
await db.query('DELETE FROM users WHERE id = $1', [userId]);
```
- **Fix**: Use `DELETE ... RETURNING id` and check `rows[0]`:
```js
const { rows } = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
if (!rows[0]) throw ApiError.notFound('User not found.');
```
- **Expected impact**: 1 fewer query per deleteUser call.
- **Removal Safety**: Safe

---

### [OPT-15] `logout` handler does nothing meaningful | Category: Dead Code
- **Severity**: Low
- **File + Function**: `auth.controller.js` · `logout` · lines 550–573
- **Evidence**: The handler reads `userId` and `accessToken`, logs a message, and returns success. It doesn't invalidate any token or session server-side.
- **Why it's a problem**: Without server-side token blacklisting, this endpoint is cosmetic. The `console.log` exposes the userId in logs.
- **Fix**: Either implement token blacklisting (e.g., Redis) or document this as a no-op. Remove the `accessToken` extraction since it's unused beyond the guard.
- **Expected impact**: Clarity. No runtime impact.
- **Removal Safety**: Likely Safe

---

### [OPT-16] DDL executed at runtime in `connectDB` | Category: Reliability
- **Severity**: Medium
- **File + Function**: `database.js` · `connectDB` · lines 18–31
- **Evidence**: `schema.sql` is read and split by `;`, then each statement is executed at every server boot.
- **Why it's a problem**: Violates AGENTS.md: "Do NOT execute DDL queries at runtime." DDL at startup adds latency, risk of partial execution, and isn't idempotent for all statements (e.g., `CREATE TYPE` fails if type exists — only `42710` is caught).
- **Fix**: Run schema migrations as a separate CLI step (`npm run db:migrate`), not at boot.
- **Expected impact**: Faster startup, safer deployments, AGENTS.md compliance.
- **Removal Safety**: Needs Verification — must ensure migration tooling exists before removing.

---

### [OPT-17] `order_number` uses `Date.now()` — collision risk | Category: Reliability
- **Severity**: Medium
- **File + Function**: `orders.controller.js` · `createOrder` · line 120
- **Evidence**: `const orderNumber = '#' + Date.now();`
- **Why it's a problem**: Two concurrent `createOrder` calls in the same millisecond produce the same `order_number`. The `UNIQUE` constraint on `order_number` will cause one to fail with a 500 error.
- **Fix**: Use `crypto.randomUUID().slice(0, 8)` or a DB sequence:
```js
const orderNumber = '#' + Date.now() + '-' + crypto.randomBytes(2).toString('hex');
```
- **Expected impact**: Prevents order creation failures under concurrency.
- **Removal Safety**: Safe

---

### [OPT-18] Duplicate staff-branch lookup pattern | Category: Reuse
- **Severity**: Low
- **File + Function**: `orders.controller.js` · `getOrders` (line 306), `getOrderById` (line 373), `updateOrderStatus` (line 443), `cancelOrder` (line 501)
- **Evidence**: Identical pattern repeated 4 times:
```js
const { rows: staffBranchRows } = await db.query(
    'SELECT branch_id FROM staff_branches WHERE user_id = $1 LIMIT 1',
    [user.id],
);
const staffBranchId = staffBranchRows[0]?.branch_id;
if (!staffBranchId) throw ApiError.forbidden('Staff account is not assigned to a branch.');
```
- **Fix**: Extract to a utility:
```js
const getStaffBranchId = async (userId, queryClient = db) => {
    const { rows } = await queryClient.query(
        'SELECT branch_id FROM staff_branches WHERE user_id = $1 LIMIT 1',
        [userId]
    );
    if (!rows[0]?.branch_id)
        throw ApiError.forbidden('Staff account is not assigned to a branch.');
    return rows[0].branch_id;
};
```
- **Expected impact**: Maintainability, DRY.
- **Removal Safety**: Safe

---

## Quick Wins (< 30 min each)

1. **`Promise.all` independent queries** in `getCartWithItems`, `clearCart`, `removeCartItem`, `validateCoupon` (~15 min)
2. **Add pagination to `getOrders`** (staff/admin) (~15 min)
3. **Replace N+1 INSERT in `createOrder`** with multi-row INSERT (~20 min)
4. **Add `LIMIT` to `getProducts`** and `getBranches` (~5 min)
5. **Replace SELECT+DELETE in `deleteUser`** with `DELETE … RETURNING` (~5 min)
6. **Add collision guard to `order_number`** generation (~5 min)
7. **Extract staff-branch lookup** into a shared utility (~10 min)

## Deeper Refactors (before submission)

1. **Remove DDL-at-runtime from `connectDB`** — create a separate migration CLI script. Priority: High.
2. **Pass `client` through `findOptionPrice`/`findExtras`** for transaction consistency, then parallelize. Priority: High.
3. **Make `ILK15` coupon logic data-driven** via `conditions` JSONB. Priority: Medium.
4. **Add server-side token blacklisting or accept logout as no-op** — document decision. Priority: Low.

## Validation Plan

| Change | Validation Method |
|--------|----------|
| Multi-row INSERT | Insert order with 5+ items; compare `EXPLAIN ANALYZE` timing before/after |
| `Promise.all` parallelization | Measure response time on `GET /cart` with 5+ items; compare before/after |
| Pagination on `getOrders` | Seed 200+ orders; verify `?page=1&limit=10` returns exactly 10 and `total_count` is correct |
| `order_number` collision fix | Run 100 concurrent `POST /orders` calls via `autocannon`; verify zero 500 errors |
| DDL removal | Boot server without schema.sql execution; verify all tables exist via `psql \dt` |
| Transaction-safe option lookups | Modify a product option mid-request (simulate); verify price consistency |
