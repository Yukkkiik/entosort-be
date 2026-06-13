// src/routes/dashboard.routes.js
const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/dashboard  -- ringkasan: unit, sensor terbaru, produksi, error terbaru
router.get('/', dashboardController.getSummary);

module.exports = router;