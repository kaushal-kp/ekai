import React from 'react'
import { Header } from '../../components/shared/Header'
import { BottomNav } from '../../components/shared/BottomNav'
import { Card } from '../../components/shared/Card'
import { OfflineBanner } from '../../components/shared/OfflineBanner'
import { useAuth } from '../../hooks/useAuth'
import { BarChart3, FileText, Clock, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

/**
 * Student dashboard with overview stats and quick links
 */
export default function StudentDashboard() {
  const { user } = useAuth()

  // Fetch dashboard data
  const { data: dashboard = {} } = useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: async () => {
      const response = await api.get('/students/dashboard')
      return response.data
    }
  })

  const stats = [
    {
      icon: Clock,
      label: 'Attendance',
      value: `${dashboard.attendancePercentage || 92}%`,
      color: 'text-primary-700',
      bgColor: 'bg-primary-100'
    },
    {
      icon: TrendingUp,
      label: 'Current GPA',
      value: dashboard.currentGPA || '3.8',
      color: 'text-secondary-700',
      bgColor: 'bg-secondary-100'
    },
    {
      icon: FileText,
      label: 'Active Consents',
      value: dashboard.activeConsents || '4',
      color: 'text-accent-600',
      bgColor: 'bg-accent-100'
    },
    {
      icon: BarChart3,
      label: 'Documents',
      value: dashboard.documents || '12',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <OfflineBanner pendingCount={0} />
      <Header title={`Welcome, ${user?.name?.split(' ')[0]}`} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} variant="stat">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Recent Grades */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Grades</h2>
              <div className="space-y-3">
                {[
                  { subject: 'Mathematics', assessment: 'Unit Test 1', marks: '42/50', grade: 'A' },
                  { subject: 'English', assessment: 'Composition', marks: '38/50', grade: 'B+' },
                  { subject: 'Science', assessment: 'Practical Exam', marks: '45/50', grade: 'A' }
                ].map((grade, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{grade.subject}</p>
                      <p className="text-sm text-gray-600">{grade.assessment}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-700">{grade.marks}</p>
                      <p className="text-xs text-gray-600">{grade.grade}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 btn-outline py-2">View All Grades</button>
            </Card>
          </div>

          {/* Quick Links */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium">
                View Attendance
              </button>
              <button className="w-full text-left px-4 py-3 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 font-medium">
                My Documents
              </button>
              <button className="w-full text-left px-4 py-3 bg-accent-50 text-accent-600 rounded-lg hover:bg-accent-100 font-medium">
                Manage Consents
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                Profile
              </button>
            </div>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {[
              { date: 'Mar 25, 2024', event: 'Mathematics Mid-Term Exam', type: 'exam' },
              { date: 'Mar 28, 2024', event: 'Science Project Submission', type: 'assignment' },
              { date: 'Apr 2, 2024', event: 'Parent-Teacher Meeting', type: 'meeting' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 border-l-4 border-primary-300">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.event}</p>
                  <p className="text-sm text-gray-600">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
