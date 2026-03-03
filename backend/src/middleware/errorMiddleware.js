const logger = require('../utils/logger');

// 404 handler
const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    message: 'Not found',
    path: req.originalUrl
  });
};

// Central error handler
// Uses ApiError shape if available
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const body = {
    message: err.message || 'Internal server error'
  };

  if (err.details) {
    body.details = err.details;
  }

  if (status >= 500) {
    logger.error(err);
  } else {
    logger.warn(err.message);
  }

  res.status(status).json(body);
};

module.exports = {
  notFoundHandler,
  errorHandler
};

