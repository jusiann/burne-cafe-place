import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
import { uploadProductImage } from '../utils/upload.js';
import {
    getBranches,
    createBranch,
    updateBranch,
    toggleBranchStatus,
    deleteBranch,
    getBranchStaff,
    createStaff,
    updateStaff,
    toggleStaffStatus,
    updateStaffBranch,
    deleteStaff,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability
} from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/branches', verifyToken, requireRole('admin'), createBranch);
router.put('/branches/:id', verifyToken, requireRole('admin'), updateBranch);
router.get('/branches', verifyToken, requireRole('admin'), getBranches);
router.delete('/branches/:id', verifyToken, requireRole('admin'), deleteBranch);
router.patch('/branches/:id/status', verifyToken, requireRole('admin'), toggleBranchStatus);

router.post('/staff', verifyToken, requireRole('admin'), createStaff);
router.put('/staff/:id', verifyToken, requireRole('admin'), updateStaff);
router.get('/branches/:branchId/staff', verifyToken, requireRole('admin'), getBranchStaff);
router.delete('/staff/:id', verifyToken, requireRole('admin'), deleteStaff);
router.patch('/staff/:id/status', verifyToken, requireRole('admin'), toggleStaffStatus);
router.patch('/staff/:id/branch', verifyToken, requireRole('admin'), updateStaffBranch);

router.post('/products', verifyToken, requireRole('admin'), uploadProductImage, createProduct);
router.put('/products/:id', verifyToken, requireRole('admin'), updateProduct);
router.delete('/products/:id', verifyToken, requireRole('admin'), deleteProduct);
router.patch('/products/:id/availability', verifyToken, requireRole('admin'), toggleProductAvailability);

export default router;