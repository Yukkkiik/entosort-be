// src/routes/settings.routes.js
const router = require('express').Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /api/settings
// Query: ?unitId=unit-001  -> settings unit tertentu
// (tanpa query)            -> semua settings, admin/superadmin only
router.get('/', settingsController.get);

// PUT /api/settings
// Body: { unitId, ...fields }
// Hanya admin & superadmin yang boleh update settings
router.put('/', authorize('superadmin', 'admin'), settingsController.update);

module.exports = router;