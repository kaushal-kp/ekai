const express = require('express');
const { body, param, query } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const logger = require('../config/logger');
const authMiddleware = require('../middleware/auth');
const { authorize, authorizeSchool } = require('../middleware/rbac');
const validateRequest = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /api/calendar/:udise
 * Get school calendar events
 */
router.get(
  '/:udise',
  authMiddleware,
  query('from_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid from_date'),
  query('to_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid to_date'),
  query('event_type')
    .optional()
    .isIn(['holiday', 'exam', 'meeting', 'activity', 'deadline'])
    .withMessage('Invalid event type'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise } = req.params;
    const { from_date, to_date, event_type } = req.query;

    // Check authorization - allow all authenticated users to view calendar
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== udise) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this school calendar',
        error: 'ACCESS_DENIED',
      });
    }

    let query = db('academic_events').where('school_udise', udise);

    if (from_date) {
      query = query.where('start_date', '>=', from_date);
    }

    if (to_date) {
      query = query.where('end_date', '<=', to_date);
    }

    if (event_type) {
      query = query.where('event_type', event_type);
    }

    const events = await query.orderBy('start_date', 'asc');

    res.json({
      success: true,
      data: events,
    });
  })
);

/**
 * POST /api/calendar/:udise
 * Create calendar event (admin only)
 */
router.post(
  '/:udise',
  authMiddleware,
  authorize('school_admin', 'platform_admin'),
  authorizeSchool(),
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('event_type')
    .isIn(['holiday', 'exam', 'meeting', 'activity', 'deadline'])
    .withMessage('Invalid event type'),
  body('start_date')
    .isISO8601()
    .withMessage('Invalid start date'),
  body('end_date')
    .isISO8601()
    .withMessage('Invalid end date'),
  body('is_school_wide')
    .optional()
    .isBoolean()
    .withMessage('is_school_wide must be boolean'),
  body('applicable_classes')
    .optional()
    .isArray()
    .withMessage('Applicable classes must be array'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise } = req.params;
    const { title, description, event_type, start_date, end_date, is_school_wide, applicable_classes } = req.body;

    // Validate dates
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date',
        error: 'INVALID_DATE_RANGE',
      });
    }

    const event = {
      id: uuidv4(),
      school_udise: udise,
      title,
      description: description || null,
      event_type,
      start_date,
      end_date,
      is_school_wide: is_school_wide || false,
      applicable_classes: applicable_classes ? JSON.stringify(applicable_classes) : null,
      created_by: req.user.id,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    await db('academic_events').insert(event);

    logger.info('Calendar event created', {
      eventId: event.id,
      title,
      school: udise,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Calendar event created successfully',
      data: event,
    });
  })
);

/**
 * PUT /api/calendar/:udise/:id
 * Update calendar event
 */
router.put(
  '/:udise/:id',
  authMiddleware,
  authorize('school_admin', 'platform_admin'),
  authorizeSchool(),
  param('id').isUUID().withMessage('Invalid event ID'),
  body('title')
    .optional()
    .isString()
    .trim(),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('event_type')
    .optional()
    .isIn(['holiday', 'exam', 'meeting', 'activity', 'deadline'])
    .withMessage('Invalid event type'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise, id } = req.params;
    const { title, description, event_type, start_date, end_date } = req.body;

    const event = await db('academic_events').where('id', id).where('school_udise', udise).first();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND',
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (event_type) updateData.event_type = event_type;
    if (start_date) updateData.start_date = start_date;
    if (end_date) updateData.end_date = end_date;

    updateData.updated_at = db.fn.now();

    await db('academic_events').where('id', id).update(updateData);

    logger.info('Calendar event updated', {
      eventId: id,
      school: udise,
      updatedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Calendar event updated successfully',
    });
  })
);

/**
 * DELETE /api/calendar/:udise/:id
 * Delete calendar event
 */
router.delete(
  '/:udise/:id',
  authMiddleware,
  authorize('school_admin', 'platform_admin'),
  authorizeSchool(),
  param('id').isUUID().withMessage('Invalid event ID'),
  asyncHandler(async (req, res) => {
    const { udise, id } = req.params;

    const event = await db('academic_events').where('id', id).where('school_udise', udise).first();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
        error: 'EVENT_NOT_FOUND',
      });
    }

    await db('academic_events').where('id', id).del();

    logger.info('Calendar event deleted', {
      eventId: id,
      school: udise,
      deletedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Calendar event deleted successfully',
    });
  })
);

module.exports = router;
