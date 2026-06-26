// app/dashboard/reports/strategic-alignment/page.jsx
'use client'

import { useState, Fragment } from 'react'
import { Grid3X3, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useEnterpriseDashboardSource } from '@/hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/components/dashboard/EnterprisePageStates'

/**
 * Enterprise Strategic Alignment Heatmap
 *
 * Matrix view of portfolio investment alignment:
 *   Rows: Investment Objectives (Run / Grow / Transform the Business)
 *   Columns: Investment Categories (e.g., Digital Transformation, Core Products)
 *
 * Each cell shows:
 *   - Number of projects
 *   - Total cost invested
 *   - Color intensity by total investment
 *
 * Additional views:
 *   - Investment Strategy distribution
 *   - Investment Initiative distribution
 *   - Cost allocation by objective and category
 *
 * Uses fields: tbMDInvestmentCategory, tbMDInvestmentObjective,
 * tbMDInvestmentStrategy, tbMDInvestmentInitiative, tbCost,
 * tbMDDecisionStrategic, tbMDPriorityStrategic, tbMDCostbarsScore
 */

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b', '#f97316', '#06b6d4']

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '$0'
  if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`
  if (Math.abs(val) >= 1e3) return `$${(val / 1e3).toFixed(0)}K`
  return `$${val.toLocaleString()}`
}

const getDecisionDot = (decision) => {
  if (!decision) return 'bg-gray-300'
  const d = decision.toLowerCase()
  if (d.includes('continue') || d.includes('proceed')) return 'bg-green-500'
  if (d.includes('review')) return 'bg-amber-500'
  if (d.includes('terminat') || d.includes('reject')) return 'bg-red-500'
  return 'bg-gray-300'
}

const getHeatColor = (value, max) => {
  if (value === 0) return 'bg-gray-50 text-gray-400'
  const intensity = Math.min(value / Math.max(max, 1), 1)
  if (intensity > 0.75) return 'bg-blue-600 text-white'
  if (intensity > 0.5) return 'bg-blue-400 text-white'
  if (intensity > 0.25) return 'bg-blue-200 text-blue-900'
  return 'bg-blue-100 text-blue-800'
}

const StrategicAlignmentPage = () => {
  const { dashboardSource, session, status, isLoading, error } =
    useEnterpriseDashboardSource()
  const [expandedCell, setExpandedCell] = useState(null)
  const [viewMode, setViewMode] = useState('cost') // 'cost' or 'count'

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Strategic Alignment Heatmap"
        icon={Grid3X3}
        message="Loading strategic alignment data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the strategic alignment heatmap" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Strategic Alignment Heatmap" icon={Grid3X3} />
  }

  if (error) {
    return <EnterpriseError title="Strategic Alignment Heatmap" icon={Grid3X3} error={error} />
  }

  const allRows = dashboardSource.tbmdjoined || []

  // Filter for Project-level rows
  const projectRows = allRows.filter(row =>
    row.tbType === 'Project' || row.tbType === 'Portfolio'
  )

  // Build project data
  const projects = projectRows.map(row => ({
    tbName: row.tbName || 'Unnamed',
    tbID: row.tbID || '',
    cost: parseFloat(row.tbCost) || 0,
    objective: row.tbMDInvestmentObjective || 'Not Set',
    category: row.tbMDInvestmentCategory || 'Not Set',
    strategy: row.tbMDInvestmentStrategy || 'Not Set',
    initiative: row.tbMDInvestmentInitiative || 'Not Set',
    decision: row.tbMDDecisionStrategic || null,
    svScore: row.tbMDPriorityStrategic ? parseFloat(row.tbMDPriorityStrategic) : null,
    aeScore: row.tbMDCostbarsScore ? parseFloat(row.tbMDCostbarsScore) : null,
    pm: row.tbMDPM || null,
  }))

  // Extract unique objectives and categories
  const objectives = [...new Set(projects.map(p => p.objective))].sort()
  const categories = [...new Set(projects.map(p => p.category))].sort()

  // Build matrix data
  const matrix = {}
  let maxCost = 0
  let maxCount = 0

  objectives.forEach(obj => {
    matrix[obj] = {}
    categories.forEach(cat => {
      const matching = projects.filter(p => p.objective === obj && p.category === cat)
      const totalCost = matching.reduce((s, p) => s + p.cost, 0)
      matrix[obj][cat] = { projects: matching, count: matching.length, cost: totalCost }
      if (totalCost > maxCost) maxCost = totalCost
      if (matching.length > maxCount) maxCount = matching.length
    })
  })

  // Row totals (by objective)
  const objectiveTotals = objectives.map(obj => ({
    name: obj,
    count: projects.filter(p => p.objective === obj).length,
    cost: projects.filter(p => p.objective === obj).reduce((s, p) => s + p.cost, 0),
  }))

  // Column totals (by category)
  const categoryTotals = categories.map(cat => ({
    name: cat,
    count: projects.filter(p => p.category === cat).length,
    cost: projects.filter(p => p.category === cat).reduce((s, p) => s + p.cost, 0),
  }))

  // Strategy distribution
  const strategyCounts = {}
  projects.forEach(p => {
    strategyCounts[p.strategy] = (strategyCounts[p.strategy] || 0) + 1
  })
  const strategyData = Object.entries(strategyCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Initiative distribution
  const initiativeCounts = {}
  projects.forEach(p => {
    initiativeCounts[p.initiative] = (initiativeCounts[p.initiative] || 0) + 1
  })
  const initiativeData = Object.entries(initiativeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const totalCost = projects.reduce((s, p) => s + p.cost, 0)

  const maxVal = viewMode === 'cost' ? maxCost : maxCount

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Grid3X3 className="w-8 h-8 text-blue-600" />
          Strategic Alignment Heatmap
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Cross-reference of Investment Objectives vs Categories showing where portfolio spend is concentrated
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-blue-800">{projects.length}</p>
            <p className="text-xs text-blue-600">Total Projects</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-green-800">{formatCurrency(totalCost)}</p>
            <p className="text-xs text-green-600">Total Investment</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-purple-800">{objectives.length}</p>
            <p className="text-xs text-purple-600">Objectives</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-amber-800">{categories.length}</p>
            <p className="text-xs text-amber-600">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">View by:</span>
        <button
          onClick={() => setViewMode('cost')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            viewMode === 'cost' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Investment ($)
        </button>
        <button
          onClick={() => setViewMode('count')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            viewMode === 'count' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Project Count
        </button>
      </div>

      {/* Heatmap Matrix */}
      <Card className="border-gray-200 mb-6">
        <CardContent className="pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Objective vs Category Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 bg-gray-50 min-w-[140px]">
                    Objective &darr; / Category &rarr;
                  </th>
                  {categories.map(cat => (
                    <th key={cat} className="px-3 py-2 text-center text-xs font-semibold text-gray-600 bg-gray-50 min-w-[120px]">
                      {cat}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-800 bg-gray-100 min-w-[100px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {objectives.map(obj => {
                  const objTotal = objectiveTotals.find(t => t.name === obj)
                  return (
                    <Fragment key={obj}>
                      <tr>
                        <td className="px-3 py-2 font-medium text-gray-800 bg-gray-50 border-r border-gray-200">
                          {obj}
                        </td>
                        {categories.map(cat => {
                          const cell = matrix[obj][cat]
                          const cellKey = `${obj}::${cat}`
                          const value = viewMode === 'cost' ? cell.cost : cell.count
                          const heatClass = getHeatColor(value, maxVal)
                          const isExpanded = expandedCell === cellKey

                          return (
                            <td
                              key={cat}
                              className={`px-3 py-2 text-center border border-gray-100 cursor-pointer transition-all hover:ring-2 hover:ring-blue-300 ${heatClass}`}
                              onClick={() => setExpandedCell(isExpanded ? null : cellKey)}
                            >
                              {cell.count > 0 ? (
                                <div>
                                  <p className="font-bold text-sm">
                                    {viewMode === 'cost' ? formatCurrency(cell.cost) : cell.count}
                                  </p>
                                  <p className="text-xs opacity-75">
                                    {viewMode === 'cost' ? `${cell.count} proj` : formatCurrency(cell.cost)}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs">--</span>
                              )}
                            </td>
                          )
                        })}
                        <td className="px-3 py-2 text-center bg-gray-100 border-l border-gray-200 font-bold">
                          <p className="text-sm">{viewMode === 'cost' ? formatCurrency(objTotal.cost) : objTotal.count}</p>
                          <p className="text-xs text-gray-500">
                            {viewMode === 'cost' ? `${objTotal.count} proj` : formatCurrency(objTotal.cost)}
                          </p>
                        </td>
                      </tr>
                      {/* Expanded cell row */}
                      {categories.map(cat => {
                        const cellKey = `${obj}::${cat}`
                        const cell = matrix[obj][cat]
                        if (expandedCell !== cellKey || cell.count === 0) return null
                        return (
                          <tr key={`${cellKey}-detail`} className="bg-blue-50">
                            <td colSpan={categories.length + 2} className="px-4 py-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-blue-800">
                                  {obj} / {cat} - {cell.count} project{cell.count !== 1 ? 's' : ''} ({formatCurrency(cell.cost)})
                                </span>
                                <button onClick={() => setExpandedCell(null)} className="ml-auto text-gray-500 hover:text-gray-700">
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="space-y-1">
                                {cell.projects.map(p => (
                                  <div key={p.tbID} className="flex items-center gap-3 text-xs bg-white rounded px-3 py-1.5">
                                    <div className={`w-2 h-2 rounded-full ${getDecisionDot(p.decision)}`} />
                                    <span className="font-medium text-gray-900 flex-1">{p.tbName}</span>
                                    <span className="text-gray-500">{formatCurrency(p.cost)}</span>
                                    {p.svScore !== null && <span className="text-blue-600">SV:{p.svScore}</span>}
                                    {p.aeScore !== null && <span className="text-purple-600">AE:{p.aeScore}</span>}
                                    {p.pm && <span className="text-gray-400">{p.pm}</span>}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </Fragment>
                  )
                })}
                {/* Column totals */}
                <tr className="bg-gray-100 border-t-2 border-gray-300">
                  <td className="px-3 py-2 font-bold text-gray-800 border-r border-gray-200">Total</td>
                  {categories.map(cat => {
                    const catTotal = categoryTotals.find(t => t.name === cat)
                    return (
                      <td key={cat} className="px-3 py-2 text-center font-bold">
                        <p className="text-sm">{viewMode === 'cost' ? formatCurrency(catTotal.cost) : catTotal.count}</p>
                        <p className="text-xs text-gray-500">
                          {viewMode === 'cost' ? `${catTotal.count} proj` : formatCurrency(catTotal.cost)}
                        </p>
                      </td>
                    )
                  })}
                  <td className="px-3 py-2 text-center font-bold text-blue-800 bg-blue-100">
                    <p className="text-sm">{viewMode === 'cost' ? formatCurrency(totalCost) : projects.length}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click any cell to see the projects in that intersection</p>
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Investment by Objective */}
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Investment by Objective</h3>
            {objectiveTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={objectiveTotals} margin={{ left: 10, right: 20, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Investment" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No objective data</p>
            )}
          </CardContent>
        </Card>

        {/* Investment by Category */}
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Investment by Category</h3>
            {categoryTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryTotals} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="cost">
                    {categoryTotals.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No category data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategy & Initiative Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strategy Distribution */}
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Investment Strategy Distribution</h3>
            <div className="space-y-2">
              {strategyData.map((s, i) => {
                const pct = ((s.value / projects.length) * 100).toFixed(0)
                return (
                  <div key={s.name} className="flex items-center gap-2">
                    <div
                      className="h-6 rounded flex items-center px-2 text-xs font-medium text-white"
                      style={{
                        width: `${Math.max(pct, 8)}%`,
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    >
                      {pct}%
                    </div>
                    <span className="text-xs text-gray-700 flex-1 truncate">{s.name}</span>
                    <span className="text-xs text-gray-500">{s.value}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Initiative Distribution */}
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Investment Initiative Distribution</h3>
            <div className="space-y-2">
              {initiativeData.map((s, i) => {
                const pct = ((s.value / projects.length) * 100).toFixed(0)
                return (
                  <div key={s.name} className="flex items-center gap-2">
                    <div
                      className="h-6 rounded flex items-center px-2 text-xs font-medium text-white"
                      style={{
                        width: `${Math.max(pct, 8)}%`,
                        backgroundColor: PIE_COLORS[(i + 4) % PIE_COLORS.length],
                      }}
                    >
                      {pct}%
                    </div>
                    <span className="text-xs text-gray-700 flex-1 truncate">{s.name}</span>
                    <span className="text-xs text-gray-500">{s.value}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alignment Insights */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="mb-1">
                <span className="font-medium">Strategic Alignment</span> is configured in Costbars under PPM &gt; Prioritize.
                Each project is assigned an Investment Objective (Run/Grow/Transform), Category, Strategy, and Initiative.
              </p>
              <p>
                The heatmap reveals where investment is concentrated vs strategic intent. Empty or sparse cells
                indicate under-investment in specific strategic areas. Over-concentration in one cell
                may indicate portfolio imbalance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StrategicAlignmentPage
