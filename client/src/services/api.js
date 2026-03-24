import axios from 'axios'
import { LOCAL_STORAGE_KEYS, REQUEST_TIMEOUT } from '../utils/constants'
import * as mockData from './mockData'

/**
 * Create axios instance with interceptors
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: REQUEST_TIMEOUT
})

/**
 * Mock data responder for development/demo
 */
const getMockResponse = (config) => {
  const url = config.url
  const method = config.method

  // Auth endpoints
  if (method === 'post' && url.includes('/auth/send-otp')) {
    return { data: { success: true, message: 'OTP sent successfully' } }
  }

  if (method === 'post' && url.includes('/auth/verify-otp')) {
    const phone = config.data?.phone
    const role = phone === '9876543210' ? 'student' : 'school_admin'
    const user = role === 'student' ? mockData.mockStudentUser : mockData.mockSchoolAdminUser
    return {
      data: {
        token: 'mock_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        user
      }
    }
  }

  if (method === 'post' && url.includes('/apaar/verify')) {
    return {
      data: {
        success: true,
        message: 'APAAR verification successful',
        user: { apaarLinked: true }
      }
    }
  }

  // Student endpoints
  if (method === 'get' && url.includes('/student/profile')) {
    return { data: mockData.mockStudentUser }
  }

  if (method === 'get' && url.includes('/student/grades')) {
    return { data: { grades: mockData.mockGrades } }
  }

  if (method === 'get' && url.includes('/student/attendance')) {
    return { data: { attendance: mockData.mockAttendance } }
  }

  if (method === 'get' && url.includes('/student/documents')) {
    return { data: { documents: mockData.mockDocuments } }
  }

  if (method === 'get' && url.includes('/student/notifications')) {
    return { data: { notifications: mockData.mockNotifications } }
  }

  // School endpoints
  if (method === 'get' && url.includes('/school/students')) {
    return { data: { students: mockData.mockStudents, total: mockData.mockStudents.length } }
  }

  if (method === 'get' && url.includes('/school/students/') && url.includes('/profile')) {
    return { data: mockData.mockStudents[0] }
  }

  if (method === 'get' && url.includes('/school/teachers')) {
    return { data: { teachers: mockData.mockTeachers } }
  }

  if (method === 'get' && url.includes('/school/assessments')) {
    return { data: { assessments: mockData.mockAssessments } }
  }

  if (method === 'get' && url.includes('/school/attendance')) {
    return { data: { records: mockData.mockAttendanceRecords } }
  }

  if (method === 'get' && url.includes('/school/calendar')) {
    return { data: { events: mockData.mockCalendarEvents } }
  }

  if (method === 'get' && url.includes('/school/reports')) {
    return { data: { reports: mockData.mockReports } }
  }

  if (method === 'post' && url.includes('/grades')) {
    return { data: { success: true, message: 'Grades saved successfully' } }
  }

  // Dashboard endpoints
  if (method === 'get' && url.includes('/dashboard')) {
    return {
      data: {
        studentStats: {
          totalGPA: 3.8,
          attendance: 92,
          onTrack: true,
          upcomingExams: 2
        },
        schoolStats: {
          totalStudents: mockData.mockStudents.length,
          totalTeachers: mockData.mockTeachers.length,
          averageAttendance: 91,
          totalAssessments: mockData.mockAssessments.length
        }
      }
    }
  }

  return null
}

/**
 * Request interceptor - Add auth token
 */
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

/**
 * Response interceptor - Handle errors and token refresh
 */
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Try to return mock data if API fails (for demo/offline mode)
    if (error.message === 'Network Error' || !error.response) {
      console.log('API unreachable, using mock data for:', originalRequest.url)
      const mockResponse = getMockResponse(originalRequest)
      if (mockResponse) {
        return mockResponse
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        )

        const { token } = response.data
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token)

        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, try mock data
        const mockResponse = getMockResponse(originalRequest)
        if (mockResponse) {
          return mockResponse
        }

        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // On any other error, try mock data
    const mockResponse = getMockResponse(originalRequest)
    if (mockResponse) {
      console.log('Using mock data fallback for:', originalRequest.url)
      return mockResponse
    }

    return Promise.reject(error)
  }
)

export default api
