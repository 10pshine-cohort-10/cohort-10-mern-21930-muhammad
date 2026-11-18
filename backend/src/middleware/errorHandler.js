const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  logger.error({ err, method: req.method, url: req.originalUrl }, err.message);

  if (err.name === 'ValidationError') {
    const errorMessages = Object.values(err.errors).map((item) => item.message);
    return res.status(400).json({ success: false, error: errorMessages.join(', ') });
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ success: false, error: 'Invalid ID format' });
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0] || 'Field';
    return res.status(409).json({ success: false, error: `${duplicateField} already exists` });
  }

  const statusCode = err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  return res.status(statusCode).json({ success: false, error: message });
}

module.exports = errorHandler;
