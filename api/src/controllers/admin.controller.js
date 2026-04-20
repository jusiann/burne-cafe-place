import ApiError from '../utils/error.js';
import db from '../lib/db/database.js';
import bcrypt from 'bcryptjs';

export const createBranch = async (req, res) => {
    try {
        const { name, city, district, address = '' } = req.body;
        if (!name || !city || !district)
            throw ApiError.badRequest('name, city, and district are required.');

        const { rows } = await db.query(
            'INSERT INTO branches (name, city, district, address) VALUES ($1, $2, $3, $4) RETURNING *',
            [name.trim(), city.trim(), district.trim(), address.trim()]
        );

        res.status(201).json({
            success: true,
            message: 'Branch created successfully',
            data: rows[0]
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to create branch'
        });
    }
};

export const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, city, district, address = '' } = req.body;
        if (!name || !city || !district)
            throw ApiError.badRequest('name, city, and district are required.');

        const { rows } = await db.query(
            'UPDATE branches SET name = $1, city = $2, district = $3, address = $4 WHERE id = $5 RETURNING *',
            [name.trim(), city.trim(), district.trim(), address.trim(), id]
        );

        if (rows.length === 0)
            throw ApiError.notFound('Branch not found.');

        res.status(200).json({
            success: true,
            message: 'Branch updated successfully',
            data: rows[0]
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to update branch'
        });
    }
};

export const getBranches = async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT id, name, city, district, address, is_active, (SELECT COUNT(*) FROM staff_branches sb WHERE sb.branch_id = b.id)::int AS staff_count FROM branches b ORDER BY id ASC'
        );

        res.status(200).json({
            success: true,
            message: 'Branches retrieved successfully',
            data: rows
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to retrieve branches'
        });
    }
};

export const deleteBranch = async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        const { rows: activeOrders } = await client.query(
            'SELECT id FROM orders WHERE branch_id = $1 AND status IN (\'preparing\', \'ready\') LIMIT 1',
            [id]
        );

        if (activeOrders.length > 0)
            throw ApiError.conflict('Cannot delete branch with active orders.');

        await client.query(
            'UPDATE users SET is_active = false WHERE id IN (SELECT user_id FROM staff_branches WHERE branch_id = $1)',
            [id]
        );

        const { rows } = await client.query(
            'DELETE FROM branches WHERE id = $1 RETURNING id',
            [id]
        );

        if (rows.length === 0)
            throw ApiError.notFound('Branch not found.');

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Branch deleted successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to delete branch'
        });
    } finally {
        client.release();
    }
};

export const toggleBranchStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await db.query(
            'UPDATE branches SET is_active = NOT is_active WHERE id = $1 RETURNING *',
            [id]
        );

        if (rows.length === 0)
            throw ApiError.notFound('Branch not found.');

        const branch = rows[0];
        if (!branch.is_active) {
            await db.query(
                'UPDATE users SET is_active = false WHERE id IN (SELECT user_id FROM staff_branches WHERE branch_id = $1)',
                [id]
            );
        }

        res.status(200).json({
            success: true,
            message: 'Branch status toggled successfully',
            data: branch
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to toggle branch status'
        });
    }
};

export const createStaff = async (req, res) => {
    const client = await db.connect();
    try {
        const { name, email, phone, password, branchId } = req.body;
        if (!name || !email || !phone || !password || !branchId)
            throw ApiError.badRequest('name, email, phone, password, and branchId are required.');

        await client.query('BEGIN');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { rows: userRows } = await client.query(
            'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
            [name.trim(), email.toLowerCase(), phone, hashedPassword, 'staff']
        );

        const userId = userRows[0].id;

        await client.query(
            'INSERT INTO staff_branches (user_id, branch_id) VALUES ($1, $2)',
            [userId, branchId]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Staff created successfully',
            data: userRows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to create staff account'
        });
    } finally {
        client.release();
    }
};

