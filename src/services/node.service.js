// src/services/node.service.js
const nodeRepo = require('../repositories/node.repository');
const unitRepo = require('../repositories/unit.repository');
const { AppError } = require('../middleware/errorHandler');

// ─────────────────────────────────────────────────────────────
// Helper: cek akses node via unit
// superadmin : bebas semua node
// admin      : hanya node dari unit yang adminId = user.id
// peternak   : hanya node dari unit yang peterId = user.id
// ─────────────────────────────────────────────────────────────
const checkNodeAccess = async (unitId, user) => {
  if (user.role === 'superadmin') return; // superadmin bebas

  const unit = await unitRepo.findByUnitId(unitId);
  if (!unit) throw new AppError(`Unit '${unitId}' not found`, 404);

  if (user.role === 'admin' && unit.adminId !== user.id) {
    throw new AppError('Akses ditolak: unit ini bukan milik Anda', 403);
  }
  if (user.role === 'peternak' && unit.peterId !== user.id) {
    throw new AppError('Akses ditolak: unit ini bukan milik Anda', 403);
  }
};

// ─────────────────────────────────────────────────────────────
// getByUnitId — semua node (ESP32 + RPi) milik unit
// ─────────────────────────────────────────────────────────────
const getByUnitId = async (unitId, user) => {
  await checkNodeAccess(unitId, user);
  return nodeRepo.findByUnitId(unitId);
};

// ─────────────────────────────────────────────────────────────
// Dipanggil dari MQTT handler — tidak butuh auth check
// ─────────────────────────────────────────────────────────────
const heartbeat = ({ nodeId, unitId, nodeType, ipAddress, firmware }) =>
  nodeRepo.upsertByNodeId(nodeId, {
    unitId,
    nodeType,
    ipAddress,
    firmware,
    status:   'online',
    lastSeen: new Date(),
  });

const markOffline = (nodeId) => nodeRepo.updateStatus(nodeId, 'offline');

module.exports = { getByUnitId, heartbeat, markOffline };