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
 * POST /api/assessments
 * Create new assessment
 */
router.post(
  '/',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  body('school_udise')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('School UDISE is required'),
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('subject')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('class')
    .isInt({ min: 1, max: 12 })
    .withMessage('Class must be between 1 and 12'),
  body('section')
    .optional()
    .isString()
    .trim(),
  body('assessment_type')
    .isIn(['unit_test', 'midterm', 'final', 'assignment', 'project', 'practical'])
    .withMessage('Invalid assessment type'),
  body('max_marks')
    .isInt({ min: 1, max: 500 })
    .withMessage('Max marks must be between 1 and 500'),
  body('weightage')
    .optional()
    .isDecimal({ min: 0, max: 100 })
    .withMessage('Weightage must be between 0 and 100'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { school_udise, title, subject, class: className, section, assessment_type, max_marks, weightage, date } =
      req.body;

    // Check authorization
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== school_udise) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this school',
        error: 'ACCESS_DENIED',
      });
    }

    const assessment = {
      id: uuidv4(),
      school_udise,
      title,
      subject,
      class: className,
      section: section || null,
      assessment_type,
      max_marks,
      weightage: weightage || 0,
      date,
      created_by: req.user.id,
      is_published: false,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    await db('assessments').insert(assessment);

    logger.info('Assessment created', {
      assessmentId: assessment.id,
      title,
      school: school_udise,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment,
    });
  })
);

/**
 * GET /api/assessments/:udise
 * List assessments for school
 */
router.get(
  '/:udise',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  query('class')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Invalid class'),
  query('subject')
    .optional()
    .isString()
    .trim(),
  query('assessment_type')
    .optional()
    .isIn(['unit_test', 'midterm', 'final', 'assignment', 'project', 'practical'])
    .withMessage('Invalid assessment type'),
  query('published_only')
    .optional()
    .isBoolean()
    .withMessage('published_only must be boolean'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise } = req.params;
    const { class: className, subject, assessment_type, published_only } = req.query;

    // Check authorization
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== udise) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED',
      });
    }

    let query = db('assessments').where('school_udise', udise);

    if (className) {
      query = query.where('class', className);
    }

    if (subject) {
      query = query.where('subject', 'like', `%${subject}%`);
    }

    if (assessment_type) {
      query = query.where('assessment_type', assessment_type);
    }

    if (published_only === 'true') {
      query = query.where('is_published', true);
    }

    const assessments = await query.orderBy('date', 'desc');

    res.json({
      success: true,
      data: assessments,
    });
  })
);

/**
 * GET /api/assessments/:id
 * Get assessment details
 */
router.get(
  '/detail/:id',
  authMiddleware,
  param('id').isUUID().withMessage('Invalid assessment ID'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const assessment = await db('assessments').where('id', id).first();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
        error: 'ASSESSMENT_NOT_FOUND',
      });
    }

    // Get grades for this assessment
    const grades = await db('grades')
      .join('students', 'grades.student_apaar_id', 'students.apaar_id')
      .where('assessment_id', id)
      .select('grades.*', 'students.name');

    res.json({
      success: true,
      data: {
        assessment,
        grades,
      },
    });
  })
);

/**
 * PUT /api/assessments/:id
 * Update assessment
 */
router.put(
  '/:id',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  param('id').isUUID().withMessage('Invalid assessment ID'),
  body('title')
    .optional()
    .isString()
    .trim(),
  body('max_marks')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max marks must be positive'),
  body('weightage')
    .optional()
    .isDecimal()
    .withMessage('Invalid weightage'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, max_marks, weightage } = req.body;

    const assessment = await db('assessments').where('id', id).first();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
        error: 'ASSESSMENT_NOT_FOUND',
      });
    }

    // Check authorization
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== assessment.school_udise) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED',
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (max_marks) updateData.max_marks = max_marks;
    if (weightage) updateData.weightage = weightage;

    updateData.updated_at = db.fn.now();

    await db('assessments').where('id', id).update(updateData);

    logger.info('Assessment updated', { assessmentId: id });

    res.json({
      success: true,
      message: 'Assessment updated successfully',
    });
  })
);

/**
 * POST /api/assessments/:id/grades
 * Bulk upload grades for assessment
 */
