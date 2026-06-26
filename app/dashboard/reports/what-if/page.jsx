// app/dashboard/reports/what-if/page.jsx
'use client'

import { useState, useMemo } from 'react'
import { SlidersHorizontal, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts'
import { useEnterpriseDashboardSource } from '@/hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/components/dashboard/EnterprisePageStates'

/**
 * Enterprise What-If Scenario Dashboard
 *
 * Enables executives to:
 *   1. See current portfolio health profile (radar chart of health dimensions)
 *   2. View AE Score component breakdown parsed from tbMDDecisionNotes
 *   3. Adjust SV/AE thresholds and see how project decisions change
 *   4. Compare current vs simulated portfolio outcomes
 *
 * Uses fields: tbMDHealthOverall, tbMDHealthScope, tbMDHealthCost,
 * tbMDHealthSchedule, tbMDHealthIssues, tbMDHealthRisk, tbMDHealthHours,
 * tbMDDecisionNotes, tbMDDecisionStrategic, tbMDCostbarsScore,
 * tbMDPriorityStrategic, tbCost
 */

const healthToValue = (h) => {
  if (!h) return 0
  const lower = h.toLowerCase()
  if (lower === 'green' || lower === 'on track' || lower === 'on schedule') return 100
  if (lower === 'yellow' || lower === 'amber' || lower === 'at risk') return 50
  if (lower === 'red' || lower === 'critical' || lower === 'off track') return 0
  return 50
}

const healthToColor = (h) => {
  if (!h) return 'bg-gray-300'
  const lower = h.toLowerCase()
  if (lower === 'green' || lower === 'on track' || lower === 'on schedule') return 'bg-green-500'
  if (lower === 'yellow' || lower === 'amber' || lower === 'at risk') return 'bg-amber-500'
  if (lower === 'red' || lower === 'critical' || lower === 'off track') return 'bg-red-500'
  return 'bg-gray-300'
}

const parseDecisionNotes = (notes) => {
  if (!notes) return null
  const components = {}
  const patterns = [
    { key: 'healthScore', regex: /Health Score:\s*([\d.]+)/i },
    { key: 'riskComplexity', regex: /Risk Complexity Score:\s*([\d.]+)/i },
    { key: 'executiveCommitment', regex: /Executive Commitment:\s*([\d.]+)/i },
    { key: 'top3RiskAvg', regex: /Top 3 Risk Avg[\.\s]*Score:\s*([\d.]+)/i },
    { key: 'budgetScore', regex: /Budget Score:\s*([\d.]+)/i },
    { key: 'hoursVariance', regex: /Hours Variance Score:\s*([\d.]+)/i },
    { key: 'finalScore', regex: /Final Score:\s*([\d.]+)/i },
  ]

  patterns.forEach(({ key, regex }) => {
    const match = notes.match(regex)
    if (match) components[key] = parseFloat(match[1])
  })

  return Object.keys(components).length > 0 ? components : null
}

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '$0'
  if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`
  if (Math.abs(val) >= 1e3) return `$${(val / 1e3).toFixed(0)}K`
  return `$${val.toLocaleString()}`
}

const getDecision = (svScore, aeScore, svWeight, aeWeight, threshold) => {
  const sv = svScore || 0
  const ae = aeScore || 0
  const finalScore = (sv * (svWeight / 100)) + (ae * (aeWeight / 100))
  if (finalScore >= threshold) return 'Continue'
  if (finalScore >= threshold * 0.6) return 'Review'
  return 'Consider Terminating'
}

const getDecisionBadge = (decision) => {
  if (!decision) return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">N/A</span>
  const d = decision.toLowerCase()
  if (d.includes('continue') || d.includes('proceed'))
    return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">{decision}</span>
  if (d.includes('review'))
    return <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">{decision}</span>
  if (d.includes('terminat') || d.includes('reject'))
    return <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">{decision}</span>
  return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{decision}</span>
}

const WhatIfPage = () => {
  const { dashboardSource, session, status, isLoading, error } =
    useEnterpriseDashboardSource()

  // Scenario controls
  const [svWeight, setSvWeight] = useState(60)
  const [aeWeight, setAeWeight] = useState(40)
  const [threshold, setThreshold] = useState(50)

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="What-If Scenario Dashboard"
        icon={SlidersHorizontal}
        message="Loading portfolio data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the what-if dashboard" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="What-If Scenario Dashboard" icon={SlidersHorizontal} />
  }

  if (error) {
    return <EnterpriseError title="What-If Scenario Dashboard" icon={SlidersHorizontal} error={error} />
  }

  const allRows = dashboardSource.tbmdjoined || []

  // Filter for Project-level rows
  const projectRows = allRows.filter(row =>
    row.tbType === 'Project' || row.tbType === 'Portfolio'
  )

  // Build project dataset
  const projects = projectRows.map(row => {
    const svRaw = row.tbMDPriorityStrategic
    const svScore = svRaw ? (isNaN(parseFloat(svRaw)) ? null : parseFloat(svRaw)) : null
    const aeScore = row.tbMDCostbarsScore ? parseFloat(row.tbMDCostbarsScore) : null
    const cost = parseFloat(row.tbCost) || 0
    const components = parseDecisionNotes(row.tbMDDecisionNotes)

    return {
      tbName: row.tbName || 'Unnamed',
      tbID: row.tbID || '',
      cost,
      svScore,
      aeScore,
      currentDecision: row.tbMDDecisionStrategic || null,
      components,
      healthOverall: row.tbMDHealthOverall || null,
      healthScope: row.tbMDHealthScope || null,
      healthCost: row.tbMDHealthCost || null,
      healthSchedule: row.tbMDHealthSchedule || null,
      healthIssues: row.tbMDHealthIssues || null,
      healthRisk: row.tbMDHealthRisk || null,
      healthHours: row.tbMDHealthHours || null,
      pm: row.tbMDPM || null,
    }
  })

  // Compute simulated decisions
  const withSimulation = projects.map(p => {
    const hasScores = p.svScore !== null || p.aeScore !== null
    const simulatedDecision = hasScores
      ? getDecision(p.svScore, p.aeScore, svWeight, aeWeight, threshold)
      : null
    const finalScore = hasScores
      ? Math.round((p.svScore || 0) * (svWeight / 100) + (p.aeScore || 0) * (aeWeight / 100))
      : null
    const changed = hasScores && p.currentDecision && simulatedDecision !== null &&
      !p.currentDecision.toLowerCase().includes(simulatedDecision.toLowerCase().substring(0, 6))
    return { ...p, simulatedDecision, finalScore, changed }
  })

  const scoredProjects = withSimulation.filter(p => p.svScore !== null || p.aeScore !== null)
  const unscoredProjects = withSimulation.filter(p => p.svScore === null && p.aeScore === null)

  // Current vs simulated decision counts
  const currentCounts = { continue: 0, review: 0, terminate: 0 }
  const simCounts = { continue: 0, review: 0, terminate: 0 }

  scoredProjects.forEach(p => {
    // Current
    const cd = (p.currentDecision || '').toLowerCase()
    if (cd.includes('continue') || cd.includes('proceed')) currentCounts.continue++
    else if (cd.includes('review')) currentCounts.review++
    else if (cd.includes('terminat') || cd.includes('reject')) currentCounts.terminate++

    // Simulated
    const sd = (p.simulatedDecision || '').toLowerCase()
    if (sd.includes('continue')) simCounts.continue++
    else if (sd.includes('review')) simCounts.review++
    else if (sd.includes('terminat')) simCounts.terminate++
  })

  // Portfolio health radar data (aggregate)
  const healthDimensions = [
    { key: 'Overall', field: 'healthOverall' },
    { key: 'Scope', field: 'healthScope' },
    { key: 'Cost', field: 'healthCost' },
    { key: 'Schedule', field: 'healthSchedule' },
    { key: 'Issues', field: 'healthIssues' },
    { key: 'Risk', field: 'healthRisk' },
    { key: 'Hours', field: 'healthHours' },
  ]

  const radarData = healthDimensions.map(dim => {
    const values = projects.map(p => healthToValue(p[dim.field])).filter(v => v > 0)
    const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0
    return { dimension: dim.key, score: Math.round(avg) }
  })

  // Health summary counts
  const healthSummary = { green: 0, yellow: 0, red: 0, unknown: 0 }
  projects.forEach(p => {
    const h = (p.healthOverall || '').toLowerCase()
    if (h === 'green' || h === 'on track') healthSummary.green++
    else if (h === 'yellow' || h === 'amber' || h === 'at risk') healthSummary.yellow++
    else if (h === 'red' || h === 'critical') healthSummary.red++
    else healthSummary.unknown++
  })

  // AE Score component breakdown (aggregate from parsed decision notes)
  const projectsWithComponents = projects.filter(p => p.components)
  const componentLabels = {
    healthScore: 'Health Score',
    riskComplexity: 'Risk/Complexity',
    executiveCommitment: 'Exec. Commitment',
    top3RiskAvg: 'Top 3 Risk Avg',
    budgetScore: 'Budget Score',
    hoursVariance: 'Hours Variance',
  }

  const componentAverages = Object.entries(componentLabels).map(([key, label]) => {
    const values = projectsWithComponents.map(p => p.components[key]).filter(v => v !== undefined)
    const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0
    return { name: label, average: Math.round(avg), count: values.length }
  })

  // Comparison data for bar chart
  const comparisonData = [
    { category: 'Continue', current: currentCounts.continue, simulated: simCounts.continue },
    { category: 'Review', current: currentCounts.review, simulated: simCounts.review },
    { category: 'Terminate', current: currentCounts.terminate, simulated: simCounts.terminate },
  ]

  // Cost at risk (projects that would be terminated in simulation)
  const costAtRisk = scoredProjects
    .filter(p => p.simulatedDecision && p.simulatedDecision.includes('Terminat'))
    .reduce((s, p) => s + p.cost, 0)
  const costContinuing = scoredProjects
    .filter(p => p.simulatedDecision === 'Continue')
    .reduce((s, p) => s + p.cost, 0)

  const changedCount = withSimulation.filter(p => p.changed).length

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <SlidersHorizontal className="w-8 h-8 text-blue-600" />
          What-If Scenario Dashboard
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Adjust selection thresholds and weights to simulate portfolio decisions and see financial impact
        </p>
      </div>

      {/* Scenario Controls */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Scenario Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">
                SV Weight: {svWeight}% (Strategic Value importance)
              </label>
              <input
                type="range" min="0" max="100" value={svWeight}
                onChange={(e) => { setSvWeight(Number(e.target.value)); setAeWeight(100 - Number(e.target.value)) }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-blue-600">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">
                AE Weight: {aeWeight}% (Execution ability importance)
              </label>
              <input
                type="range" min="0" max="100" value={aeWeight}
                onChange={(e) => { setAeWeight(Number(e.target.value)); setSvWeight(100 - Number(e.target.value)) }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-blue-600">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-blue-700 block mb-1">
                Selection Threshold: {threshold} (minimum final score to continue)
              </label>
              <input
                type="range" min="0" max="100" value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-blue-600">
                <span>Lenient (0)</span>
                <span>Strict (100)</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3">
            Formula: Final Score = (SV &times; {svWeight}%) + (AE &times; {aeWeight}%). Continue if &ge; {threshold}, Review if &ge; {Math.round(threshold * 0.6)}, else Terminate.
          </p>
        </CardContent>
      </Card>

      {/* Impact Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-gray-200">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{scoredProjects.length}</p>
            <p className="text-xs text-gray-500">Scored Projects</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-green-700">{simCounts.continue}</p>
            <p className="text-xs text-green-600">Would Continue</p>
            <p className="text-xs text-green-500">{formatCurrency(costContinuing)}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{simCounts.review}</p>
            <p className="text-xs text-amber-600">Would Review</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-red-700">{simCounts.terminate}</p>
            <p className="text-xs text-red-600">Would Terminate</p>
            <p className="text-xs text-red-500">{formatCurrency(costAtRisk)}</p>
          </CardContent>
        </Card>
        <Card className={`${changedCount > 0 ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`}>
          <CardContent className="pt-3 pb-3 text-center">
            <p className={`text-2xl font-bold ${changedCount > 0 ? 'text-purple-700' : 'text-gray-500'}`}>{changedCount}</p>
            <p className="text-xs text-gray-500">Decisions Changed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Current vs Simulated Comparison */}
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Current vs Simulated Decisions</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData} margin={{ left: 10, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="current" fill="#94a3b8" name="Current (Costbars)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="simulated" fill="#3b82f6" name="Simulated (What-If)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Health Radar */}
        <Card className="border-gray-200">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Portfolio Health Profile</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Avg Health" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs">
                <span className="w-3 h-3 rounded-full bg-green-500" /> Green: {healthSummary.green}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Yellow: {healthSummary.yellow}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <span className="w-3 h-3 rounded-full bg-red-500" /> Red: {healthSummary.red}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AE Score Component Breakdown */}
      {componentAverages.some(c => c.count > 0) && (
        <Card className="border-gray-200 mb-6">
          <CardContent className="pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              AE Score Component Breakdown (avg across {projectsWithComponents.length} scored projects)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={componentAverages} margin={{ left: 10, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v} / 100`} />
                <Bar dataKey="average" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Project-Level Detail Table */}
      <Card className="border-gray-200">
        <CardContent className="pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Project Scenario Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Project</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">SV</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">AE</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Final</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Cost</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Health</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Current</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">Simulated</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 w-12">Chg</th>
                </tr>
              </thead>
              <tbody>
                {withSimulation
                  .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
                  .map((p, idx) => (
                    <tr key={p.tbID || idx} className={`border-b border-gray-100 ${p.changed ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900">{p.tbName}</div>
                        <div className="text-xs text-gray-500">{p.tbID}</div>
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-sm">
                        {p.svScore !== null ? p.svScore : <span className="text-gray-400">--</span>}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-sm">
                        {p.aeScore !== null ? p.aeScore : <span className="text-gray-400">--</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p.finalScore !== null ? (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            p.finalScore >= threshold ? 'bg-green-100 text-green-700' :
                            p.finalScore >= threshold * 0.6 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {p.finalScore}
                          </span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs text-gray-700">{formatCurrency(p.cost)}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex justify-center gap-0.5">
                          {['healthOverall', 'healthScope', 'healthCost', 'healthSchedule', 'healthRisk', 'healthIssues', 'healthHours'].map(h => (
                            <div key={h} className={`w-2.5 h-2.5 rounded-full ${healthToColor(p[h])}`} title={`${h.replace('health', '')}: ${p[h] || 'N/A'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">{getDecisionBadge(p.currentDecision)}</td>
                      <td className="px-3 py-2 text-center">{getDecisionBadge(p.simulatedDecision)}</td>
                      <td className="px-3 py-2 text-center">
                        {p.changed && <span className="text-purple-600 text-xs font-bold">*</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {unscoredProjects.length > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              {unscoredProjects.length} unscored project{unscoredProjects.length !== 1 ? 's' : ''} not shown
              ({unscoredProjects.map(p => p.tbName).join(', ')})
            </p>
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
                <span className="font-medium">What-If Scenarios</span> simulate portfolio decisions by adjusting the weight
                given to Strategic Value (SV) vs Ability to Execute (AE) and the minimum threshold for continuation.
                The default Costbars formula uses 60% SV + 40% AE.
              </p>
              <p className="mb-1">
                <span className="font-medium">AE Score Components</span> (parsed from Decision Notes) show what drives
                each project&apos;s execution score: health status, risk/complexity, executive commitment,
                top 3 risk average, budget performance, and hours variance.
              </p>
              <p>
                Projects marked with <span className="text-purple-600 font-bold">*</span> would change decisions under
                the simulated scenario vs their current Costbars scoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WhatIfPage
