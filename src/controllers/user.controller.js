const userService = require('../services/user.service');
const { catchAsync } = require('../utils/catchAsync');

const getAll = catchAsync(async (req, res) => {
  const users = await userService.getAll();
  res.json({ success: true, data: users });
});

const create = catchAsync(async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json({ success: true, message: 'User created', data: user });
});

const update = catchAsync(async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  res.json({ success: true, message: 'User updated', data: user });
});

const remove = catchAsync(async (req, res) => {
  await userService.remove(req.params.id);
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { getAll, create, update, remove };