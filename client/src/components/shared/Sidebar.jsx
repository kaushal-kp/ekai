import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  BarChart3,
  Settings,
  ChevronDown,
  X
} from 'lucide-react'

/**
 * School hub sidebar navigation
 */
export const Sidebar = ({ isOpen = true, onClose = null }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedMenu, setExpandedMenu] = useState(null)

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/school'
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      path: '/school/students'
    },
    {
      id: 'teachers',
      label: 'Teachers',
      icon: BookOpen,
      path: '/school/teachers'
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: ClipboardList,
      path: '/school/attendance'
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: BarChart3,
      path: '/school/assessments'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      path: '/school/calendar'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      path: '/school/reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/school/settings'
    }
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  const handleNavigate = (path) => {
    navigate(path)
    onClose && onClose()
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary-700">EKAI</h1>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-600">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">EKAI School Management v1.0</p>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 lg:hidden z-30" onClick={onClose}></div>
          <aside className="fixed left-0 top-0 h-screen w-64 bg-white z-40 flex flex-col lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
