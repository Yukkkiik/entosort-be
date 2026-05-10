// src/utils/bcrypt.js
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash plain text password
 * @param {string} password
 * @returns {Promise<string>} hashed password
 */
const hashPassword = (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Bandingkan plain password dengan hash
 * @param {string} password - plain text
 * @param {string} hash - hashed password dari database
 * @returns {Promise<boolean>}
 */
const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };