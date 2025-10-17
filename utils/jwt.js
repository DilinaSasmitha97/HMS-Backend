const jwt = require('jsonwebtoken');
const config = require('../config');

function signToken(payload, options = { expiresIn: '7d' }) {
  return jwt.sign(payload, config.jwtSecret, options);
}

module.exports = { signToken };
