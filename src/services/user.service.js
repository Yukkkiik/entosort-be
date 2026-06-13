// src/services/user.service.js
const userRepo = require('../repositories/user.repository');
const unitRepo = require('../repositories/unit.repository');
const { AppError } = require('../middleware/errorHandler');
const { hashPassword } = require('../utils/password');

/**
 * getAll:
 * - superadmin → hanya lihat daftar admin
 * - admin      → hanya lihat peternak yang unitnya dia kelola
 * - peternak   → 403
 */
const getAll = (query, currentUser) => {
  if (currentUser.role === 'superadmin') {
    return userRepo.findAll({ role: 'admin' });
  }
  if (currentUser.role === 'admin') {
    return userRepo.findAll({ role: 'peternak', adminId: currentUser.id });
  }
  throw new AppError('Akses ditolak', 403);
};

const getById = async (id) => {
  const user = await userRepo.findById(Number(id));
  if (!user) throw new AppError('User not found', 404);
  return user;
};

/**
 * create:
 * - superadmin → hanya boleh buat user dengan role 'admin'
 * - admin      → hanya boleh buat user dengan role 'peternak'
 */
const create = async (data, currentUser) => {
  const { username, password, role, phone, selectedUnits } = data;

  // Validasi role yang boleh dibuat
  if (currentUser.role === 'superadmin' && role !== 'admin') {
    throw new AppError('Superadmin hanya bisa membuat akun admin', 400);
  }
  if (currentUser.role === 'admin' && role !== 'peternak') {
    throw new AppError('Admin hanya bisa membuat akun peternak', 400);
  }

  const existing = await userRepo.findByUsername(username);
  if (existing) throw new AppError('Username already exists', 409);

  const hashedPassword = await hashPassword(password);
  const newUser = await userRepo.create({
    username,
    password: hashedPassword,
    role,
    phone,
  });

  // Admin buat peternak → langsung assign ke unit milik admin
  if (
    currentUser.role === 'admin' &&
    role === 'peternak' &&
    selectedUnits?.length > 0
  ) {
    const unitId = selectedUnits[0]; // peternak max 1 unit
    const unit   = await unitRepo.findByUnitId(unitId);
    if (!unit) throw new AppError(`Unit '${unitId}' not found`, 404);

    // Pastikan unit itu memang milik admin yang sedang login
    if (unit.adminId !== currentUser.id) {
      throw new AppError('Akses ditolak: unit ini bukan milik Anda', 403);
    }
    await unitRepo.assignPeternak(unitId, newUser.id);
  }

  return newUser;
};

/**
 * update:
 * - superadmin → hanya boleh update data admin
 * - admin      → hanya boleh update peternak miliknya
 * - peternak   → hanya boleh update data dirinya sendiri (phone & password)
 */
const update = async (id, data, currentUser) => {
  const user = await userRepo.findById(Number(id));
  if (!user) throw new AppError('User not found', 404);

  // Superadmin hanya boleh edit admin
  if (currentUser.role === 'superadmin' && user.role !== 'admin') {
    throw new AppError('Superadmin hanya bisa mengelola akun admin', 403);
  }

  // Admin hanya boleh edit peternak miliknya
  if (currentUser.role === 'admin') {
    if (user.role !== 'peternak') {
      throw new AppError('Admin hanya bisa mengelola akun peternak', 403);
    }
    // Cek apakah peternak ini memang di bawah admin yang login
    if (user.peternakUnit && user.peternakUnit.adminId !== currentUser.id) {
      throw new AppError('Akses ditolak: peternak ini bukan milik Anda', 403);
    }
  }

  // Peternak hanya boleh edit dirinya sendiri & field terbatas
  let updatePayload = { ...data };
  if (currentUser.role === 'peternak') {
    if (Number(id) !== currentUser.id) {
      throw new AppError('Akses ditolak', 403);
    }
    updatePayload = {};
    if (data.phone)    updatePayload.phone    = data.phone;
    if (data.password) updatePayload.password = data.password;
  }

  const { selectedUnits, ...finalData } = updatePayload;

  if (finalData.password) {
    finalData.password = await hashPassword(finalData.password);
  }

  // Re-assign unit — hanya admin yang boleh lakukan ini untuk peternak miliknya
  if (selectedUnits && Array.isArray(selectedUnits) && currentUser.role === 'admin') {
    if (user.role === 'peternak') {
      const currentUnitId = user.peternakUnit?.unitId || null;
      const newUnitId     = selectedUnits[0] || null;

      if (currentUnitId && currentUnitId !== newUnitId) {
        await unitRepo.removePeternak(currentUnitId);
      }
      if (newUnitId && newUnitId !== currentUnitId) {
        const unit = await unitRepo.findByUnitId(newUnitId);
        if (!unit) throw new AppError(`Unit '${newUnitId}' not found`, 404);
        if (unit.adminId !== currentUser.id) {
          throw new AppError('Akses ditolak: unit ini bukan milik Anda', 403);
        }
        await unitRepo.assignPeternak(newUnitId, user.id);
      }
    }
  }

  return userRepo.update(Number(id), finalData);
};

/**
 * remove:
 * - superadmin → hanya boleh hapus admin
 * - admin      → hanya boleh hapus peternak miliknya
 */
const remove = async (id, currentUser) => {
  const user = await userRepo.findById(Number(id));
  if (!user) throw new AppError('User not found', 404);

  if (currentUser.role === 'superadmin' && user.role !== 'admin') {
    throw new AppError('Superadmin hanya bisa menghapus akun admin', 403);
  }
  if (currentUser.role === 'admin') {
    if (user.role !== 'peternak') {
      throw new AppError('Admin hanya bisa menghapus akun peternak', 403);
    }
    if (user.peternakUnit && user.peternakUnit.adminId !== currentUser.id) {
      throw new AppError('Akses ditolak: peternak ini bukan milik Anda', 403);
    }
  }

  await userRepo.remove(Number(id));
};

module.exports = { getAll, getById, create, update, remove };