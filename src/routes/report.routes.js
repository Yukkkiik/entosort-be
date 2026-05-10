const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/daily', reportController.daily);
router.get('/export/pdf', reportController.exportPdf);
router.get('/export/csv', reportController.exportCsv);

module.exports = router;