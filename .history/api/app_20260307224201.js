const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth.routes');
const productRoutes = require('./src/routes/product.routes');
const categoryRoutes = require('./src/routes/category.routes');
const orderRoutes = require('./src/routes/order.routes');
const storeRoutes = require('./src/routes/store.routes');
const couponRoutes = require('./src/routes/coupon.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Burne Cafe API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/coupons', couponRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

module.exports = app;
