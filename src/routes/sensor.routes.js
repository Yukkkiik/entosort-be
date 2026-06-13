// src/routes/sensor.routes.js
const router = require('express').Router();
const sensorController = require('../controllers/sensor.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// GET /api/sensors/latest
// Query: ?nodeId=esp32-001  ATAU  ?unitId=unit-001
// nodeId  -> dari ESP32 spesifik (debug hardware)
// unitId  -> terbaru dari unit (dashboard)
router.get('/latest', sensorController.getLatest);

// GET /api/sensors/latest/per-unit  -- satu data terbaru per unit (dashboard summary)
router.get('/latest/per-unit', sensorController.getLatestPerUnit);

// GET /api/sensors/latest/per-node  -- satu data terbaru per ESP32 (monitoring hardware)
router.get('/latest/per-node', sensorController.getLatestPerNode);

// GET /api/sensors/history
// Query: ?nodeId=...  ATAU  ?unitId=...  &from=ISO&to=ISO&limit=100
router.get('/history', sensorController.getHistory);

module.exports = router;