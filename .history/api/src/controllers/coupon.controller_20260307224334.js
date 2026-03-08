const pool = require('../config/db');

const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.query;
    const result = await pool.query("SELECT * FROM coupons WHERE code = $1 AND is_active = true", [code]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Coupon not found or inactive' });

    const coupon = result.rows[0];
    if (parseFloat(subtotal) < parseFloat(coupon.min_order_amount)) {
      return res.status(400).json({ message: `Minimum order amount is ₺${coupon.min_order_amount}` });
    }

    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_amount } = req.body;
    const result = await pool.query(
      'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [code, discount_type, discount_value, min_order_amount ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { validateCoupon, createCoupon };
