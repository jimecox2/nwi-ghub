// app/dashboard/visualizations/burndown/page.jsx
'use client'

import { useState } from 'react'
import { Activity, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar,
} from 'recharts'
import moment from 'moment'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'
import BurndownChart from '@/components/Dashboard/Graphs/BurndownChart'

/**
 * Enterprise Burndown Charts Page
 *
 * Two data sources:
 *   1. Sprint Charts (Agilebars) — pre-computed tbcharts from pubsets
 *   2. Project Burndown (Computed) — rolled up from tbmdjoined task rows
 *
 * The computed burndown uses tbWork, tbAWork, tbWorkRemaining, tbPercentComplete,
 * tbStart, tbFinish fields from tasks to build planned vs actual burndown curves.
 */

const parseNum = (v) => {
  if (v === null || v === undefined || v === '') return 0
  const n = parseFloat(v)
  return isNaN(n) ? 0 : n
}

const parseDate = (d) => {
  if (!d) return null
  // Handle "DD-MMM-YYYY" format (e.g. "28-Jul-2025") and ISO dates
  const m = moment(d, ['DD-MMM-YYYY', 'YYYY-MM-DD', moment.ISO_8601], true)
  return m.isValid() ? m : null
}

const formatHours = (h) => {
  if (h >= 1000) return `${(h / 1000).toFixed(1)}K`
  return h.toFixed(0)
}

/**
 * Compute burndown data for a project from its task rows.
 *
 * Planned line: At each week, remaining = totalWork - sum(work of tasks finishing by that week)
 * Actual line: Shows current state based on actual work completed (tbAWork / tbPercentComplete)
 *   - From project start to report date: linear interpolation from totalWork to currentRemaining
 *   - From report date forward: project at current burn rate to projected completion
 */
const computeProjectBurndown = (projectName, tasks, reportDate) => {
  if (!tasks || tasks.length === 0) return null

  // Filter tasks with valid work and dates
  const validTasks = tasks.filter(t => {
    const work = parseNum(t.tbWork)
    const start = parseDate(t.tbStart)
    const finish = parseDate(t.tbFinish)
    return work > 0 && start && finish
  })

  if (validTasks.length === 0) return null

  const totalWork = validTasks.reduce((s, t) => s + parseNum(t.tbWork), 0)
  const totalActualWork = validTasks.reduce((s, t) => s + parseNum(t.tbAWork), 0)
  const totalRemaining = validTasks.reduce((s, t) => {
    const wr = parseNum(t.tbWorkRemaining)
    if (wr > 0) return s + wr
    // Fall back to computing from percent complete
    const work = parseNum(t.tbWork)
    const pct = parseNum(t.tbPercentComplete)
    return s + work * (1 - pct / 100)
  }, 0)

  // Find date boundaries
  const starts = validTasks.map(t => parseDate(t.tbStart)).filter(Boolean)
  const finishes = validTasks.map(t => parseDate(t.tbFinish)).filter(Boolean)
  const projectStart = moment.min(starts)
  const projectFinish = moment.max(finishes)

  if (!projectStart || !projectFinish || projectStart.isSameOrAfter(projectFinish)) return null

  // Build weekly time buckets from project start to finish
  const weeks = []
  let current = projectStart.clone().startOf('isoWeek')
  const end = projectFinish.clone().endOf('isoWeek')

  while (current.isSameOrBefore(end)) {
    weeks.push(current.clone())
    current.add(1, 'week')
  }

  if (weeks.length < 2) return null
  // Cap at 104 weeks (2 years) to avoid excessive rendering
  if (weeks.length > 104) {
    return null
  }

  // Compute planned burndown: at each week, subtract work of tasks finishing by that week
  const plannedData = weeks.map(week => {
    const completedWork = validTasks.reduce((s, t) => {
      const finish = parseDate(t.tbFinish)
      if (finish && finish.isSameOrBefore(week, 'week')) {
        return s + parseNum(t.tbWork)
      }
      return s
    }, 0)
    return Math.max(totalWork - completedWork, 0)
  })

  // Compute actual/forecast burndown
  const reportMoment = reportDate ? parseDate(reportDate) : moment()
  const reportWeekIdx = weeks.findIndex(w => w.isSameOrAfter(reportMoment, 'week'))
  const actualReportIdx = reportWeekIdx >= 0 ? reportWeekIdx : weeks.length - 1

  // Current remaining work
  const currentRemaining = Math.max(totalRemaining, 0)

  // Weeks elapsed from start to report date
  const elapsedWeeks = Math.max(actualReportIdx, 1)

  // Actual burn rate per week
  const burnedSoFar = totalWork - currentRemaining
  const burnRate = elapsedWeeks > 0 ? burnedSoFar / elapsedWeeks : 0

  // Projected weeks to complete from report date
  const weeksToComplete = burnRate > 0 ? currentRemaining / burnRate : 0

  const actualData = weeks.map((week, idx) => {
    if (idx <= actualReportIdx) {
      // Before or at report date: linear interpolation from totalWork to currentRemaining
      const progress = actualReportIdx > 0 ? idx / actualReportIdx : 1
      return Math.max(totalWork - (burnedSoFar * progress), 0)
    } else {
      // After report date: project forward at current burn rate
      const weeksAfterReport = idx - actualReportIdx
      const projected = currentRemaining - (burnRate * weeksAfterReport)
      return Math.max(projected, 0)
    }
  })

  // Build chart data points
  const chartPoints = weeks.map((week, idx) => ({
    date: week.format('DDMMMYY'),
    fullDate: week.toISOString(),
    planned: Math.round(plannedData[idx]),
    actual: Math.round(actualData[idx]),
  }))

  return {
    projectName,
    totalWork: Math.round(totalWork),
    totalActualWork: Math.round(totalActualWork),
    totalRemaining: Math.round(currentRemaining),
    percentComplete: totalWork > 0 ? Math.round((burnedSoFar / totalWork) * 100) : 0,
    taskCount: validTasks.length,
    startDate: projectStart.format('DD-MMM-YYYY'),
    finishDate: projectFinish.format('DD-MMM-YYYY'),
    reportDate: reportMoment ? reportMoment.format('DDMMMYY') : null,
    chartPoints,
    burnRate: Math.round(burnRate),
    weeksToComplete: Math.round(weeksToComplete),
  }
}

