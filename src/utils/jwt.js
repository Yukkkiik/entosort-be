// src/utils/jwt.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;

/**
 * Generate JWT token dari payload
 * @param {object} payload - data yang disimpan dalam token
 * @returns {string} token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

/**
 * Verifikasi JWT token
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

/**
 * Decode token tanpa verifikasi (untuk debugging)
 * @param {string} token
 * @returns {object | null}
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = { generateToken, verifyToken, decodeToken };