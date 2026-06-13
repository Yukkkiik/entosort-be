// src/controllers/node.controller.js
const nodeService = require('../services/node.service');
const { catchAsync } = require('../utils/catchAsync');

// GET /api/nodes/:unitId — semua node (ESP32 + RPi) milik unit
const getByUnitId = catchAsync(async (req, res) => {
  const nodes = await nodeService.getByUnitId(req.params.unitId, req.user);
  res.json({ success: true, data: nodes });
});

// GET /api/nodes/:unitId/esp32 — ESP32 saja
const getEsp32 = catchAsync(async (req, res) => {
  const nodes = await nodeService.getByUnitId(req.params.unitId, req.user);
  const esp32 = nodes.find((n) => n.nodeType === 'esp32') || null;
  res.json({ success: true, data: esp32 });
});

// GET /api/nodes/:unitId/rpi — Raspberry Pi saja
const getRpi = catchAsync(async (req, res) => {
  const nodes = await nodeService.getByUnitId(req.params.unitId, req.user);
  const rpi = nodes.find((n) => n.nodeType === 'raspberry') || null;
  res.json({ success: true, data: rpi });
});

module.exports = { getByUnitId, getEsp32, getRpi };