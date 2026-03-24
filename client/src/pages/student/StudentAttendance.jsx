import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { BottomNav } from '../../components/shared/BottomNav'
import { Card } from '../../components/shared/Card'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { ATTENDANCE_STATUS, ATTENDANCE_BG_COLORS, ATTENDANCE_TEXT_COLORS } from '../../utils/constants'

/**
 * Student attendance page with monthly calendar view
 */
export default function StudentAttendance() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { data: attendance = [] } = useQuery({
    queryKey: ['student', 'attendance', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const response = await api.get('/students/attendance', {
        params: { month: format(currentMonth, 'yyyy-MM') }
      })
      return response.data
    }
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getDayStatus = (day) => {
    return attendance.find(a => isSameDay(parseISO(a.date), day))?.status
  }

  const stats = attendance.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1
    return acc
  }, {})

  const workingDays = (stats[ATTENDANCE_STATUS.PRESENT] || 0) +
                     (stats[ATTENDANCE_STATUS.ABSENT] || 0) +
                     (stats[ATTENDANCE_STATUS.LATE] || 0)
  const attendancePercentage = workingDays > 0
    ? Math.round(((stats[ATTENDANCE_STATUS.PRESENT] || 0) / workingDays) * 100)
    : 0

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekGridDays = []
  const firstDay = days[0].getDay()

  for (let i = 0; i < firstDay; i++) {
    weekGridDays.push(null)
  }
  weekGridDays.push(...days)

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <Header title="Attendance" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card variant="stat">
            <p className="text-sm text-gray-600">Attendance %</p>
            <p className="text-2xl font-bold text-success mt-1">{attendancePercentage}%</p>
          </Card>
          <Card variant="stat">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-2xl font-bold text-success mt-1">{stats[ATTENDANCE_STATUS.PRESENT] || 0}</p>
          </Card>
          <Card variant="stat">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-2xl font-bold text-danger mt-1">{stats[ATTENDANCE_STATUS.ABSENT] || 0}</p>
          </Card>
          <Card variant="stat">
            <p className="text-sm text-gray-600">Late</p>
            <p className="text-2xl font-bold text-accent-600 mt-1">{stats[ATTENDANCE_STATUS.LATE] || 0}</p>
          </Card>
        </div>

        {/* Calendar */}
        <Card>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekGridDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="aspect-square"></div>
              }

              const status = getDayStatus(day)
              const bgClass = status ? ATTENDANCE_BG_COLORS[status] : 'bg-gray-50'
              const textClass = status ? ATTENDANCE_TEXT_COLORS[status] : 'text-gray-600'
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm border-2 ${bgClass} ${textClass} ${
                    isToday ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success rounded"></div>
              <span className="text-sm text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-danger rounded"></div>
              <span className="text-sm text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent-500 rounded"></div>
              <span className="text-sm text-gray-600">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-600">Holiday</span>
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
