const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/category.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', getCategories);
router.post('/', verifyToken, requireRole('manager'), createCategory);

module.exports = router;
