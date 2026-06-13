// src/routes/node.routes.js
// Read-only: status hardware ESP32 & RPi.
// Node dibuat otomatis dari MQTT heartbeat, bukan dari HTTP.
const router = require('express').Router();
const nodeController = require('../controllers/node.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/nodes/:unitId         -- semua node (ESP32 + RPi) milik unit
router.get('/:unitId', nodeController.getByUnitId);

// GET /api/nodes/:unitId/esp32   -- hanya ESP32
router.get('/:unitId/esp32', nodeController.getEsp32);

// GET /api/nodes/:unitId/rpi     -- hanya Raspberry Pi
router.get('/:unitId/rpi', nodeController.getRpi);

module.exports = router;