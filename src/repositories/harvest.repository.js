// src/repositories/harvest.repository.js
const prisma = require('../config/prisma');

const create = (data) => prisma.harvestLog.create({ data });

// Peternak hanya boleh lihat panen dari unit miliknya sendiri (unit.peterId)
const buildWhere = ({ unitId, from, to, userId, isAdmin }) => {
  const where = {};
  if (!isAdmin && userId) {
    where.unit = { peterId: Number(userId) };
  }
  if (unitId) where.unitId = unitId;
  if (from || to) {
    where.recordedAt = {};
    if (from) where.recordedAt.gte = new Date(from);
    if (to) where.recordedAt.lte = new Date(to);
  }
  return where;
};

const findAll = (filters) => {
  const where = buildWhere(filters);
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;

  return Promise.all([
    prisma.harvestLog.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: limit,
      skip,
      include: { user: { select: { id: true, username: true } } },
    }),
    prisma.harvestLog.count({ where }),
  ]);
};

const getStats = (filters) => {
  const where = buildWhere(filters);
  return prisma.harvestLog.aggregate({
    where,
    _sum: { larvaCount: true, prepupaCount: true, rejectCount: true, totalCount: true },
    _avg: { larvaCount: true, prepupaCount: true },
    _count: { id: true },
  });
};

const findForReport = ({ from, to }) => {
  const where = {};
  if (from || to) {
    where.recordedAt = {};
    if (from) where.recordedAt.gte = new Date(from);
    if (to) where.recordedAt.lte = new Date(to);
  }
  return prisma.harvestLog.findMany({
    where,
    orderBy: { recordedAt: 'asc' },
    include: {
      user: { select: { username: true } },
      unit: { select: { unitId: true } },
    },
  });
};

module.exports = { create, findAll, getStats, findForReport };