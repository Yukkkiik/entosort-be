const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateSettingsSchema } = require('../validations/settings.validation');

router.use(authenticate);

router.get('/', settingsController.get);
router.put('/', authorize('admin'), validate(updateSettingsSchema), settingsController.update);

module.exports = router;