export const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;
        if (!name || !email || !phone)
            throw ApiError.badRequest('name, email, and phone are required.');

        const { rows } = await db.query(
            'UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4 AND role = \'staff\' RETURNING id, name, email, phone',
            [name.trim(), email.toLowerCase(), phone, id]
        );

        if (rows.length === 0)
            throw ApiError.notFound('Staff not found.');

        res.status(200).json({
            success: true,
            message: 'Staff updated successfully',
            data: rows[0]
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to update staff'
        });
    }
};

export const getBranchStaff = async (req, res) => {
    try {
        const { branchId } = req.params;

        const { rows } = await db.query(
            'SELECT u.id, u.name, u.email, u.phone, u.is_active FROM users u JOIN staff_branches sb ON u.id = sb.user_id WHERE sb.branch_id = $1 AND u.role = \'staff\' ORDER BY u.name ASC',
            [branchId]
        );

        res.status(200).json({
            success: true,
            message: 'Staff retrieved successfully',
            data: rows
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to retrieve branch staff'
        });
    }
};

export const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await db.query(
            'UPDATE users SET is_active = false WHERE id = $1 AND role = \'staff\' RETURNING id',
            [id]
        );

        if (rows.length === 0)
            throw ApiError.notFound('Staff not found.');

        res.status(200).json({
            success: true,
            message: 'Staff deleted successfully'
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to delete staff'
        });
    }
};

export const toggleStaffStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await db.query(
            'UPDATE users SET is_active = NOT is_active WHERE id = $1 AND role = \'staff\' RETURNING id, name, is_active',
            [id]
        );

        if (rows.length === 0)
            throw ApiError.notFound('Staff not found.');

        res.status(200).json({
            success: true,
            message: 'Staff status toggled successfully',
            data: rows[0]
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to toggle staff status'
        });
    }
};

export const updateStaffBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { branchId } = req.body;
        if (!branchId)
            throw ApiError.badRequest('branchId is required.');

        const { rows } = await db.query(
            'UPDATE staff_branches SET branch_id = $1 WHERE user_id = $2 RETURNING *',
            [branchId, id]
        );

        if (rows.length === 0)
            throw ApiError.notFound('Staff branch assignment not found.');

        res.status(200).json({
            success: true,
            message: 'Staff reallocated successfully',
            data: rows[0]
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            error: error.message || 'Failed to update staff branch'
        });
    }
};


export const createProduct = async (req, res) => {
    try {
        const { name, description, base_price, category_id, is_available } = req.body;
        if (!name || base_price === undefined || category_id === undefined || category_id === null || category_id === '') {
            throw ApiError.badRequest('name, base_price, and category_id are required. Received: ' + JSON.stringify(req.body));
        }

        const { rows } = await db.query(
            'INSERT INTO products (name, description, base_price, category_id, is_available) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name.trim(), description?.trim() || null, base_price, category_id, is_available !== undefined ? is_available : true]
        );

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: rows[0]
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, base_price, category_id, is_available } = req.body;

        if (!name || base_price === undefined || category_id === undefined || category_id === null || category_id === '') {
            throw ApiError.badRequest('name, base_price, and category_id are required. Received: ' + JSON.stringify(req.body));
        }

        const { rows } = await db.query(
            'UPDATE products SET name = $1, description = $2, base_price = $3, category_id = $4, is_available = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [name.trim(), description?.trim() || null, base_price, category_id, is_available !== undefined ? is_available : true, id]
        );

        if (rows.length === 0) {
            throw ApiError.notFound('Product not found');
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: rows[0]
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await db.query(
            'DELETE FROM products WHERE id = $1 RETURNING *',
            [id]
        );

        if (rows.length === 0) {
            throw ApiError.notFound('Product not found');
        }

        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: rows[0]
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

export const toggleProductAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_available } = req.body;

        if (is_available === undefined) {
             throw ApiError.badRequest('is_available boolean field is required.');
        }

        const { rows } = await db.query(
            'UPDATE products SET is_available = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [is_available, id]
        );

        if (rows.length === 0) {
            throw ApiError.notFound('Product not found');
        }

        res.json({
            success: true,
            message: 'Product availability toggled successfully',
            data: rows[0]
        });
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};
