const harvestRepo = require('../repositories/harvest.repository');
const nodeRepo = require('../repositories/node.repository');
const { AppError } = require('../middleware/errorHandler');
const mqttClient = require('../mqtt/mqttClient');

/**
 * Create a new harvest log entry.
 * Triggered either from REST API (manual) or MQTT (from Raspberry Pi CV result).
 */
const create = async ({ nodeId, userId, larvaCount, prepupaCount, rejectCount, durationSec, notes }) => {
  // Validate node exists
  const node = await nodeRepo.findByNodeId(nodeId);
  if (!node) throw new AppError(`Node '${nodeId}' not found`, 404);

  const totalCount = larvaCount + prepupaCount + rejectCount;

  const harvest = await harvestRepo.create({
    nodeId,
    userId: userId || null,
    larvaCount,
    prepupaCount,
    rejectCount,
    totalCount,
    durationSec: durationSec || null,
    notes: notes || null,
  });

  // After saving, publish MQTT sorting command to ESP32
  // Trigger separation based on classification result
  const controlPayload = {
    event: 'sort_trigger',
    larvaCount,
    prepupaCount,
    rejectCount,
    timestamp: new Date().toISOString(),
  };
  mqttClient.publish(`device/control/${nodeId}`, JSON.stringify(controlPayload));

  return harvest;
};

/**
 * Get paginated harvest logs with optional filters.
 */
const getAll = async (filters) => {
  const [logs, total] = await harvestRepo.findAll(filters);
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;

  return {
    data: logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get aggregated production statistics.
 */
const getStats = async (filters) => {
  const stats = await harvestRepo.getStats(filters);

  return {
    totalSessions: stats._count.id,
    totalLarva: stats._sum.larvaCount || 0,
    totalPrepupa: stats._sum.prepupaCount || 0,
    totalReject: stats._sum.rejectCount || 0,
    totalHarvested: stats._sum.totalCount || 0,
    avgLarvaPerSession: Math.round(stats._avg.larvaCount || 0),
    avgPrepupaPerSession: Math.round(stats._avg.prepupaCount || 0),
    successRate: stats._sum.totalCount > 0
      ? (((stats._sum.larvaCount + stats._sum.prepupaCount) / stats._sum.totalCount) * 100).toFixed(2)
      : 0,
  };
};

module.exports = { create, getAll, getStats };