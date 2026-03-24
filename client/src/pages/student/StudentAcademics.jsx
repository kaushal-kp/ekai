import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { BottomNav } from '../../components/shared/BottomNav'
import { Card } from '../../components/shared/Card'
import { DataTable } from '../../components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

/**
 * Student academics page with grades and assessments
 */
export default function StudentAcademics() {
  const [selectedSemester, setSelectedSemester] = useState('2024-1')
  const [selectedSubject, setSelectedSubject] = useState('all')

  const { data: grades = [] } = useQuery({
    queryKey: ['student', 'grades', selectedSemester, selectedSubject],
    queryFn: async () => {
      const response = await api.get('/students/grades', {
        params: { semester: selectedSemester, subject: selectedSubject }
      })
      return response.data
    }
  })

  const columns = [
    { key: 'subject', label: 'Subject' },
    { key: 'assessment', label: 'Assessment' },
    { key: 'marks', label: 'Marks', render: (value, row) => `${value}/${row.maxMarks}` },
    { key: 'percentage', label: '%', render: (value) => `${value}%` },
    { key: 'grade', label: 'Grade' },
    { key: 'date', label: 'Date' }
  ]

  const subjectSummary = [
    { subject: 'Mathematics', average: '88', credits: '4' },
    { subject: 'English', average: '85', credits: '3' },
    { subject: 'Science', average: '91', credits: '4' },
    { subject: 'Social Studies', average: '87', credits: '3' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <Header title="Academics" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="input-base"
            >
              <option value="2024-1">2024 - Semester 1</option>
              <option value="2023-2">2023 - Semester 2</option>
              <option value="2023-1">2023 - Semester 1</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-base"
            >
              <option value="all">All Subjects</option>
              <option value="mathematics">Mathematics</option>
              <option value="english">English</option>
              <option value="science">Science</option>
              <option value="social">Social Studies</option>
            </select>
          </div>
        </div>

        {/* GPA Overview */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card variant="stat">
            <p className="text-sm text-gray-600">Current GPA</p>
            <p className="text-3xl font-bold text-primary-700 mt-1">3.8/4.0</p>
            <p className="text-xs text-gray-600 mt-2">Based on current semester</p>
          </Card>
          <Card variant="stat">
            <p className="text-sm text-gray-600">Cumulative GPA</p>
            <p className="text-3xl font-bold text-secondary-700 mt-1">3.7/4.0</p>
            <p className="text-xs text-gray-600 mt-2">All semesters</p>
          </Card>
          <Card variant="stat">
            <p className="text-sm text-gray-600">Credits Earned</p>
            <p className="text-3xl font-bold text-accent-600 mt-1">48/120</p>
            <p className="text-xs text-gray-600 mt-2">40% complete</p>
          </Card>
        </div>

        {/* Subject Summary */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Average %</th>
                  <th className="table-header">Credits</th>
                </tr>
              </thead>
              <tbody>
                {subjectSummary.map((item, idx) => (
                  <tr key={idx} className="table-row-hover">
                    <td className="table-cell">{item.subject}</td>
                    <td className="table-cell font-semibold text-primary-700">{item.average}%</td>
                    <td className="table-cell">{item.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Assessments Table */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessments</h2>
          <DataTable
            columns={columns}
            data={grades}
            searchable={true}
            paginate={true}
            pageSize={10}
          />
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
