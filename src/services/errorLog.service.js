const errorLogRepo = require('../repositories/errorLog.repository');
const { AppError } = require('../middleware/errorHandler');
const { broadcast } = require('../utils/websocket');

const getAll = (filters) => errorLogRepo.findAll(filters);

const resolve = async (id) => {
  const log = await errorLogRepo.resolve(Number(id));
  return log;
};

const saveError = async (data) => {
  const error = await errorLogRepo.create(data);

  // Broadcast unresolved errors via WebSocket to dashboard
  broadcast({ type: 'error_alert', payload: error });

  return error;
};

module.exports = { getAll, resolve, saveError };