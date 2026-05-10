const prisma = require('../config/prisma');

const create = (data) => prisma.sensorLog.create({
    data,
});

const findLatest = (nodeId) => {
    const where = nodeId ? { nodeId }: {};
    return prisma.sensorLog.findFirst({
        where,
        orderBy: { recordedAt: 'desc' },
        include: { node: { select: { nodeId: true, status: true }}},
    });
};

const findHistory = ({ nodeId, from, to, limit = 100}) => {
    const where = {};
    if (nodeId) where.nodeId = nodeId;
    if (from || to) {
        where.recordedAt = {};
        if (from) where.recordedAt.gte = new Date(from);
        if (to) where.recordedAt.lte = new Date(to);
    }
    return prisma.sensorLog.findMany({
        where,
        orderBy: { recordedAt: 'desc' },
        take: Number(limit),
    });
};

const findLatestPerNode = () =>
  prisma.sensorLog.findMany({
    distinct: ['nodeId'],
    orderBy: { recordedAt: 'desc' },
  });
 
module.exports = { create, findLatest, findHistory, findLatestPerNode };