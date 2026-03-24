const express = require('express');
const { body, query, param } = require('express-validator');

const db = require('../config/database');
const logger = require('../config/logger');
const authMiddleware = require('../middleware/auth');
const { authorize, authorizeSchool } = require('../middleware/rbac');
const validateRequest = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /api/students/profile
 * Get current student's profile
 */
router.get(
  '/profile',
  authMiddleware,
  authorize('student'),
  asyncHandler(async (req, res) => {
    const student = await db('students')
      .where('user_id', req.user.id)
      .first();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
        error: 'PROFILE_NOT_FOUND',
      });
    }

    const user = await db('users').where('id', req.user.id).first();

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          apaar_id: user.apaar_id,
        },
        student,
      },
    });
  })
);

/**
 * GET /api/students/:apaarId
 * Get student information (admin/teacher view)
 */
router.get(
  '/:apaarId',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  param('apaarId')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { apaarId } = req.params;

    const student = await db('students')
      .where('apaar_id', apaarId)
      .first();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        error: 'STUDENT_NOT_FOUND',
      });
    }

    // Check access permission
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== student.school_udise) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this student',
        error: 'ACCESS_DENIED',
      });
    }

    const user = await db('users').where('id', student.user_id).first();

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          apaar_id: user.apaar_id,
        },
        student,
      },
    });
  })
);

/**
 * GET /api/students/:apaarId/attendance
 * Get student's attendance records
 */
router.get(
  '/:apaarId/attendance',
  authMiddleware,
  authorize('student', 'teacher', 'school_admin', 'parent', 'platform_admin'),
  param('apaarId')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  query('from_date')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO date'),
  query('to_date')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO date'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { apaarId } = req.params;
    const { from_date, to_date, limit = 30 } = req.query;

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
        message: 'You do not have access to this data',
        error: 'ACCESS_DENIED',
      });
    }

    if (req.user.role !== 'platform_admin' && req.user.school_udise !== student.school_udise) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this school',
        error: 'ACCESS_DENIED',
      });
    }

    let query = db('attendance').where('student_apaar_id', apaarId);

    if (from_date) {
      query = query.where('date', '>=', from_date);
    }

    if (to_date) {
      query = query.where('date', '<=', to_date);
    }

    const records = await query.orderBy('date', 'desc').limit(limit);

    const totalDays = await query.clone().count('* as count').first();
    const presentDays = await db('attendance')
      .where('student_apaar_id', apaarId)
      .where('status', 'present')
      .count('* as count')
      .first();

    res.json({
      success: true,
      data: {
        records,
        stats: {
          total_days: totalDays.count,
          present_days: presentDays.count,
          attendance_percentage:
            totalDays.count > 0
              ? Math.round((presentDays.count / totalDays.count) * 100)
              : 0,
        },
      },
    });
  })
);

/**
 * GET /api/students/:apaarId/grades
 * Get student's grades and assessments
 */
router.get(
  '/:apaarId/grades',
  authMiddleware,
  authorize('student', 'teacher', 'school_admin', 'parent', 'platform_admin'),
  param('apaarId')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  query('subject')
    .optional()
    .isString()
    .trim(),
  query('assessment_type')
    .optional()
    .isIn(['unit_test', 'midterm', 'final', 'assignment', 'project', 'practical'])
    .withMessage('Invalid assessment type'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { apaarId } = req.params;
    const { subject, assessment_type } = req.query;

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
        message: 'You do not have access to this data',
        error: 'ACCESS_DENIED',
      });
    }

    let query = db('grades')
      .join('assessments', 'grades.assessment_id', 'assessments.id')
      .where('grades.student_apaar_id', apaarId)
      .select('grades.*', 'assessments.title', 'assessments.subject', 'assessments.max_marks', 'assessments.assessment_type', 'assessments.date');

    if (subject) {
      query = query.where('assessments.subject', 'like', `%${subject}%`);
    }

    if (assessment_type) {
      query = query.where('assessments.assessment_type', assessment_type);
    }

    const grades = await query.orderBy('assessments.date', 'desc');

    // Calculate overall performance
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    const gradeLetters = {};

    grades.forEach((grade) => {
      totalMarksObtained += grade.marks_obtained;
      totalMaxMarks += grade.max_marks;
      gradeLetters[grade.grade_letter] = (gradeLetters[grade.grade_letter] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        grades,
        stats: {
          total_assessments: grades.length,
          overall_percentage:
            totalMaxMarks > 0
              ? Math.round((totalMarksObtained / totalMaxMarks) * 100)
              : 0,
          grade_distribution: gradeLetters,
        },
      },
    });
  })
);

/**
 * GET /api/students/:apaarId/documents
 * Get student's document vault
 */
router.get(
  '/:apaarId/documents',
  authMiddleware,
  authorize('student', 'teacher', 'school_admin', 'parent', 'platform_admin'),
  param('apaarId')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { apaarId } = req.params;

    const student = await db('students').where('apaar_id', apaarId).first();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        error: 'STUDENT_NOT_FOUND',
      });
    }

    // For MVP, return mock document data
    res.json({
      success: true,
      data: {
        documents: [
          {
            id: '1',
            type: 'transcript',
            name: 'Academic Transcript 2023-2024',
            issued_date: '2024-06-15',
            size: '2.5 MB',
          },
          {
            id: '2',
            type: 'certificate',
            name: 'Certificate of Participation - Science Fair',
            issued_date: '2024-03-20',
            size: '1.2 MB',
          },
        ],
      },
    });
  })
);

/**
 * PUT /api/students/:apaarId
 * Update student profile (limited fields)
 */
router.put(
  '/:apaarId',
  authMiddleware,
  authorize('student', 'school_admin', 'platform_admin'),
  param('apaarId')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  body('guardian_name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Guardian name must not be empty'),
  body('guardian_phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid guardian phone number'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { apaarId } = req.params;
    const { guardian_name, guardian_phone } = req.body;

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
        message: 'You can only update your own profile',
        error: 'ACCESS_DENIED',
      });
    }

    const updateData = {};
    if (guardian_name) updateData.guardian_name = guardian_name;
    if (guardian_phone) updateData.guardian_phone = guardian_phone;

    updateData.updated_at = db.fn.now();

    await db('students').where('apaar_id', apaarId).update(updateData);

    logger.info('Student profile updated', { apaarId, ...updateData });

    res.json({
      success: true,
      message: 'Student profile updated successfully',
    });
  })
);

module.exports = router;
