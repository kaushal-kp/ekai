import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { Sidebar } from '../../components/shared/Sidebar'
import { Card } from '../../components/shared/Card'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { Download, BarChart3 } from 'lucide-react'
import { REPORT_TYPES } from '../../utils/constants'
import { format, subDays } from 'date-fns'

/**
 * School reports generation and viewing
 */
export default function SchoolReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [reportType, setReportType] = useState('attendance')
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [generating, setGenerating] = useState(false)

  const mockReports = {
    attendance: {
      title: 'Attendance Report',
      data: [
        { class: '10-A', total: 35, present: 32, absent: 2, percentage: 91 },
        { class: '10-B', total: 34, present: 31, absent: 3, percentage: 91 },
        { class: '9-A', total: 36, present: 34, absent: 2, percentage: 94 },
        { class: '9-B', total: 33, present: 30, absent: 3, percentage: 91 }
      ]
    },
    academic: {
      title: 'Academic Performance Report',
      data: [
        { subject: 'Mathematics', avgPercentage: 78, students: 138, pass: 130 },
        { subject: 'Science', avgPercentage: 82, students: 138, pass: 135 },
        { subject: 'English', avgPercentage: 75, students: 138, pass: 128 },
        { subject: 'Social Studies', avgPercentage: 80, students: 138, pass: 133 }
      ]
    }
  }

  const handleGenerateReport = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      alert('Report generated successfully')
    }, 1500)
  }

  const currentReport = mockReports[reportType]

  return (
    <div className="flex h-screen bg-gray-50 lg:ml-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Reports" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showMenu={true} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filters */}
            <Card className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="input-base"
                  >
                    <option value="attendance">Attendance Report</option>
                    <option value="academic">Academic Performance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateReport}
                    disabled={generating}
                    className="btn-primary py-2 px-4 w-full"
                  >
                    {generating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>
            </Card>

            {/* Report */}
            {currentReport && (
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{currentReport.title}</h2>
                    <p className="text-gray-600 text-sm">
                      {format(new Date(startDate), 'MMM dd, yyyy')} to {format(new Date(endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <button className="btn-outline py-2 px-4 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>

                {/* Report Data */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {reportType === 'attendance' ? (
                          <>
                            <th className="table-header">Class</th>
                            <th className="table-header">Total Days</th>
                            <th className="table-header">Present</th>
                            <th className="table-header">Absent</th>
                            <th className="table-header">Attendance %</th>
                          </>
                        ) : (
                          <>
                            <th className="table-header">Subject</th>
                            <th className="table-header">Avg %</th>
                            <th className="table-header">Total Students</th>
                            <th className="table-header">Passed</th>
                            <th className="table-header">Pass %</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {currentReport.data.map((row, idx) => (
                        <tr key={idx} className="table-row-hover">
                          {reportType === 'attendance' ? (
                            <>
                              <td className="table-cell font-semibold">{row.class}</td>
                              <td className="table-cell">{row.total}</td>
                              <td className="table-cell text-success font-semibold">{row.present}</td>
                              <td className="table-cell text-danger font-semibold">{row.absent}</td>
                              <td className="table-cell">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-success"
                                      style={{ width: `${row.percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-bold text-gray-900 min-w-12">
                                    {row.percentage}%
                                  </span>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="table-cell font-semibold">{row.subject}</td>
                              <td className="table-cell">
                                <span className="text-lg font-bold text-primary-700">{row.avgPercentage}%</span>
                              </td>
                              <td className="table-cell">{row.students}</td>
                              <td className="table-cell text-success font-semibold">{row.pass}</td>
                              <td className="table-cell">
                                {Math.round((row.pass / row.students) * 100)}%
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Stats */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {reportType === 'attendance' ? (
                      <>
                        <div className="p-4 bg-primary-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Overall Attendance</p>
                          <p className="text-2xl font-bold text-primary-700">91.75%</p>
                        </div>
                        <div className="p-4 bg-success text-white rounded-lg">
                          <p className="text-sm opacity-90 mb-1">Total Present Days</p>
                          <p className="text-2xl font-bold">127</p>
                        </div>
                        <div className="p-4 bg-danger text-white rounded-lg">
                          <p className="text-sm opacity-90 mb-1">Total Absent Days</p>
                          <p className="text-2xl font-bold">10</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-primary-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Average Performance</p>
                          <p className="text-2xl font-bold text-primary-700">78.75%</p>
                        </div>
                        <div className="p-4 bg-success text-white rounded-lg">
                          <p className="text-sm opacity-90 mb-1">Total Students</p>
                          <p className="text-2xl font-bold">138</p>
                        </div>
                        <div className="p-4 bg-accent-500 text-white rounded-lg">
                          <p className="text-sm opacity-90 mb-1">Pass Rate</p>
                          <p className="text-2xl font-bold">94%</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
