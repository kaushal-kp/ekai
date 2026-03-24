import React, { useState } from 'react'
import { Bell, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { getInitials } from '../../utils/helpers'

/**
 * Top header component with notifications and profile
 */
export const Header = ({ title = '', onMenuToggle = null, showMenu = true }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showMenu && onMenuToggle && (
            <button onClick={onMenuToggle} className="lg:hidden text-gray-600">
              <Menu className="h-6 w-6" />
            </button>
          )}
          {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
                <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm font-medium text-gray-900">New grade posted</p>
                    <p className="text-xs text-gray-600 mt-1">Mathematics - Formative 1</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="h-8 w-8 bg-primary-700 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {getInitials(user?.name || 'User')}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user?.name || 'User'}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.email || user?.phone}</p>
                </div>
                <div className="p-2 space-y-2">
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setShowProfileMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowProfileMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-red-50 rounded flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
