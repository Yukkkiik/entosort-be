// src/validations/control.validation.js
const Joi = require('joi');

const motorSchema = Joi.object({
  nodeId: Joi.string().max(50).required(),
  action: Joi.string().valid('on', 'off').required(),
  speedRpm: Joi.number().integer().min(0).max(3000).optional(),
});

const solenoidSchema = Joi.object({
  nodeId: Joi.string().max(50).required(),
  action: Joi.string().valid('on', 'off').required(),
  delayMs: Joi.number().integer().min(0).max(10000).optional(),
});

const manualModeSchema = Joi.object({
  nodeId: Joi.string().max(50).required(),
  enabled: Joi.boolean().required(),
});

module.exports = { motorSchema, solenoidSchema, manualModeSchema };