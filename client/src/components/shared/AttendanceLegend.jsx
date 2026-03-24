import React from 'react'
import { ATTENDANCE_STATUS, ATTENDANCE_BG_COLORS, ATTENDANCE_TEXT_COLORS } from '../../utils/constants'

/**
 * Reusable attendance legend component with color-coded status
 * This ensures consistent color display across all pages using theme tokens
 */
export const AttendanceLegend = () => {
  const statuses = [
    ATTENDANCE_STATUS.PRESENT,
    ATTENDANCE_STATUS.ABSENT,
    ATTENDANCE_STATUS.LATE,
    ATTENDANCE_STATUS.HOLIDAY
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statuses.map(status => (
        <div key={status} className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${ATTENDANCE_BG_COLORS[status]}`}></div>
          <span className="text-sm text-gray-600">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      ))}
    </div>
  )
}
