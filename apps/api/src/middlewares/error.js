import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Error:', err.message || err);
  logger.error('Error name:', err.name);
  logger.error('Error stack:', err.stack);
  if (err.message) {
    logger.error('Error message:', err.message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(e => e.message);
    return res.status(400).json({
      error: 'Validation error',
      message: messages.join(', ') || err.message,
      details: err.errors,
    });
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid data format',
      message: `${err.path} is invalid`,
    });
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      name: err.name,
    }),
  });
}
