const Joi = require('joi');

const createNodeSchema = Joi.object({
  nodeId:    Joi.string().max(50).required(),
  nodeType:  Joi.string().valid('microcontroller', 'raspberry'),
  ipAddress: Joi.string().ip().optional().allow('', null),
  firmware:  Joi.string().max(50).optional().allow('', null),
});
 
const updateNodeSchema = Joi.object({
  nodeType:  Joi.string().valid('microcontroller', 'raspberry').optional(),
  ipAddress: Joi.string().ip().optional().allow('', null),
  firmware:  Joi.string().max(50).optional().allow('', null),
  status:    Joi.string().valid('online', 'offline').optional(),
}).min(1);
 
module.exports = { createNodeSchema, updateNodeSchema };