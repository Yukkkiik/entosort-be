// src/controllers/control.controller.js
const controlService = require('../services/control.service');
const { catchAsync } = require('../utils/catchAsync');

/**
 * POST /control/motor
 * Body: { unitId, action: 'on'|'off', speedRpm? }
 */
const controlMotor = catchAsync(async (req, res) => {
  const result = await controlService.controlMotor(req.body);
  res.json({ success: true, message: 'Motor command sent', data: result });
});

/**
 * POST /control/solenoid
 * Body: { unitId, action: 'on'|'off', delayMs? }
 */
const controlSolenoid = catchAsync(async (req, res) => {
  const result = await controlService.controlSolenoid(req.body);
  res.json({ success: true, message: 'Solenoid command sent', data: result });
});

/**
 * POST /control/manual-mode
 * Body: { unitId, enabled: true|false }
 */
const setManualMode = catchAsync(async (req, res) => {
  const result = await controlService.setManualMode(req.body);
  res.json({ success: true, message: 'Manual mode updated', data: result });
});

module.exports = { controlMotor, controlSolenoid, setManualMode };