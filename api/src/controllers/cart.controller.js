import ApiError from '../utils/error.js';
import db from '../lib/db/database.js';
import { calculateCouponDiscount } from '../utils/coupon.util.js';

const normalizeExtras = (extras) => {
    if (!Array.isArray(extras)) return [];

    return extras
        .filter((extra) => extra && typeof extra.name === 'string')
        .map((extra) => ({ name: extra.name.trim() }))
        .filter((extra) => extra.name.length > 0);
};

const findOptionPrice = async (productId, optionType, optionName, client = db) => {
    if (!optionName) return 0;

    const { rows } = await client.query(
        'SELECT extra_price FROM product_options WHERE product_id = $1 AND option_type = $2 AND name = $3 AND is_available = true LIMIT 1',
        [productId, optionType, optionName],
    );

    if (!rows[0])
        throw ApiError.badRequest('Invalid ' + optionType + ' option.');

    return Number(rows[0].extra_price);
};

const findExtras = async (productId, extras, client = db) => {
    if (extras.length === 0) return { extras: [], total_extra_price: 0 };

    const names = extras.map((item) => item.name);
    const namePlaceholders = names.map((_, index) => '$' + (index + 2)).join(', ');
    const { rows } = await client.query(
        "SELECT name, extra_price FROM product_options WHERE product_id = $1 AND option_type = 'extra' AND is_available = true AND name IN (" + namePlaceholders + ')',
        [productId, ...names],
    );

    if (rows.length !== names.length)
        throw ApiError.badRequest('One or more extras are invalid.');

    const extraMap = new Map(
        rows.map((row) => [row.name, Number(row.extra_price)]),
    );
    const formattedExtras = extras.map((item) => ({
        name: item.name,
        price: extraMap.get(item.name) || 0,
    }));

    const totalExtraPrice = formattedExtras.reduce(
        (sum, item) => sum + item.price,
        0,
    );

    return {
        extras: formattedExtras,
        total_extra_price: totalExtraPrice,
    };
};

const ensureActiveUserExists = async (userId, queryClient = db) => {
    const { rows } = await queryClient.query(
        'SELECT id, is_active FROM users WHERE id = $1 LIMIT 1',
        [userId],
    );

    const user = rows[0];

    if (!user)
        throw ApiError.unauthorized('User not found. Please sign in again.');

    if (!user.is_active)
        throw ApiError.forbidden('Account is deactivated.');
};

const getOrCreateUserCart = async (userId) => {
    await ensureActiveUserExists(userId, db);

    const { rows: existingRows } = await db.query(
        'SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = $1 LIMIT 1',
        [userId],
    );

    if (existingRows[0]) return existingRows[0];

    const { rows } = await db.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id, user_id, created_at, updated_at',
        [userId],
    );

    return rows[0];
};

