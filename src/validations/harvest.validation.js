const Joi = require('joi');

const createHarvestSchema = Joi.object({
  nodeId: Joi.string().max(50).required(),
  larvaCount: Joi.number().integer().min(0).required(),
  prepupaCount: Joi.number().integer().min(0).required(),
  rejectCount: Joi.number().integer().min(0).required(),
  durationSec: Joi.number().integer().min(0).optional().allow(null),
  notes: Joi.string().optional().allow('', null),
});

module.exports = { createHarvestSchema };