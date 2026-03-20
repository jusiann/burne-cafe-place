import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { 
    validateCoupon,
    getCart, 
    addItemToCart, 
    updateCartItem, 
    removeCartItem, 
    clearCart 
} from '../controllers/cart.controller.js';

const router = express.Router();

router.get('/', verifyToken, getCart);
router.post('/coupons/validate', verifyToken, validateCoupon);
router.post('/items', verifyToken, addItemToCart);
router.put('/items/:itemId', verifyToken, updateCartItem);
router.delete('/items/:itemId', verifyToken, removeCartItem);
router.delete('/', verifyToken, clearCart);

export default router;