const getCartWithItems = async (userId) => {
    const { rows: cartRows } = await db.query(
        'SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = $1 LIMIT 1',
        [userId],
    );

    if (!cartRows[0]) {
        return {
            id: null,
            user_id: userId,
            items: [],
            total_price: 0,
        };
    }

    const cart = cartRows[0];

    const [{ rows: items }, { rows: appliedCouponRows }] = await Promise.all([
        db.query(
            'SELECT item.id, item.cart_id, item.product_id, item.quantity, item.size_name, item.size_extra_price, item.milk_option_name, item.milk_option_extra_price, item.extras, item.unit_price, item.total_price, item.note, item.created_at, item.updated_at, p.name AS product_name, p.image_url AS product_image, p.base_price FROM cart_items item JOIN products p ON item.product_id = p.id WHERE item.cart_id = $1 ORDER BY item.created_at ASC',
            [cart.id]
        ),
        db.query(
            'SELECT cc.coupon_id, c.code, c.discount_type, c.discount_value, c.min_order_amount, c.conditions, c.is_active FROM cart_coupons cc JOIN coupons c ON cc.coupon_id = c.id WHERE cc.cart_id = $1 LIMIT 1',
            [cart.id]
        )
    ]);

    const totalPrice = items.reduce(
        (sum, item) => sum + Number(item.total_price),
        0,
    );

    const productIds = items.map((item) => item.product_id).filter(Boolean);

    const appliedCoupon = appliedCouponRows[0] || null;

    if (!appliedCoupon) {
        return {
            ...cart,
            items,
            subtotal: totalPrice,
            discount_amount: 0,
            total_price: totalPrice,
            coupon: null,
        };
    }

    const couponResult = await calculateCouponDiscount({
        coupon: appliedCoupon,
        subtotal: totalPrice,
        productIds,
        effectiveUserId: userId,
    });

    if (!couponResult.valid) {
        await db.query('DELETE FROM cart_coupons WHERE cart_id = $1', [cart.id]);

        return {
            ...cart,
            items,
            subtotal: totalPrice,
            discount_amount: 0,
            total_price: totalPrice,
            coupon: null,
        };
    }

    const finalTotal = totalPrice - couponResult.discountAmount;

    return {
        ...cart,
        items,
        subtotal: totalPrice,
        discount_amount: couponResult.discountAmount,
        total_price: finalTotal,
        coupon: {
            id: appliedCoupon.coupon_id,
            code: appliedCoupon.code,
            discount_type: appliedCoupon.discount_type,
            discount_value: Number(appliedCoupon.discount_value || 0),
            discount_amount: couponResult.discountAmount,
        },
    };
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId)
            throw ApiError.unauthorized('User authentication is required.');

        const cart = await getCartWithItems(userId);

        res.status(200).json({
            success: true,
            message: 'Cart fetched successfully',
            cart,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to fetch cart',
        });
    }
};

export const addItemToCart = async (req, res) => {
    const client = await db.connect();

    try {
        const userId = req.user?.id;
        const {
            productId,
            quantity = 1,
            sizeName = null,
            milkOptionName = null,
            extras = [],
            note = null,
        } = req.body;

        if (!userId)
            throw ApiError.unauthorized('User authentication is required.');

        await ensureActiveUserExists(userId, client);

        if (!productId) throw ApiError.badRequest('Product ID is required.');

        if (!Number.isInteger(quantity) || quantity < 1)
            throw ApiError.badRequest('Quantity must be a positive integer.');

        await client.query('BEGIN');

        const { rows: productRows } = await client.query(
            'SELECT id, base_price, is_available FROM products WHERE id = $1 LIMIT 1',
            [productId],
        );
        const product = productRows[0];

        if (!product || !product.is_available)
            throw ApiError.notFound('Product not found or unavailable.');

        const safeExtras = normalizeExtras(extras);

        const [sizeExtraPrice, milkOptionExtraPrice, extrasData] = await Promise.all([
            findOptionPrice(productId, 'size', sizeName, client),
            findOptionPrice(productId, 'milk', milkOptionName, client),
            findExtras(productId, safeExtras, client)
        ]);

        const unitPrice =
            Number(product.base_price) +
            sizeExtraPrice +
            milkOptionExtraPrice +
            extrasData.total_extra_price;
        const totalPrice = unitPrice * quantity;

        let cartRows = [];
        const existingCartResult = await client.query(
            'SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = $1 LIMIT 1',
            [userId],
        );
        cartRows = existingCartResult.rows;

        if (!cartRows[0]) {
            const createdCartResult = await client.query(
                'INSERT INTO carts (user_id) VALUES ($1) RETURNING id, user_id, created_at, updated_at',
                [userId],
            );
            cartRows = createdCartResult.rows;
        }

        const cart = cartRows[0];

        await client.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity, size_name, size_extra_price, milk_option_name, milk_option_extra_price, extras, unit_price, total_price, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11)',
            [
                cart.id,
                productId,
                quantity,
                sizeName,
                sizeExtraPrice,
                milkOptionName,
                milkOptionExtraPrice,
                JSON.stringify(extrasData.extras),
                unitPrice,
                totalPrice,
                note,
            ],
        );

        await client.query(
            'UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [cart.id],
        );

        await client.query('COMMIT');

        const cartWithItems = await getCartWithItems(userId);

        res.status(201).json({
            success: true,
            message: 'Item added to cart',
            cart: cartWithItems,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to add item to cart',
        });
    } finally {
        client.release();
    }
};

