import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { Sidebar } from '../../components/shared/Sidebar'
import { Card } from '../../components/shared/Card'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Detailed student profile view for school admin
 */
export default function StudentDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const mockStudent = {
    id: id,
    name: 'Aarav Sharma',
    admissionNo: 'ADM001',
    class: '10',
    section: 'A',
    email: 'aarav@email.com',
    phone: '9876543210',
    parentName: 'Mr. Sharma',
    parentPhone: '9876543200',
    attendancePercentage: 92,
    gpa: 3.8,
    consentStatus: 'active',
    grades: [
      { subject: 'Mathematics', average: 88 },
      { subject: 'English', average: 85 },
      { subject: 'Science', average: 91 }
    ]
  }

  return (
    <div className="flex h-screen bg-gray-50 lg:ml-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={mockStudent.name} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showMenu={true} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/school/students')}
              className="flex items-center gap-2 text-primary-700 hover:text-primary-800 font-semibold mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Students
            </button>

            {/* Profile Header */}
            <Card className="mb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="h-24 w-24 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary-700">A</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{mockStudent.name}</h1>
                    <p className="text-gray-600 mb-4">Admission No: {mockStudent.admissionNo}</p>
                    <div className="flex gap-4">
                      <button className="btn-outline py-2 px-4 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </button>
                      <button className="btn-outline py-2 px-4 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Overview Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card variant="stat">
                <p className="text-sm text-gray-600">Class</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{mockStudent.class}-{mockStudent.section}</p>
              </Card>
              <Card variant="stat">
                <p className="text-sm text-gray-600">Attendance %</p>
                <p className="text-2xl font-bold text-success mt-2">{mockStudent.attendancePercentage}%</p>
              </Card>
              <Card variant="stat">
                <p className="text-sm text-gray-600">Current GPA</p>
                <p className="text-2xl font-bold text-primary-700 mt-2">{mockStudent.gpa}</p>
              </Card>
              <Card variant="stat">
                <p className="text-sm text-gray-600">APAAR Status</p>
                <div className="mt-2">
                  <StatusBadge status={mockStudent.consentStatus} type="consent" />
                </div>
              </Card>
            </div>

            {/* Academic Summary */}
            <Card className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Summary</h2>
              <div className="space-y-3">
                {mockStudent.grades.map((grade, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-900">{grade.subject}</p>
                    <p className="text-lg font-bold text-primary-700">{grade.average}%</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Contact Information */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-gray-900">{mockStudent.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium text-gray-900">{mockStudent.phone}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian</h2>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium text-gray-900">{mockStudent.parentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium text-gray-900">{mockStudent.parentPhone}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
