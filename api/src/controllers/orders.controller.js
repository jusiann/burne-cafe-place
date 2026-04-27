import ApiError from '../utils/error.js';
import db from '../lib/db/database.js';
import { calculateCouponDiscount } from '../utils/coupon.util.js';
import { getPaginationOptions, getPaginationResult } from '../utils/pagination.util.js';

export const createOrder = async (req, res) => {
    let client;
    let transactionStarted = false;

    try {
        client = await db.connect();

        const userId = req.user.id;
        const {
            branchId,
            customerName,
            customerPhone,
            scheduledTime = null,
            paymentMethod,
            orderNote = null,
            couponCode = null,
            cartId,
        } = req.body;

        if (!branchId || !customerName || !customerPhone || !paymentMethod || !cartId)
            throw ApiError.badRequest(
                'branchId, customerName, customerPhone, paymentMethod and cartId are required.',
            );

        if (!['cash', 'credit_card'].includes(paymentMethod))
            throw ApiError.badRequest('Invalid payment method.');

        if (scheduledTime && Number.isNaN(Date.parse(scheduledTime)))
            throw ApiError.badRequest('scheduledTime must be a valid datetime.');

        await client.query('BEGIN');
        transactionStarted = true;

        const { rows: branchRows } = await client.query(
            'SELECT id, is_active FROM branches WHERE id = $1 LIMIT 1',
            [branchId],
        );
        const branch = branchRows[0];

        if (!branch || !branch.is_active)
            throw ApiError.badRequest('Selected branch is invalid or inactive.');

        const { rows: cartRows } = await client.query(
            'SELECT id, user_id FROM carts WHERE id = $1 LIMIT 1',
            [cartId],
        );
        const cart = cartRows[0];

        if (!cart)
            throw ApiError.notFound('Cart not found.');

        if (cart.user_id !== userId)
            throw ApiError.forbidden('You can only create order from your own cart.');

        const { rows: cartItemRows } = await client.query(
            'SELECT ci.id, ci.product_id, ci.quantity, ci.size_name, ci.size_extra_price, ci.milk_option_name, ci.milk_option_extra_price, ci.extras, ci.unit_price, ci.total_price, ci.note, p.name AS product_name FROM cart_items ci LEFT JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1',
            [cartId],
        );

        if (cartItemRows.length === 0)
            throw ApiError.badRequest('Cart is empty.');

        const subtotal = cartItemRows.reduce(
            (sum, item) => sum + Number(item.total_price || 0),
            0,
        );

        if (subtotal <= 0)
            throw ApiError.badRequest('Cart total must be greater than zero.');

        const productIds = cartItemRows
            .map((item) => item.product_id)
            .filter(Boolean);

        let coupon = null;

        if (couponCode) {
            const { rows: couponRows } = await client.query(
                'SELECT id, code, discount_type, discount_value, min_order_amount, conditions, is_active FROM coupons WHERE UPPER(code) = UPPER($1) LIMIT 1',
                [couponCode.trim()],
            );
            coupon = couponRows[0] || null;
        } else {
            const { rows: appliedCouponRows } = await client.query(
                'SELECT c.id, c.code, c.discount_type, c.discount_value, c.min_order_amount, c.conditions, c.is_active FROM cart_coupons cc JOIN coupons c ON cc.coupon_id = c.id WHERE cc.cart_id = $1 LIMIT 1',
                [cartId],
            );
            coupon = appliedCouponRows[0] || null;
        }

        let discount = 0;
        let couponId = null;

        if (coupon) {
            const couponResult = await calculateCouponDiscount({
                coupon,
                subtotal,
                productIds,
                effectiveUserId: userId,
            });

            if (!couponResult.valid)
                throw ApiError.badRequest(couponResult.message);

            discount = couponResult.discountAmount;
            couponId = coupon.id;
        }

        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.20;
        const total = afterDiscount + tax;

        if (total < 0)
            throw ApiError.badRequest('Order total cannot be negative.');

        const orderNumber = '#' + Date.now() + '-' + Math.random().toString(16).slice(2, 6);

        const { rows: orderRows } = await client.query(
            'INSERT INTO orders (order_number, user_id, branch_id, customer_name, customer_phone, status, scheduled_time, payment_method, order_note, subtotal, tax, discount, coupon_id, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::payment_method, $9, $10, $11, $12, $13, $14) RETURNING id, order_number, user_id, branch_id, customer_name, customer_phone, status, scheduled_time, payment_method, order_note, staff_note, subtotal, tax, discount, coupon_id, total, completed_by, created_at, updated_at',
            [
                orderNumber,
                userId,
                branchId,
                customerName.trim(),
                customerPhone.trim(),
                'preparing',
                scheduledTime,
                paymentMethod,
                orderNote,
                subtotal,
                tax,
                discount,
                couponId,
                total,
            ],
        );
        const order = orderRows[0];

        if (cartItemRows.length > 0) {
            const values = [];
            const placeholders = [];
            let idx = 1;

            for (const item of cartItemRows) {
                placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}::jsonb, $${idx++}, $${idx++}, $${idx++})`);
                values.push(
                    order.id,
                    item.product_id,
                    item.product_name || 'Deleted Product',
                    item.quantity,
                    item.size_name,
                    item.size_extra_price,
                    item.milk_option_name,
                    item.milk_option_extra_price,
                    JSON.stringify(Array.isArray(item.extras) ? item.extras : []),
                    item.unit_price,
                    item.total_price,
                    item.note
                );
            }

            await client.query(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, size_name, size_extra_price, milk_option_name, milk_option_extra_price, extras, unit_price, total_price, note) VALUES ${placeholders.join(', ')}`,
                values
            );
        }

        await Promise.all([
            client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]),
            client.query('DELETE FROM cart_coupons WHERE cart_id = $1', [cartId]),
            client.query('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [cartId])
        ]);

        await client.query('COMMIT');
        transactionStarted = false;

        const { rows: orderRowsForResponse } = await db.query(
            'SELECT o.id, o.order_number, o.user_id, o.branch_id, o.customer_name, o.customer_phone, o.status, o.scheduled_time, o.payment_method, o.order_note, o.staff_note, o.subtotal, o.tax, o.discount, o.coupon_id, o.total, o.completed_by, o.created_at, o.updated_at, b.name AS branch_name FROM orders o LEFT JOIN branches b ON o.branch_id = b.id WHERE o.id = $1 LIMIT 1',
            [order.id],
        );

        const { rows: items } = await db.query(
            'SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.quantity, oi.size_name, oi.size_extra_price, oi.milk_option_name, oi.milk_option_extra_price, oi.extras, oi.unit_price, oi.total_price, oi.note, p.image_url AS product_image FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1 ORDER BY oi.id ASC',
            [order.id],
        );

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                ...orderRowsForResponse[0],
                items,
            },
        });
    } catch (error) {
        if (client && transactionStarted)
            await client.query('ROLLBACK');

        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to create order',
        });
    } finally {
        if (client)
            client.release();
    }
};