/**
 * Single computed burndown chart card
 */
const ComputedBurndownCard = ({ burndown }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{burndown.projectName}</h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-3 mb-3 text-xs">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
            {burndown.taskCount} tasks
          </span>
          <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded">
            {formatHours(burndown.totalWork)} hrs planned
          </span>
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
            {burndown.percentComplete}% complete
          </span>
          <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded">
            {formatHours(burndown.totalRemaining)} hrs remaining
          </span>
          {burndown.burnRate > 0 && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
              ~{formatHours(burndown.burnRate)} hrs/wk burn rate
            </span>
          )}
          <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded">
            {burndown.startDate} &rarr; {burndown.finishDate}
          </span>
        </div>

        {/* Chart */}
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={burndown.chartPoints}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                padding={{ left: 10, right: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                domain={[0, 'auto']}
                tickFormatter={(v) => formatHours(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value, name) => [
                  `${formatHours(value)} hours`,
                  name === 'planned' ? 'Planned Remaining' : 'Actual / Forecast',
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === 'planned' ? 'Planned Remaining' : 'Actual / Forecast'
                }
              />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="#ff0080"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="planned"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0099ff"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="actual"
              />
              {burndown.reportDate && (
                <ReferenceLine
                  x={burndown.reportDate}
                  stroke="#333"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: `Report: ${burndown.reportDate}`,
                    position: 'insideTopRight',
                    fill: '#333',
                    fontSize: 11,
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Planned Work</p>
                <p className="font-semibold">{formatHours(burndown.totalWork)} hrs</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Actual Work Done</p>
                <p className="font-semibold">{formatHours(burndown.totalActualWork)} hrs</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Remaining Work</p>
                <p className="font-semibold">{formatHours(burndown.totalRemaining)} hrs</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Completion</p>
                <p className="font-semibold">{burndown.percentComplete}%</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Burn Rate</p>
                <p className="font-semibold">{burndown.burnRate > 0 ? `${formatHours(burndown.burnRate)} hrs/wk` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Est. Weeks to Complete</p>
                <p className="font-semibold">{burndown.weeksToComplete > 0 ? `${burndown.weeksToComplete} wks` : 'Done'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Start Date</p>
                <p className="font-semibold">{burndown.startDate}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Finish Date</p>
                <p className="font-semibold">{burndown.finishDate}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Portfolio burndown summary bar chart — shows remaining vs completed per project
 */
const PortfolioSummaryChart = ({ burndowns }) => {
  const data = burndowns.map(b => ({
    name: b.projectName.length > 20 ? b.projectName.substring(0, 18) + '...' : b.projectName,
    completed: b.totalActualWork,
    remaining: b.totalRemaining,
  }))

  return (
    <Card className="border-gray-200 mb-6">
      <CardContent className="pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Portfolio Work Status</h3>
        <ResponsiveContainer width="100%" height={Math.max(200, burndowns.length * 40)}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tickFormatter={(v) => formatHours(v)} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
            <Tooltip formatter={(v) => `${formatHours(v)} hrs`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
            <Bar dataKey="remaining" stackId="a" fill="#f59e0b" name="Remaining" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const BurndownPage = () => {
  const { dashboardSource, adaptedData, session, status, isLoading, error } =
    useEnterpriseDashboardSource()
  const [activeTab, setActiveTab] = useState('computed') // 'computed' or 'sprint'

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Burndown Charts"
        icon={Activity}
        message="Loading chart data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="burndown charts" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Burndown Charts" icon={Activity} />
  }

  if (error) {
    return <EnterpriseError title="Burndown Charts" icon={Activity} error={error} />
  }

  const { bdCharts } = adaptedData
  const allRows = dashboardSource.tbmdjoined || []

  // Compute burndowns from tbmdjoined tasks
  const taskRows = allRows.filter(row =>
    row.tbType === 'Task' || row.tbType === 'Milestone'
  )

  const projectGroups = {}
  taskRows.forEach(task => {
    const projectName = task.tbL2 || task.tbL1 || 'Unknown Project'
    if (!projectGroups[projectName]) projectGroups[projectName] = []
    projectGroups[projectName].push(task)
  })

  const reportDateRow = allRows.find(r => r.apStatusDate)
  const reportDate = reportDateRow ? reportDateRow.apStatusDate : null

  const computedBurndowns = Object.entries(projectGroups)
    .map(([name, tasks]) => computeProjectBurndown(name, tasks, reportDate))
    .filter(Boolean)
    .sort((a, b) => b.totalWork - a.totalWork)

  const hasSprintCharts = bdCharts && bdCharts.length > 0
  const hasComputedCharts = computedBurndowns.length > 0

  // Portfolio summary stats
  const totalPlanned = computedBurndowns.reduce((s, b) => s + b.totalWork, 0)
  const totalCompleted = computedBurndowns.reduce((s, b) => s + b.totalActualWork, 0)
  const totalRemaining = computedBurndowns.reduce((s, b) => s + b.totalRemaining, 0)
  const overallPercent = totalPlanned > 0 ? Math.round(((totalPlanned - totalRemaining) / totalPlanned) * 100) : 0

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          Burndown Charts
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Work remaining over time — planned schedule vs actual progress
        </p>
      </div>

      {/* Tab Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('computed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'computed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Project Burndown ({computedBurndowns.length})
        </button>
        <button
          onClick={() => setActiveTab('sprint')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'sprint'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Sprint Charts {hasSprintCharts ? `(${bdCharts.length})` : '(0)'}
        </button>
      </div>

      {/* Computed Project Burndowns */}
      {activeTab === 'computed' && (
        <>
          {hasComputedCharts ? (
            <>
              {/* Portfolio summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-3 pb-3 text-center">
                    <p className="text-xl font-bold text-blue-800">{computedBurndowns.length}</p>
                    <p className="text-xs text-blue-600">Projects</p>
                  </CardContent>
                </Card>
                <Card className="border-gray-200">
                  <CardContent className="pt-3 pb-3 text-center">
                    <p className="text-xl font-bold text-gray-800">{formatHours(totalPlanned)}</p>
                    <p className="text-xs text-gray-500">Planned (hrs)</p>
                  </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-3 pb-3 text-center">
                    <p className="text-xl font-bold text-green-700">{formatHours(totalCompleted)}</p>
                    <p className="text-xs text-green-600">Completed (hrs)</p>
                  </CardContent>
                </Card>
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="pt-3 pb-3 text-center">
                    <p className="text-xl font-bold text-amber-700">{formatHours(totalRemaining)}</p>
                    <p className="text-xs text-amber-600">Remaining (hrs)</p>
                  </CardContent>
                </Card>
                <Card className="border-indigo-200 bg-indigo-50">
                  <CardContent className="pt-3 pb-3 text-center">
                    <p className="text-xl font-bold text-indigo-700">{overallPercent}%</p>
                    <p className="text-xs text-indigo-600">Overall Complete</p>
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio summary bar chart */}
              {computedBurndowns.length > 1 && (
                <PortfolioSummaryChart burndowns={computedBurndowns} />
              )}

              {/* Individual project burndowns */}
              <div className="space-y-6">
                {computedBurndowns.map((burndown, idx) => (
                  <ComputedBurndownCard key={idx} burndown={burndown} />
                ))}
              </div>
            </>
          ) : (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-amber-900 font-semibold mb-2">
                    No Task Data for Burndown Computation
                  </p>
                  <p className="text-amber-800 text-sm">
                    No tasks with valid work hours and date ranges were found in the dashboard source.
                    Project burndowns are computed from Task-level rows in tbmdjoined that have
                    tbWork, tbStart, and tbFinish values.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sprint Charts (Agilebars) */}
      {activeTab === 'sprint' && (
        <>
          {hasSprintCharts ? (
            <div className="space-y-8">
              {bdCharts.map((chartData, index) => (
                <BurndownChart key={index} chartData={chartData} />
              ))}
            </div>
          ) : (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-amber-900 font-semibold mb-2">
                    Sprint Chart Data Not Available
                  </p>
                  <p className="text-amber-800 text-sm">
                    This dashboard source does not contain Agilebars sprint chart data (tbcharts).
                    To include sprint charts, ensure at least one Agilebars pubset with published
                    sprint data is selected when creating the dashboard source via{' '}
                    <a href="/dashboard/pubsets" className="underline font-medium hover:text-amber-900">
                      Consolidated Pubsets
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <Card className="mt-8 border-gray-200 bg-gray-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="mb-1">
                <span className="font-medium">Project Burndown</span> charts are computed from
                task-level data in tbmdjoined. The planned line shows work remaining as tasks reach
                their scheduled finish dates. The actual/forecast line shows progress based on
                reported actual work and projects forward at the current burn rate.
              </p>
              <p>
                <span className="font-medium">Sprint Charts</span> are pre-computed by the Agilebars
                Sprint Scheduler and provided via published tbcharts data. These show story-point
                burndown for agile sprints.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BurndownPage
