const pool = require('../config/db');

const createOrder = async (req, res) => {
  // TODO: implement full order creation logic
  res.status(201).json({ message: 'createOrder - not implemented yet' });
};

const getOrders = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    let result;
    if (role === 'customer') {
      result = await pool.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [userId]);
    } else {
      result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (order.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.json(order.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['preparing', 'on_the_way', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const order = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (order.rows.length === 0) return res.status(404).json({ message: 'Order not found' });

    if (role === 'customer' && order.rows[0].customer_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await pool.query("UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder };
