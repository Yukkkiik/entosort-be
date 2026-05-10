const prisma = require('../config/prisma');

const create = (data) => prisma.harvestLog.create({ data });

const findAll = ({ nodeId, from, to, limit = 50, page = 1 }) => {
  const where = {};
  if (nodeId) where.nodeId = nodeId;
  if (from || to) {
    where.recordedAt = {};
    if (from) where.recordedAt.gte = new Date(from);
    if (to) where.recordedAt.lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);

  return Promise.all([
    prisma.harvestLog.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: Number(limit),
      skip,
      include: { user: { select: { id: true, username: true } } },
    }),
    prisma.harvestLog.count({ where }),
  ]);
};

const getStats = ({ nodeId, from, to }) => {
  const where = {};
  if (nodeId) where.nodeId = nodeId;
  if (from || to) {
    where.recordedAt = {};
    if (from) where.recordedAt.gte = new Date(from);
    if (to) where.recordedAt.lte = new Date(to);
  }

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
    include: { user: { select: { username: true } }, node: { select: { nodeId: true } } },
  });
};

module.exports = { create, findAll, getStats, findForReport };