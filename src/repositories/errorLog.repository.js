// src/repositories/errorLog.repository.js
const prisma = require('../config/prisma');

const create = (data) => prisma.errorLog.create({ data });

const findUnresolved = (limit = 5) =>
  prisma.errorLog.findMany({
    where: { resolved: false },
    orderBy: { occurredAt: 'desc' },
    take: Number(limit),
  });

const findByUnitId = (unitId, { limit = 50 } = {}) =>
  prisma.errorLog.findMany({
    where: { unitId },
    orderBy: { occurredAt: 'desc' },
    take: Number(limit),
  });

const resolve = (id) =>
  prisma.errorLog.update({ where: { id: Number(id) }, data: { resolved: true } });

module.exports = { create, findUnresolved, findByUnitId, resolve };