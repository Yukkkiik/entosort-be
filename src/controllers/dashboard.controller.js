const dashboardService = require('../services/dashboard.service');
const { catchAsync } = require('../utils/catchAsync');

const getSummary = catchAsync(async (req, res) => {
  const data = await dashboardService.getSummary();
  res.json({ success: true, data });
});

module.exports = { getSummary };