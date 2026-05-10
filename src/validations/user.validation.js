const Joi = require('joi');

const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'peternak').default('peternak'),
  phone: Joi.string().max(20).optional().allow('', null),
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(100).optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('admin', 'peternak').optional(),
  phone: Joi.string().max(20).optional().allow('', null),
}).min(1);

module.exports = { createUserSchema, updateUserSchema };