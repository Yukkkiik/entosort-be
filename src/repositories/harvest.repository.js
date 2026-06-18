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

const findAll = async (params) => {
  const { page = 1, limit = 50, from, to, nodeId, userId, isAdmin } = params;
  
  const where = {};

  if (from || to) {
    where.recordedAt = {};
    if (from) where.recordedAt.gte = new Date(from);
    if (to)   where.recordedAt.lte = new Date(to);
  }

  if (nodeId) {
    where.unitId = nodeId; 
  }

  if (isAdmin) {
    where.unit = { adminId: userId };
  } else {
    where.unit = { peterId: userId };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await prisma.$transaction([
    prisma.harvestLog.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { recordedAt: 'desc' },
    }),
    prisma.harvestLog.count({ where })
  ]);

  return [logs, total];
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