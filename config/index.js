require('dotenv').config();

const config = Object.freeze({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  logLevel: process.env.LOG_LEVEL || 'info'
});

module.exports = config;