export const updateCartItem = async (req, res) => {
    const client = await db.connect();

    try {
        const userId = req.user?.id;
        const { itemId } = req.params;
        const { quantity, sizeName, milkOptionName, extras, note } = req.body;

        if (!userId)
            throw ApiError.unauthorized('User authentication is required.');

        if (!itemId) throw ApiError.badRequest('Cart item ID is required.');

        await client.query('BEGIN');

        const { rows } = await client.query(
            'SELECT item.*, c.user_id, p.base_price, p.is_available FROM cart_items item JOIN carts c ON item.cart_id = c.id JOIN products p ON item.product_id = p.id WHERE item.id = $1 LIMIT 1',
            [itemId],
        );

        const currentItem = rows[0];

        if (!currentItem) throw ApiError.notFound('Cart item not found.');

        if (currentItem.user_id !== userId)
            throw ApiError.forbidden('You can only update your own cart item.');

        if (!currentItem.is_available)
            throw ApiError.badRequest('Product is no longer available.');

        const nextQuantity =
            quantity !== undefined ? quantity : currentItem.quantity;
        if (!Number.isInteger(nextQuantity) || nextQuantity < 1)
            throw ApiError.badRequest('Quantity must be a positive integer.');

        const nextSizeName =
            sizeName !== undefined ? sizeName : currentItem.size_name;
        const nextMilkOptionName =
            milkOptionName !== undefined
                ? milkOptionName
                : currentItem.milk_option_name;
        const nextNote = note !== undefined ? note : currentItem.note;
        const nextExtrasInput =
            extras !== undefined
                ? normalizeExtras(extras)
                : normalizeExtras(currentItem.extras);

        const [sizeExtraPrice, milkOptionExtraPrice, extrasData] = await Promise.all([
            findOptionPrice(currentItem.product_id, 'size', nextSizeName, client),
            findOptionPrice(currentItem.product_id, 'milk', nextMilkOptionName, client),
            findExtras(currentItem.product_id, nextExtrasInput, client)
        ]);

        const unitPrice =
            Number(currentItem.base_price) +
            sizeExtraPrice +
            milkOptionExtraPrice +
            extrasData.total_extra_price;
        const totalPrice = unitPrice * nextQuantity;

        await client.query(
            'UPDATE cart_items SET quantity = $1, size_name = $2, size_extra_price = $3, milk_option_name = $4, milk_option_extra_price = $5, extras = $6::jsonb, unit_price = $7, total_price = $8, note = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10',
            [
                nextQuantity,
                nextSizeName,
                sizeExtraPrice,
                nextMilkOptionName,
                milkOptionExtraPrice,
                JSON.stringify(extrasData.extras),
                unitPrice,
                totalPrice,
                nextNote,
                itemId,
            ],
        );

        await client.query(
            'UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [currentItem.cart_id],
        );

        await client.query('COMMIT');

        const cart = await getCartWithItems(userId);

        res.status(200).json({
            success: true,
            message: 'Cart item updated',
            cart,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to update cart item',
        });
    } finally {
        client.release();
    }
};

