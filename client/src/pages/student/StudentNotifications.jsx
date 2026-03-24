import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { BottomNav } from '../../components/shared/BottomNav'
import { Card } from '../../components/shared/Card'
import { EmptyState } from '../../components/shared/EmptyState'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { formatDate, getRelativeTime } from '../../utils/helpers'
import { Bell, CheckCircle, AlertCircle, FileText, Book, Trash2 } from 'lucide-react'

/**
 * Student notifications page
 */
export default function StudentNotifications() {
  const [selectedType, setSelectedType] = useState('all')

  const { data: notifications = [] } = useQuery({
    queryKey: ['student', 'notifications', selectedType],
    queryFn: async () => {
      const response = await api.get('/students/notifications', {
        params: { type: selectedType }
      })
      return response.data
    }
  })

  const mockNotifications = [
    {
      id: 1,
      type: 'grade',
      title: 'New Grade Posted',
      message: 'Your Mathematics formative assessment has been graded',
      icon: Book,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 2,
      type: 'attendance',
      title: 'Attendance Alert',
      message: 'Your attendance has dropped below 75%. Please attend classes regularly.',
      icon: AlertCircle,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 3,
      type: 'document',
      title: 'Document Generated',
      message: 'Your Grade Card for Semester 1 is ready for download',
      icon: FileText,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: 4,
      type: 'announcement',
      title: 'School Announcement',
      message: 'Annual sports day will be held on April 15, 2024',
      icon: Bell,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      read: true
    }
  ]

  const filteredNotifications = selectedType === 'all'
    ? mockNotifications
    : mockNotifications.filter(n => n.type === selectedType)

  const unreadCount = mockNotifications.filter(n => !n.read).length

  const getTypeLabel = (type) => {
    const labels = {
      grade: 'Grades',
      attendance: 'Attendance',
      document: 'Documents',
      announcement: 'Announcements'
    }
    return labels[type] || type
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <Header title="Notifications" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Unread Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button className="btn-outline py-2 px-4 text-sm">
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedType === 'all'
                ? 'bg-primary-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {['grade', 'attendance', 'document', 'announcement'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => {
              const Icon = notification.icon
              return (
                <Card
                  key={notification.id}
                  className={`p-4 ${!notification.read ? 'border-l-4 border-primary-500 bg-primary-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      notification.type === 'grade' ? 'bg-blue-100' :
                      notification.type === 'attendance' ? 'bg-amber-100' :
                      notification.type === 'document' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        notification.type === 'grade' ? 'text-blue-600' :
                        notification.type === 'attendance' ? 'text-amber-600' :
                        notification.type === 'document' ? 'text-green-600' :
                        'text-purple-600'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`font-semibold ${notification.read ? 'text-gray-900' : 'text-gray-900 font-bold'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {getRelativeTime(notification.date)}
                          </p>
                        </div>
                        {!notification.read && (
                          <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>

                    <button className="p-2 text-gray-400 hover:text-danger rounded-lg">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card>
              <EmptyState
                icon={Bell}
                title="No Notifications"
                description="You're all caught up! No new notifications at this time."
              />
            </Card>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
