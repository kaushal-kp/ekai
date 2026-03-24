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
 * GET /api/schools/:udise/dashboard
 * Get school dashboard overview
 */
router.get(
  '/:udise/dashboard',
  authMiddleware,
  authorize('school_admin', 'teacher', 'platform_admin'),
  authorizeSchool(),
  asyncHandler(async (req, res) => {
    const { udise } = req.params;

    const school = await db('schools').where('udise_code', udise).first();

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found',
        error: 'SCHOOL_NOT_FOUND',
      });
    }

    // Get statistics
    const totalStudents = await db('students').where('school_udise', udise).count('* as count').first();
    const totalTeachers = await db('teachers').where('school_udise', udise).count('* as count').first();

    // Attendance stats for today
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await db('attendance')
      .where('school_udise', udise)
      .where('date', today)
      .count('* as count')
      .first();

    const todayPresent = await db('attendance')
      .where('school_udise', udise)
      .where('date', today)
      .where('status', 'present')
      .count('* as count')
      .first();

    // Recent grades
    const recentGrades = await db('grades')
      .join('assessments', 'grades.assessment_id', 'assessments.id')
      .where('assessments.school_udise', udise)
      .orderBy('assessments.date', 'desc')
      .limit(5)
      .select('assessments.title', 'assessments.subject', 'grades.marks_obtained', 'grades.grade_letter');

    res.json({
      success: true,
      data: {
        school,
        statistics: {
          total_students: totalStudents.count,
          total_teachers: totalTeachers.count,
          today_attendance: {
            total: todayAttendance.count,
            present: todayPresent.count,
            percentage:
              todayAttendance.count > 0
                ? Math.round((todayPresent.count / todayAttendance.count) * 100)
                : 0,
          },
        },
        recent_grades: recentGrades,
      },
    });
  })
);

/**
 * GET /api/schools/:udise/students
 * Get paginated list of students in school
 */
router.get(
  '/:udise/students',
  authMiddleware,
  authorize('school_admin', 'teacher', 'platform_admin'),
  authorizeSchool(),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isString()
    .trim(),
  query('class')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Class must be between 1 and 12'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise } = req.params;
    const { page = 1, limit = 20, search, class: className } = req.query;
    const offset = (page - 1) * limit;

    let query = db('students').where('school_udise', udise);

    if (search) {
      query = query.where('name', 'like', `%${search}%`);
    }

    if (className) {
      query = query.where('class', className);
    }

    const total = await query.clone().count('* as count').first();
    const students = await query
      .orderBy('name')
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: students,
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
 * POST /api/schools/:udise/students
 * Enroll new student in school
 */
router.post(
  '/:udise/students',
  authMiddleware,
  authorize('school_admin', 'platform_admin'),
  authorizeSchool(),
  body('apaar_id')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('dob')
    .isISO8601()
    .withMessage('Date of birth must be valid ISO date'),
  body('gender')
    .isIn(['M', 'F', 'Other'])
    .withMessage('Gender must be M, F, or Other'),
  body('class')
    .isInt({ min: 1, max: 12 })
    .withMessage('Class must be between 1 and 12'),
  body('section')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Section is required'),
  body('guardian_name')
    .optional()
    .isString()
    .trim(),
  body('guardian_phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Invalid guardian phone'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise } = req.params;
    const { apaar_id, name, dob, gender, class: className, section, guardian_name, guardian_phone } = req.body;

    // Check if APAAR ID already exists
    const existingStudent = await db('students').where('apaar_id', apaar_id).first();
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'Student with this APAAR ID already exists',
        error: 'DUPLICATE_STUDENT',
      });
    }

    // Create user and student
    const userId = uuidv4();
    const userData = {
      id: userId,
      apaar_id,
      name,
      role: 'student',
      school_udise: udise,
      is_active: true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    const studentData = {
      apaar_id,
      user_id: userId,
      school_udise: udise,
      name,
      dob,
      gender,
      class: className,
      section,
      guardian_name,
      guardian_phone,
      enrollment_date: new Date().toISOString().split('T')[0],
      is_active: true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    await db('users').insert(userData);
    await db('students').insert(studentData);

    logger.info('Student enrolled', {
      apaarId: apaar_id,
      school: udise,
      enrolledBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: studentData,
    });
  })
);

