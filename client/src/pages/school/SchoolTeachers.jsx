import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { Sidebar } from '../../components/shared/Sidebar'
import { Card } from '../../components/shared/Card'
import { DataTable } from '../../components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Plus, Edit, Trash2 } from 'lucide-react'

/**
 * School teachers management page
 */
export default function SchoolTeachers() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: teachers = [] } = useQuery({
    queryKey: ['school', 'teachers'],
    queryFn: async () => {
      const response = await api.get('/school/teachers')
      return response.data
    }
  })

  const mockTeachers = [
    { id: 1, name: 'Mrs. Priya Gupta', email: 'priya@school.com', subject: 'Mathematics', classes: '10-A, 10-B' },
    { id: 2, name: 'Mr. Rajesh Kumar', email: 'rajesh@school.com', subject: 'Science', classes: '9-A, 9-B, 10-A' },
    { id: 3, name: 'Ms. Sneha Singh', email: 'sneha@school.com', subject: 'English', classes: '10-A, 10-B, 10-C' },
    { id: 4, name: 'Mr. Vikram Nair', email: 'vikram@school.com', subject: 'Social Studies', classes: '9-A, 9-B' }
  ]

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'subject', label: 'Subject' },
    { key: 'classes', label: 'Classes' },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex gap-2">
          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
            <Edit className="h-4 w-4" />
          </button>
          <button className="p-1 text-danger hover:bg-red-50 rounded">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50 lg:ml-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Teachers" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showMenu={true} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Actions */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
              <button className="btn-primary py-2 px-4 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Teacher
              </button>
            </div>

            {/* Teachers Table */}
            <Card>
              <DataTable
                columns={columns}
                data={mockTeachers}
                searchable={true}
                paginate={true}
                pageSize={10}
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
