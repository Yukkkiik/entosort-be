// src/routes/harvest.routes.js
const router = require('express').Router();
const harvestController = require('../controllers/harvest.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// POST /api/harvests  -- simpan hasil panen (dari REST manual atau relay dari MQTT RPi)
// Body: { unitId, larvaCount, prepupaCount, rejectCount, durationSec?, notes?, triggerSource? }
router.post('/', harvestController.create);

// GET /api/harvests
// Query: ?unitId=...&from=ISO&to=ISO&page=1&limit=50
// Peternak: hanya lihat panen dari unitnya sendiri
// Admin/superadmin: bisa lihat semua
router.get('/', harvestController.getAll);

// GET /api/harvests/stats
// Query: ?unitId=...&from=ISO&to=ISO
router.get('/stats', harvestController.getStats);

module.exports = router;