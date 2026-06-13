// src/repositories/report.repository.js
const prisma = require('../config/prisma');

/**
 * buildWhere:
 * - admin      → hanya unit yang adminId = userId
 * - peternak   → hanya unit yang peterId = userId
 * - superadmin → ditolak di service sebelum sampai sini
 *
 * Kalau unitId spesifik disertakan, filter relasi unit di-skip
 * (validasi akses sudah dilakukan di service).
 */
const buildWhere = ({ from, to, unitId, userId, role }) => {
  const where = {};

  if (!unitId) {
    if (role === 'admin') {
      where.unit = { adminId: Number(userId) };
    } else if (role === 'peternak') {
      where.unit = { peterId: Number(userId) };
    }
  } else {
    where.unitId = unitId;
  }

  const dateFrom = from ? new Date(from) : null;
  const dateTo   = to   ? new Date(to)   : null;
  const validFrom = dateFrom && !isNaN(dateFrom.getTime());
  const validTo   = dateTo   && !isNaN(dateTo.getTime());

  if (validFrom || validTo) {
    where.recordedAt = {};
    if (validFrom) where.recordedAt.gte = dateFrom;
    if (validTo)   where.recordedAt.lte = dateTo;
  }

  return where;
};

const findHarvestForExport = (filters) => {
  const where = buildWhere(filters);
  return prisma.harvestLog.findMany({
    where,
    orderBy: { recordedAt: 'asc' },
    include: {
      user: { select: { username: true } },
      unit: { select: { unitId: true, location: true } },
    },
  });
};

const findHarvestForDaily = (filters) => {
  const where = buildWhere(filters);
  return prisma.harvestLog.findMany({
    where,
    orderBy: { recordedAt: 'asc' },
    include: {
      user: { select: { username: true } },
    },
  });
};

module.exports = { findHarvestForExport, findHarvestForDaily };