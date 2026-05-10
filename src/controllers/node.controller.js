const nodeService = require('../services/node.service');
const { catchAsync } = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const nodes = await nodeService.getAll();
  res.json({ success: true, data: nodes });
});

const getStatus = catchAsync(async (req, res) => {
  const node = await nodeService.getStatus(req.params.id);
  res.json({ success: true, data: node });
});

const create = catchAsync(async (req, res) => {
  const node = await nodeService.create(req.body);
  res.status(201).json({ success: true, message: 'Node created', data: node });
});

const update = catchAsync(async (req, res) => {
  const node = await nodeService.update(req.params.id, req.body);
  res.json({ success: true, message: 'Node updated', data: node });
});

const remove = catchAsync(async (req, res) => {
  await nodeService.remove(req.params.id);
  res.json({ success: true, message: 'Node deleted' });
});

module.exports = { getAll, getStatus, create, update, remove };