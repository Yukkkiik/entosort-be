// routes/ai.js
const router = require('express').Router();
const { publish } = require('../mqtt/mqttClient');

// Kirim command ke AI engine (start/stop)
router.post('/command', (req, res) => {
  const { command } = req.body; // 'start' | 'stop'
  if (!['start', 'stop'].includes(command)) {
    return res.status(400).json({ success: false, message: 'Invalid command' });
  }
  publish('ai/command', { command, timestamp: Date.now() });
  res.json({ success: true, command });
});

// GET history deteksi (nanti dari DB)
router.get('/detections', async (req, res) => {
  // const logs = await DetectionLog.findAll({ limit: 100, order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: [] }); // placeholder
});

module.exports = router;