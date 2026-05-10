// src/services/settings.service.js
const settingsRepo = require('../repositories/setinggs.repository');
const mqttClient = require('../mqtt/mqttClient');

const get = ({ nodeId }) => {
  if (nodeId) return settingsRepo.findByNodeId(nodeId);
  return settingsRepo.findAll();
};

const update = async ({ nodeId, ...data }) => {
  const settings = await settingsRepo.upsert(nodeId, data);

  // Publish updated settings to device so it can apply them live
  mqttClient.publish(`device/control/${nodeId}`, JSON.stringify({
    command: 'update_settings',
    settings: data,
    timestamp: new Date().toISOString(),
  }));

  return settings;
};

module.exports = { get, update };