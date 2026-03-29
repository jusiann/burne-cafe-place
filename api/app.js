import express from 'express';
import 'dotenv/config';

import AUTH_ROUTER from './src/routes/auth.router.js';
import PRODUCTS_ROUTER from './src/routes/products.router.js';
import CATEGORIES_ROUTER from './src/routes/categories.router.js';
import BRANCHES_ROUTER from './src/routes/branches.router.js';
import CART_ROUTER from './src/routes/cart.router.js';
import ORDERS_ROUTER from './src/routes/orders.router.js';
import ADMIN_ROUTER from './src/routes/admin.routes.js';

import { connectDB, runSeed } from './src/lib/db/database.js';

import helmet from 'helmet';
import cors from 'cors';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - start;
        const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
        console.log(
        `[LOG - ${time}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`,
        );
        return originalSend.call(this, data);
    };
    next();
});

app.use('/api/auth', AUTH_ROUTER);
app.use('/api/products', PRODUCTS_ROUTER);
app.use('/api/categories', CATEGORIES_ROUTER);
app.use('/api/branches', BRANCHES_ROUTER);
app.use('/api/cart', CART_ROUTER);
app.use('/api/orders', ORDERS_ROUTER);
app.use('/api/admin', ADMIN_ROUTER);

app.get('/api/health', (req, res) => {
    const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    res.status(200).json({
        success: true,
        message: `[SERVER - ${time}] System is healthy`,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500 
        ? 'Internal server error' 
        : (err.message || 'Internal server error');
        
    res.status(statusCode).json({ success: false, message });
});

app.listen(PORT, async () => {
    const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    console.log(`[SERVER - ${time}] Started on port ${PORT}`);
    await connectDB();
    await runSeed();
});
