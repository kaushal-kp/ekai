const express = require('express');
const { body, query, param } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const logger = require('../config/logger');
const authMiddleware = require('../middleware/auth');
const { authorize, authorizeSchool } = require('../middleware/rbac');
const validateRequest = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * POST /api/attendance/mark
 * Mark attendance for single or multiple students
 */
router.post(
  '/mark',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  body('entries')
    .isArray({ min: 1 })
    .withMessage('Entries must be a non-empty array'),
  body('entries.*.student_apaar_id')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  body('entries.*.status')
    .isIn(['present', 'absent', 'late', 'half_day', 'holiday'])
    .withMessage('Invalid status'),
  body('entries.*.date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('entries.*.period')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Period must be positive integer'),
  body('entries.*.remarks')
    .optional()
    .isString()
    .trim(),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { entries } = req.body;

    const attendanceRecords = [];

    for (const entry of entries) {
      // Verify student exists
      const student = await db('students')
        .where('apaar_id', entry.student_apaar_id)
        .first();

      if (!student) {
        return res.status(404).json({
          success: false,
          message: `Student ${entry.student_apaar_id} not found`,
          error: 'STUDENT_NOT_FOUND',
        });
      }

      // Check authorization
      if (req.user.role !== 'platform_admin' && req.user.school_udise !== student.school_udise) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to mark attendance for this school',
          error: 'ACCESS_DENIED',
        });
      }

      attendanceRecords.push({
        id: uuidv4(),
        student_apaar_id: entry.student_apaar_id,
        school_udise: student.school_udise,
        date: entry.date,
        status: entry.status,
        period: entry.period || null,
        remarks: entry.remarks || null,
        marked_by: req.user.id,
        device_id: null,
        is_offline_entry: false,
        synced_at: db.fn.now(),
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
    }

    await db('attendance').insert(attendanceRecords);

    logger.info('Attendance marked', {
      count: attendanceRecords.length,
      markedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${attendanceRecords.length} students`,
      data: attendanceRecords,
    });
  })
);

/**
 * POST /api/attendance/sync
 * Sync offline attendance entries
 */
router.post(
  '/sync',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  body('entries')
    .isArray({ min: 1 })
    .withMessage('Entries must be a non-empty array'),
  body('entries.*.student_apaar_id')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  body('entries.*.status')
    .isIn(['present', 'absent', 'late', 'half_day', 'holiday'])
    .withMessage('Invalid status'),
  body('entries.*.date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('entries.*.device_id')
    .isString()
    .trim(),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { entries } = req.body;

    const syncedRecords = [];

    for (const entry of entries) {
      const student = await db('students')
        .where('apaar_id', entry.student_apaar_id)
        .first();

      if (!student) continue;

      // Check if record already exists
      const existing = await db('attendance')
        .where('student_apaar_id', entry.student_apaar_id)
        .where('date', entry.date)
        .where('period', entry.period || null)
        .first();

      if (existing) {
        // Update existing record
        await db('attendance')
          .where('id', existing.id)
          .update({
            status: entry.status,
            synced_at: db.fn.now(),
            is_offline_entry: false,
          });
      } else {
        // Create new record
        const newRecord = {
          id: uuidv4(),
          student_apaar_id: entry.student_apaar_id,
          school_udise: student.school_udise,
          date: entry.date,
          status: entry.status,
          period: entry.period || null,
          remarks: entry.remarks || null,
          marked_by: req.user.id,
          device_id: entry.device_id,
          is_offline_entry: false,
          synced_at: db.fn.now(),
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        };

        await db('attendance').insert(newRecord);
        syncedRecords.push(newRecord);
      }
    }

    logger.info('Attendance synced', {
      count: syncedRecords.length,
      syncedBy: req.user.id,
    });

    res.json({
      success: true,
      message: `Synced ${syncedRecords.length} attendance records`,
      data: syncedRecords,
    });
  })
);

/**
 * GET /api/attendance/class/:udise/:class/:section/:date
 * Get class attendance for a specific date
 */
router.get(
  '/class/:udise/:class/:section/:date',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  param('class')
    .isInt({ min: 1, max: 12 })
    .withMessage('Invalid class'),
  param('section')
    .isString()
    .trim(),
  param('date')
    .isISO8601()
    .withMessage('Invalid date'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise, class: className, section, date } = req.params;

    // Check authorization
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== udise) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this school',
        error: 'ACCESS_DENIED',
      });
    }

    const dateOnly = date.split('T')[0];

    const attendance = await db('attendance')
      .join('students', 'attendance.student_apaar_id', 'students.apaar_id')
      .where('attendance.school_udise', udise)
      .where('students.class', className)
      .where('students.section', section)
      .where('attendance.date', dateOnly)
      .select('attendance.*', 'students.name')
      .orderBy('students.name');

    const summary = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      half_day: attendance.filter((a) => a.status === 'half_day').length,
    };

    res.json({
      success: true,
      data: {
        attendance,
        summary,
      },
    });
  })
);

/**
 * GET /api/attendance/student/:apaarId
 * Get student's attendance history
 */
router.get(
  '/student/:apaarId',
  authMiddleware,
  authorize('student', 'teacher', 'school_admin', 'parent', 'platform_admin'),
  param('apaarId')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Limit must be between 1 and 365'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { apaarId } = req.params;
    const { limit = 30 } = req.query;

    const student = await db('students').where('apaar_id', apaarId).first();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        error: 'STUDENT_NOT_FOUND',
      });
    }

    // Authorization check
    if (req.user.role === 'student' && req.user.id !== student.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED',
      });
    }

    const records = await db('attendance')
      .where('student_apaar_id', apaarId)
      .orderBy('date', 'desc')
      .limit(limit);

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'present').length;
    const absentDays = records.filter((r) => r.status === 'absent').length;

    res.json({
      success: true,
      data: {
        records,
        stats: {
          total_days: totalDays,
          present_days: presentDays,
          absent_days: absentDays,
          attendance_percentage:
            totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
        },
      },
    });
  })
);

/**
 * GET /api/attendance/report/:udise
 * Get school-level attendance report
 */
router.get(
  '/report/:udise',
  authMiddleware,
  authorize('school_admin', 'platform_admin'),
  query('from_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid from_date'),
  query('to_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid to_date'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise } = req.params;
    const { from_date, to_date } = req.query;

    // Check authorization
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== udise) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED',
      });
    }

    let query = db('attendance')
      .where('school_udise', udise);

    if (from_date) {
      query = query.where('date', '>=', from_date);
    }

    if (to_date) {
      query = query.where('date', '<=', to_date);
    }

    const records = await query;

    const statusCounts = {};
    records.forEach((r) => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total_records: records.length,
        status_distribution: statusCounts,
        average_attendance_percentage:
          records.length > 0
            ? Math.round(
                ((records.filter((r) => r.status === 'present').length /
                  records.length) *
                  100)
              )
            : 0,
      },
    });
  })
);

/**
 * PUT /api/attendance/:id
 * Correct/update an attendance entry
 */
router.put(
  '/:id',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  param('id').isUUID().withMessage('Invalid attendance ID'),
  body('status')
    .isIn(['present', 'absent', 'late', 'half_day', 'holiday'])
    .withMessage('Invalid status'),
  body('remarks')
    .optional()
    .isString()
    .trim(),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const attendance = await db('attendance').where('id', id).first();

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
        error: 'RECORD_NOT_FOUND',
      });
    }

    // Check authorization
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== attendance.school_udise) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED',
      });
    }

    await db('attendance')
      .where('id', id)
      .update({
        status,
        remarks: remarks || null,
        updated_at: db.fn.now(),
      });

    logger.info('Attendance corrected', {
      attendanceId: id,
      newStatus: status,
      correctedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
    });
  })
);

module.exports = router;
