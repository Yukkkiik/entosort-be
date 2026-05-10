const { AppError } = require('./errorHandler');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map((d) => d.message).join(', ');
    return next(new AppError(messages, 400));
  }

  req.body = value;
  next();
};

module.exports = validate;