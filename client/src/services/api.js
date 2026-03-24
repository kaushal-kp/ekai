import axios from 'axios'
import { LOCAL_STORAGE_KEYS, REQUEST_TIMEOUT } from '../utils/constants'

/**
 * Create axios instance with interceptors
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: REQUEST_TIMEOUT
})

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
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
