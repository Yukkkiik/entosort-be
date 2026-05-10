const prisma = require('../config/prisma');

const findByNodeId = (nodeId) => prisma.settings.findUnique({ where: { nodeId } });

const findAll = () => prisma.settings.findMany({ include: { node: { select: { nodeId: true, status: true } } } });

const upsert = (nodeId, data) =>
  prisma.settings.upsert({
    where: { nodeId },
    update: data,
    create: { nodeId, ...data },
  });

module.exports = { findByNodeId, findAll, upsert };