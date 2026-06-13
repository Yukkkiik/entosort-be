// src/repositories/node.repository.js
const prisma = require('../config/prisma');

const findByUnitId = (unitId) =>
  prisma.node.findMany({ where: { unitId }, orderBy: { nodeType: 'asc' } });

const findByNodeId = (nodeId) =>
  prisma.node.findUnique({ where: { nodeId }, include: { unit: true } });

// Dipanggil saat node mengirim heartbeat lewat MQTT
const upsertByNodeId = (nodeId, data) =>
  prisma.node.upsert({
    where: { nodeId },
    update: data,
    create: { nodeId, ...data },
  });

const updateStatus = (nodeId, status) =>
  prisma.node.update({
    where: { nodeId },
    data: { status, lastSeen: new Date() },
  });

const findLatestPerUnit = () =>
  prisma.node.findMany({
    orderBy: { lastSeen: 'desc' },
    include: { unit: { select: { unitId: true } } },
  });

module.exports = { findByUnitId, findByNodeId, upsertByNodeId, updateStatus, findLatestPerUnit };