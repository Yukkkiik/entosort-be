// mqtt/handlers/ai.handler.js
const { broadcastEvent } = require('../../utils/websocket');

const handleAiDetection = (data) => {
  if (!data.timestamp || !Array.isArray(data.detections)) {
    console.warn('⚠️  ai/detection: invalid payload');
    return;
  }

  broadcastEvent('ai:detection', {
    timestamp:  data.timestamp,
    detections: data.detections,
    fps:        data.fps ?? null,
    frame:      data.frame ?? null,
  });
};

module.exports = { handleAiDetection };