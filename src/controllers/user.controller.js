// src/controllers/user.controller.js
const userService = require('../services/user.service');
const { catchAsync } = require('../utils/catchAsync');

/**
 * GET /api/users
 * Superadmin: semua user.
 * Admin: hanya user yang unitnya dikelola admin tersebut (filter di service kalau perlu).
 */
const getAll = catchAsync(async (req, res) => {
  const users = await userService.getAll(req.query, req.user);
  res.json({ success: true, data: users });
});

/**
 * GET /api/users/:id
 */
const getById = catchAsync(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json({ success: true, data: user });
});

/**
 * POST /api/users
 * Body: { username, password, role, phone?, selectedUnits?: string[] }
 *
 * selectedUnits (opsional):
 *   - role admin    → array unitId yang langsung dikelola admin baru
 *   - role peternak → array dengan 1 unitId saja (peternak max 1 unit)
 */
const create = catchAsync(async (req, res) => {
  const user = await userService.create(req.body, req.user);
  res.status(201).json({ success: true, message: 'User created', data: user });
});

/**
 * PUT /api/users/:id
 * Body: { phone?, password?, selectedUnits? }
 *
 * Peternak yang update dirinya sendiri: hanya phone & password.
 * Admin/superadmin: bisa update semua field + re-assign unit.
 */
const update = catchAsync(async (req, res) => {
  const user = await userService.update(req.params.id, req.body, req.user);
  res.json({ success: true, message: 'User updated', data: user });
});

/**
 * DELETE /api/users/:id
 * Superadmin only (enforce di route middleware).
 */
const remove = catchAsync(async (req, res) => {
  await userService.remove(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { getAll, getById, create, update, remove };