import React, { createContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import { LOCAL_STORAGE_KEYS } from '../utils/constants'

export const AuthContext = createContext()

/**
 * AuthProvider component
 * Manages user authentication state and operations
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
        const userInfo = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_INFO)

        if (token && userInfo) {
          setUser(JSON.parse(userInfo))
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err)
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  /**
   * Send OTP to phone number
   */
  const sendOTP = useCallback(async (phone) => {
    try {
      setError(null)
      const response = await api.post('/auth/send-otp', { phone })
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP'
      setError(errorMessage)
      throw err
    }
  }, [])

  /**
   * Verify OTP and login
   */
  const verifyOTP = useCallback(async (phone, otp) => {
    try {
      setError(null)
      const response = await api.post('/auth/verify-otp', { phone, otp })
      const { token, refreshToken, user: userData } = response.data

      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token)
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_INFO, JSON.stringify(userData))

      setUser(userData)
      return userData
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to verify OTP'
      setError(errorMessage)
      throw err
    }
  }, [])

  /**
   * Verify APAAR token and link profile
   */
  const verifyAPAAR = useCallback(async (apaarToken, consentScopes) => {
    try {
      setError(null)
      const response = await api.post('/apaar/verify', {
        token: apaarToken,
        consentScopes
      })

      const updatedUser = { ...user, ...response.data.user, apaarLinked: true }
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_INFO, JSON.stringify(updatedUser))
      setUser(updatedUser)

      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to verify APAAR'
      setError(errorMessage)
      throw err
    }
  }, [user])

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      setError(null)
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO)
      setUser(null)
    }
  }, [])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    sendOTP,
    verifyOTP,
    verifyAPAAR,
    logout,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
