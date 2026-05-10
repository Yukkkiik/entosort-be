const nodeRepo = require('../repositories/node.repository');
const sensorRepo = require('../repositories/sensor.repository');
const harvestRepo = require('../repositories/harvest.repository');
const errorLogRepo = require('../repositories/errorLog.repository');

const getSummary = async () => {
  const [nodes, latestSensors, harvestStats, recentErrors] = await Promise.all([
    nodeRepo.findAll(),
    sensorRepo.findLatestPerNode(),
    harvestRepo.getStats({}),
    errorLogRepo.findUnresolved(5),
  ]);

  const onlineNodes = nodes.filter((n) => n.status === 'online').length;

  return {
    nodes: {
      total: nodes.length,
      online: onlineNodes,
      offline: nodes.length - onlineNodes,
      list: nodes.map((n) => ({
        id: n.id,
        nodeId: n.nodeId,
        status: n.status,
        lastSeen: n.lastSeen,
        firmware: n.firmware,
        ipAddress: n.ipAddress,
      })),
    },
    environment: latestSensors.map((s) => ({
      nodeId: s.nodeId,
      temperature: s.temperature,
      humidity: s.humidity,
      pressure: s.pressure,
      recordedAt: s.recordedAt,
    })),
    production: {
      totalSessions: harvestStats._count.id,
      totalLarva: harvestStats._sum.larvaCount || 0,
      totalPrepupa: harvestStats._sum.prepupaCount || 0,
      totalReject: harvestStats._sum.rejectCount || 0,
      totalHarvested: harvestStats._sum.totalCount || 0,
    },
    recentErrors: recentErrors.map((e) => ({
      id: e.id,
      nodeId: e.nodeId,
      errorType: e.errorType,
      message: e.message,
      severity: e.severity,
      occurredAt: e.occurredAt,
    })),
  };
};

module.exports = { getSummary };