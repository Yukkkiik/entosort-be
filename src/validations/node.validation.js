const Joi = require('joi');

const createNodeSchema = Joi.object({
  nodeId: Joi.string().max(50).required(),
  ipAddress: Joi.string().ip().optional().allow('', null),
  firmware: Joi.string().max(50).optional().allow('', null),
});

module.exports = { createNodeSchema };