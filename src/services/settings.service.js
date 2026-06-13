// src/services/settings.service.js
const settingsRepo = require('../repositories/settings.repository');
const mqttClient = require('../mqtt/mqttClient');

const get = ({ unitId }) => {
  if (unitId) return settingsRepo.findByUnitId(unitId);
  return settingsRepo.findAll();
};

const update = async ({ unitId, ...data }) => {
  const settings = await settingsRepo.upsert(unitId, data);
  mqttClient.publish(
    `device/control/${unitId}`,
    JSON.stringify({
      command: 'update_settings',
      settings: data,
      timestamp: new Date().toISOString(),
    })
  );

  return settings;
};

module.exports = { get, update };