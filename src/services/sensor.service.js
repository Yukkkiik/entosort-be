// src/services/sensor.service.js
const sensorRepo = require('../repositories/sensor.repository');

const getLatest = ({ nodeId, unitId }) => sensorRepo.findLatest({ nodeId, unitId });

const getHistory = (filters) => sensorRepo.findHistory(filters);

const saveSensorData = (data) => sensorRepo.create(data);

const getLatestPerUnit = () => sensorRepo.findLatestPerUnit();

const getLatestPerNode = () => sensorRepo.findLatestPerNode();

module.exports = { getLatest, getHistory, saveSensorData, getLatestPerUnit, getLatestPerNode };