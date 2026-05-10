const userRepo = require('../repositories/user.repository');
const AppError = require('../middleware/errorHandler');
const { generateToken } = require('../utils/jwt');
const { comparePassword } = require('../utils/password');
const { compare } = require('bcryptjs');

const login = async ({ username, password }) => {
    const user = await userRepo.findByUsername(username);
    if (!user) {
        throw new AppError('Invalid username or password', 401);
    }

    const isMatch = await comparePassword(password, user.password);
    if(!isMatch) {
        throw new AppError('Invalid username or password', 401);
    }

    const payload = { id: user.id, username: user.username, role: user.role};
    const token = generateToken(payload);

    return {
        token,
        user: {id: user.id, username: user.username, role: user.role, phone: user.phone},
    };
};

module.exports = { login }