const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const db = require('../config/database');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user information to request object
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        error: 'MISSING_TOKEN',
      });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const user = await db('users').where('id', decoded.userId).first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
        error: 'USER_INACTIVE',
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
      school_udise: user.school_udise,
      apaar_id: user.apaar_id,
    };

    // Update last login
    await db('users').where('id', user.id).update({
      last_login_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        error: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'INVALID_TOKEN',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
