const express = require('express');
const router = express.Router();
const { validateCoupon, createCoupon } = require('../controllers/coupon.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/validate', verifyToken, validateCoupon);
router.post('/', verifyToken, requireRole('manager'), createCoupon);

module.exports = router;
