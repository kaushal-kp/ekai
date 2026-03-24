import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/shared/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'

// Student Hub
import StudentDashboard from './pages/student/StudentDashboard'
import StudentAcademics from './pages/student/StudentAcademics'
import StudentAttendance from './pages/student/StudentAttendance'
import StudentDocuments from './pages/student/StudentDocuments'
import StudentConsent from './pages/student/StudentConsent'
import StudentProfile from './pages/student/StudentProfile'
import StudentNotifications from './pages/student/StudentNotifications'

// School Hub
import SchoolDashboard from './pages/school/SchoolDashboard'
import SchoolStudents from './pages/school/SchoolStudents'
import StudentDetail from './pages/school/StudentDetail'
import SchoolTeachers from './pages/school/SchoolTeachers'
import SchoolAttendance from './pages/school/SchoolAttendance'
import SchoolAssessments from './pages/school/SchoolAssessments'
import GradeEntry from './pages/school/GradeEntry'
import SchoolCalendar from './pages/school/SchoolCalendar'
import SchoolReports from './pages/school/SchoolReports'
import SchoolSettings from './pages/school/SchoolSettings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10
    }
  }
})

/**
 * Main App component with routing
 */
function App() {
  // Handle 404.html redirect for GitHub Pages
  React.useEffect(() => {
    const redirect = sessionStorage.redirect
    if (redirect) {
      delete sessionStorage.redirect
      window.history.replaceState(null, null, redirect)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/academics" element={
              <ProtectedRoute>
                <StudentAcademics />
              </ProtectedRoute>
            } />
            <Route path="/student/attendance" element={
              <ProtectedRoute>
                <StudentAttendance />
              </ProtectedRoute>
            } />
            <Route path="/student/documents" element={
              <ProtectedRoute>
                <StudentDocuments />
              </ProtectedRoute>
            } />
            <Route path="/student/consents" element={
              <ProtectedRoute>
                <StudentConsent />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            } />
            <Route path="/student/notifications" element={
              <ProtectedRoute>
                <StudentNotifications />
              </ProtectedRoute>
            } />

            {/* School Routes */}
            <Route path="/school" element={
              <ProtectedRoute>
                <SchoolDashboard />
              </ProtectedRoute>
            } />
            <Route path="/school/students" element={
              <ProtectedRoute>
                <SchoolStudents />
              </ProtectedRoute>
            } />
            <Route path="/school/students/:id" element={
              <ProtectedRoute>
                <StudentDetail />
              </ProtectedRoute>
            } />
            <Route path="/school/teachers" element={
              <ProtectedRoute>
                <SchoolTeachers />
              </ProtectedRoute>
            } />
            <Route path="/school/attendance" element={
              <ProtectedRoute>
                <SchoolAttendance />
              </ProtectedRoute>
            } />
            <Route path="/school/assessments" element={
              <ProtectedRoute>
                <SchoolAssessments />
              </ProtectedRoute>
            } />
            <Route path="/school/assessments/:id/grades" element={
              <ProtectedRoute>
                <GradeEntry />
              </ProtectedRoute>
            } />
            <Route path="/school/calendar" element={
              <ProtectedRoute>
                <SchoolCalendar />
              </ProtectedRoute>
            } />
            <Route path="/school/reports" element={
              <ProtectedRoute>
                <SchoolReports />
              </ProtectedRoute>
            } />
            <Route path="/school/settings" element={
              <ProtectedRoute>
                <SchoolSettings />
              </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
