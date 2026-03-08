const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct } = require('../controllers/product.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, requireRole('manager'), createProduct);

module.exports = router;
