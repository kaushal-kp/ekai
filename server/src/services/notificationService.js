const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../config/logger');

/**
 * Notification Service
 * Handles creation and management of user notifications
 */

/**
 * Create a notification for a user
 *
 * @param {Object} notificationData - Notification information
 * @param {string} notificationData.userId - ID of user to notify
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.type - Type of notification (attendance, grade, consent, announcement, system)
 * @param {string} [notificationData.referenceType] - Type of referenced resource
 * @param {string} [notificationData.referenceId] - ID of referenced resource
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (notificationData) => {
  try {
    const notification = {
      id: uuidv4(),
      user_id: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      reference_type: notificationData.referenceType || null,
      reference_id: notificationData.referenceId || null,
      is_read: false,
      created_at: db.fn.now(),
    };

    await db('notifications').insert(notification);

    logger.debug('Notification created', {
      notificationId: notification.id,
      userId: notificationData.userId,
      type: notificationData.type,
    });

    return notification;
  } catch (error) {
    logger.error('Failed to create notification', {
      userId: notificationData.userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get notifications for a user
 *
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=20] - Results per page
 * @param {boolean} [options.unreadOnly=false] - Only unread notifications
 * @returns {Promise<Object>} Paginated notifications
 */
const getUserNotifications = async (userId, options = {}) => {
  try {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let query = db('notifications').where('user_id', userId);

    if (options.unreadOnly) {
      query = query.where('is_read', false);
    }

    const total = await query.clone().count('* as count').first();
    const notifications = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    logger.debug('Retrieved notifications', {
      userId,
      count: notifications.length,
      total: total.count,
    });

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to retrieve notifications', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Mark notification as read
 *
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
const markAsRead = async (notificationId) => {
  try {
    const now = db.fn.now();

    const result = await db('notifications')
      .where('id', notificationId)
      .update({
        is_read: true,
        read_at: now,
        updated_at: now,
      });

    if (result === 0) {
      throw new Error('Notification not found');
    }

    logger.debug('Notification marked as read', { notificationId });

    return { success: true };
  } catch (error) {
    logger.error('Failed to mark notification as read', {
      notificationId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with count of updated notifications
 */
const markAllAsRead = async (userId) => {
  try {
    const now = db.fn.now();

    const result = await db('notifications')
      .where('user_id', userId)
      .where('is_read', false)
      .update({
        is_read: true,
        read_at: now,
        updated_at: now,
      });

    logger.debug('All notifications marked as read', {
      userId,
      count: result,
    });

    return { success: true, updated: result };
  } catch (error) {
    logger.error('Failed to mark all notifications as read', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get unread notification count for user
 *
 * @param {string} userId - User ID
 * @returns {Promise<number>} Count of unread notifications
 */
const getUnreadCount = async (userId) => {
  try {
    const result = await db('notifications')
      .where('user_id', userId)
      .where('is_read', false)
      .count('* as count')
      .first();

    return result.count;
  } catch (error) {
    logger.error('Failed to get unread count', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Create bulk notifications for multiple users
 *
 * @param {Array<string>} userIds - Array of user IDs to notify
 * @param {Object} notificationData - Notification information (same as createNotification)
 * @returns {Promise<Array>} Created notifications
 */
const createBulkNotifications = async (userIds, notificationData) => {
  try {
    const notifications = userIds.map((userId) => ({
      id: uuidv4(),
      user_id: userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      reference_type: notificationData.referenceType || null,
      reference_id: notificationData.referenceId || null,
      is_read: false,
      created_at: db.fn.now(),
    }));

    await db('notifications').insert(notifications);

    logger.info('Bulk notifications created', {
      userCount: userIds.length,
      type: notificationData.type,
    });

    return notifications;
  } catch (error) {
    logger.error('Failed to create bulk notifications', {
      userCount: userIds.length,
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createBulkNotifications,
};
