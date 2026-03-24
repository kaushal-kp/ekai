import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { Sidebar } from '../../components/shared/Sidebar'
import { Card } from '../../components/shared/Card'
import { useParams, useNavigate } from 'react-router-dom'
import { getGradeLetter } from '../../utils/helpers'
import { ArrowLeft, Send } from 'lucide-react'
import api from '../../services/api'

/**
 * Grade entry page for assessments with auto-calculation
 */
export default function GradeEntry() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [grades, setGrades] = useState({})
  const [saving, setSaving] = useState(false)

  const assessment = {
    id,
    title: 'Mid-Term Exam',
    subject: 'Mathematics',
    class: '10-A',
    maxMarks: 100,
    publishedAt: null
  }

  const mockStudents = [
    { id: 1, name: 'Aarav Sharma', rollNo: 1 },
    { id: 2, name: 'Priya Patel', rollNo: 2 },
    { id: 3, name: 'Rajesh Kumar', rollNo: 3 },
    { id: 4, name: 'Sneha Singh', rollNo: 4 },
    { id: 5, name: 'Vikram Nair', rollNo: 5 }
  ]

  const handleMarksChange = (studentId, marks) => {
    const numMarks = parseInt(marks) || 0
    setGrades(prev => ({
      ...prev,
      [studentId]: numMarks
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post(`/school/assessments/${id}/grades`, {
        grades: Object.entries(grades).map(([studentId, marks]) => ({
          studentId: parseInt(studentId),
          marks
        }))
      })
      alert('Grades saved successfully')
    } catch (err) {
      console.error('Failed to save grades:', err)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    try {
      await api.post(`/school/assessments/${id}/publish`)
      alert('Grades published successfully')
    } catch (err) {
      console.error('Failed to publish grades:', err)
    }
  }

  const stats = mockStudents.reduce((acc, student) => {
    const marks = grades[student.id] || 0
    if (marks > 0) {
      acc.evaluated++
      acc.sum += marks
      acc.highest = Math.max(acc.highest, marks)
      acc.lowest = acc.lowest === 0 ? marks : Math.min(acc.lowest, marks)
    }
    return acc
  }, { evaluated: 0, sum: 0, highest: 0, lowest: 0 })

  const average = stats.evaluated > 0 ? (stats.sum / stats.evaluated).toFixed(2) : 0
  const passPercentage = stats.evaluated > 0
    ? Math.round((mockStudents.filter(s => (grades[s.id] || 0) >= 40).length / stats.evaluated) * 100)
    : 0

  return (
    <div className="flex h-screen bg-gray-50 lg:ml-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Grade Entry" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showMenu={true} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/school/assessments')}
              className="flex items-center gap-2 text-primary-700 hover:text-primary-800 font-semibold mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Assessments
            </button>

            {/* Assessment Header */}
            <Card className="mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{assessment.title}</h1>
                  <p className="text-gray-600 mb-4">{assessment.subject} • Class {assessment.class}</p>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-gray-600">Max Marks</p>
                      <p className="font-bold text-gray-900">{assessment.maxMarks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Students</p>
                      <p className="font-bold text-gray-900">{mockStudents.length}</p>
                    </div>
                  </div>
                </div>
                {assessment.publishedAt && (
                  <div className="px-3 py-1 bg-green-100 text-success rounded-full text-sm font-semibold">
                    Published
                  </div>
                )}
              </div>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Card variant="stat">
                <p className="text-xs text-gray-600">Evaluated</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.evaluated}/{mockStudents.length}</p>
              </Card>
              <Card variant="stat">
                <p className="text-xs text-gray-600">Average</p>
                <p className="text-2xl font-bold text-primary-700 mt-1">{average}</p>
              </Card>
              <Card variant="stat">
                <p className="text-xs text-gray-600">Highest</p>
                <p className="text-2xl font-bold text-success mt-1">{stats.highest}</p>
              </Card>
              <Card variant="stat">
                <p className="text-xs text-gray-600">Pass %</p>
                <p className="text-2xl font-bold text-accent-600 mt-1">{passPercentage}%</p>
              </Card>
            </div>

            {/* Grade Entry Table */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Marks</h2>
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="table-header">Roll No.</th>
                      <th className="table-header">Student Name</th>
                      <th className="table-header">Marks ({assessment.maxMarks})</th>
                      <th className="table-header">%</th>
                      <th className="table-header">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStudents.map(student => {
                      const marks = grades[student.id] || 0
                      const percentage = marks > 0 ? Math.round((marks / assessment.maxMarks) * 100) : 0
                      const grade = marks > 0 ? getGradeLetter(marks, assessment.maxMarks) : '-'

                      return (
                        <tr key={student.id} className="table-row-hover">
                          <td className="table-cell">{student.rollNo}</td>
                          <td className="table-cell">{student.name}</td>
                          <td className="table-cell">
                            <input
                              type="number"
                              min="0"
                              max={assessment.maxMarks}
                              value={marks}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="table-cell">{percentage}%</td>
                          <td className="table-cell font-bold text-primary-700">{grade}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary py-2 px-4"
                >
                  {saving ? 'Saving...' : 'Save Grades'}
                </button>
                {!assessment.publishedAt && (
                  <button
                    onClick={handlePublish}
                    className="btn-secondary py-2 px-4 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Publish Grades
                  </button>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
