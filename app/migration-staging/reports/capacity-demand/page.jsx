// app/dashboard/reports/capacity-demand/page.jsx
'use client'

import { useState } from 'react'
import { Users2, Info, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Cell,
} from 'recharts'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'

/**
 * Enterprise Capacity vs Demand Dashboard
 *
 * Shows resource supply (available capacity) vs demand (project requirements)
 * computed from tbrescalcs2 (resource calculations) and tbresources (resource pool).
 *
 * Data sources:
 *   tbrescalcs2: Weekly resource demand rows with tbResCalcResID, tbResCalcWeek,
 *                tbResCalcHours, tbResCalcCost, tbResCalcMonday, tbResCalcFriday
 *   tbresources: Resource pool with resource IDs, roles, skills, availability
 *
 * Views:
 *   1. Weekly demand timeline (stacked bar chart by resource)
 *   2. Per-resource demand summary
 *   3. By-role demand aggregation
 *   4. Supply vs demand variance
 *
 * This addresses the customer need: "Calculate realistic availability,
 * forecast demand, identify gaps where demand exceeds supply"
 */

const HOURS_PER_WEEK = 40 // Standard working week
const MAX_UTILIZATION = 0.8 // 80% max utilization (buffer for meetings, etc.)
const SUPPLY_HOURS = HOURS_PER_WEEK * MAX_UTILIZATION // 32 hours effective capacity

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <p className="font-bold text-gray-900 text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex justify-between gap-4 text-xs">
          <span style={{ color: entry.color }}>{entry.name}:</span>
          <span className="font-medium">{parseFloat(entry.value).toFixed(1)}h</span>
        </div>
      ))}
    </div>
  )
}

