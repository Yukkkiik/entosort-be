// src/services/harvest.service.js
const harvestRepo = require('../repositories/harvest.repository');
const unitRepo = require('../repositories/unit.repository');
const { AppError } = require('../middleware/errorHandler');
const mqttClient = require('../mqtt/mqttClient');

/**
 * Buat satu sesi panen.
 * Dipicu dari REST (manual) atau MQTT (hasil CV dari Raspberry Pi).
 */
const create = async ({
  unitId,
  userId,
  larvaCount,
  prepupaCount,
  rejectCount,
  durationSec,
  notes,
  triggerSource,
}) => {
  const unit = await unitRepo.findByUnitId(unitId);
  if (!unit) throw new AppError(`Unit '${unitId}' not found`, 404);

  const larva = Number(larvaCount) || 0;
  const prepupa = Number(prepupaCount) || 0;
  const reject = Number(rejectCount) || 0;
  const totalCount = larva + prepupa + reject;

  const harvest = await harvestRepo.create({
    unitId,
    userId: userId || null,
    larvaCount: larva,
    prepupaCount: prepupa,
    rejectCount: reject,
    totalCount,
    durationSec: durationSec || null,
    notes: notes || null,
    triggerSource: triggerSource || 'ir_sensor',
  });

  // Setelah klasifikasi, perintahkan ESP32 menjalankan pemisahan
  mqttClient.publish(
    `device/control/${unitId}`,
    JSON.stringify({
      event: 'sort_trigger',
      larvaCount: larva,
      prepupaCount: prepupa,
      rejectCount: reject,
      timestamp: new Date().toISOString(),
    })
  );

  return harvest;
};

const getAll = async (filters, user) => {
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  const [logs, total] = await harvestRepo.findAll({ ...filters, userId: user.id, isAdmin });

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;

  return {
    data: logs,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getStats = async (filters, user) => {
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  const stats = await harvestRepo.getStats({ ...filters, userId: user.id, isAdmin });

  const sumTotal = stats._sum.totalCount || 0;
  const sumLarva = stats._sum.larvaCount || 0;
  const sumPrepupa = stats._sum.prepupaCount || 0;

  return {
    totalSessions: stats._count.id,
    totalLarva: sumLarva,
    totalPrepupa: sumPrepupa,
    totalReject: stats._sum.rejectCount || 0,
    totalHarvested: sumTotal,
    avgLarvaPerSession: Math.round(stats._avg.larvaCount || 0),
    avgPrepupaPerSession: Math.round(stats._avg.prepupaCount || 0),
    successRate: sumTotal > 0 ? (((sumLarva + sumPrepupa) / sumTotal) * 100).toFixed(2) : 0,
  };
};

module.exports = { create, getAll, getStats };