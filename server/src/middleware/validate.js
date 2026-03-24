const { validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Validation Error Handler Middleware
 * Catches validation errors from express-validator and formats response
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.debug('Validation error', {
      path: req.path,
      errors: errors.array(),
    });

    const formattedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = validateRequest;
