import ApiError from '../utils/error.js';
import db from '../lib/db/database.js';

export const getProducts = async (req, res) => {
    try {
        const { category, search, is_popular, is_new } = req.query;

        let query =
            'SELECT p.id, p.name, p.description, p.image_url, p.base_price, p.is_popular, p.is_new, p.discount, p.is_available, c.id AS category_id, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_available = true';

        let querySegments = [];
        let queryValues = [];
        let index = 1;

        if (category) {
            querySegments.push('c.id = $' + index++);
            queryValues.push(category);
        }

        if (search) {
            querySegments.push(
                '(p.name ILIKE $' +
                    index +
                    ' OR p.description ILIKE $' +
                    index +
                    ')',
            );
            queryValues.push('%' + search + '%');
            index++;
        }

        if (is_popular === 'true') querySegments.push('p.is_popular = true');

        if (is_new === 'true') querySegments.push('p.is_new = true');

        if (querySegments.length > 0)
            query += ' AND ' + querySegments.join(' AND ');

        query += ' ORDER BY c.sort_order ASC, p.name ASC LIMIT 200';

        const { rows } = await db.query(query, queryValues);

        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            products: rows,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch products',
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) throw ApiError.badRequest('Product ID is required.');

        const { rows: productRows } = await db.query(
            'SELECT p.id, p.name, p.description, p.image_url, p.base_price, p.is_popular, p.is_new, p.discount, p.is_available, p.nutrition_calories, p.nutrition_protein, p.nutrition_carbs, p.nutrition_fat, c.id AS category_id, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1 AND p.is_available = true LIMIT 1',
            [id],
        );
        const product = productRows[0];

        if (!product) throw ApiError.notFound('Product not found.');

        const { rows: optionRows } = await db.query(
            'SELECT id, option_type, name, extra_price FROM product_options WHERE product_id = $1 AND is_available = true ORDER BY extra_price ASC',
            [id],
        );

        product.options = {
            size: optionRows.filter((opt) => opt.option_type === 'size'),
            milk: optionRows.filter((opt) => opt.option_type === 'milk'),
            extra: optionRows.filter((opt) => opt.option_type === 'extra'),
        };

        res.status(200).json({
            success: true,
            message: 'Product fetched successfully',
            product,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to fetch product details',
        });
    }
};