const CapacityDemandPage = () => {
  const { dashboardSource, adaptedData, session, status, isLoading, error } =
    useEnterpriseDashboardSource()
  const [viewMode, setViewMode] = useState('weekly') // weekly, resource, role
  const [supplyHours, setSupplyHours] = useState(SUPPLY_HOURS)

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Capacity vs Demand"
        icon={Users2}
        message="Loading resource data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the capacity demand dashboard" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Capacity vs Demand" icon={Users2} />
  }

  if (error) {
    return <EnterpriseError title="Capacity vs Demand" icon={Users2} error={error} />
  }

  // Detect Agilebars pubsets — resource reports don't work with Agilebars data
  const agilebarsPubsets = dashboardSource?.tbdocuments?.filter(p => p.source_product === 'Agilebars') || []
  if (agilebarsPubsets.length > 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users2 className="w-8 h-8 text-teal-600" />
            Capacity vs Demand
          </h1>
          <p className="text-gray-600">
            Source: <span className="font-medium">{dashboardSource.name}</span>
          </p>
        </div>
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 font-semibold mb-2">
                Resource Reports Not Available for Agilebars
              </p>
              <p className="text-amber-800 text-sm mb-2">
                This dashboard source includes Agilebars pubset{agilebarsPubsets.length > 1 ? 's' : ''}:{' '}
                <span className="font-medium">{agilebarsPubsets.map(p => p.name).join(', ')}</span>.
              </p>
              <p className="text-amber-800 text-sm mb-2">
                The Agilebars product does not use the resource pool for scheduling &mdash; it uses
                task data directly. Capacity vs demand analysis requires resource-loaded schedules
                from the <span className="font-medium">Timebars</span> or <span className="font-medium">Costbars</span> products.
              </p>
              <p className="text-amber-700 text-sm">
                To use this report, create a dashboard source using Timebars or Costbars pubsets.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quick check: does the source data contain any Allocation rows?
  const allRows = adaptedData?.allRows || []
  const allocationCount = allRows.filter(r => r.tbType === 'Allocation').length

  if (allocationCount === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users2 className="w-8 h-8 text-teal-600" />
            Capacity vs Demand
          </h1>
          <p className="text-gray-600">
            Source: <span className="font-medium">{dashboardSource.name}</span>
          </p>
        </div>
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 font-semibold mb-2">
                No Resource Allocations Found
              </p>
              <p className="text-amber-800 text-sm mb-2">
                This dashboard source does not contain any Allocation rows in the schedule data.
                Capacity vs demand analysis requires tasks with resource allocations assigned in
                your Timebars or Costbars schedules.
              </p>
              <p className="text-amber-700 text-sm">
                Ensure your source pubsets include resource-loaded schedules with allocations.
                Resource data is preprocessed automatically when a dashboard source is created.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const resCalcs = adaptedData?.resCalcs || []
  const resources = dashboardSource.tbresources || []

  // Count unique resources in demand data
  const uniqueResources = new Set(resCalcs.map(r => r.tbResCalcResID)).size
  const uniqueWeeks = new Set(resCalcs.map(r => r.tbResCalcWeek || r.tbResCalcMonday)).size

  // Total supply = unique resources × supply hours per week × unique weeks
  const totalSupplyHours = uniqueResources * supplyHours * uniqueWeeks
  const totalDemandHours = resCalcs.reduce((sum, r) => sum + (parseFloat(r.tbResCalcHours) || 0), 0)
  const totalDemandCost = resCalcs.reduce((sum, r) => sum + (parseFloat(r.tbResCalcCost) || 0), 0)
  const variance = totalSupplyHours - totalDemandHours
  const utilizationPct = totalSupplyHours > 0 ? (totalDemandHours / totalSupplyHours * 100) : 0

  // Weekly timeline data
  const weeklyData = (() => {
    const weekMap = {}
    resCalcs.forEach(r => {
      const week = r.tbResCalcWeek || r.tbResCalcMonday || 'Unknown'
      if (!weekMap[week]) weekMap[week] = { week, demand: 0, resources: new Set() }
      weekMap[week].demand += parseFloat(r.tbResCalcHours) || 0
      weekMap[week].resources.add(r.tbResCalcResID)
    })

    return Object.values(weekMap)
      .map(w => ({
        week: w.week,
        demand: Math.round(w.demand * 10) / 10,
        supply: w.resources.size * supplyHours,
        variance: (w.resources.size * supplyHours) - w.demand,
        resourceCount: w.resources.size,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
  })()

  // Per-resource summary
  const resourceData = (() => {
    const resMap = {}
    resCalcs.forEach(r => {
      const resId = r.tbResCalcResID || 'Unknown'
      if (!resMap[resId]) {
        resMap[resId] = {
          resourceId: resId,
          name: r.tbMDNameShort || r.tbResCalcResID || 'Unknown',
          role: r.tbMDPrimaryRole || 'Unassigned',
          skill: r.tbMDPrimarySkill || 'Unassigned',
          department: r.tbMDDepartment || 'Unassigned',
          totalHours: 0,
          totalCost: 0,
          weekCount: 0,
        }
      }
      resMap[resId].totalHours += parseFloat(r.tbResCalcHours) || 0
      resMap[resId].totalCost += parseFloat(r.tbResCalcCost) || 0
      resMap[resId].weekCount++
    })

    return Object.values(resMap)
      .map(r => ({
        ...r,
        avgHoursPerWeek: r.weekCount > 0 ? r.totalHours / r.weekCount : 0,
        utilization: r.weekCount > 0 ? ((r.totalHours / r.weekCount) / supplyHours * 100) : 0,
      }))
      .sort((a, b) => b.totalHours - a.totalHours)
  })()

  // Per-role summary
  const roleData = (() => {
    const roleMap = {}
    resourceData.forEach(r => {
      const role = r.role
      if (!roleMap[role]) roleMap[role] = { role, totalHours: 0, totalCost: 0, resourceCount: 0 }
      roleMap[role].totalHours += r.totalHours
      roleMap[role].totalCost += r.totalCost
      roleMap[role].resourceCount++
    })

    return Object.values(roleMap).sort((a, b) => b.totalHours - a.totalHours)
  })()

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Users2 className="w-8 h-8 text-teal-600" />
          Capacity vs Demand
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Resource supply and demand analysis — identify where demand exceeds available capacity
        </p>
      </div>

      {resCalcs.length === 0 ? (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <Users2 className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <p className="text-amber-800 font-medium">No resource calculation data available</p>
          <p className="text-amber-600 text-sm mt-1">
            Resource calculations (tbrescalcs2) are generated by preprocessing Allocation rows
            from the dashboard source. Visit{' '}
            <a href="/dashboard/settings/preprocess" className="underline font-medium hover:text-amber-900">
              Preprocess Resource Data
            </a>{' '}
            to generate this data, or ensure your source pubsets include resource-loaded schedules.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="border-gray-200">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{uniqueResources}</p>
                <p className="text-xs text-gray-500">Resources</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{Math.round(totalSupplyHours).toLocaleString()}</p>
                <p className="text-xs text-blue-600">Supply (hrs)</p>
              </CardContent>
            </Card>
            <Card className="border-teal-200 bg-teal-50">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-2xl font-bold text-teal-700">{Math.round(totalDemandHours).toLocaleString()}</p>
                <p className="text-xs text-teal-600">Demand (hrs)</p>
              </CardContent>
            </Card>
            <Card className={`${variance >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="pt-3 pb-3 text-center">
                <p className={`text-2xl font-bold ${variance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {variance >= 0 ? '+' : ''}{Math.round(variance).toLocaleString()}
                </p>
                <p className={`text-xs ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>Variance (hrs)</p>
              </CardContent>
            </Card>
            <Card className={`${utilizationPct <= 80 ? 'border-green-200 bg-green-50' : utilizationPct <= 100 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="pt-3 pb-3 text-center">
                <p className={`text-2xl font-bold ${utilizationPct <= 80 ? 'text-green-700' : utilizationPct <= 100 ? 'text-amber-700' : 'text-red-700'}`}>
                  {utilizationPct.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-600">Utilization</p>
              </CardContent>
            </Card>
          </div>

          {/* Capacity Control */}
          <Card className="mb-6 border-teal-200 bg-teal-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-teal-800">Available hours/week per resource:</label>
                  <input
                    type="range"
                    min="8"
                    max="40"
                    value={supplyHours}
                    onChange={(e) => setSupplyHours(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm font-bold text-teal-900 w-12">{supplyHours}h</span>
                </div>
                <p className="text-xs text-teal-700">
                  Adjust for core operations time. At {supplyHours}h/week, resources have{' '}
                  {Math.round((1 - supplyHours / 40) * 100)}% of time allocated to core duties.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-600 font-medium">View:</span>
            {[
              { value: 'weekly', label: 'Weekly Timeline' },
              { value: 'resource', label: 'By Resource' },
              { value: 'role', label: 'By Role' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setViewMode(opt.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  viewMode === opt.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Weekly Timeline View */}
          {viewMode === 'weekly' && (
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Supply vs Demand</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={weeklyData} margin={{ top: 10, right: 30, bottom: 40, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="supply" name="Supply (Capacity)" fill="#3b82f6" opacity={0.6} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="demand" name="Demand (Required)" radius={[2, 2, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.variance >= 0 ? '#14b8a6' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Resource View */}
          {viewMode === 'resource' && (
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Demand by Resource</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Resource</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Role</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Total Hours</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Avg/Week</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Utilization</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Total Cost</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resourceData.map((r) => (
                        <tr key={r.resourceId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium">{r.name}</td>
                          <td className="py-2 px-3 text-gray-600">{r.role}</td>
                          <td className="py-2 px-3 text-right">{Math.round(r.totalHours).toLocaleString()}</td>
                          <td className="py-2 px-3 text-right">{r.avgHoursPerWeek.toFixed(1)}</td>
                          <td className={`py-2 px-3 text-right font-medium ${
                            r.utilization <= 80 ? 'text-green-600' :
                            r.utilization <= 100 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {r.utilization.toFixed(0)}%
                          </td>
                          <td className="py-2 px-3 text-right">${Math.round(r.totalCost).toLocaleString()}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              r.utilization <= 80 ? 'bg-green-100 text-green-700' :
                              r.utilization <= 100 ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {r.utilization <= 80 ? 'Available' : r.utilization <= 100 ? 'At Capacity' : 'Over-Allocated'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role View */}
          {viewMode === 'role' && (
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Demand by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(200, roleData.length * 40)}>
                  <BarChart data={roleData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} label={{ value: 'Total Hours', position: 'bottom', style: { fontSize: 12 } }} />
                    <YAxis type="category" dataKey="role" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        `${Math.round(value).toLocaleString()} hours`,
                        name === 'totalHours' ? 'Demand' : name
                      ]}
                    />
                    <Bar dataKey="totalHours" name="Demand Hours" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Role</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Resources</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Total Hours</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roleData.map((r) => (
                        <tr key={r.role} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium">{r.role}</td>
                          <td className="py-2 px-3 text-right">{r.resourceCount}</td>
                          <td className="py-2 px-3 text-right">{Math.round(r.totalHours).toLocaleString()}</td>
                          <td className="py-2 px-3 text-right">${Math.round(r.totalCost).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="mt-6 border-gray-200 bg-gray-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">Supply</span> is calculated as available hours per resource per week
                    (adjustable via the slider above). Assumes {Math.round((1 - supplyHours / 40) * 100)}% core duties overhead.
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Demand</span> comes from resource allocations in your project schedules
                    (tbrescalcs2 data from Timebars/Costbars resource-loaded schedules).
                  </p>
                  <p>
                    <span className="text-red-600 font-medium">Red bars</span> indicate weeks where demand exceeds supply —
                    these require action: delay projects, reassign resources, or hire/contract.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default CapacityDemandPage
