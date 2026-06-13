// src/repositories/settings.repository.js
const prisma = require('../config/prisma');

const findByUnitId = (unitId) => prisma.settings.findUnique({ where: { unitId } });

const findAll = () =>
  prisma.settings.findMany({
    include: { unit: { select: { unitId: true, status: true } } },
  });

const upsert = (unitId, data) =>
  prisma.settings.upsert({ where: { unitId }, update: data, create: { unitId, ...data } });

module.exports = { findByUnitId, findAll, upsert };