import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { Sidebar } from '../../components/shared/Sidebar'
import { Card } from '../../components/shared/Card'
import { DataTable } from '../../components/shared/DataTable'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Plus, Download, Mail } from 'lucide-react'

/**
 * School students roster and management
 */
export default function SchoolStudents() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [classFilter, setClassFilter] = useState('all')
  const [sectionFilter, setSectionFilter] = useState('all')

  const { data: students = [] } = useQuery({
    queryKey: ['school', 'students', classFilter, sectionFilter],
    queryFn: async () => {
      const response = await api.get('/school/students', {
        params: { class: classFilter, section: sectionFilter }
      })
      return response.data
    }
  })

  const mockStudents = [
    { id: 1, name: 'Aarav Sharma', class: '10', section: 'A', admissionNo: 'ADM001', attendancePercentage: 92 },
    { id: 2, name: 'Priya Patel', class: '10', section: 'A', admissionNo: 'ADM002', attendancePercentage: 88 },
    { id: 3, name: 'Rajesh Kumar', class: '10', section: 'B', admissionNo: 'ADM003', attendancePercentage: 85 },
    { id: 4, name: 'Sneha Singh', class: '10', section: 'B', admissionNo: 'ADM004', attendancePercentage: 95 },
    { id: 5, name: 'Vikram Nair', class: '9', section: 'A', admissionNo: 'ADM005', attendancePercentage: 78 }
  ]

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'class', label: 'Class' },
    { key: 'section', label: 'Section' },
    { key: 'admissionNo', label: 'Admission No.' },
    { key: 'attendancePercentage', label: 'Attendance %', render: (value) => `${value}%` }
  ]

  return (
    <div className="flex h-screen bg-gray-50 lg:ml-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Students" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showMenu={true} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Student Roster</h1>
              <div className="flex gap-2">
                <button className="btn-outline py-2 px-4 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button className="btn-outline py-2 px-4 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notify
                </button>
                <button
                  onClick={() => navigate('/school/students/new')}
                  className="btn-primary py-2 px-4 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Student
                </button>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-8">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="input-base"
                  >
                    <option value="all">All Classes</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className="input-base"
                  >
                    <option value="all">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Students Table */}
            <Card>
              <DataTable
                columns={columns}
                data={mockStudents}
                searchable={true}
                paginate={true}
                pageSize={20}
                onRowClick={(row) => navigate(`/school/students/${row.id}`)}
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
