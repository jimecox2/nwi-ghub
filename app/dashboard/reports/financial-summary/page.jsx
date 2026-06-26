// app/dashboard/reports/financial-summary/page.jsx
'use client'

import { useState } from 'react'
import { DollarSign, ArrowUpDown, ChevronDown, ChevronUp, Info } from 'lucide-react'
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
 * Enterprise Portfolio Financial Summary
 *
 * Aggregates financial data across the portfolio:
 *   - NPV, IRR, Payback Period, Financial Score
 *   - ROM Estimate, Estimation Class
 *   - Cost breakdown and investment totals
 *   - Benefit-Cost Ratio, EVA, Opportunity Cost
 *
 * Uses fields: tbMDNetPresentValue, tbMDInternalRateOfReturn, tbMDPaybackPeriod,
 * tbMDFinancialScore, tbMDROMEstimate, tbMDEstimationClass, tbMDBenefitCostRatio,
 * tbMDEcnomicValueAdded, tbMDOpportunityCost, tbCost, tbMDDecisionStrategic,
 * tbMDCostbarsScore, tbMDPriorityStrategic
 */

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b']

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 'N/A'
  if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`
  if (Math.abs(val) >= 1e3) return `$${(val / 1e3).toFixed(0)}K`
  return `$${val.toLocaleString()}`
}

const parseNum = (val) => {
  if (val === null || val === undefined || val === '') return null
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

const getDecisionBadge = (decision) => {
  if (!decision) return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">Not Scored</span>
  const d = decision.toLowerCase()
  if (d.includes('continue') || d.includes('proceed'))
    return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">{decision}</span>
  if (d.includes('review'))
    return <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">{decision}</span>
  if (d.includes('terminat') || d.includes('reject'))
    return <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">{decision}</span>
  return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{decision}</span>
}

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null
  const d = payload[0]
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
      <p className="font-medium">{d.name}: {d.value} project{d.value !== 1 ? 's' : ''}</p>
    </div>
  )
}

const FinancialSummaryPage = () => {
  const { dashboardSource, session, status, isLoading, error } =
    useEnterpriseDashboardSource()
  const [sortField, setSortField] = useState('tbCost')
  const [sortDir, setSortDir] = useState('desc')
  const [expandedRow, setExpandedRow] = useState(null)

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Portfolio Financial Summary"
        icon={DollarSign}
        message="Loading financial data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the financial summary" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Portfolio Financial Summary" icon={DollarSign} />
  }

  if (error) {
    return <EnterpriseError title="Portfolio Financial Summary" icon={DollarSign} error={error} />
  }

  const allRows = dashboardSource.tbmdjoined || []

  // Filter for Project-level rows
  const projectRows = allRows.filter(row =>
    row.tbType === 'Project' || row.tbType === 'Portfolio'
  )

  // Build financial dataset
  const projects = projectRows.map(row => ({
    tbName: row.tbName || 'Unnamed',
    tbID: row.tbID || '',
    tbType: row.tbType || '',
    cost: parseNum(row.tbCost) || 0,
    npv: parseNum(row.tbMDNetPresentValue),
    irr: parseNum(row.tbMDInternalRateOfReturn),
    payback: parseNum(row.tbMDPaybackPeriod),
    financialScore: parseNum(row.tbMDFinancialScore),
    romEstimate: row.tbMDROMEstimate || null,
    estimationClass: row.tbMDEstimationClass || null,
    bcr: parseNum(row.tbMDBenefitCostRatio),
    eva: parseNum(row.tbMDEcnomicValueAdded),
    opportunityCost: parseNum(row.tbMDOpportunityCost),
    svScore: parseNum(row.tbMDPriorityStrategic),
    aeScore: parseNum(row.tbMDCostbarsScore),
    decision: row.tbMDDecisionStrategic || null,
    pm: row.tbMDPM || null,
    investmentCategory: row.tbMDInvestmentCategory || null,
    investmentObjective: row.tbMDInvestmentObjective || null,
    budgetCommentary: row.tbMDBudgetCommentary || null,
    financialCommentary: row.tbMDFinancialCommentary || null,
    seniorCommitment: row.tbMDSeniorLevelCommitment || null,
  }))

  // Sort
  const sorted = [...projects].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    if (aVal === null && bVal === null) return 0
    if (aVal === null) return 1
    if (bVal === null) return -1
    if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal
  })

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortHeader = ({ field, label }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-gray-600 cursor-pointer hover:text-blue-600 select-none whitespace-nowrap"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-3 h-3" />
      </span>
    </th>
  )

  // Aggregate stats
  const totalCost = projects.reduce((sum, p) => sum + p.cost, 0)
  const projectsWithNPV = projects.filter(p => p.npv !== null)
  const projectsWithIRR = projects.filter(p => p.irr !== null)
  const projectsWithPayback = projects.filter(p => p.payback !== null)
  const projectsWithFinScore = projects.filter(p => p.financialScore !== null)

  const avgNPV = projectsWithNPV.length > 0
    ? projectsWithNPV.reduce((s, p) => s + p.npv, 0) / projectsWithNPV.length : null
  const totalNPV = projectsWithNPV.length > 0
    ? projectsWithNPV.reduce((s, p) => s + p.npv, 0) : null
  const avgIRR = projectsWithIRR.length > 0
    ? projectsWithIRR.reduce((s, p) => s + p.irr, 0) / projectsWithIRR.length : null
  const avgPayback = projectsWithPayback.length > 0
    ? projectsWithPayback.reduce((s, p) => s + p.payback, 0) / projectsWithPayback.length : null
  const avgFinScore = projectsWithFinScore.length > 0
    ? projectsWithFinScore.reduce((s, p) => s + p.financialScore, 0) / projectsWithFinScore.length : null

  // ROM Estimate distribution
  const romCounts = {}
  projects.forEach(p => {
    const key = p.romEstimate || 'Not Set'
    romCounts[key] = (romCounts[key] || 0) + 1
  })
  const romData = Object.entries(romCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Estimation Class distribution
  const estCounts = {}
  projects.forEach(p => {
    const key = p.estimationClass || 'Not Set'
    estCounts[key] = (estCounts[key] || 0) + 1
  })
  const estData = Object.entries(estCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Financial score distribution (bar chart)
  const scoreRanges = [
    { label: '0-20', min: 0, max: 20 },
    { label: '21-40', min: 21, max: 40 },
    { label: '41-60', min: 41, max: 60 },
    { label: '61-80', min: 61, max: 80 },
    { label: '81-100', min: 81, max: 100 },
  ]
  const scoreDistribution = scoreRanges.map(range => ({
    range: range.label,
    count: projectsWithFinScore.filter(p => p.financialScore >= range.min && p.financialScore <= range.max).length,
  }))

  // Cost by investment category (bar chart)
  const costByCategory = {}
  projects.forEach(p => {
    const cat = p.investmentCategory || 'Uncategorized'
    costByCategory[cat] = (costByCategory[cat] || 0) + p.cost
  })
  const costByCategoryData = Object.entries(costByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-blue-600" />
          Portfolio Financial Summary
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Aggregate financial data including NPV, IRR, Payback Period, ROM Estimates, and Estimation Class across {projects.length} projects
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-blue-800">{formatCurrency(totalCost)}</p>
            <p className="text-xs text-blue-600">Total Investment</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-green-800">{totalNPV !== null ? formatCurrency(totalNPV) : 'N/A'}</p>
            <p className="text-xs text-green-600">Total NPV</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-emerald-800">{avgNPV !== null ? formatCurrency(avgNPV) : 'N/A'}</p>
            <p className="text-xs text-emerald-600">Avg NPV</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-purple-800">{avgIRR !== null ? `${avgIRR.toFixed(1)}%` : 'N/A'}</p>
            <p className="text-xs text-purple-600">Avg IRR</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-amber-800">{avgPayback !== null ? `${avgPayback.toFixed(1)} mo` : 'N/A'}</p>
            <p className="text-xs text-amber-600">Avg Payback</p>
          </CardContent>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-indigo-800">{avgFinScore !== null ? avgFinScore.toFixed(0) : 'N/A'}</p>
            <p className="text-xs text-indigo-600">Avg Financial Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Investment by Category */}
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Investment by Category</h3>
            {costByCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={costByCategoryData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No category data available</p>
            )}
          </CardContent>
        </Card>

        {/* ROM Estimate Distribution */}
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">ROM Estimate Distribution</h3>
            {romData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={romData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {romData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No ROM data available</p>
            )}
          </CardContent>
        </Card>

        {/* Estimation Class Distribution */}
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Estimation Class Distribution</h3>
            {estData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={estData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {estData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[(i + 3) % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No estimation class data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Score Distribution */}
      {projectsWithFinScore.length > 0 && (
        <Card className="border-gray-200 mb-6">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Financial Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreDistribution} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Financial Details Table */}
      <Card className="border-gray-200">
        <CardContent className="pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Project Financial Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortHeader field="tbName" label="Project" />
                  <SortHeader field="cost" label="Cost" />
                  <SortHeader field="npv" label="NPV" />
                  <SortHeader field="irr" label="IRR" />
                  <SortHeader field="payback" label="Payback" />
                  <SortHeader field="financialScore" label="Fin. Score" />
                  <SortHeader field="romEstimate" label="ROM Est." />
                  <SortHeader field="estimationClass" label="Est. Class" />
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Decision</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, idx) => (
                  <>
                    <tr key={p.tbID || idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900">{p.tbName}</div>
                        <div className="text-xs text-gray-500">{p.tbID}</div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-gray-900">{formatCurrency(p.cost)}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        {p.npv !== null ? (
                          <span className={p.npv >= 0 ? 'text-green-700' : 'text-red-600'}>{formatCurrency(p.npv)}</span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {p.irr !== null ? (
                          <span className={p.irr >= 10 ? 'text-green-700' : 'text-amber-600'}>{p.irr.toFixed(1)}%</span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {p.payback !== null ? (
                          <span className="text-gray-900">{p.payback.toFixed(1)} mo</span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p.financialScore !== null ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            p.financialScore >= 60 ? 'bg-green-100 text-green-700' :
                            p.financialScore >= 30 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {p.financialScore}
                          </span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">{p.romEstimate || '--'}</td>
                      <td className="px-3 py-2 text-xs text-gray-700">{p.estimationClass || '--'}</td>
                      <td className="px-3 py-2">{getDecisionBadge(p.decision)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {expandedRow === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === idx && (
                      <tr key={`${p.tbID}-detail`} className="bg-blue-50 border-b border-blue-100">
                        <td colSpan={10} className="px-6 py-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <span className="text-gray-500">SV Score:</span>{' '}
                              <span className="font-medium">{p.svScore !== null ? p.svScore : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">AE Score:</span>{' '}
                              <span className="font-medium">{p.aeScore !== null ? p.aeScore : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">BCR:</span>{' '}
                              <span className="font-medium">{p.bcr !== null ? p.bcr.toFixed(2) : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">EVA:</span>{' '}
                              <span className="font-medium">{p.eva !== null ? formatCurrency(p.eva) : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Opportunity Cost:</span>{' '}
                              <span className="font-medium">{p.opportunityCost !== null ? formatCurrency(p.opportunityCost) : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Sr. Commitment:</span>{' '}
                              <span className="font-medium">{p.seniorCommitment || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Category:</span>{' '}
                              <span className="font-medium">{p.investmentCategory || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Objective:</span>{' '}
                              <span className="font-medium">{p.investmentObjective || 'N/A'}</span>
                            </div>
                          </div>
                          {(p.budgetCommentary || p.financialCommentary) && (
                            <div className="mt-3 space-y-1">
                              {p.budgetCommentary && (
                                <p className="text-xs"><span className="text-gray-500">Budget Commentary:</span> {p.budgetCommentary}</p>
                              )}
                              {p.financialCommentary && (
                                <p className="text-xs"><span className="text-gray-500">Financial Commentary:</span> {p.financialCommentary}</p>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          {projects.length === 0 && (
            <p className="text-center text-gray-500 py-8">No project financial data available</p>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="mt-6 border-gray-200 bg-gray-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="mb-1">
                <span className="font-medium">Financial data</span> is entered in Costbars under PPM &gt; Investment Analysis.
                NPV, IRR, Payback Period, and Benefit-Cost Ratio are computed from project cash flows.
              </p>
              <p>
                <span className="font-medium">ROM Estimate</span> (Rough Order of Magnitude) and{' '}
                <span className="font-medium">Estimation Class</span> (A/B/C/D/E) reflect the confidence level
                in cost estimates. Class A is highest confidence (&plusmn;10%), Class E is lowest (&plusmn;50%).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancialSummaryPage
