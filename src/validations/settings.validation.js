const Joi = require('joi');

const updateSettingsSchema = Joi.object({
  nodeId: Joi.string().max(50).required(),
  hsvLowerH: Joi.number().integer().min(0).max(179).optional(),
  hsvLowerS: Joi.number().integer().min(0).max(255).optional(),
  hsvLowerV: Joi.number().integer().min(0).max(255).optional(),
  hsvUpperH: Joi.number().integer().min(0).max(179).optional(),
  hsvUpperS: Joi.number().integer().min(0).max(255).optional(),
  hsvUpperV: Joi.number().integer().min(0).max(255).optional(),
  irThreshold: Joi.number().integer().min(0).optional(),
  motorSpeedRpm: Joi.number().integer().min(0).max(3000).optional(),
  solenoidDelayMs: Joi.number().integer().min(0).max(10000).optional(),
  manualMode: Joi.boolean().optional(),
  motorOn: Joi.boolean().optional(),
  solenoidOn: Joi.boolean().optional(),
}).min(2); // At least nodeId + one setting

module.exports = { updateSettingsSchema };