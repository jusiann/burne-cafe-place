const express = require('express');
const router = express.Router();
const { getStores, createStore, getStoreEmployees, addEmployeeToStore } = require('../controllers/store.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', verifyToken, requireRole('manager'), getStores);
router.post('/', verifyToken, requireRole('manager'), createStore);
router.get('/:id/employees', verifyToken, requireRole('manager'), getStoreEmployees);
router.post('/:id/employees', verifyToken, requireRole('manager'), addEmployeeToStore);

module.exports = router;
