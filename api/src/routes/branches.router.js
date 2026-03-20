import express from 'express';
import {
    getBranches,
    getBranchId,
} from '../controllers/branches.controller.js';

const router = express.Router();

router.get('/', getBranches);
router.get('/:id', getBranchId);

export default router;
