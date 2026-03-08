const pool = require('../config/db');

const getStores = async (req, res) => {
  try {
    const { city, district } = req.query;
    let query = 'SELECT * FROM stores WHERE is_active = true';
    const params = [];
    if (city) { params.push(city); query += ` AND city = $${params.length}`; }
    if (district) { params.push(district); query += ` AND district = $${params.length}`; }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createStore = async (req, res) => {
  try {
    const { name, city, district } = req.body;
    const result = await pool.query(
      'INSERT INTO stores (name, city, district) VALUES ($1, $2, $3) RETURNING *',
      [name, city, district]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStoreEmployees = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone FROM users u
       INNER JOIN employee_stores es ON u.id = es.user_id
       WHERE es.store_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addEmployeeToStore = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    const { user_id } = req.body;
    await pool.query(
      'INSERT INTO employee_stores (user_id, store_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [user_id, storeId]
    );
    res.status(201).json({ message: 'Employee assigned to store' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStores, createStore, getStoreEmployees, addEmployeeToStore };