const injectItemsToOrders = async (orders) => {
    if (!orders || orders.length === 0) return [];

    const orderIds = orders.map((order) => order.id);
    const placeholders = orderIds.map((_, index) => '$' + (index + 1)).join(', ');

    const { rows: itemRows } = await db.query(
        'SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.quantity, oi.size_name, oi.size_extra_price, oi.milk_option_name, oi.milk_option_extra_price, oi.extras, oi.unit_price, oi.total_price, oi.note, p.image_url AS product_image FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id IN (' +
        placeholders +
        ') ORDER BY oi.id ASC',
        orderIds,
    );

    const itemsByOrderId = new Map();
    for (const item of itemRows) {
        if (!itemsByOrderId.has(item.order_id)) itemsByOrderId.set(item.order_id, []);
        itemsByOrderId.get(item.order_id).push(item);
    }

    return orders.map((order) => ({
        ...order,
        items: itemsByOrderId.get(order.id) || [],
    }));
};

export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id;

        let pagination;
        try {
            pagination = getPaginationOptions(req.query, 100);
        } catch (err) {
            throw ApiError.badRequest(err.message);
        }
        const { page, limit, offset } = pagination;

        if (!userId)
            throw ApiError.unauthorized('User authentication is required.');

        const { rows: totalRows } = await db.query(
            'SELECT COUNT(*)::int AS total_count FROM orders WHERE user_id = $1',
            [userId],
        );

        const { rows: orderRows } = await db.query(
            'SELECT id, order_number, user_id, branch_id, customer_name, customer_phone, status, scheduled_time, payment_method, order_note, staff_note, subtotal, tax, discount, coupon_id, total, completed_by, created_at, updated_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [userId, limit, offset],
        );

        const orders = await injectItemsToOrders(orderRows);

        res.status(200).json({
            success: true,
            message: 'My orders fetched successfully',
            pagination: getPaginationResult(totalRows[0]?.total_count || 0, page, limit),
            orders,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to fetch my orders',
        });
    }
};

