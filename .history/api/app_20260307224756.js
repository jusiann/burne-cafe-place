const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    console.log(`[LOG - ${time}] ${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// Routes
app.use('/api/auth',       require('./src/routes/auth.routes'));
app.use('/api/products',   require('./src/routes/product.routes'));
app.use('/api/categories', require('./src/routes/category.routes'));
app.use('/api/orders',     require('./src/routes/order.routes'));
app.use('/api/stores',     require('./src/routes/store.routes'));
app.use('/api/coupons',    require('./src/routes/coupon.routes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, uptime: process.uptime() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
  console.log(`[SERVER - ${time}] Started on PORT ${PORT}`);
});
