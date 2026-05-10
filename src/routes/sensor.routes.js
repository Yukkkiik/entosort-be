// src/routes/sensor.routes.js
const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/latest', sensorController.getLatest);
router.get('/history', sensorController.getHistory);

module.exports = router;