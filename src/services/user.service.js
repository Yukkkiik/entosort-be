const userRepo = require('../repositories/user.repository');
const { AppError } = require('../middleware/errorHandler');
const { hashPassword } = require('../utils/password');

const getAll = () => userRepo.findAll();

const create = async ({ username, password, role, phone }) => {
  const existing = await userRepo.findByUsername(username);
  if (existing) throw new AppError('Username already exists', 409);

  const hashedPassword = await hashPassword(password);
  return userRepo.create({ username, password: hashedPassword, role, phone });
};

const update = async (id, data) => {
  const user = await userRepo.findById(Number(id));
  if (!user) throw new AppError('User not found', 404);

  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  return userRepo.update(Number(id), data);
};

const remove = async (id) => {
  const user = await userRepo.findById(Number(id));
  if (!user) throw new AppError('User not found', 404);
  await userRepo.remove(Number(id));
};

module.exports = { getAll, create, update, remove };