router.post(
  '/:id/grades',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  param('id').isUUID().withMessage('Invalid assessment ID'),
  body('grades')
    .isArray({ min: 1 })
    .withMessage('Grades must be non-empty array'),
  body('grades.*.student_apaar_id')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  body('grades.*.marks_obtained')
    .isDecimal()
    .withMessage('Invalid marks'),
  body('grades.*.grade_letter')
    .optional()
    .isString()
    .trim(),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { grades } = req.body;

    const assessment = await db('assessments').where('id', id).first();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
        error: 'ASSESSMENT_NOT_FOUND',
      });
    }

    // Check authorization
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== assessment.school_udise) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED',
      });
    }

    const gradeRecords = [];

    for (const grade of grades) {
      // Calculate percentage and grade letter
      const percentage = (grade.marks_obtained / assessment.max_marks) * 100;
      const gradeMap = {
        A: [90, 100],
        B: [70, 89],
        C: [50, 69],
        D: [35, 49],
        F: [0, 34],
      };

      let gradeLetter = grade.grade_letter || 'F';
      if (!grade.grade_letter) {
        for (const [letter, range] of Object.entries(gradeMap)) {
          if (percentage >= range[0] && percentage <= range[1]) {
            gradeLetter = letter;
            break;
          }
        }
      }

      gradeRecords.push({
        id: uuidv4(),
        assessment_id: id,
        student_apaar_id: grade.student_apaar_id,
        marks_obtained: grade.marks_obtained,
        grade_letter: gradeLetter,
        percentile: percentage,
        graded_by: req.user.id,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
    }

    // Delete existing grades for this assessment (or use upsert)
    await db('grades').where('assessment_id', id).del();
    await db('grades').insert(gradeRecords);

    logger.info('Grades uploaded', {
      assessmentId: id,
      count: gradeRecords.length,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: `Grades uploaded for ${gradeRecords.length} students`,
      data: gradeRecords,
    });
  })
);

/**
 * PUT /api/assessments/:id/grades/:gradeId
 * Update single grade
 */
router.put(
  '/:id/grades/:gradeId',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  param('id').isUUID().withMessage('Invalid assessment ID'),
  param('gradeId').isUUID().withMessage('Invalid grade ID'),
  body('marks_obtained')
    .isDecimal()
    .withMessage('Invalid marks'),
  body('remarks')
    .optional()
    .isString()
    .trim(),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id, gradeId } = req.params;
    const { marks_obtained, remarks } = req.body;

    const grade = await db('grades').where('id', gradeId).first();

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found',
        error: 'GRADE_NOT_FOUND',
      });
    }

    const assessment = await db('assessments').where('id', id).first();

    if (!assessment || assessment.id !== grade.assessment_id) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
        error: 'ASSESSMENT_NOT_FOUND',
      });
    }

    // Check authorization
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== assessment.school_udise) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED',
      });
    }

    const percentage = (marks_obtained / assessment.max_marks) * 100;

    const updateData = {
      marks_obtained,
      percentile: percentage,
      remarks: remarks || null,
      updated_at: db.fn.now(),
    };

    await db('grades').where('id', gradeId).update(updateData);

    logger.info('Grade updated', { gradeId, assessmentId: id });

    res.json({
      success: true,
      message: 'Grade updated successfully',
    });
  })
);

/**
 * POST /api/assessments/:id/publish
 * Publish grades for assessment
 */
router.post(
  '/:id/publish',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  param('id').isUUID().withMessage('Invalid assessment ID'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const assessment = await db('assessments').where('id', id).first();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
        error: 'ASSESSMENT_NOT_FOUND',
      });
    }

    // Check authorization
    if (req.user.role !== 'platform_admin' && req.user.school_udise !== assessment.school_udise) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED',
      });
    }

    await db('assessments').where('id', id).update({
      is_published: true,
      updated_at: db.fn.now(),
    });

    logger.info('Assessment published', { assessmentId: id });

    res.json({
      success: true,
      message: 'Assessment published successfully',
    });
  })
);

/**
 * GET /api/assessments/:id/report
 * Get grade distribution report
 */
router.get(
  '/:id/report',
  authMiddleware,
  authorize('teacher', 'school_admin', 'platform_admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const assessment = await db('assessments').where('id', id).first();

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
        error: 'ASSESSMENT_NOT_FOUND',
      });
    }

    const grades = await db('grades')
      .where('assessment_id', id)
      .select('grade_letter', 'percentile')
      .orderBy('percentile', 'desc');

    const distribution = {};
    grades.forEach((g) => {
      distribution[g.grade_letter] = (distribution[g.grade_letter] || 0) + 1;
    });

    const totalMarks = grades.reduce((sum, g) => sum + g.percentile, 0);
    const average = grades.length > 0 ? Math.round(totalMarks / grades.length) : 0;

    res.json({
      success: true,
      data: {
        total_students: grades.length,
        average_percentage: average,
        grade_distribution: distribution,
        highest_score: grades[0]?.percentile || 0,
        lowest_score: grades[grades.length - 1]?.percentile || 0,
      },
    });
  })
);

module.exports = router;
