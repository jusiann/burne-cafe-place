import db from '../lib/db/database.js';

export const calculateCouponDiscount = async ({ coupon, subtotal, productIds, effectiveUserId }) => {
    if (!coupon || !coupon.is_active) {
        return {
            valid: false,
            message: 'Coupon is invalid or inactive',
            discountAmount: 0,
        };
    }

    if (subtotal <= 0) {
        return {
            valid: false,
            message: 'Cart is empty',
            discountAmount: 0,
        };
    }

    if (subtotal < Number(coupon.min_order_amount || 0)) {
        return {
            valid: false,
            message: 'Minimum order amount is not met',
            discountAmount: 0,
        };
    }

    const conditions = coupon.conditions || {};
    const requiredProducts = Array.isArray(conditions.requires_products)
        ? conditions.requires_products
        : [];

    if (requiredProducts.length > 0) {
        const hasAllProducts = requiredProducts.every((productId) =>
            productIds.includes(productId),
        );
        if (!hasAllProducts) {
            return {
                valid: false,
                message: 'Coupon conditions are not met',
                discountAmount: 0,
            };
        }
    }

    if (conditions.first_order_only) {
        if (!effectiveUserId) {
            return {
                valid: false,
                message: 'This coupon is only available for registered users',
                discountAmount: 0,
            };
        }

        const { rows: orderCountRows } = await db.query(
            'SELECT COUNT(*)::int AS order_count FROM orders WHERE user_id = $1',
            [effectiveUserId],
        );

        if ((orderCountRows[0]?.order_count || 0) > 0) {
            return {
                valid: false,
                message: 'This coupon is only valid for first orders',
                discountAmount: 0,
            };
        }
    }

    const discountValue = Number(coupon.discount_value || 0);
    let discountAmount = 0;

    if (coupon.discount_type === 'percentage')
        discountAmount = (subtotal * discountValue) / 100;
    else if (coupon.discount_type === 'fixed') discountAmount = discountValue;

    if (discountAmount > subtotal) discountAmount = subtotal;

    return {
        valid: true,
        message: 'Coupon validation completed',
        discountAmount,
    };
};
