// mqtt/handlers/aiStatus.handler.js
const { broadcastEvent } = require('../../utils/websocket');

const handleAiStatus = (data) => {
  broadcastEvent('ai:status', {
    status:  data.status,   // 'running' | 'stopped' | 'error'
    message: data.message ?? null,
  });
};

module.exports = { handleAiStatus };