/**
 * GET /api/schools/:udise/teachers
 * Get list of teachers in school
 */
router.get(
  '/:udise/teachers',
  authMiddleware,
  authorize('school_admin', 'platform_admin'),
  authorizeSchool(),
  query('search')
    .optional()
    .isString()
    .trim(),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise } = req.params;
    const { search } = req.query;

    let query = db('teachers').where('school_udise', udise);

    if (search) {
      query = query.where('name', 'like', `%${search}%`);
    }

    const teachers = await query.orderBy('name');

    res.json({
      success: true,
      data: teachers,
    });
  })
);

/**
 * POST /api/schools/:udise/teachers
 * Add new teacher to school
 */
router.post(
  '/:udise/teachers',
  authMiddleware,
  authorize('school_admin', 'platform_admin'),
  authorizeSchool(),
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('phone')
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email'),
  body('employee_id')
    .optional()
    .isString()
    .trim(),
  body('designation')
    .optional()
    .isString()
    .trim(),
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise } = req.params;
    const { name, phone, email, employee_id, designation, subjects = [] } = req.body;

    // Check for duplicate phone
    const existingUser = await db('users').where('phone', phone).first();
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone number already exists',
        error: 'DUPLICATE_PHONE',
      });
    }

    const userId = uuidv4();
    const userData = {
      id: userId,
      phone,
      email: email || null,
      name,
      role: 'teacher',
      school_udise: udise,
      is_active: true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    const teacherData = {
      id: uuidv4(),
      user_id: userId,
      school_udise: udise,
      name,
      employee_id: employee_id || null,
      designation: designation || null,
      subjects: JSON.stringify(subjects),
      assigned_classes: JSON.stringify([]),
      is_active: true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    await db('users').insert(userData);
    await db('teachers').insert(teacherData);

    logger.info('Teacher added', {
      teacher: name,
      school: udise,
      addedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Teacher added successfully',
      data: teacherData,
    });
  })
);

/**
 * PUT /api/schools/:udise/teachers/:id
 * Update teacher information
 */
router.put(
  '/:udise/teachers/:id',
  authMiddleware,
  authorize('school_admin', 'platform_admin'),
  authorizeSchool(),
  param('id').isUUID().withMessage('Invalid teacher ID'),
  body('designation')
    .optional()
    .isString()
    .trim(),
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array'),
  body('assigned_classes')
    .optional()
    .isArray()
    .withMessage('Assigned classes must be an array'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { udise, id } = req.params;
    const { designation, subjects, assigned_classes } = req.body;

    const teacher = await db('teachers').where('id', id).where('school_udise', udise).first();

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
        error: 'TEACHER_NOT_FOUND',
      });
    }

    const updateData = {};
    if (designation) updateData.designation = designation;
    if (subjects) updateData.subjects = JSON.stringify(subjects);
    if (assigned_classes) updateData.assigned_classes = JSON.stringify(assigned_classes);

    updateData.updated_at = db.fn.now();

    await db('teachers').where('id', id).update(updateData);

    logger.info('Teacher updated', { teacherId: id, school: udise });

    res.json({
      success: true,
      message: 'Teacher updated successfully',
    });
  })
);

/**
 * GET /api/schools/:udise/stats
 * Get school statistics and reports
 */
router.get(
  '/:udise/stats',
  authMiddleware,
  authorize('school_admin', 'platform_admin'),
  authorizeSchool(),
  asyncHandler(async (req, res) => {
    const { udise } = req.params;

    // Attendance stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendance = await db('attendance')
      .where('school_udise', udise)
      .where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0])
      .select('status')
      .count('* as count')
      .groupBy('status');

    const attendanceMap = {};
    attendance.forEach((a) => {
      attendanceMap[a.status] = a.count;
    });

    // Grade distribution
    const grades = await db('grades')
      .join('assessments', 'grades.assessment_id', 'assessments.id')
      .where('assessments.school_udise', udise)
      .select('grades.grade_letter')
      .count('* as count')
      .groupBy('grades.grade_letter');

    const gradeMap = {};
    grades.forEach((g) => {
      gradeMap[g.grade_letter] = g.count;
    });

    res.json({
      success: true,
      data: {
        attendance_distribution: attendanceMap,
        grade_distribution: gradeMap,
      },
    });
  })
);

module.exports = router;
