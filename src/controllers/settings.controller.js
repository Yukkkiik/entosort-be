// src/controllers/settings.controller.js
const settingsService = require('../services/settings.service');
const { catchAsync } = require('../utils/catchAsync');

/**
 * GET /settings
 * Query params (opsional): ?unitId=unit-001
 * - dengan unitId  -> settings unit tertentu
 * - tanpa unitId   -> semua settings (admin/superadmin)
 */
const get = catchAsync(async (req, res) => {
  const data = await settingsService.get(req.query);
  res.json({ success: true, data });
});

/**
 * PUT /settings
 * Body: { unitId, ...fields }
 * Field ESP32 : irThreshold, motorSpeedRpm, solenoidDelayMs, manualMode, motorOn, solenoidOn
 * Field RPi   : hsvLowerH, hsvLowerS, hsvLowerV, hsvUpperH, hsvUpperS, hsvUpperV
 * Boleh kirim sebagian — upsert akan merge dengan nilai yang sudah ada.
 */
const update = catchAsync(async (req, res) => {
  const data = await settingsService.update(req.body);
  res.json({ success: true, message: 'Settings updated', data });
});

module.exports = { get, update };