const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const logger = require('../config/logger');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const otpService = require('../services/otpService');
const apaarService = require('../services/apaarService');

const router = express.Router();

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number
 */
router.post(
  '/send-otp',
  body('phone')
    .isMobilePhone('any')
    .withMessage('Invalid phone number')
    .trim()
    .matches(/^\+?91?[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits or start with +91'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { phone } = req.body;

    // Normalize phone number
    let normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length === 10) {
      normalizedPhone = '+91' + normalizedPhone;
    } else if (normalizedPhone.length === 12 && normalizedPhone.startsWith('91')) {
      normalizedPhone = '+' + normalizedPhone;
    }

    try {
      const result = await otpService.sendOTP(normalizedPhone);

      res.json({
        success: true,
        message: 'OTP sent successfully',
        phone: normalizedPhone,
        expiryMinutes: result.expiryMinutes,
      });
    } catch (error) {
      logger.error('Send OTP error', { phone: normalizedPhone, error: error.message });

      res.status(400).json({
        success: false,
        message: error.message,
        error: 'OTP_SEND_FAILED',
      });
    }
  })
);

/**
 * POST /api/auth/verify-otp
 * Verify OTP and generate JWT token
 */
router.post(
  '/verify-otp',
  body('phone')
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;

    // Normalize phone
    let normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length === 10) {
      normalizedPhone = '+91' + normalizedPhone;
    } else if (normalizedPhone.length === 12 && normalizedPhone.startsWith('91')) {
      normalizedPhone = '+' + normalizedPhone;
    }

    try {
      // Verify OTP
      await otpService.verifyOTP(normalizedPhone, otp);

      // Find or create user
      let user = await db('users').where('phone', normalizedPhone).first();

      if (!user) {
        // Create new user
        const userId = uuidv4();
        const newUser = {
          id: userId,
          phone: normalizedPhone,
          name: `User ${normalizedPhone}`,
          role: 'student',
          is_active: true,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        };

        await db('users').insert(newUser);
        user = newUser;

        logger.info('New user created via OTP', {
          userId: user.id,
          phone: normalizedPhone,
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRY || '7d',
        }
      );

      // Update last login
      await db('users').where('id', user.id).update({
        last_login_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          school_udise: user.school_udise,
        },
      });
    } catch (error) {
      logger.error('Verify OTP error', { phone: normalizedPhone, error: error.message });

      res.status(400).json({
        success: false,
        message: error.message,
        error: 'OTP_VERIFICATION_FAILED',
      });
    }
  })
);

/**
 * POST /api/auth/verify-apaar
 * Verify user with APAAR ID and create/update user account
 */
router.post(
  '/verify-apaar',
  body('apaar_id')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { apaar_id } = req.body;

    try {
      // Verify with APAAR
      const apaarProfile = await apaarService.verifyApaarId(apaar_id);

      // Find or create user
      let user = await db('users').where('apaar_id', apaar_id).first();

      if (!user) {
        // Create new user
        const userId = uuidv4();
        const newUser = {
          id: userId,
          apaar_id,
          name: apaarProfile.name,
          role: 'student',
          is_active: true,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        };

        await db('users').insert(newUser);
        user = newUser;

        logger.info('New user created via APAAR', {
          userId: user.id,
          apaarId: apaar_id,
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          apaarId: user.apaar_id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRY || '7d',
        }
      );

      res.json({
        success: true,
        message: 'APAAR verification successful',
        token,
        user: {
          id: user.id,
          apaar_id: user.apaar_id,
          name: user.name,
          role: user.role,
          school_udise: user.school_udise,
        },
      });
    } catch (error) {
      logger.error('APAAR verification error', {
        apaarId: req.body.apaar_id,
        error: error.message,
      });

      res.status(400).json({
        success: false,
        message: error.message,
        error: 'APAAR_VERIFICATION_FAILED',
      });
    }
  })
);

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await db('users').where('id', req.user.id).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    // Fetch role-specific data
    let roleData = null;

    if (user.role === 'student') {
      roleData = await db('students').where('user_id', user.id).first();
    } else if (user.role === 'teacher') {
      roleData = await db('teachers').where('user_id', user.id).first();
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        school_udise: user.school_udise,
        apaar_id: user.apaar_id,
        is_active: user.is_active,
        last_login_at: user.last_login_at,
        ...(roleData && { roleData }),
      },
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post(
  '/refresh',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await db('users').where('id', req.user.id).first();

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        error: 'USER_NOT_FOUND',
      });
    }

    // Generate new token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY || '7d',
      }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token,
    });
  })
);

module.exports = router;
