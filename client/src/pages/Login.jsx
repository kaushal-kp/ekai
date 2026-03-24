import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { FORM_VALIDATION_RULES, APAAR_CONSENT_SCOPES } from '../utils/constants'
import { LoadingSpinner } from '../components/shared/LoadingSpinner'
import { ArrowLeft, CheckCircle } from 'lucide-react'

/**
 * Login page with OTP and APAAR verification flow
 */
export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, sendOTP, verifyOTP, verifyAPAAR, error, clearError } = useAuth()

  const userRole = searchParams.get('role') || 'student'

  const [step, setStep] = useState('phone') // phone, otp, apaar
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedScopes, setSelectedScopes] = useState(
    APAAR_CONSENT_SCOPES.map(s => s.id)
  )
  const [phoneError, setPhoneError] = useState('')
  const [otpError, setOtpError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        navigate('/student')
      } else if (user.role === 'school_admin' || user.role === 'teacher') {
        navigate('/school')
      }
    }
  }, [user, navigate])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setPhoneError('')
    clearError()

    if (!phone || !FORM_VALIDATION_RULES.PHONE.test(phone)) {
      setPhoneError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    try {
      await sendOTP(phone)
      setStep('otp')
    } catch (err) {
      setPhoneError(error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setOtpError('')
    clearError()

    if (!otp || !FORM_VALIDATION_RULES.OTP.test(otp)) {
      setOtpError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      await verifyOTP(phone, otp)
      setStep('apaar')
    } catch (err) {
      setOtpError(error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleAPAARVerify = async (e) => {
    e.preventDefault()
    clearError()

    if (selectedScopes.length === 0) {
      alert('Please select at least one consent scope')
      return
    }

    setLoading(true)
    try {
      const mockAPAARToken = 'mock_apaar_token_' + Date.now()
      await verifyAPAAR(mockAPAARToken, selectedScopes)
      // Navigation happens automatically via useEffect after user state updates
    } catch (err) {
      alert(error || 'Failed to verify APAAR')
    } finally {
      setLoading(false)
    }
  }

  const handleScopeToggle = (scopeId) => {
    setSelectedScopes(prev =>
      prev.includes(scopeId)
        ? prev.filter(id => id !== scopeId)
        : [...prev, scopeId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="text-primary-700 hover:text-primary-800 font-semibold mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {userRole === 'student' ? 'Student Login' : 'School Admin Login'}
            </h1>
            <p className="text-gray-600">
              {step === 'phone'
                ? 'Enter your phone number'
                : step === 'otp'
                  ? 'Enter the OTP sent to your phone'
                  : 'Link with APAAR and grant access'}
            </p>
          </div>

          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setPhoneError('')
                  }}
                  placeholder="10-digit phone number"
                  className="input-base"
                  maxLength="10"
                />
                {phoneError && <p className="text-danger text-sm mt-1">{phoneError}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value)
                    setOtpError('')
                  }}
                  placeholder="6-digit OTP"
                  className="input-base"
                  maxLength="6"
                />
                {otpError && <p className="text-danger text-sm mt-1">{otpError}</p>}
              </div>
              <p className="text-xs text-gray-600">
                OTP sent to {phone}
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-primary-700 font-semibold ml-2"
                >
                  Change number
                </button>
              </p>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {/* APAAR Consent Step */}
          {step === 'apaar' && (
            <form onSubmit={handleAPAARVerify} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">APAAR Integration:</span> Grant EKAI access to your educational data with granular consent management.
                </p>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {APAAR_CONSENT_SCOPES.map(scope => (
                  <label key={scope.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(scope.id)}
                      onChange={() => handleScopeToggle(scope.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{scope.label}</div>
                      <div className="text-xs text-gray-600">{scope.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-700">
                  By proceeding, you authorize EKAI to access your educational records from APAAR in accordance with your selected scopes. You can revoke access anytime from your profile settings.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || selectedScopes.length === 0}
                className="btn-primary w-full py-3"
              >
                {loading ? 'Linking with APAAR...' : 'Proceed to Dashboard'}
              </button>

              <button
                type="button"
                onClick={() => setStep('otp')}
                className="btn-outline w-full py-3"
              >
                Back
              </button>
            </form>
          )}

          {/* Info Box */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex gap-3 text-sm text-gray-600">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Secure & APAAR Compliant</p>
                <p>Your data is protected with APAAR consent management standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
