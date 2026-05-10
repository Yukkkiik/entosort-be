// src/services/sensor.service.js
const sensorRepo = require('../repositories/sensor.repository');

const getLatest = ({ nodeId }) => sensorRepo.findLatest(nodeId);

const getHistory = (filters) => sensorRepo.findHistory(filters);

const saveSensorData = (data) => sensorRepo.create(data);

module.exports = { getLatest, getHistory, saveSensorData };