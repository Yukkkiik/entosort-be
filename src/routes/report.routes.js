// src/routes/report.routes.js
const express = require('express');
const router  = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/reports/daily
// Query: ?unitId=...&date=YYYY-MM-DD
router.get('/daily', reportController.daily);

// GET /api/reports/export/pdf
// Query: ?from=ISO&to=ISO&unitId=...
router.get('/export/pdf', reportController.exportPdf);

// GET /api/reports/export/xlsx
// Query: ?from=ISO&to=ISO&unitId=...
router.get('/export/xlsx', reportController.exportXlsx);

module.exports = router;