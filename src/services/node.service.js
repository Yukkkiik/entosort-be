// src/services/node.service.js
const nodeRepo = require('../repositories/node.repository');
const { AppError } = require('../middleware/errorHandler');

const getAll = () => nodeRepo.findAll();

const getStatus = async (id) => {
  const node = await nodeRepo.findById(Number(id));
  if (!node) throw new AppError('Node not found', 404);
  return node;
};

const create = async (data) => {
  const existing = await nodeRepo.findByNodeId(data.nodeId);
  if (existing) throw new AppError('Node ID already exists', 409);
  return nodeRepo.create(data);
};

const update = async (id, data) => {
  const node = await nodeRepo.findById(Number(id));
  if (!node) throw new AppError('Node not found', 404);
  return nodeRepo.update(Number(id), data);
};

const remove = async (id) => {
  const node = await nodeRepo.findById(Number(id));
  if (!node) throw new AppError('Node not found', 404);
  await nodeRepo.remove(Number(id));
};

module.exports = { getAll, getStatus, create, update, remove };