import React from 'react'
import { ATTENDANCE_COLORS, ATTENDANCE_BG_COLORS, ATTENDANCE_TEXT_COLORS, CONSENT_STATUS } from '../../utils/constants'

/**
 * Status badge component with color coding
 */
export const StatusBadge = ({ status, type = 'attendance' }) => {
  let bgColor, textColor, displayText

  if (type === 'attendance') {
    bgColor = ATTENDANCE_BG_COLORS[status] || 'bg-gray-100'
    textColor = ATTENDANCE_TEXT_COLORS[status] || 'text-gray-700'
    displayText = status?.charAt(0).toUpperCase() + status?.slice(1)
  } else if (type === 'consent') {
    const consentColors = {
      [CONSENT_STATUS.ACTIVE]: { bg: 'bg-green-100', text: 'text-success' },
      [CONSENT_STATUS.PENDING]: { bg: 'bg-accent-100', text: 'text-accent-700' },
      [CONSENT_STATUS.REVOKED]: { bg: 'bg-red-100', text: 'text-danger' },
      [CONSENT_STATUS.EXPIRED]: { bg: 'bg-gray-100', text: 'text-gray-700' }
    }
    const colors = consentColors[status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
    bgColor = colors.bg
    textColor = colors.text
    displayText = status?.charAt(0).toUpperCase() + status?.slice(1)
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {displayText}
    </span>
  )
}
