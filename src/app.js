require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
// const { initMqtt } = require('./mqtt/mqttClient');
// const { initWebSocket } = require('./utils/websocket');

const app = express();
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 3001;

// ================================
// SECURITY MIDDLEWARE
// ================================
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ================================
// RATE LIMITING
// ================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ================================
// GENERAL MIDDLEWARE
// ================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ================================
// HEALTH CHECK
// ================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'BSF Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ================================
// ROUTES
// ================================
app.use('/api', routes);

// ================================
// ERROR HANDLERS
// ================================
app.use(notFoundHandler);
app.use(errorHandler);

// ================================
// START SERVER
// ================================
const server = app.listen(PORT, () => {
  console.log(`\n🚀 BSF Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health\n`);

  // Initialize MQTT client
//   initMqtt();

  // Initialize WebSocket server
//   initWebSocket(WS_PORT);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = app;