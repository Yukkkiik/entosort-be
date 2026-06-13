// src/repositories/unit.repository.js
const prisma = require('../config/prisma');

const userSelect = { select: { id: true, username: true, role: true } };

const unitInclude = {
  admin: userSelect,
  peternak: userSelect,
  nodes: true,
  settings: true,
};

const findAll = () =>
  prisma.unit.findMany({ orderBy: { createdAt: 'desc' }, include: unitInclude });

const findById = (id) =>
  prisma.unit.findUnique({ where: { id: Number(id) }, include: unitInclude });

const findByUnitId = (unitId) =>
  prisma.unit.findUnique({ where: { unitId }, include: unitInclude });

const findByAdminId = (adminId) =>
  prisma.unit.findMany({
    where: { adminId: Number(adminId) },
    orderBy: { createdAt: 'desc' },
    include: unitInclude,
  });

const findByPeternakId = (peterId) =>
  prisma.unit.findMany({
    where: { peterId: Number(peterId) },
    orderBy: { createdAt: 'desc' },
    include: unitInclude,
  });

const create = (data) => prisma.unit.create({ data, include: unitInclude });

const update = (id, data) =>
  prisma.unit.update({ where: { id: Number(id) }, data, include: unitInclude });

const assignPeternak = (unitId, peterId) =>
  prisma.unit.update({ where: { unitId }, data: { peterId: Number(peterId) }, include: unitInclude });

const removePeternak = (unitId) =>
  prisma.unit.update({ where: { unitId }, data: { peterId: null }, include: unitInclude });

const assignAdmin = (unitId, adminId) =>
  prisma.unit.update({ where: { unitId }, data: { adminId: Number(adminId) }, include: unitInclude });

const removeAdmin = (unitId) =>
  prisma.unit.update({ where: { unitId }, data: { adminId: null, peterId: null }, include: unitInclude });

const remove = (id) => prisma.unit.delete({ where: { id: Number(id) } });

module.exports = {
  findAll,
  findById,
  findByUnitId,
  findByAdminId,
  findByPeternakId,
  create,
  update,
  assignPeternak,
  removePeternak,
  assignAdmin,
  removeAdmin,
  remove,
};