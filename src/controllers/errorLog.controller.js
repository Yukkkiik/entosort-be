const errorLogService = require('../services/errorLog.service');
const { catchAsync } = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const data = await errorLogService.getAll(req.query);
  res.json({ success: true, data });
});

const resolve = catchAsync(async (req, res) => {
  const data = await errorLogService.resolve(req.params.id);
  res.json({ success: true, message: 'Error marked as resolved', data });
});

module.exports = { getAll, resolve };