// src/controllers/harvest.controller.js
const harvestService = require('../services/harvest.service');
const { catchAsync } = require('../utils/catchAsync');

const create = catchAsync(async (req, res) => {
  console.log('req.user:', req.user);        // ← tambah ini
  console.log('typeof req.user:', typeof req.user); 
  const data = await harvestService.create({ ...req.body, userId: req.user.id });
  res.status(201).json({ success: true, message: 'Harvest log saved', data });
});

const getAll = catchAsync(async (req, res) => {
  const result = await harvestService.getAll(req.query, req.user.id);
  res.json({ success: true, ...result });
});

const getStats = catchAsync(async (req, res) => {
  const stats = await harvestService.getStats(req.query, req.user.id);
  res.json({ success: true, data: stats });
});

module.exports = { create, getAll, getStats };