export const getOrders = async (req, res) => {
    try {
        const user = req.user;
        const { status, date } = req.query;

        let pagination;
        try {
            pagination = getPaginationOptions(req.query, 1000);
        } catch (err) {
            throw ApiError.badRequest(err.message);
        }
        const { page, limit, offset } = pagination;

        if (!user)
            throw ApiError.unauthorized('User authentication is required.');

        if (status && !['preparing', 'ready', 'completed', 'cancelled'].includes(status))
            throw ApiError.badRequest('Invalid status filter.');

        if (date && Number.isNaN(Date.parse(date)))
            throw ApiError.badRequest('date must be a valid date.');

        const conditions = [];
        const values = [];

        if (user.role === 'staff') {
            const { rows: staffBranchRows } = await db.query(
                'SELECT branch_id FROM staff_branches WHERE user_id = $1 LIMIT 1',
                [user.id],
            );

            const staffBranchId = staffBranchRows[0]?.branch_id;

            if (!staffBranchId)
                throw ApiError.forbidden('Staff account is not assigned to a branch.');

            values.push(staffBranchId);
            conditions.push('o.branch_id = $' + values.length);
        }

        if (status) {
            values.push(status);
            conditions.push('o.status = $' + values.length + '::order_status');
        }

        if (date) {
            values.push(date);
            conditions.push('DATE(o.created_at) = $' + values.length + '::date');
        }

        const whereClause = conditions.length > 0
            ? ' WHERE ' + conditions.join(' AND ')
            : '';

        const countValues = [...values];
        const { rows: totalRows } = await db.query(
            'SELECT COUNT(*)::int AS total_count FROM orders o' + whereClause,
            countValues,
        );

        const limitIdx = values.length + 1;
        const offsetIdx = values.length + 2;
        values.push(limit, offset);

        const query =
            'SELECT o.id, o.order_number, o.user_id, o.branch_id, o.customer_name, o.customer_phone, o.status, o.scheduled_time, o.payment_method, o.order_note, o.staff_note, o.subtotal, o.tax, o.discount, o.coupon_id, o.total, o.completed_by, o.created_at, o.updated_at, b.name AS branch_name FROM orders o LEFT JOIN branches b ON o.branch_id = b.id' +
            whereClause +
            ' ORDER BY o.created_at DESC LIMIT $' + limitIdx + ' OFFSET $' + offsetIdx;

        const { rows: orderRows } = await db.query(query, values);

        const orders = await injectItemsToOrders(orderRows);

        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
            pagination: getPaginationResult(totalRows[0]?.total_count || 0, page, limit),
            orders,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to fetch orders',
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!user)
            throw ApiError.unauthorized('User authentication is required.');

        if (!id)
            throw ApiError.badRequest('Order ID is required.');

        const { rows: orderRows } = await db.query(
            'SELECT o.id, o.order_number, o.user_id, o.branch_id, o.customer_name, o.customer_phone, o.status, o.scheduled_time, o.payment_method, o.order_note, o.staff_note, o.subtotal, o.tax, o.discount, o.coupon_id, o.total, o.completed_by, o.created_at, o.updated_at, b.name AS branch_name FROM orders o LEFT JOIN branches b ON o.branch_id = b.id WHERE o.id = $1 LIMIT 1',
            [id],
        );

        const order = orderRows[0];

        if (!order)
            throw ApiError.notFound('Order not found.');

        if (user.role === 'staff') {
            const { rows: staffBranchRows } = await db.query(
                'SELECT branch_id FROM staff_branches WHERE user_id = $1 LIMIT 1',
                [user.id],
            );

            const staffBranchId = staffBranchRows[0]?.branch_id;

            if (!staffBranchId)
                throw ApiError.forbidden('Staff account is not assigned to a branch.');

            if (order.branch_id !== staffBranchId)
                throw ApiError.forbidden('You can only access orders of your assigned branch.');
        }

        if (user.role === 'customer') {
            if (!order.user_id || order.user_id !== user.id)
                throw ApiError.forbidden('You can only access your own orders.');
        }

        const { rows: items } = await db.query(
            'SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.quantity, oi.size_name, oi.size_extra_price, oi.milk_option_name, oi.milk_option_extra_price, oi.extras, oi.unit_price, oi.total_price, oi.note, p.image_url AS product_image FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1 ORDER BY oi.id ASC',
            [id],
        );

        res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            order: {
                ...order,
                items,
            },
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to fetch order',
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { status } = req.body;

        if (!user)
            throw ApiError.unauthorized('User authentication is required.');

        if (!id)
            throw ApiError.badRequest('Order ID is required.');

        if (!status)
            throw ApiError.badRequest('status is required.');

        if (!['preparing', 'ready', 'completed'].includes(status))
            throw ApiError.badRequest('status must be preparing, ready or completed.');

        const { rows: orderRows } = await db.query(
            'SELECT id, branch_id FROM orders WHERE id = $1 LIMIT 1',
            [id],
        );

        const order = orderRows[0];

        if (!order)
            throw ApiError.notFound('Order not found.');

        if (user.role === 'staff') {
            const { rows: staffBranchRows } = await db.query(
                'SELECT branch_id FROM staff_branches WHERE user_id = $1 LIMIT 1',
                [user.id],
            );

            const staffBranchId = staffBranchRows[0]?.branch_id;

            if (!staffBranchId)
                throw ApiError.forbidden('Staff account is not assigned to a branch.');

            if (order.branch_id !== staffBranchId)
                throw ApiError.forbidden('You can only access orders of your assigned branch.');
        }

        const completedBy = status === 'completed' ? user.id : null;

        const { rows } = await db.query(
            'UPDATE orders SET status = $1::order_status, completed_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, order_number, user_id, branch_id, customer_name, customer_phone, status, scheduled_time, payment_method, order_note, staff_note, subtotal, tax, discount, coupon_id, total, completed_by, created_at, updated_at',
            [status, completedBy, id],
        );

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order: rows[0],
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to update order status',
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { staffNote = null } = req.body;

        if (!user)
            throw ApiError.unauthorized('User authentication is required.');

        if (!id)
            throw ApiError.badRequest('Order ID is required.');

        const { rows: orderRows } = await db.query(
            'SELECT id, user_id, branch_id, status FROM orders WHERE id = $1 LIMIT 1',
            [id],
        );

        const order = orderRows[0];

        if (!order)
            throw ApiError.notFound('Order not found.');

        if (user.role === 'staff') {
            const { rows: staffBranchRows } = await db.query(
                'SELECT branch_id FROM staff_branches WHERE user_id = $1 LIMIT 1',
                [user.id],
            );

            const staffBranchId = staffBranchRows[0]?.branch_id;

            if (!staffBranchId)
                throw ApiError.forbidden('Staff account is not assigned to a branch.');

            if (order.branch_id !== staffBranchId)
                throw ApiError.forbidden('You can only access orders of your assigned branch.');
        }

        if (user.role === 'customer') {
            if (!order.user_id || order.user_id !== user.id)
                throw ApiError.forbidden('You can only cancel your own orders.');
            if (order.status !== 'preparing')
                throw ApiError.badRequest('You can only cancel orders that are being prepared.');
        }

        const { rows } = await db.query(
            'UPDATE orders SET status = $1::order_status, staff_note = $2, completed_by = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, order_number, user_id, branch_id, customer_name, customer_phone, status, scheduled_time, payment_method, order_note, staff_note, subtotal, tax, discount, coupon_id, total, completed_by, created_at, updated_at',
            ['cancelled', staffNote, id],
        );

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order: rows[0],
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false, error: error.message || 'Failed to cancel order',
        });
    }
};
