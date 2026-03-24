import React, { useState } from 'react'
import { Header } from '../../components/shared/Header'
import { Sidebar } from '../../components/shared/Sidebar'
import { Card } from '../../components/shared/Card'
import { Modal } from '../../components/shared/Modal'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { EVENT_TYPES, EVENT_COLORS } from '../../utils/constants'

/**
 * School calendar with event management
 */
export default function SchoolCalendar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  const { data: events = [] } = useQuery({
    queryKey: ['school', 'calendar', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const response = await api.get('/school/calendar', {
        params: { month: format(currentMonth, 'yyyy-MM') }
      })
      return response.data
    }
  })

  const mockEvents = [
    { id: 1, date: '2024-03-20', title: 'Mathematics Exam', type: 'exam' },
    { id: 2, date: '2024-03-21', title: 'Annual Sports Day', type: 'meeting' },
    { id: 3, date: '2024-03-22', title: 'Holiday', type: 'holiday' },
    { id: 4, date: '2024-03-25', title: 'Project Submission', type: 'assignment' }
  ]

  const onSubmit = async (data) => {
    try {
      await api.post('/school/calendar/events', {
        ...data,
        date: selectedDate
      })
      reset()
      setShowEventModal(false)
      alert('Event created successfully')
    } catch (err) {
      console.error('Failed to create event:', err)
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfWeek = getDay(monthStart)

  const weeks = []
  let currentWeek = new Array(firstDayOfWeek).fill(null)

  daysInMonth.forEach(day => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(day)
  })

  while (currentWeek.length < 7) {
    currentWeek.push(null)
  }
  weeks.push(currentWeek)

  const getDateEvents = (date) => {
    if (!date) return []
    const dateStr = format(date, 'yyyy-MM-dd')
    return mockEvents.filter(e => e.date === dateStr)
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex h-screen bg-gray-50 lg:ml-64">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Calendar" onMenuToggle={() => setSidebarOpen(!sidebarOpen)} showMenu={true} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="btn-primary py-2 px-4 flex items-center gap-2 ml-4"
                >
                  <Plus className="h-4 w-4" />
                  Add Event
                </button>
              </div>
            </div>

            {/* Calendar */}
            <Card>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {weeks.map((week, weekIdx) =>
                  week.map((day, dayIdx) => {
                    const dateEvents = day ? getDateEvents(day) : []
                    const isCurrentMonth = day && day.getMonth() === currentMonth.getMonth()
                    const isToday = day && new Date().toDateString() === day.toDateString()

                    return (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        className={`min-h-24 p-2 border rounded-lg ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${isToday ? 'border-2 border-primary-500' : 'border-gray-200'}`}
                      >
                        {day && (
                          <>
                            <p className={`text-sm font-semibold mb-2 ${
                              isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {format(day, 'd')}
                            </p>
                            <div className="space-y-1">
                              {dateEvents.map(event => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded truncate cursor-pointer ${EVENT_COLORS[event.type]}`}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                            </div>
                            {isCurrentMonth && (
                              <button
                                onClick={() => {
                                  setSelectedDate(day)
                                  setShowEventModal(true)
                                }}
                                className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                + Add
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </Card>

            {/* Event Legend */}
            <Card className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(EVENT_TYPES).map(([key, type]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${EVENT_COLORS[type]?.split(' ')[0]}`}></div>
                    <span className="text-sm text-gray-600 capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Add Event Modal */}
            <Modal
              isOpen={showEventModal}
              onClose={() => {
                setShowEventModal(false)
                setSelectedDate(null)
                reset()
              }}
              title="Add Event"
              size="md"
              footer={
                <>
                  <button
                    onClick={() => {
                      setShowEventModal(false)
                      setSelectedDate(null)
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
                    Add Event
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
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    {...register('date', { required: true })}
                    defaultValue={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select {...register('type', { required: true })} className="input-base">
                    {Object.values(EVENT_TYPES).map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    rows="3"
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
