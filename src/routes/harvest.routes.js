// src/routes/harvest.routes.js
const express = require('express');
const router = express.Router();
const harvestController = require('../controllers/harvest.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createHarvestSchema } = require('../validations/harvest.validation');

router.use(authenticate);

router.post('/', validate(createHarvestSchema), harvestController.create);
router.get('/', harvestController.getAll);
router.get('/stats', harvestController.getStats);

module.exports = router;