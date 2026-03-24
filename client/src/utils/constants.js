/**
 * Application-wide constants for EKAI MVP
 */

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  SCHOOL_ADMIN: 'school_admin',
  SYSTEM_ADMIN: 'system_admin'
}

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HOLIDAY: 'holiday',
  LEAVE: 'leave'
}

export const ATTENDANCE_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: '#059669',
  [ATTENDANCE_STATUS.ABSENT]: '#DC2626',
  [ATTENDANCE_STATUS.LATE]: '#F59E0B',
  [ATTENDANCE_STATUS.HOLIDAY]: '#64748B',
  [ATTENDANCE_STATUS.LEAVE]: '#0F766E'
}

export const ATTENDANCE_BG_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: 'bg-green-100',
  [ATTENDANCE_STATUS.ABSENT]: 'bg-red-100',
  [ATTENDANCE_STATUS.LATE]: 'bg-amber-100',
  [ATTENDANCE_STATUS.HOLIDAY]: 'bg-gray-100',
  [ATTENDANCE_STATUS.LEAVE]: 'bg-teal-100'
}

export const ATTENDANCE_TEXT_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: 'text-success',
  [ATTENDANCE_STATUS.ABSENT]: 'text-danger',
  [ATTENDANCE_STATUS.LATE]: 'text-accent-600',
  [ATTENDANCE_STATUS.HOLIDAY]: 'text-neutral',
  [ATTENDANCE_STATUS.LEAVE]: 'text-secondary-700'
}

export const CONSENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REVOKED: 'revoked',
  EXPIRED: 'expired'
}

export const CONSENT_SCOPES = {
  ACADEMIC: 'academic_records',
  ATTENDANCE: 'attendance_records',
  DOCUMENTS: 'documents_access',
  BEHAVIORAL: 'behavioral_records',
  HEALTH: 'health_records',
  SPECIAL_NEEDS: 'special_needs_info'
}

export const ASSESSMENT_TYPES = {
  FORMATIVE: 'formative',
  SUMMATIVE: 'summative',
  PERIODIC: 'periodic',
  TERMINAL: 'terminal'
}

export const GRADE_SCALE = {
  A: { min: 90, label: 'A' },
  B: { min: 80, label: 'B' },
  C: { min: 70, label: 'C' },
  D: { min: 60, label: 'D' },
  F: { min: 0, label: 'F' }
}

export const EVENT_TYPES = {
  HOLIDAY: 'holiday',
  EXAM: 'exam',
  CLASS: 'class',
  ASSIGNMENT: 'assignment',
  MEETING: 'meeting',
  NOTICE: 'notice'
}

export const EVENT_COLORS = {
  [EVENT_TYPES.HOLIDAY]: 'bg-secondary-100 text-secondary-700',
  [EVENT_TYPES.EXAM]: 'bg-danger text-white',
  [EVENT_TYPES.CLASS]: 'bg-primary-100 text-primary-700',
  [EVENT_TYPES.ASSIGNMENT]: 'bg-accent-100 text-accent-700',
  [EVENT_TYPES.MEETING]: 'bg-blue-100 text-blue-700',
  [EVENT_TYPES.NOTICE]: 'bg-purple-100 text-purple-700'
}

export const REPORT_TYPES = {
  ATTENDANCE: 'attendance',
  ACADEMIC: 'academic',
  CLASS_WISE: 'class_wise',
  STUDENT_PROGRESS: 'student_progress'
}

export const NOTIFICATION_TYPES = {
  ATTENDANCE: 'attendance',
  GRADE: 'grade',
  CONSENT: 'consent',
  ANNOUNCEMENT: 'announcement',
  ASSIGNMENT: 'assignment',
  DOCUMENT: 'document',
  SYSTEM: 'system'
}

export const APAAR_CONSENT_SCOPES = [
  { id: CONSENT_SCOPES.ACADEMIC, label: 'Academic Records', description: 'Access to grades, assessments, and academic performance' },
  { id: CONSENT_SCOPES.ATTENDANCE, label: 'Attendance Records', description: 'Access to attendance history and reports' },
  { id: CONSENT_SCOPES.DOCUMENTS, label: 'Documents Access', description: 'Access to certificates and official documents' },
  { id: CONSENT_SCOPES.BEHAVIORAL, label: 'Behavioral Records', description: 'Access to conduct and behavioral records' },
  { id: CONSENT_SCOPES.HEALTH, label: 'Health Records', description: 'Access to health check-up records' },
  { id: CONSENT_SCOPES.SPECIAL_NEEDS, label: 'Special Needs Info', description: 'Access to special education and accommodations' }
]

export const FORM_VALIDATION_RULES = {
  PHONE: /^[0-9]{10}$/,
  OTP: /^[0-9]{6}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UDISE: /^[0-9]{11}$/
}

export const API_ENDPOINTS = {
  // Auth
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',

  // Students
  STUDENT_PROFILE: '/students/profile',
  STUDENT_GRADES: '/students/grades',
  STUDENT_ATTENDANCE: '/students/attendance',
  STUDENT_DOCUMENTS: '/students/documents',
  STUDENT_CONSENTS: '/students/consents',
  STUDENT_NOTIFICATIONS: '/students/notifications',

  // School - Dashboard
  SCHOOL_DASHBOARD: '/school/dashboard',

  // School - Students
  SCHOOL_STUDENTS: '/school/students',
  SCHOOL_STUDENT_DETAIL: '/school/students/:id',
  SCHOOL_STUDENT_CREATE: '/school/students/create',

  // School - Teachers
  SCHOOL_TEACHERS: '/school/teachers',
  SCHOOL_TEACHER_CREATE: '/school/teachers/create',
  SCHOOL_TEACHER_UPDATE: '/school/teachers/:id',

  // School - Attendance
  SCHOOL_ATTENDANCE: '/school/attendance',
  SCHOOL_ATTENDANCE_MARK: '/school/attendance/mark',
  SCHOOL_ATTENDANCE_REPORT: '/school/attendance/report',

  // School - Assessments
  SCHOOL_ASSESSMENTS: '/school/assessments',
  SCHOOL_ASSESSMENT_CREATE: '/school/assessments/create',
  SCHOOL_ASSESSMENT_GRADES: '/school/assessments/:id/grades',
  SCHOOL_ASSESSMENT_PUBLISH: '/school/assessments/:id/publish',

  // School - Calendar
  SCHOOL_CALENDAR: '/school/calendar',
  SCHOOL_CALENDAR_EVENT: '/school/calendar/events',

  // School - Reports
  SCHOOL_REPORTS: '/school/reports',

  // APAAR
  APAAR_VERIFY: '/apaar/verify',
  APAAR_CONSENTS: '/apaar/consents',
  APAAR_REVOKE_CONSENT: '/apaar/consents/:id/revoke'
}

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'ekai_auth_token',
  REFRESH_TOKEN: 'ekai_refresh_token',
  USER_INFO: 'ekai_user_info',
  PREFERENCES: 'ekai_preferences',
  OFFLINE_QUEUE: 'ekai_offline_queue'
}

export const SYNC_STATUSES = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR: 'error'
}

export const PAGE_SIZE = {
  STUDENTS: 20,
  TEACHERS: 20,
  ATTENDANCE: 50,
  GRADES: 30,
  NOTIFICATIONS: 20
}

export const TOAST_DURATION = 3000

export const DEBOUNCE_DELAY = 300

export const REQUEST_TIMEOUT = 30000
