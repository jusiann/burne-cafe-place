const pool = require('../config/db');

const getProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name AS category_name FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY p.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pool.query('SELECT * FROM products WHERE id = $1 AND is_active = true', [id]);
    if (product.rows.length === 0) return res.status(404).json({ message: 'Product not found' });

    const sizes = await pool.query('SELECT * FROM product_sizes WHERE product_id = $1', [id]);
    const milkOptions = await pool.query('SELECT * FROM product_milk_options WHERE product_id = $1', [id]);
    const extras = await pool.query('SELECT * FROM product_extras WHERE product_id = $1', [id]);

    res.json({ ...product.rows[0], sizes: sizes.rows, milkOptions: milkOptions.rows, extras: extras.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { category_id, name, description, image_url, base_price, is_popular, is_new, discount, calories, protein, carbs, fat } = req.body;
    const result = await pool.query(
      `INSERT INTO products (category_id, name, description, image_url, base_price, is_popular, is_new, discount, calories, protein, carbs, fat)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [category_id, name, description, image_url, base_price, is_popular ?? false, is_new ?? false, discount ?? 0, calories, protein, carbs, fat]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProducts, getProductById, createProduct };
