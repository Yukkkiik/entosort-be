const prisma = require('../config/prisma');

const create = (data) => prisma.errorLog.create({ data });

const findAll = ({ nodeId, resolved, severity, limit = 50 }) => {
  const where = {};
  if (nodeId) where.nodeId = nodeId;
  if (resolved !== undefined) where.resolved = resolved === 'true' || resolved === true;
  if (severity) where.severity = severity;

  return prisma.errorLog.findMany({
    where,
    orderBy: { occurredAt: 'desc' },
    take: Number(limit),
    include: { node: { select: { nodeId: true } } },
  });
};

const resolve = (id) =>
  prisma.errorLog.update({ where: { id }, data: { resolved: true } });

const findUnresolved = (limit = 10) =>
  prisma.errorLog.findMany({
    where: { resolved: false },
    orderBy: { occurredAt: 'desc' },
    take: limit,
  });

module.exports = { create, findAll, resolve, findUnresolved };