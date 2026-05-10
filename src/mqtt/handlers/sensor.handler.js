// src/mqtt/handlers/sensor.handler.js
const sensorService = require('../../services/sensor.service');
const nodeRepo = require('../../repositories/node.repository');
const { broadcast } = require('../../utils/websocket');

/**
 * Handle incoming sensor data dari microcontroller via MQTT.
 * Jika node belum terdaftar, otomatis di-register dengan nodeType 'esp32'
 * karena data sensor hanya dikirim dari microcontroller.
 *
 * Topic  : sensor/data/{nodeId}
 * Payload: { temperature, humidity, pressure, firmware?, ipAddress? }
 */
const handleSensorData = async (nodeId, data) => {
  try {
    const { temperature, humidity, pressure, firmware, ipAddress } = data;

    if (temperature === undefined || humidity === undefined || pressure === undefined) {
      console.warn(`⚠️  [SensorHandler] Incomplete sensor data from ${nodeId}:`, data);
      return;
    }

    // Auto-register node jika belum ada — sensor data selalu dari microcontroller
    const existingNode = await nodeRepo.findByNodeId(nodeId);
    if (!existingNode) {
      console.log(`🆕 [SensorHandler] Node baru terdeteksi, auto-register: ${nodeId} (microcontroller)`);
    }

    await nodeRepo.upsertByNodeId(nodeId, {
      nodeType: 'microcontroller',
      status: 'online',
      lastSeen: new Date(),
      ...(firmware && { firmware }),
      ...(ipAddress && { ipAddress }),
    });

    // Simpan data sensor ke database
    const log = await sensorService.saveSensorData({
      nodeId,
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      pressure: parseFloat(pressure),
    });

    // Broadcast ke WebSocket (dashboard real-time)
    broadcast({
      type: 'sensor_update',
      payload: {
        nodeId,
        nodeType: 'microcontroller',
        temperature: log.temperature,
        humidity: log.humidity,
        pressure: log.pressure,
        recordedAt: log.recordedAt,
        isNewNode: !existingNode,
      },
    });

    console.log(`✅ [SensorHandler] Data saved for node ${nodeId}`);
  } catch (err) {
    console.error(`❌ [SensorHandler] Error processing data from ${nodeId}:`, err.message);
  }
};

module.exports = { handleSensorData };