import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { Sidebar } from '../../components/shared/Sidebar'
import { Card } from '../../components/shared/Card'
import { OfflineBanner } from '../../components/shared/OfflineBanner'
import { useOffline } from '../../hooks/useOffline'
import { queueAction, getSyncStats } from '../../services/offlineSync'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Save, AlertCircle } from 'lucide-react'

/**
 * School attendance marking with offline support
 */
export default function SchoolAttendance() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedClass, setSelectedClass] = useState('10-A')
  const [attendance, setAttendance] = useState({})
  const [syncStats, setSyncStats] = useState({ pending: 0 })
  const { isOffline } = useOffline()

  const mockStudents = [
    { id: 1, name: 'Aarav Sharma' },
    { id: 2, name: 'Priya Patel' },
    { id: 3, name: 'Rajesh Kumar' },
    { id: 4, name: 'Sneha Singh' },
    { id: 5, name: 'Vikram Nair' }
  ]

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSave = async () => {
    const payload = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      class: selectedClass,
      records: Object.entries(attendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status
      }))
    }

    try {
      if (isOffline) {
        await queueAction({
          type: 'attendance_mark',
          endpoint: '/school/attendance/mark',
          method: 'POST',
          data: payload
        })
        const stats = await getSyncStats()
        setSyncStats(stats)
        alert('Attendance saved offline. Will sync when online.')
      } else {
        await api.post('/school/attendance/mark', payload)
        alert('Attendance marked successfully')
      }
    } catch (err) {
      console.error('Failed to mark attendance:', err)
    }
  }

  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length
  const lateCount = Object.values(attendance).filter(s => s === 'late').length

  return (
    <div className="flex h-screen bg-gray-50 lg:ml-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <OfflineBanner pendingCount={syncStats.pending} />
        <Header title="Attendance" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showMenu={true} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filters */}
            <Card className="mb-8">
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class/Section</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="input-base"
                  >
                    <option value="10-A">10 - A</option>
                    <option value="10-B">10 - B</option>
                    <option value="9-A">9 - A</option>
                    <option value="9-B">9 - B</option>
                  </select>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="bg-gray-100 p-2 rounded text-center">
                  <p className="text-gray-600">Total</p>
                  <p className="font-bold text-gray-900">{mockStudents.length}</p>
                </div>
                <div className="bg-green-100 p-2 rounded text-center">
                  <p className="text-success">Present</p>
                  <p className="font-bold text-success">{presentCount}</p>
                </div>
                <div className="bg-red-100 p-2 rounded text-center">
                  <p className="text-danger">Absent</p>
                  <p className="font-bold text-danger">{absentCount}</p>
                </div>
                <div className="bg-amber-100 p-2 rounded text-center">
                  <p className="text-amber-600">Late</p>
                  <p className="font-bold text-amber-600">{lateCount}</p>
                </div>
              </div>
            </Card>

            {/* Offline Alert */}
            {isOffline && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">You are offline</p>
                  <p className="text-sm text-amber-700">Attendance will be saved locally and synced when you're back online</p>
                </div>
              </div>
            )}

            {/* Attendance Marking Grid */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mark Attendance</h2>
              <div className="space-y-2 mb-6">
                {mockStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                          attendance[student.id] === 'present'
                            ? 'bg-success text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                          attendance[student.id] === 'absent'
                            ? 'bg-danger text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                        className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                          attendance[student.id] === 'late'
                            ? 'bg-accent-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Late
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                className="btn-primary py-3 px-6 flex items-center gap-2 w-full sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {isOffline ? 'Save Offline' : 'Mark Attendance'}
              </button>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
