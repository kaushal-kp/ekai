const express = require('express');
const { body, param, query } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/database');
const logger = require('../config/logger');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const validateRequest = require('../middleware/validate');
const { asyncHandler } = require('../middleware/errorHandler');
const apaarService = require('../services/apaarService');

const router = express.Router();

/**
 * GET /api/consents/student/:apaarId
 * List all consents granted for a student
 */
router.get(
  '/student/:apaarId',
  authMiddleware,
  authorize('student', 'parent', 'school_admin', 'platform_admin'),
  param('apaarId')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  query('status')
    .optional()
    .isIn(['active', 'revoked', 'expired'])
    .withMessage('Invalid status'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { apaarId } = req.params;
    const { status } = req.query;

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

    let query = db('consents').where('student_apaar_id', apaarId);

    if (status) {
      query = query.where('status', status);
    }

    const consents = await query.orderBy('granted_at', 'desc');

    res.json({
      success: true,
      data: consents,
    });
  })
);

/**
 * POST /api/consents
 * Grant data sharing consent
 */
router.post(
  '/',
  authMiddleware,
  authorize('student', 'parent'),
  body('student_apaar_id')
    .matches(/^IN-[A-Z]{2}-\d{3}-\d{4}-\d{5}$/)
    .withMessage('Invalid APAAR ID format'),
  body('granted_to_entity')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Recipient entity is required'),
  body('granted_to_type')
    .isIn(['school', 'employer', 'government'])
    .withMessage('Invalid recipient type'),
  body('scope')
    .isIn(['basic_identity', 'academic_summary', 'detailed_academic', 'attendance', 'certificates', 'full_profile'])
    .withMessage('Invalid consent scope'),
  body('expires_at')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date'),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { student_apaar_id, granted_to_entity, granted_to_type, scope, expires_at } = req.body;

    const student = await db('students').where('apaar_id', student_apaar_id).first();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        error: 'STUDENT_NOT_FOUND',
      });
    }

    // Authorization: only student or parent can grant consent
    if (req.user.role === 'student' && req.user.id !== student.user_id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to grant consent for this student',
        error: 'ACCESS_DENIED',
      });
    }

    // Check for duplicate active consent
    const existing = await db('consents')
      .where('student_apaar_id', student_apaar_id)
      .where('granted_to_entity', granted_to_entity)
      .where('scope', scope)
      .where('status', 'active')
      .first();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Active consent already exists for this recipient and scope',
        error: 'DUPLICATE_CONSENT',
      });
    }

    // Create consent record
    const consentId = uuidv4();
    const consent = {
      id: consentId,
      student_apaar_id,
      granted_by: req.user.id,
      granted_to_entity,
      granted_to_type,
      scope,
      status: 'active',
      granted_at: db.fn.now(),
      expires_at: expires_at || null,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    };

    await db('consents').insert(consent);

    // Create audit log entry
    await db('consent_audit_log').insert({
      id: uuidv4(),
      consent_id: consentId,
      performed_by: req.user.id,
      action: 'granted',
      ip_address: req.ip,
      details: JSON.stringify({
        scope,
        recipient_type: granted_to_type,
      }),
      created_at: db.fn.now(),
    });

    logger.info('Consent granted', {
      consentId,
      studentApaarId: student_apaar_id,
      grantedBy: req.user.id,
      scope,
    });

    res.status(201).json({
      success: true,
      message: 'Consent granted successfully',
      data: consent,
    });
  })
);

/**
 * PUT /api/consents/:id/revoke
 * Revoke data sharing consent
 */
router.put(
  '/:id/revoke',
  authMiddleware,
  authorize('student', 'parent', 'school_admin', 'platform_admin'),
  param('id').isUUID().withMessage('Invalid consent ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const consent = await db('consents').where('id', id).first();

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'Consent not found',
        error: 'CONSENT_NOT_FOUND',
      });
    }

    const student = await db('students').where('apaar_id', consent.student_apaar_id).first();

    // Authorization check
    if (req.user.role === 'student' && req.user.id !== student.user_id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to revoke this consent',
        error: 'ACCESS_DENIED',
      });
    }

    // Update consent status
    const now = db.fn.now();
    await db('consents')
      .where('id', id)
      .update({
        status: 'revoked',
        revoked_at: now,
        updated_at: now,
      });

    // Create audit log entry
    await db('consent_audit_log').insert({
      id: uuidv4(),
      consent_id: id,
      performed_by: req.user.id,
      action: 'revoked',
      ip_address: req.ip,
      details: JSON.stringify({ reason: 'User revoked consent' }),
      created_at: db.fn.now(),
    });

    logger.info('Consent revoked', {
      consentId: id,
      studentApaarId: consent.student_apaar_id,
      revokedBy: req.user.id,
    });

    res.json({
      success: true,
      message: 'Consent revoked successfully',
    });
  })
);

/**
 * GET /api/consents/:id/audit
 * Get audit log for a consent
 */
router.get(
  '/:id/audit',
  authMiddleware,
  authorize('student', 'parent', 'school_admin', 'platform_admin'),
  param('id').isUUID().withMessage('Invalid consent ID'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const consent = await db('consents').where('id', id).first();

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'Consent not found',
        error: 'CONSENT_NOT_FOUND',
      });
    }

    const student = await db('students').where('apaar_id', consent.student_apaar_id).first();

    // Authorization check
    if (req.user.role === 'student' && req.user.id !== student.user_id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this audit log',
        error: 'ACCESS_DENIED',
      });
    }

    const auditLog = await db('consent_audit_log')
      .where('consent_id', id)
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: {
        consent,
        audit_log: auditLog,
      },
    });
  })
);

module.exports = router;
