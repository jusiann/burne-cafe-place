const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/status', verifyToken, requireRole('employee', 'manager'), updateOrderStatus);
router.patch('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;
