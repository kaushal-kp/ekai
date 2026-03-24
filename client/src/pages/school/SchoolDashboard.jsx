import React from 'react'
import { Header } from '../../components/shared/Header'
import { Sidebar } from '../../components/shared/Sidebar'
import { Card } from '../../components/shared/Card'
import { useState } from 'react'
import { Users, BarChart3, TrendingUp, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

/**
 * School dashboard with overview and analytics
 */
export default function SchoolDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: dashboard = {} } = useQuery({
    queryKey: ['school', 'dashboard'],
    queryFn: async () => {
      const response = await api.get('/school/dashboard')
      return response.data
    }
  })

  const stats = [
    { icon: Users, label: 'Total Students', value: '1,234', color: 'text-primary-700', bg: 'bg-primary-100' },
    { icon: Users, label: 'Total Teachers', value: '87', color: 'text-secondary-700', bg: 'bg-secondary-100' },
    { icon: TrendingUp, label: "Today's Attendance", value: '92%', color: 'text-success', bg: 'bg-green-50' },
    { icon: BarChart3, label: 'Active Assessments', value: '12', color: 'text-accent-600', bg: 'bg-accent-100' }
  ]

  const recentActivity = [
    { action: 'Attendance marked', details: 'Class 10-A, 10-B', time: '09:30 AM' },
    { action: 'Assessment created', details: 'Mathematics - Unit Test', time: '08:15 AM' },
    { action: 'Student enrolled', details: 'Class 9-C', time: 'Yesterday' },
    { action: 'Grade published', details: 'English - Formative 1', time: '2 days ago' }
  ]

  return (
    <div className="flex h-screen bg-gray-50 lg:ml-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showMenu={true} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <Card key={idx} variant="stat">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      </div>
                      <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Attendance Trend */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <Card>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend (Last 7 Days)</h2>
                  <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {[85, 88, 90, 87, 92, 89, 92].map((value, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-primary-700 rounded-t" style={{ height: `${value}%` }}></div>
                        <span className="text-xs text-gray-600 font-semibold">{value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                    School average attendance: 89.4%
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium">
                    Mark Attendance
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 font-medium">
                    Create Assessment
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-accent-50 text-accent-600 rounded-lg hover:bg-accent-100 font-medium">
                    Enroll Student
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium">
                    Generate Report
                  </button>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border-l-4 border-primary-300">
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
