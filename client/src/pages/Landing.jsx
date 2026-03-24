import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, BarChart3 } from 'lucide-react'

/**
 * Landing page with login options
 */
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-primary-700">EKAI</h1>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Education Management Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect students, schools, and data through APAAR
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-16">
          {/* Student Login */}
          <button
            onClick={() => navigate('/login?role=student')}
            className="group p-8 bg-white rounded-xl border-2 border-primary-200 hover:border-primary-500 hover:shadow-xl transition-all"
          >
            <div className="h-16 w-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
              <BookOpen className="h-8 w-8 text-primary-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Student Hub</h3>
            <p className="text-gray-600 mb-6">
              View your grades, attendance, documents, and manage your academic profile
            </p>
            <div className="text-primary-700 font-semibold">Login as Student →</div>
          </button>

          {/* School Admin Login */}
          <button
            onClick={() => navigate('/login?role=school_admin')}
            className="group p-8 bg-white rounded-xl border-2 border-secondary-200 hover:border-secondary-500 hover:shadow-xl transition-all"
          >
            <div className="h-16 w-16 bg-secondary-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-secondary-200 transition-colors">
              <Users className="h-8 w-8 text-secondary-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">School Hub</h3>
            <p className="text-gray-600 mb-6">
              Manage students, teachers, attendance, and generate comprehensive reports
            </p>
            <div className="text-secondary-700 font-semibold">Login as Admin →</div>
          </button>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Key Features</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-primary-700 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Academic Records</h4>
              <p className="text-sm text-gray-600">View grades, assessments, and academic progress</p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-secondary-700 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Attendance Tracking</h4>
              <p className="text-sm text-gray-600">Monitor daily attendance with visual reports</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-accent-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Data Privacy</h4>
              <p className="text-sm text-gray-600">APAAR-compliant with consent management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>&copy; 2024 EKAI - Education Management Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
