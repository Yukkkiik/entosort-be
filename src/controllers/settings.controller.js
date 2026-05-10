const settingsService = require('../services/settings.service');
const { catchAsync } = require('../utils/catchAsync');

const get = catchAsync(async (req, res) => {
  const data = await settingsService.get(req.query);
  res.json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await settingsService.update(req.body);
  res.json({ success: true, message: 'Settings updated', data });
});

module.exports = { get, update };