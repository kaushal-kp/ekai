import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { Sidebar } from '../../components/shared/Sidebar'
import { Card } from '../../components/shared/Card'
import { DataTable } from '../../components/shared/DataTable'
import { Modal } from '../../components/shared/Modal'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { useForm } from 'react-hook-form'
import { Plus, BookOpen } from 'lucide-react'

/**
 * School assessments management
 */
export default function SchoolAssessments() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      subject: '',
      class: '',
      type: 'formative',
      maxMarks: 50,
      date: new Date().toISOString().split('T')[0]
    }
  })

  const { data: assessments = [] } = useQuery({
    queryKey: ['school', 'assessments'],
    queryFn: async () => {
      const response = await api.get('/school/assessments')
      return response.data
    }
  })

  const mockAssessments = [
    { id: 1, title: 'Unit Test 1', subject: 'Mathematics', class: '10-A', type: 'formative', maxMarks: 50, date: '2024-03-20', studentsEvaluated: 32, totalStudents: 35 },
    { id: 2, title: 'Mid-Term Exam', subject: 'Science', class: '10-B', type: 'summative', maxMarks: 100, date: '2024-03-18', studentsEvaluated: 30, totalStudents: 34 },
    { id: 3, title: 'Class Assignment', subject: 'English', class: '9-A', type: 'formative', maxMarks: 25, date: '2024-03-15', studentsEvaluated: 35, totalStudents: 35 }
  ]

  const onSubmit = async (data) => {
    try {
      await api.post('/school/assessments', data)
      reset()
      setShowCreateModal(false)
      alert('Assessment created successfully')
    } catch (err) {
      console.error('Failed to create assessment:', err)
    }
  }

  const columns = [
    { key: 'title', label: 'Assessment' },
    { key: 'subject', label: 'Subject' },
    { key: 'class', label: 'Class' },
    { key: 'type', label: 'Type', render: (value) => value.charAt(0).toUpperCase() + value.slice(1) },
    { key: 'maxMarks', label: 'Max Marks' },
    {
      key: 'progress',
      label: 'Progress',
      render: (value, row) => `${row.studentsEvaluated}/${row.totalStudents}`
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50 lg:ml-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Assessments" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showMenu={true} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Actions */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary py-2 px-4 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Assessment
              </button>
            </div>

            {/* Assessments Table */}
            <Card>
              <DataTable
                columns={columns}
                data={mockAssessments}
                searchable={true}
                paginate={true}
                pageSize={10}
                onRowClick={(row) => navigate(`/school/assessments/${row.id}/grades`)}
              />
            </Card>

            {/* Create Assessment Modal */}
            <Modal
              isOpen={showCreateModal}
              onClose={() => {
                setShowCreateModal(false)
                reset()
              }}
              title="Create New Assessment"
              size="md"
              footer={
                <>
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      reset()
                    }}
                    className="btn-outline px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    className="btn-primary px-4 py-2"
                  >
                    Create
                  </button>
                </>
              }
            >
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    {...register('title', { required: true })}
                    placeholder="e.g., Unit Test 1"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select {...register('subject', { required: true })} className="input-base">
                    <option value="">Select Subject</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="science">Science</option>
                    <option value="english">English</option>
                    <option value="social">Social Studies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select {...register('class', { required: true })} className="input-base">
                    <option value="">Select Class</option>
                    <option value="9-A">9 - A</option>
                    <option value="9-B">9 - B</option>
                    <option value="10-A">10 - A</option>
                    <option value="10-B">10 - B</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select {...register('type')} className="input-base">
                      <option value="formative">Formative</option>
                      <option value="summative">Summative</option>
                      <option value="periodic">Periodic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                    <input
                      type="number"
                      {...register('maxMarks', { required: true })}
                      className="input-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    {...register('date', { required: true })}
                    className="input-base"
                  />
                </div>
              </form>
            </Modal>
          </div>
        </main>
      </div>
    </div>
  )
}
