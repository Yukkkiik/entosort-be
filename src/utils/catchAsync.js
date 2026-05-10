/**
 * Wraps async controller functions to catch errors
 * and pass them to Express error handler middleware.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { catchAsync };