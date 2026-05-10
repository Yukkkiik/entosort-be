const express = require('express');
const router = express.Router();
const controlController = require('../controllers/control.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { motorSchema, solenoidSchema, manualModeSchema } = require('../validations/control.validation');

router.use(authenticate);

router.post('/motor', validate(motorSchema), controlController.controlMotor);
router.post('/solenoid', validate(solenoidSchema), controlController.controlSolenoid);
router.post('/manual-mode', validate(manualModeSchema), controlController.setManualMode);

module.exports = router;