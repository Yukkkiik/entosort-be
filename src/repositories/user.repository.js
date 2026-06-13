// src/repositories/user.repository.js
const prisma = require('../config/prisma');

const userSelect = {
  id:        true,
  username:  true,
  role:      true,
  phone:     true,
  createdAt: true,
  updatedAt: true,
};

const unitSelect = {
  id:       true,
  unitId:   true,
  location: true,
  status:   true,
  nodes: {
    select: {
      nodeId:    true,
      nodeType:  true,
      status:    true,
      ipAddress: true,
      firmware:  true,
      lastSeen:  true,
    },
  },
};

/**
 * findAll -- support filter:
 * - role    : filter by role (peternak/admin)
 * - adminId : filter peternak yang unitnya dikelola admin tertentu
 */
const findAll = ({ role, adminId } = {}) => {
  const where = {};

  if (role) where.role = role;

  // Kalau adminId disertakan, filter peternak yang punya unit
  // dengan adminId tersebut
  if (adminId) {
    where.peternakUnit = {
      adminId: Number(adminId),
    };
  }

  return prisma.user.findMany({
    where,
    select: {
      ...userSelect,
      peternakUnit: { select: unitSelect },
      adminUnits:   { select: unitSelect },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const findById = (id) =>
  prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      ...userSelect,
      peternakUnit: { select: unitSelect },
      adminUnits:   { select: unitSelect },
    },
  });

const findByUsername = (username) =>
  prisma.user.findUnique({ where: { username } });

const create = (data) =>
  prisma.user.create({
    data,
    select: { id: true, username: true, role: true, phone: true, createdAt: true },
  });

const update = (id, data) =>
  prisma.user.update({
    where: { id: Number(id) },
    data,
    select: { id: true, username: true, role: true, phone: true, updatedAt: true },
  });

const remove = (id) =>
  prisma.user.delete({ where: { id: Number(id) } });

module.exports = { findAll, findById, findByUsername, create, update, remove };