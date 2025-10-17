const config = require('../config');

function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
}

// Express 5 handles async errors natively, but keeping a formatter
function errorHandler(err, req, res, _next) {
  const explicitStatus = err.statusCode || err.status;
  const statusCode = explicitStatus || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: config.env === 'production' ? '🥞' : err.stack,
  });
}

module.exports = { notFound, errorHandler };
