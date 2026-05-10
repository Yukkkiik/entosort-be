const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 3 characters',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
});

module.exports = { loginSchema };