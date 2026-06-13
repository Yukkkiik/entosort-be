// src/controllers/sensor.controller.js
const sensorService = require('../services/sensor.service');
const { catchAsync } = require('../utils/catchAsync');

/**
 * GET /sensors/latest
 * Query params (opsional, salah satu):
 *   ?nodeId=esp32-001   -> data dari ESP32 spesifik
 *   ?unitId=unit-001    -> data terbaru dari unit
 *   (kosong)            -> data terbaru secara global
 */
const getLatest = catchAsync(async (req, res) => {
  const data = await sensorService.getLatest(req.query);
  res.json({ success: true, data });
});

/**
 * GET /sensors/history
 * Query params:
 *   ?nodeId=...  atau  ?unitId=...
 *   ?from=ISO   ?to=ISO   ?limit=100
 */
const getHistory = catchAsync(async (req, res) => {
  const data = await sensorService.getHistory(req.query);
  res.json({ success: true, data });
});

/**
 * GET /sensors/latest/per-unit
 * Ringkasan satu data terbaru per unit -- untuk dashboard.
 */
const getLatestPerUnit = catchAsync(async (req, res) => {
  const data = await sensorService.getLatestPerUnit();
  res.json({ success: true, data });
});

/**
 * GET /sensors/latest/per-node
 * Ringkasan satu data terbaru per ESP32 -- untuk monitoring hardware.
 */
const getLatestPerNode = catchAsync(async (req, res) => {
  const data = await sensorService.getLatestPerNode();
  res.json({ success: true, data });
});

module.exports = { getLatest, getHistory, getLatestPerUnit, getLatestPerNode };