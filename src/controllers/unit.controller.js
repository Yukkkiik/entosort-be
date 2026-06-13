// src/controllers/unit.controller.js
const unitService = require('../services/unit.service');
const { catchAsync } = require('../utils/catchAsync');

// GET /api/units
// admin: unit miliknya | peternak: unitnya sendiri | superadmin: semua Unit
const getAll = catchAsync(async (req, res) => {
  const units = await unitService.getAll(req.user);
  res.json({ success: true, data: units });
});

// GET /api/units/:id
const getStatus = catchAsync(async (req, res) => {
  const unit = await unitService.getStatus(req.params.id, req.user);
  res.json({ success: true, data: unit });
});

// POST /api/units — superadmin only
const create = catchAsync(async (req, res) => {
  const unit = await unitService.create(req.body, req.user);
  res.status(201).json({ success: true, message: 'Unit created', data: unit });
});

// PUT /api/units/:id — admin pemilik unit
const update = catchAsync(async (req, res) => {
  const unit = await unitService.update(req.params.id, req.body, req.user);
  res.json({ success: true, message: 'Unit updated', data: unit });
});

// DELETE /api/units/:id — superadmin only
const remove = catchAsync(async (req, res) => {
  await unitService.remove(req.params.id, req.user);
  res.json({ success: true, message: 'Unit deleted' });
});

// POST /api/units/:unitId/assign-peternak — admin pemilik unit
const assignPeternak = catchAsync(async (req, res) => {
  const { unitId } = req.params;
  const { peterId } = req.body;
  const unit = await unitService.assignPeternak(unitId, peterId, req.user);
  res.json({ success: true, message: 'Peternak assigned to unit', data: unit });
});

// DELETE /api/units/:unitId/assign-peternak — admin pemilik unit
const removePeternak = catchAsync(async (req, res) => {
  const unit = await unitService.removePeternak(req.params.unitId, req.user);
  res.json({ success: true, message: 'Peternak removed from unit', data: unit });
});

// POST /api/units/:unitId/assign-admin — superadmin only
const assignAdmin = catchAsync(async (req, res) => {
  const { unitId } = req.params;
  const { adminId } = req.body;
  const unit = await unitService.assignAdmin(unitId, adminId, req.user);
  res.json({ success: true, data: unit });
});

// DELETE /api/units/:unitId/assign-admin — superadmin only
const removeAdmin = catchAsync(async (req, res) => {
  const unit = await unitService.removeAdmin(req.params.unitId, req.user);
  res.json({ success: true, data: unit });
});

module.exports = {
  getAll,
  getStatus,
  create,
  update,
  remove,
  assignPeternak,
  removePeternak,
  assignAdmin,
  removeAdmin,
};