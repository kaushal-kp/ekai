import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { GRADE_SCALE, ATTENDANCE_STATUS } from './constants'

/**
 * Format a date string to a readable format
 * @param {string|Date} dateString - ISO date string or Date object
 * @param {string} formatStr - date-fns format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return ''
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
  return format(date, formatStr)
}

/**
 * Format a date to time string
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Time (HH:mm)
 */
export const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
  return format(date, 'HH:mm')
}

/**
 * Format date and time together
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Date and time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
  return format(date, 'MMM dd, yyyy HH:mm')
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total, decimals = 1) => {
  if (total === 0) return 0
  return Number(((value / total) * 100).toFixed(decimals))
}

/**
 * Get grade letter based on percentage/marks
 * @param {number} marks - Marks obtained
 * @param {number} maxMarks - Total marks
 * @returns {string} Grade letter
 */
export const getGradeLetter = (marks, maxMarks) => {
  const percentage = calculatePercentage(marks, maxMarks, 0)
  for (const [grade, config] of Object.entries(GRADE_SCALE)) {
    if (percentage >= config.min) {
      return grade
    }
  }
  return 'F'
}

/**
 * Get GPA from grades
 * @param {Array} grades - Array of grade objects with marks and maxMarks
 * @returns {number} GPA out of 4.0
 */
export const calculateGPA = (grades) => {
  if (!grades || grades.length === 0) return 0

  const gradePoints = {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    F: 0.0
  }

  const totalPoints = grades.reduce((sum, grade) => {
    const letter = getGradeLetter(grade.marks, grade.maxMarks)
    return sum + (gradePoints[letter] || 0)
  }, 0)

  return Number((totalPoints / grades.length).toFixed(2))
}

/**
 * Format attendance status as readable text
 * @param {string} status - Attendance status
 * @returns {string} Readable status
 */
export const formatAttendanceStatus = (status) => {
  const statusMap = {
    [ATTENDANCE_STATUS.PRESENT]: 'Present',
    [ATTENDANCE_STATUS.ABSENT]: 'Absent',
    [ATTENDANCE_STATUS.LATE]: 'Late',
    [ATTENDANCE_STATUS.HOLIDAY]: 'Holiday',
    [ATTENDANCE_STATUS.LEAVE]: 'Leave'
  }
  return statusMap[status] || status
}

/**
 * Calculate attendance statistics
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} Attendance stats
 */
export const calculateAttendanceStats = (attendanceRecords) => {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return { present: 0, absent: 0, late: 0, total: 0, percentage: 0 }
  }

  const stats = {
    present: 0,
    absent: 0,
    late: 0,
    holiday: 0,
    leave: 0
  }

  attendanceRecords.forEach(record => {
    if (record.status === ATTENDANCE_STATUS.PRESENT) stats.present++
    else if (record.status === ATTENDANCE_STATUS.ABSENT) stats.absent++
    else if (record.status === ATTENDANCE_STATUS.LATE) stats.late++
    else if (record.status === ATTENDANCE_STATUS.HOLIDAY) stats.holiday++
    else if (record.status === ATTENDANCE_STATUS.LEAVE) stats.leave++
  })

  const workingDays = stats.present + stats.absent + stats.late
  const percentage = workingDays > 0 ? calculatePercentage(stats.present, workingDays, 1) : 0

  return {
    ...stats,
    total: attendanceRecords.length,
    workingDays,
    percentage
  }
}

/**
 * Get days of month with attendance data
 * @param {Date} month - Month date
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Array} Days with attendance info
 */
export const getDaysOfMonth = (month, attendanceRecords = []) => {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days = eachDayOfInterval({ start, end })

  return days.map(day => {
    const record = attendanceRecords.find(r => isSameDay(parseISO(r.date), day))
    return {
      date: day,
      status: record?.status || null,
      day: format(day, 'd')
    }
  })
}

/**
 * Check if user can edit a resource
 * @param {Object} user - Current user
 * @param {Object} resource - Resource to check
 * @returns {boolean} Can edit
 */
export const canEditResource = (user, resource) => {
  if (!user) return false
  if (user.role === 'system_admin') return true
  if (user.role === 'school_admin' && resource.schoolId === user.schoolId) return true
  if (user.role === 'teacher' && resource.createdBy === user.id) return true
  return false
}

/**
 * Format phone number
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone (XXXXX XXXXX)
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.replace(/(\d{5})(\d{5})/, '$1 $2')
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
export const truncate = (text, length = 50) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

/**
 * Group array by property
 * @param {Array} array - Array to group
 * @param {string} key - Property to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) result[group] = []
    result[group].push(item)
    return result
  }, {})
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

/**
 * Sort array of objects
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Compare two dates (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareDates = (date1, date2) => {
  const d1 = new Date(date1).setHours(0, 0, 0, 0)
  const d2 = new Date(date2).setHours(0, 0, 0, 0)
  if (d1 < d2) return -1
  if (d1 > d2) return 1
  return 0
}

/**
 * Get relative time (e.g., '2 hours ago')
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Relative time
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return ''
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
  const now = new Date()
  const secondsAgo = (now - date) / 1000

  if (secondsAgo < 60) return 'just now'
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`
  return formatDate(date, 'MMM dd')
}
