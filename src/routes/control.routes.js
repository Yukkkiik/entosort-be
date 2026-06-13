// src/routes/control.routes.js
const router = require('express').Router();
const controlController = require('../controllers/control.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { motorSchema, solenoidSchema, manualModeSchema } = require('../validations/control.validation');

router.use(authenticate);

// Hanya admin & superadmin yang boleh kirim perintah ke device
// (peternak hanya monitoring, bukan control)
router.use(authorize('superadmin', 'admin'));

// POST /api/control/motor
// Body: { unitId, action: 'on'|'off', speedRpm? }
router.post('/motor', validate(motorSchema),controlController.controlMotor);

// POST /api/control/solenoid
// Body: { unitId, action: 'on'|'off', delayMs? }
router.post('/solenoid', validate(solenoidSchema),controlController.controlSolenoid);

// POST /api/control/manual-mode
// Body: { unitId, enabled: true|false }
router.post('/manual-mode', validate(manualModeSchema),controlController.setManualMode);

module.exports = router;