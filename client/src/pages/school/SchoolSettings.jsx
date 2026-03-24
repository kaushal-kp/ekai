import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { Sidebar } from '../../components/shared/Sidebar'
import { Card } from '../../components/shared/Card'
import { useForm } from 'react-hook-form'
import { Edit2, Save, X } from 'lucide-react'

/**
 * School settings and configuration
 */
export default function SchoolSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      schoolName: 'Central High School',
      udise: '12345678901',
      affiliation: 'CBSE',
      address: '123 School Lane, City',
      phone: '1234567890',
      email: 'school@email.com',
      principal: 'Dr. A. K. Sharma',
      vice_principal: 'Mr. R. K. Singh'
    }
  })

  const onSubmit = async (data) => {
    console.log('Settings update:', data)
    setEditingProfile(false)
  }

  const admins = [
    { id: 1, name: 'Admin User 1', email: 'admin1@school.com', role: 'super_admin', active: true },
    { id: 2, name: 'Admin User 2', email: 'admin2@school.com', role: 'admin', active: true },
    { id: 3, name: 'Admin User 3', email: 'admin3@school.com', role: 'admin', active: false }
  ]

  const auditLogs = [
    { id: 1, action: 'Grades Published', user: 'Admin User 1', date: '2024-03-20 14:30', details: 'Class 10-A Mathematics' },
    { id: 2, action: 'Student Enrolled', user: 'Admin User 2', date: '2024-03-19 09:15', details: 'Class 9-C' },
    { id: 3, action: 'Attendance Marked', user: 'Teacher 1', date: '2024-03-18 12:00', details: 'Class 10-B' },
    { id: 4, action: 'Assessment Created', user: 'Teacher 2', date: '2024-03-17 10:30', details: 'Science Mid-Term' }
  ]

  return (
    <div className="flex h-screen bg-gray-50 lg:ml-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Settings" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showMenu={true} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* School Profile */}
            <Card className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">School Profile</h2>
                <button
                  onClick={() => {
                    setEditingProfile(!editingProfile)
                    reset()
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  {editingProfile ? <X className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
                </button>
              </div>

              {editingProfile ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                      <input {...register('schoolName')} className="input-base" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">UDISE Code</label>
                      <input {...register('udise')} className="input-base" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Board Affiliation</label>
                      <input {...register('affiliation')} className="input-base" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input {...register('phone')} className="input-base" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea {...register('address')} rows="2" className="input-base" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Principal Name</label>
                      <input {...register('principal')} className="input-base" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vice Principal Name</label>
                      <input {...register('vice_principal')} className="input-base" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary py-2 px-4 flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">School Name</p>
                      <p className="font-medium text-gray-900">Central High School</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">UDISE Code</p>
                      <p className="font-medium text-gray-900">12345678901</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Board Affiliation</p>
                      <p className="font-medium text-gray-900">CBSE</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-medium text-gray-900">1234567890</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="font-medium text-gray-900">123 School Lane, City</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-medium text-gray-900">school@email.com</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* APAAR Integration */}
            <Card className="mb-8 bg-green-50 border-green-200">
              <h2 className="text-lg font-semibold text-green-900 mb-4">APAAR Integration Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-gray-900">APAAR Registration</p>
                    <p className="text-sm text-gray-600">School is registered with APAAR framework</p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-success rounded-full text-sm font-semibold">
                    Active
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-gray-900">Last Sync</p>
                    <p className="text-sm text-gray-600">Data synchronized with APAAR</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">2 hours ago</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-gray-900">Student Records Synced</p>
                    <p className="text-sm text-gray-600">Total student profiles in APAAR</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">1,234/1,234</p>
                </div>
              </div>
            </Card>

            {/* Admin Users */}
            <Card className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Users</h2>
              <div className="space-y-2">
                {admins.map(admin => (
                  <div key={admin.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{admin.name}</p>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 capitalize">{admin.role}</span>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        admin.active
                          ? 'bg-green-100 text-success'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {admin.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Audit Log */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Log</h2>
              <div className="space-y-2">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{log.date} by {log.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
