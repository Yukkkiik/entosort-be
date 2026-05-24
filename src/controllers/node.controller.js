const nodeService = require('../services/node.service');
const { catchAsync } = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const nodes = req.user.role === 'peternak'
    ? await nodeService.getUserById(req.user.id)
    : await nodeService.getAll();

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

const assignUser = catchAsync(async (req, res) => {
  const { nodeId } = req.params;
  const { userId } = req.body;
  const node = await nodeService.assignUser(nodeId, userId);
  res.json({ success: true, message: 'User assigned to node', data: node});
});

const removeUser = catchAsync(async (req, res) => {
  const node = await nodeService.removeUser(req.params.nodeId);
  res.json({ success: true, message:'User removed from node', data:node});
});

const remove = catchAsync(async (req, res) => {
  await nodeService.remove(req.params.id);
  res.json({ success: true, message: 'Node deleted' });
});

module.exports = { getAll, getStatus, create, update, assignUser, removeUser, remove };