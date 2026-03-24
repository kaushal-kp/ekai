import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { BottomNav } from '../../components/shared/BottomNav'
import { Card } from '../../components/shared/Card'
import { useAuth } from '../../hooks/useAuth'
import { Edit2, Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'

/**
 * Student profile page with personal and school info
 */
export default function StudentProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      email: user?.email || '',
      phone: user?.phone || '',
      address: 'School address here'
    }
  })

  const onSubmit = async (data) => {
    console.log('Profile update:', data)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <Header title="Profile" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-700">
                  {user?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">Student ID: {user?.studentId || 'STU000123'}</p>
                <p className="text-gray-600">APAAR ID: {user?.apaarId || 'APAAR123456'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsEditing(!isEditing)
                reset()
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isEditing ? <X className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
            </button>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  {...register('address')}
                  className="input-base"
                  rows="3"
                />
              </div>
              <button type="submit" className="btn-primary py-2 px-4">
                <Save className="h-4 w-4 inline mr-2" />
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-900">{user?.email || 'Not provided'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium text-gray-900">{user?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address</span>
                <span className="font-medium text-gray-900">School address here</span>
              </div>
            </div>
          )}
        </Card>

        {/* School Information */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">School Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">School</span>
              <span className="font-medium text-gray-900">Central High School</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Class</span>
              <span className="font-medium text-gray-900">10 - A</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Section</span>
              <span className="font-medium text-gray-900">Science</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Enrollment Date</span>
              <span className="font-medium text-gray-900">June 15, 2023</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Board</span>
              <span className="font-medium text-gray-900">Central Board of Education</span>
            </div>
          </div>
        </Card>

        {/* Guardian Information */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Guardian Information</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Primary Guardian</h3>
              <div className="space-y-2 ml-4 border-l-2 border-primary-200 pl-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium text-gray-900">Mr. John Doe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium text-gray-900">9876543210</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">john.doe@email.com</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Secondary Guardian</h3>
              <div className="space-y-2 ml-4 border-l-2 border-secondary-200 pl-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium text-gray-900">Mrs. Jane Doe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium text-gray-900">9876543211</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-900">jane.doe@email.com</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* APAAR Status */}
        <Card className="bg-secondary-50 border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-secondary-900 mb-1">APAAR Status</h3>
              <p className="text-sm text-secondary-700">Your profile is successfully linked with APAAR</p>
            </div>
            <div className="px-3 py-1 bg-success bg-opacity-10 text-success rounded-full text-sm font-semibold">
              Linked
            </div>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}
