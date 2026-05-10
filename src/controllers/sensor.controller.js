// src/controllers/sensor.controller.js
const sensorService = require('../services/sensor.service');
const { catchAsync } = require('../utils/catchAsync');

const getLatest = catchAsync(async (req, res) => {
  const data = await sensorService.getLatest(req.query);
  res.json({ success: true, data });
});

const getHistory = catchAsync(async (req, res) => {
  const data = await sensorService.getHistory(req.query);
  res.json({ success: true, data });
});

module.exports = { getLatest, getHistory };