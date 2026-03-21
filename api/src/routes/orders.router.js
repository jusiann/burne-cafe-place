import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
import {
    createOrder,
    getMyOrders,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
} from '../controllers/orders.controller.js';

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/my', verifyToken, requireRole('customer'), getMyOrders);
router.get('/', verifyToken, requireRole('staff'), getOrders);
router.get('/:id', verifyToken, getOrderById);

router.patch('/:id/status', verifyToken, requireRole('staff', 'admin'), updateOrderStatus);
router.patch('/:id/cancel', verifyToken, cancelOrder);

export default router;