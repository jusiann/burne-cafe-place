import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken } from '../middlewares/auth.js';
import {
    signUp,
    signIn,
    forgotPassword,
    checkResetCode,
    resetPassword,
    refreshToken,
    updateProfile,
    getMe,
    logout,
    deleteUser,
} from '../controllers/auth.controller.js';

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many requests. Please try again later.' },
});

router.post('/sign-up', authLimiter, signUp);
router.post('/sign-in', authLimiter, signIn);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/check-reset-code', authLimiter, checkResetCode);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/refresh-token', refreshToken);

router.put('/update-profile', verifyToken, updateProfile);
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);
router.delete('/delete', verifyToken, deleteUser);

export default router;
