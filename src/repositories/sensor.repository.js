// src/repositories/sensor.repository.js
const prisma = require('../config/prisma');

/**
 * Dipanggil dari MQTT handler saat ESP32 publish data sensor.
 * data harus berisi: { nodeId, unitId, temperature, humidity, pressure }
 */
const create = (data) => prisma.sensorLog.create({ data });

/**
 * Ambil satu data sensor terbaru.
 * Bisa filter by nodeId (ESP32 spesifik) atau unitId (semua node di unit itu).
 * Priority: nodeId > unitId > latest globally.
 */
const findLatest = ({ nodeId, unitId } = {}) => {
  const where = {};
  if (nodeId) where.nodeId = nodeId;
  else if (unitId) where.unitId = unitId;

  return prisma.sensorLog.findFirst({
    where,
    orderBy: { recordedAt: 'desc' },
    include: {
      node: { select: { nodeId: true, nodeType: true, status: true } },
      unit: { select: { unitId: true, status: true } },
    },
  });
};

/**
 * History sensor dengan filter opsional.
 * Support filter by nodeId (detail hardware) atau unitId (dashboard unit).
 */
const findHistory = ({ nodeId, unitId, from, to, limit = 100 }) => {
  const where = {};
  if (nodeId) where.nodeId = nodeId;
  else if (unitId) where.unitId = unitId;

  if (from || to) {
    where.recordedAt = {};
    if (from) where.recordedAt.gte = new Date(from);
    if (to) where.recordedAt.lte = new Date(to);
  }

  return prisma.sensorLog.findMany({
    where,
    orderBy: { recordedAt: 'desc' },
    take: Number(limit),
    include: {
      node: { select: { nodeId: true, nodeType: true } },
    },
  });
};

/**
 * Ambil data sensor terbaru per unit (untuk ringkasan dashboard).
 * distinct by unitId supaya tiap unit hanya muncul sekali.
 */
const findLatestPerUnit = () =>
  prisma.sensorLog.findMany({
    distinct: ['unitId'],
    orderBy: { recordedAt: 'desc' },
    include: {
      unit: { select: { unitId: true, status: true } },
    },
  });

/**
 * Ambil data sensor terbaru per node ESP32 (untuk debug hardware spesifik).
 */
const findLatestPerNode = () =>
  prisma.sensorLog.findMany({
    distinct: ['nodeId'],
    orderBy: { recordedAt: 'desc' },
    include: {
      node: { select: { nodeId: true, nodeType: true, status: true } },
      unit: { select: { unitId: true } },
    },
  });

module.exports = { create, findLatest, findHistory, findLatestPerUnit, findLatestPerNode };