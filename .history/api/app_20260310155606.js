import express, { response } from 'express';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;
    const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    console.log(`[LOG - ${time}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    return originalSend.call(this, data);
  };
  next();
});

// Routes
app.use('/', (req, res) = {
  res.status(200).json({
    success: true
  });
});

// Health check
app.get('/health', (req, res) => {
  const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
  res.status(200).json({
    success: true,
    message: `[SERVER - ${time}] System is healthy`,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
  console.log(`[SERVER - ${time}] Started on PORT ${PORT}`);
});
