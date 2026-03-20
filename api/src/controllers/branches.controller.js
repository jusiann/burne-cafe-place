import ApiError from '../utils/error.js';
import db from '../lib/db/database.js';

export const getBranches = async (req, res) => {
    try {
        const { city, district } = req.query;
        let query =
            'SELECT id, name, city, district, address, is_active, created_at FROM branches WHERE is_active = true';
        const params = [];

        if (city) {
            params.push(city);
            query += ' AND city = $' + params.length;
        }

        if (district) {
            params.push(district);
            query += ' AND district = $' + params.length;
        }

        query += ' ORDER BY city ASC, district ASC, name ASC';

        const { rows } = await db.query(query, params);

        res.status(200).json({
            success: true,
            message: 'Branches fetched successfully',
            branches: rows,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch branches',
        });
    }
};

export const getBranchId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) throw ApiError.badRequest('Branch ID is required.');

        const { rows } = await db.query(
            'SELECT id, name, city, district, address, is_active, created_at FROM branches WHERE id = $1 AND is_active = true LIMIT 1',
            [id],
        );

        const branch = rows[0];

        if (!branch) throw ApiError.notFound('Branch not found.');

        res.status(200).json({
            success: true,
            message: 'Branch fetched successfully',
            branch,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch branch details',
        });
    }
};
