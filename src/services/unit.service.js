// src/services/unit.service.js
const userRepo = require('../repositories/user.repository');
const unitRepo = require('../repositories/unit.repository');
const { AppError } = require('../middleware/errorHandler');

// ─────────────────────────────────────────────────────────────
// Helper: cek akses unit berdasarkan role
// superadmin : bebas semua unit
// admin      : hanya unit yang adminId = user.id
// peternak   : hanya unit yang peterId = user.id (read only)
// ─────────────────────────────────────────────────────────────
const checkUnitAccess = (unit, user, { writeOnly = false } = {}) => {
  if (user.role === 'superadmin') return; // superadmin bebas

  if (user.role === 'admin' && unit.adminId !== user.id) {
    throw new AppError('Akses ditolak: unit ini bukan milik Anda', 403);
  }
  if (user.role === 'peternak') {
    if (writeOnly) {
      throw new AppError('Peternak tidak bisa mengubah data unit', 403);
    }
    if (unit.peterId !== user.id) {
      throw new AppError('Akses ditolak: unit ini bukan milik Anda', 403);
    }
  }
};

// ─────────────────────────────────────────────────────────────
// getAll
// superadmin : semua unit
// admin      : unit yang adminId = user.id
// peternak   : unit yang peterId = user.id
// ─────────────────────────────────────────────────────────────
const getAll = (user) => {
  if (user.role === 'superadmin') return unitRepo.findAll();
  if (user.role === 'admin')      return unitRepo.findByAdminId(user.id);
  return unitRepo.findByPeternakId(user.id);
};

// ─────────────────────────────────────────────────────────────
// getStatus — detail satu unit
// ─────────────────────────────────────────────────────────────
const getStatus = async (id, user) => {
  const unit = await unitRepo.findById(Number(id));
  if (!unit) throw new AppError('Unit not found', 404);
  checkUnitAccess(unit, user);
  return unit;
};

// ─────────────────────────────────────────────────────────────
// create — superadmin & admin
// ─────────────────────────────────────────────────────────────
const create = async (data, user) => {
  if (user.role === 'peternak') {
    throw new AppError('Peternak tidak bisa menambah unit', 403);
  }

  const existing = await unitRepo.findByUnitId(data.unitId);
  if (existing) throw new AppError('Unit ID already exists', 409);

  // Kalau admin yang buat, otomatis adminId = dirinya sendiri
  const payload = { ...data };
  if (user.role === 'admin') {
    payload.adminId = user.id;
  }

  if (payload.adminId) {
    const admin = await userRepo.findById(Number(payload.adminId));
    if (!admin) throw new AppError('Admin not found', 404);
    if (admin.role !== 'admin') throw new AppError('User is not an admin', 400);
  }

  return unitRepo.create(payload);
};

// ─────────────────────────────────────────────────────────────
// update — superadmin & admin pemilik
// ─────────────────────────────────────────────────────────────
const update = async (id, data, user) => {
  const unit = await unitRepo.findById(Number(id));
  if (!unit) throw new AppError('Unit not found', 404);
  checkUnitAccess(unit, user, { writeOnly: true });
  return unitRepo.update(Number(id), data);
};

// ─────────────────────────────────────────────────────────────
// remove — superadmin & admin pemilik
// ─────────────────────────────────────────────────────────────
const remove = async (id, user) => {
  const unit = await unitRepo.findById(Number(id));
  if (!unit) throw new AppError('Unit not found', 404);
  checkUnitAccess(unit, user, { writeOnly: true });
  await unitRepo.remove(Number(id));
};

// ─────────────────────────────────────────────────────────────
// assignPeternak — superadmin & admin pemilik unit
// ─────────────────────────────────────────────────────────────
const assignPeternak = async (unitId, peterId, user) => {
  const unit = await unitRepo.findByUnitId(unitId);
  if (!unit) throw new AppError('Unit not found', 404);
  checkUnitAccess(unit, user, { writeOnly: true });

  const peternak = await userRepo.findById(Number(peterId));
  if (!peternak) throw new AppError('User not found', 404);
  if (peternak.role !== 'peternak') throw new AppError('User is not a peternak', 400);

  const owned = await unitRepo.findByPeternakId(Number(peterId));
  const alreadyOther = owned.find((u) => u.unitId !== unitId);
  if (alreadyOther) {
    throw new AppError(`Peternak sudah dipasang ke unit '${alreadyOther.unitId}'`, 409);
  }

  return unitRepo.assignPeternak(unitId, Number(peterId));
};

// ─────────────────────────────────────────────────────────────
// removePeternak — superadmin & admin pemilik unit
// ─────────────────────────────────────────────────────────────
const removePeternak = async (unitId, user) => {
  const unit = await unitRepo.findByUnitId(unitId);
  if (!unit) throw new AppError('Unit not found', 404);
  checkUnitAccess(unit, user, { writeOnly: true });
  return unitRepo.removePeternak(unitId);
};

// ─────────────────────────────────────────────────────────────
// assignAdmin — superadmin only
// ─────────────────────────────────────────────────────────────
const assignAdmin = async (unitId, adminId, user) => {
  if (user.role !== 'superadmin') {
    throw new AppError('Hanya superadmin yang bisa assign admin ke unit', 403);
  }

  const unit = await unitRepo.findByUnitId(unitId);
  if (!unit) throw new AppError('Unit not found', 404);

  const admin = await userRepo.findById(Number(adminId));
  if (!admin) throw new AppError('User not found', 404);
  if (admin.role !== 'admin') throw new AppError('User is not an admin', 400);

  return unitRepo.assignAdmin(unitId, Number(adminId));
};

// ─────────────────────────────────────────────────────────────
// removeAdmin — superadmin only
// ─────────────────────────────────────────────────────────────
const removeAdmin = async (unitId, user) => {
  if (user.role !== 'superadmin') {
    throw new AppError('Hanya superadmin yang bisa melepas admin dari unit', 403);
  }

  const unit = await unitRepo.findByUnitId(unitId);
  if (!unit) throw new AppError('Unit not found', 404);

  return unitRepo.removeAdmin(unitId);
};

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