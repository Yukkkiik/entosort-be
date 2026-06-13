// src/services/control.service.js
const mqttClient = require('../mqtt/mqttClient');
const settingsRepo = require('../repositories/settings.repository');
const unitRepo = require('../repositories/unit.repository');
const { AppError } = require('../middleware/errorHandler');

const controlMotor = async ({ unitId, action, speedRpm }) => {
  const unit = await unitRepo.findByUnitId(unitId);
  if (!unit) throw new AppError(`Unit '${unitId}' not found`, 404);

  const payload = {
    command: 'motor',
    action, // 'on' | 'off'
    speedRpm: speedRpm || 100,
    timestamp: new Date().toISOString(),
  };
  mqttClient.publish(`device/control/${unitId}`, JSON.stringify(payload));

  await settingsRepo.upsert(unitId, { motorOn: action === 'on' });
  return { unitId, command: 'motor', action, speedRpm: payload.speedRpm };
};

const controlSolenoid = async ({ unitId, action, delayMs }) => {
  const unit = await unitRepo.findByUnitId(unitId);
  if (!unit) throw new AppError(`Unit '${unitId}' not found`, 404);

  const payload = {
    command: 'solenoid',
    action,
    delayMs: delayMs || 200,
    timestamp: new Date().toISOString(),
  };
  mqttClient.publish(`device/control/${unitId}`, JSON.stringify(payload));

  await settingsRepo.upsert(unitId, { solenoidOn: action === 'on' });
  return { unitId, command: 'solenoid', action, delayMs: payload.delayMs };
};

const setManualMode = async ({ unitId, enabled }) => {
  const unit = await unitRepo.findByUnitId(unitId);
  if (!unit) throw new AppError(`Unit '${unitId}' not found`, 404);

  const payload = {
    command: 'manual_mode',
    enabled,
    timestamp: new Date().toISOString(),
  };
  mqttClient.publish(`device/control/${unitId}`, JSON.stringify(payload));

  await settingsRepo.upsert(unitId, { manualMode: enabled });
  return { unitId, manualMode: enabled };
};

module.exports = { controlMotor, controlSolenoid, setManualMode };