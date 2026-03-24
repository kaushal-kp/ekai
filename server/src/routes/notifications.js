const express = require('express');
const { query, param } = require('express-validator');

const db = require('../config/database');
const logger = require('../config/logger');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const notificationService = require('../services/notificationService');

const router = express.Router();

/**
 * GET /api/notifications
 * Get user's notifications (paginated)
 */
router.get(
  '/',
  authMiddleware,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('unread_only')
    .optional()
    .isBoolean()
    .withMessage('unread_only must be boolean'),
  query('type')
    .optional()
    .isIn(['attendance', 'grade', 'consent', 'announcement', 'system'])
    .withMessage('Invalid notification type'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unread_only, type } = req.query;

    let query = db('notifications').where('user_id', req.user.id);

    if (unread_only === 'true') {
      query = query.where('is_read', false);
    }

    if (type) {
      query = query.where('type', type);
    }

    const total = await query.clone().count('* as count').first();
    const offset = (page - 1) * limit;

    const notifications = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit),
      },
    });
  })
);

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put(
  '/:id/read',
  authMiddleware,
  param('id').isUUID().withMessage('Invalid notification ID'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await db('notifications').where('id', id).first();

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        error: 'NOTIFICATION_NOT_FOUND',
      });
    }

    // Authorization check
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this notification',
        error: 'ACCESS_DENIED',
      });
    }

    await notificationService.markAsRead(id);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  })
);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for user
 */
router.put(
  '/read-all',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: `${result.updated} notifications marked as read`,
      updated: result.updated,
    });
  })
);

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get(
  '/unread-count',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.id);

    res.json({
      success: true,
      unread_count: count,
    });
  })
);

module.exports = router;
