// src/services/dashboard.service.js
const unitRepo = require('../repositories/unit.repository');
const sensorRepo = require('../repositories/sensor.repository');
const harvestRepo = require('../repositories/harvest.repository');
const errorLogRepo = require('../repositories/errorLog.repository');

const getSummary = async () => {
  const [units, latestSensors, harvestStats, recentErrors] = await Promise.all([
    unitRepo.findAll(),
    sensorRepo.findLatestPerUnit(),
    harvestRepo.getStats({ isAdmin: true }),
    errorLogRepo.findUnresolved(5),
  ]);

  const onlineUnits = units.filter((u) => u.status === 'online').length;

  return {
    units: {
      total: units.length,
      online: onlineUnits,
      offline: units.length - onlineUnits,
      list: units.map((u) => ({
        id: u.id,
        unitId: u.unitId,
        status: u.status,
        location: u.location,
        peternak: u.peternak ? u.peternak.username : null,
        nodes: (u.nodes || []).map((n) => ({
          nodeId: n.nodeId,
          nodeType: n.nodeType,
          status: n.status,
          firmware: n.firmware,
          ipAddress: n.ipAddress,
          lastSeen: n.lastSeen,
        })),
      })),
    },
    environment: latestSensors.map((s) => ({
      unitId: s.unitId,
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
      unitId: e.unitId,
      nodeType: e.nodeType,
      errorType: e.errorType,
      message: e.message,
      severity: e.severity,
      occurredAt: e.occurredAt,
    })),
  };
};

module.exports = { getSummary };