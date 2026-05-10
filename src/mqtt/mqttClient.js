const mqtt = require('mqtt');
const { handleSensorData } = require('./handlers/sensor.handler');
const { handleNodeStatus } = require('./handlers/nodeStatus.handler');
const { handleHarvestResult } = require('./handlers/harvest.handler');
const { handleDeviceError } = require('./handlers/error.handler');

let client = null;

// ================================
// TOPIC DEFINITIONS
// ================================
const TOPICS = {
  SENSOR_DATA:    'sensor/data/+',      // sensor/data/{nodeId}
  SENSOR_STATUS:  'sensor/status/+',    // sensor/status/{nodeId}
  HARVEST_RESULT: 'harvest/result',     // from Raspberry Pi CV
  DEVICE_ERROR:   'device/error/+',     // device/error/{nodeId}
};

const initMqtt = () => {
  const options = {
    clientId: process.env.MQTT_CLIENT_ID || 'bsf-backend',
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    clean: true,
  };

  const brokerUrl = `mqtt://${process.env.MQTT_HOST || 'localhost'}:${process.env.MQTT_PORT || 1883}`;

  console.log(`📡 Connecting to MQTT broker: ${brokerUrl}`);
  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log('✅ MQTT connected');

    // Subscribe to all relevant topics
    const topicsToSubscribe = Object.values(TOPICS);
    client.subscribe(topicsToSubscribe, { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ MQTT subscription error:', err);
      } else {
        console.log('📬 MQTT subscribed to topics:', topicsToSubscribe);
      }
    });
  });

  client.on('message', (topic, payload) => {
    let data;
    try {
      data = JSON.parse(payload.toString());
    } catch {
      console.warn(`⚠️  MQTT non-JSON payload on topic: ${topic}`);
      return;
    }

    console.log(`📨 MQTT [${topic}]:`, data);
    routeMessage(topic, data);
  });

  client.on('error', (err) => {
    console.error('❌ MQTT error:', err.message);
  });

  client.on('reconnect', () => {
    console.log('🔄 MQTT reconnecting...');
  });

  client.on('offline', () => {
    console.warn('⚠️  MQTT client offline');
  });
};

/**
 * Route incoming MQTT messages to appropriate handlers
 */
const routeMessage = (topic, data) => {
  // sensor/data/{nodeId}
  if (topic.startsWith('sensor/data/')) {
    const nodeId = topic.split('/')[2];
    handleSensorData(nodeId, data);
    return;
  }

  // sensor/status/{nodeId}
  if (topic.startsWith('sensor/status/')) {
    const nodeId = topic.split('/')[2];
    handleNodeStatus(nodeId, data);
    return;
  }

  // harvest/result
  if (topic === 'harvest/result') {
    handleHarvestResult(data);
    return;
  }

  // device/error/{nodeId}
  if (topic.startsWith('device/error/')) {
    const nodeId = topic.split('/')[2];
    handleDeviceError(nodeId, data);
    return;
  }
};

/**
 * Publish a message to a topic
 */
const publish = (topic, payload, options = { qos: 1 }) => {
  if (!client || !client.connected) {
    console.warn(`⚠️  MQTT not connected. Cannot publish to: ${topic}`);
    return false;
  }

  const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
  client.publish(topic, message, options, (err) => {
    if (err) {
      console.error(`❌ MQTT publish error [${topic}]:`, err.message);
    } else {
      console.log(`📤 MQTT published [${topic}]:`, message);
    }
  });

  return true;
};

const getClient = () => client;

module.exports = { initMqtt, publish, getClient, TOPICS };