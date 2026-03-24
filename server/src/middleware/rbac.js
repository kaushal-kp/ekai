const logger = require('../config/logger');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Ensures user has one of the required roles
 *
 * @param {...string} roles - Allowed roles for this endpoint
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED',
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        required_roles: roles,
        user_role: req.user.role,
      });
    }

    next();
  };
};

/**
 * School-level access control
 * Ensures user belongs to the specified school or is platform admin
 *
 * @returns {Function} Express middleware function
 */
const authorizeSchool = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'NOT_AUTHENTICATED',
      });
    }

    const schoolUdise = req.params.udise;

    if (req.user.role === 'platform_admin') {
      return next();
    }

    if (req.user.school_udise !== schoolUdise) {
      logger.warn('School authorization failed', {
        userId: req.user.id,
        userSchool: req.user.school_udise,
        requestedSchool: schoolUdise,
      });

      return res.status(403).json({
        success: false,
        message: 'You do not have access to this school',
        error: 'SCHOOL_ACCESS_DENIED',
      });
    }

    next();
  };
};

module.exports = {
  authorize,
  authorizeSchool,
};
