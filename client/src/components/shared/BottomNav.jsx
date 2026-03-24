import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BookOpen, ClipboardList, FileText, User } from 'lucide-react'

/**
 * Student hub mobile bottom navigation
 */
export const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/student'
    },
    {
      id: 'academics',
      label: 'Academics',
      icon: BookOpen,
      path: '/student/academics'
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: ClipboardList,
      path: '/student/attendance'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FileText,
      path: '/student/documents'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/student/profile'
    }
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
      <div className="flex items-center justify-around">
        {menuItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-3 px-4 flex-1 text-xs font-medium transition-colors ${
                active
                  ? 'text-primary-700 border-t-2 border-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