export const removeCartItem = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { itemId } = req.params;

        if (!userId)
            throw ApiError.unauthorized('User authentication is required.');

        if (!itemId) throw ApiError.badRequest('Cart item ID is required.');

        const { rows } = await db.query(
            'SELECT item.id, item.cart_id, c.user_id FROM cart_items item JOIN carts c ON item.cart_id = c.id WHERE item.id = $1 LIMIT 1',
            [itemId],
        );

        const item = rows[0];

        if (!item) throw ApiError.notFound('Cart item not found.');

        if (item.user_id !== userId)
            throw ApiError.forbidden('You can only remove your own cart item.');

        await Promise.all([
            db.query('DELETE FROM cart_items WHERE id = $1', [itemId]),
            db.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [item.cart_id])
        ]);

        const cart = await getCartWithItems(userId);

        res.status(200).json({
            success: true,
            message: 'Cart item removed',
            cart,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to remove cart item',
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId)
            throw ApiError.unauthorized('User authentication is required.');

        const cart = await getOrCreateUserCart(userId);

        await Promise.all([
            db.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]),
            db.query('DELETE FROM cart_coupons WHERE cart_id = $1', [cart.id]),
            db.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cart.id])
        ]);

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            cart: {
                ...cart,
                items: [],
                total_price: 0,
            },
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to clear cart',
        });
    }
};

export const validateCoupon = async (req, res) => {
    try {
        const { code, cartId } = req.body;
        const authUserId = req.user?.id;
        const effectiveUserId = authUserId;

        if (!code || !cartId)
            throw ApiError.badRequest('code and cartId are required.');

        if (!authUserId)
            throw ApiError.unauthorized('User authentication is required.');

        const { rows: cartOwnerRows } = await db.query(
            'SELECT id, user_id FROM carts WHERE id = $1 LIMIT 1',
            [cartId],
        );

        const ownerCart = cartOwnerRows[0];

        if (!ownerCart)
            throw ApiError.notFound('Cart not found.');

        if (ownerCart.user_id !== authUserId)
            throw ApiError.forbidden('You can only apply coupon to your own cart.');

        const { rows: couponRows } = await db.query(
            'SELECT id, code, discount_type, discount_value, min_order_amount, conditions, is_active FROM coupons WHERE UPPER(code) = UPPER($1) LIMIT 1',
            [code.trim()],
        );

        const coupon = couponRows[0];

        if (!coupon || !coupon.is_active)
            return res.status(200).json({
                success: true,
                message: 'Coupon is invalid or inactive',
                valid: false,
            });

        const [{ rows: subtotalRows }, { rows: productRows }] = await Promise.all([
            db.query(
                'SELECT COALESCE(SUM(total_price), 0) AS subtotal FROM cart_items WHERE cart_id = $1',
                [cartId]
            ),
            db.query(
                'SELECT product_id FROM cart_items WHERE cart_id = $1 AND product_id IS NOT NULL',
                [cartId]
            )
        ]);

        const subtotal = Number(subtotalRows[0]?.subtotal || 0);
        const productIds = productRows.map((row) => row.product_id);

        const couponResult = await calculateCouponDiscount({
            coupon,
            subtotal,
            productIds,
            effectiveUserId,
        });

        if (!couponResult.valid)
            return res.status(200).json({
                success: true,
                message: couponResult.message,
                valid: false,
            });

        const { rows: existingCartCouponRows } = await db.query(
            'SELECT cart_id FROM cart_coupons WHERE cart_id = $1 LIMIT 1',
            [cartId],
        );

        if (existingCartCouponRows[0]) {
            await db.query(
                'UPDATE cart_coupons SET coupon_id = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2',
                [coupon.id, cartId],
            );
        } else {
            await db.query(
                'INSERT INTO cart_coupons (cart_id, coupon_id, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
                [cartId, coupon.id],
            );
        }

        const finalTotal = subtotal - couponResult.discountAmount;

        res.status(200).json({
            success: true,
            message: 'Coupon validation completed',
            valid: true,
            cart: {
                cart_id: cartId,
                subtotal,
                discount_amount: couponResult.discountAmount,
                total_price: finalTotal,
            },
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: Number(coupon.discount_value || 0),
                discount_amount: couponResult.discountAmount,
            },
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Coupon validation failed',
        });
    }
};
