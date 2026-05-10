const mqttClient = require('../mqtt/mqttClient');
const settingsRepo = require('../repositories/setinggs.repository');
const nodeRepo = require('../repositories/node.repository');
const { AppError } = require('../middleware/errorHandler');

const controlMotor = async ({ nodeId, action, speedRpm }) => {
  const node = await nodeRepo.findByNodeId(nodeId);
  if (!node) throw new AppError(`Node '${nodeId}' not found`, 404);

  const payload = {
    command: 'motor',
    action,                      // 'on' | 'off'
    speedRpm: speedRpm || 100,
    timestamp: new Date().toISOString(),
  };

  mqttClient.publish(`device/control/${nodeId}`, JSON.stringify(payload));

  // Update settings state
  await settingsRepo.upsert(nodeId, { motorOn: action === 'on' });

  return { nodeId, command: 'motor', action, speedRpm: payload.speedRpm };
};

const controlSolenoid = async ({ nodeId, action, delayMs }) => {
  const node = await nodeRepo.findByNodeId(nodeId);
  if (!node) throw new AppError(`Node '${nodeId}' not found`, 404);

  const payload = {
    command: 'solenoid',
    action,                     // 'on' | 'off'
    delayMs: delayMs || 200,
    timestamp: new Date().toISOString(),
  };

  mqttClient.publish(`device/control/${nodeId}`, JSON.stringify(payload));

  await settingsRepo.upsert(nodeId, { solenoidOn: action === 'on' });

  return { nodeId, command: 'solenoid', action, delayMs: payload.delayMs };
};

const setManualMode = async ({ nodeId, enabled }) => {
  const node = await nodeRepo.findByNodeId(nodeId);
  if (!node) throw new AppError(`Node '${nodeId}' not found`, 404);

  const payload = {
    command: 'manual_mode',
    enabled,
    timestamp: new Date().toISOString(),
  };

  mqttClient.publish(`device/control/${nodeId}`, JSON.stringify(payload));

  await settingsRepo.upsert(nodeId, { manualMode: enabled });

  return { nodeId, manualMode: enabled };
};

module.exports = { controlMotor, controlSolenoid, setManualMode };