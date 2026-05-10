const controlService = require('../services/control.service');
const { catchAsync } = require('../utils/catchAsync');

const controlMotor = catchAsync(async (req, res) => {
  const result = await controlService.controlMotor(req.body);
  res.json({ success: true, message: 'Motor command sent', data: result });
});

const controlSolenoid = catchAsync(async (req, res) => {
  const result = await controlService.controlSolenoid(req.body);
  res.json({ success: true, message: 'Solenoid command sent', data: result });
});

const setManualMode = catchAsync(async (req, res) => {
  const result = await controlService.setManualMode(req.body);
  res.json({ success: true, message: 'Manual mode updated', data: result });
});

module.exports = { controlMotor, controlSolenoid, setManualMode };