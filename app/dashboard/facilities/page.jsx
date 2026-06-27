// app/dashboard/facilities/page.jsx
'use client'

import { useState } from 'react'
import { CalendarRange, Loader2, AlertCircle } from 'lucide-react'
import { useEnterpriseDashboardSource } from '@/hooks/useEnterpriseDashboardSource'
import GanttChart from './_components/GanttChart'

const FacilitiesPage = () => {
  const { dashboardSource, status, isLoading, error } = useEnterpriseDashboardSource({ autoPreprocess: false })

  const [showInFilter, setShowInFilter] = useState('Facility Schedule')
  const [statusFilter, setStatusFilter] = useState('all')

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <CalendarRange className="w-8 h-8 text-blue-600" />
          Facility Schedule
        </h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading schedule data...</span>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Please sign in to view the shop schedule.</p>
        </div>
      </div>
    )
  }

  if (!dashboardSource) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <CalendarRange className="w-8 h-8 text-blue-600" />
          Facility Schedule
        </h1>
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-yellow-900 font-semibold mb-2">No Dashboard Source Available</p>
              <p className="text-yellow-800 mb-3">
                You need to create a dashboard source before you can view the shop schedule.
              </p>
              <a
                href="/dashboard/pubsets"
                className="inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Dashboard Source
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <CalendarRange className="w-8 h-8 text-blue-600" />
          Facility Schedule
        </h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">
            <strong>Error loading dashboard source:</strong> {error}
          </p>
        </div>
      </div>
    )
  }

  // ── All early returns done — safe to derive data ──────────────────────────

  // tbMDShowIn can be an array ['Facility Schedule'] or a comma-separated string
  const getShowInValues = (val) => {
    if (!val) return []
    if (Array.isArray(val)) return val.map(v => v.trim()).filter(Boolean)
    return val.split(',').map(v => v.trim()).filter(Boolean)
  }

  const allRows = dashboardSource.tbmdjoined || []
  const rawTasks = allRows.filter(
    row => row.tbType === 'Task' || row.tbType === 'Milestone'
  )

  // Collect distinct ShowIn values
  const showInSet = new Set()
  rawTasks.forEach(t => {
    getShowInValues(t.tbMDShowIn).forEach(v => showInSet.add(v))
  })
  const allShowInValues = Array.from(showInSet).sort()

  // Collect distinct status values
  const statusSet = new Set()
  rawTasks.forEach(t => { if (t.tbMDStatus) statusSet.add(t.tbMDStatus) })
  const allStatusValues = Array.from(statusSet).sort()

  // Apply filters
  const filteredTasks = rawTasks.filter(t => {
    if (showInFilter !== 'all') {
      if (!t.tbMDShowIn) return false
      if (!getShowInValues(t.tbMDShowIn).includes(showInFilter)) return false
    }
    if (statusFilter !== 'all') {
      if (t.tbMDStatus !== statusFilter) return false
    }
    return true
  })

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
          <CalendarRange className="w-8 h-8 text-blue-600" />
          Facility Schedule
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {allShowInValues.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Show In:
            </label>
            <select
              value={showInFilter}
              onChange={e => setShowInFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tasks</option>
              {allShowInValues.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        )}

        {allStatusValues.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Status:
            </label>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {allStatusValues.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s === statusFilter ? 'all' : s)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <span className="text-xs text-gray-400 ml-auto">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="p-8 rounded-lg border border-gray-200 bg-gray-50 text-center">
          <CalendarRange className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tasks match the current filters.</p>
        </div>
      ) : (
        <GanttChart tasks={filteredTasks} />
      )}
    </div>
  )
}

export default FacilitiesPage
