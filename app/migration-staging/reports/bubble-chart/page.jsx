// app/dashboard/reports/bubble-chart/page.jsx
'use client'

import { useState } from 'react'
import { Circle, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ZAxis, Cell,
} from 'recharts'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'

/**
 * Enterprise Bubble Chart - Project Selection Visualization
 *
 * Mirrors the Costbars PPM Bubble Chart at the enterprise level.
 * Plots projects using:
 *   X-axis: SV Score (tbMDPriorityStrategic) - Strategic Value (0-100)
 *   Y-axis: AE Score (tbMDCostbarsScore) - Ability to Execute (0-100)
 *   Bubble size: Project cost (tbCost)
 *
 * Quadrants:
 *   Top-Right: High SV + High AE = Strategically aligned, likely to succeed
 *   Top-Left:  Low SV + High AE  = Misaligned but low risk
 *   Bottom-Right: High SV + Low AE = Strategic but at risk
 *   Bottom-Left:  Low SV + Low AE  = Misaligned and risky - kill candidates
 *
 * Decision output from Costbars: tbMDDecisionStrategic
 *   (Continue / Review / Consider Terminating / PROCEED / REVIEW / REJECT)
 */

const getDecisionColor = (decision) => {
  if (!decision) return '#9ca3af' // gray
  const d = decision.toLowerCase()
  if (d.includes('continue') || d.includes('proceed')) return '#22c55e' // green
  if (d.includes('review')) return '#f59e0b' // amber
  if (d.includes('terminat') || d.includes('reject')) return '#ef4444' // red
  return '#9ca3af'
}

const getDecisionLabel = (decision) => {
  if (!decision) return 'Not Scored'
  return decision
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null
  const data = payload[0].payload

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <p className="font-bold text-gray-900 text-sm">{data.tbName}</p>
      <p className="text-xs text-gray-500 mb-2">{data.tbID} | {data.tbType}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">SV Score:</span>
          <span className="font-medium">{data.svScore !== null ? data.svScore : 'N/A'}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">AE Score:</span>
          <span className="font-medium">{data.aeScore !== null ? data.aeScore : 'N/A'}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">Cost:</span>
          <span className="font-medium">{data.cost ? `$${Number(data.cost).toLocaleString()}` : 'N/A'}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">Decision:</span>
          <span className="font-bold" style={{ color: getDecisionColor(data.decision) }}>
            {getDecisionLabel(data.decision)}
          </span>
        </div>
        {data.tbMDPM && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">PM:</span>
            <span className="font-medium">{data.tbMDPM}</span>
          </div>
        )}
        {data.tbMDInvestmentObjective && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Objective:</span>
            <span className="font-medium">{data.tbMDInvestmentObjective}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const BubbleChartPage = () => {
  const { dashboardSource, session, status, isLoading, error } =
    useEnterpriseDashboardSource()
  const [svThreshold, setSvThreshold] = useState(50)
  const [aeThreshold, setAeThreshold] = useState(50)

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Project Selection Bubble Chart"
        icon={Circle}
        message="Loading project scoring data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the bubble chart" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Project Selection Bubble Chart" icon={Circle} />
  }

  if (error) {
    return <EnterpriseError title="Project Selection Bubble Chart" icon={Circle} error={error} />
  }

  const allRows = dashboardSource.tbmdjoined || []

  // Get Project-level rows (L2) with scoring data
  const projectRows = allRows.filter(row =>
    row.tbType === 'Project' || row.tbType === 'Portfolio'
  )

  // Build chart data - parse SV and AE scores
  const chartData = projectRows.map(row => {
    const svRaw = row.tbMDPriorityStrategic
    const svScore = svRaw ? (isNaN(parseFloat(svRaw)) ? null : parseFloat(svRaw)) : null
    const aeScore = row.tbMDCostbarsScore ? parseFloat(row.tbMDCostbarsScore) : null
    const cost = parseFloat(row.tbCost) || 0

    return {
      ...row,
      svScore,
      aeScore,
      cost,
      decision: row.tbMDDecisionStrategic || null,
      // For recharts scatter: x, y, z (bubble size)
      x: svScore !== null ? svScore : 0,
      y: aeScore !== null ? aeScore : 0,
      z: Math.max(cost, 10000), // minimum bubble size
    }
  })

  // Separate scored vs unscored
  const scoredProjects = chartData.filter(d => d.svScore !== null || d.aeScore !== null)
  const unscoredProjects = chartData.filter(d => d.svScore === null && d.aeScore === null)

  // Selection algorithm (mirrors Costbars): Final Score = (SV × 60%) + (AE × 40%)
  const withSelection = scoredProjects.map(p => {
    const sv = p.svScore || 0
    const ae = p.aeScore || 0
    const finalScore = (sv * 0.6) + (ae * 0.4)
    const threshold = (svThreshold + aeThreshold) / 2
    const selected = finalScore > threshold
    return { ...p, finalScore: Math.round(finalScore), selected }
  })

  const selectedCount = withSelection.filter(p => p.selected).length
  const rejectedCount = withSelection.filter(p => !p.selected).length

  // Decision counts
  const decisionCounts = { continue: 0, review: 0, terminate: 0, unscored: unscoredProjects.length }
  scoredProjects.forEach(p => {
    const d = (p.decision || '').toLowerCase()
    if (d.includes('continue') || d.includes('proceed')) decisionCounts.continue++
    else if (d.includes('review')) decisionCounts.review++
    else if (d.includes('terminat') || d.includes('reject')) decisionCounts.terminate++
    else decisionCounts.unscored++
  })

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Circle className="w-8 h-8 text-blue-600" />
          Project Selection Bubble Chart
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Visual project selection based on Strategic Value (SV Score) and Ability to Execute (AE Score) from Costbars PPM scoring
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-gray-200">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{chartData.length}</p>
            <p className="text-xs text-gray-500">Total Projects</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-green-700">{decisionCounts.continue}</p>
            <p className="text-xs text-green-600">Continue / Proceed</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{decisionCounts.review}</p>
            <p className="text-xs text-amber-600">Review</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-red-700">{decisionCounts.terminate}</p>
            <p className="text-xs text-red-600">Terminate / Reject</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-2xl font-bold text-gray-500">{decisionCounts.unscored}</p>
            <p className="text-xs text-gray-500">Not Scored</p>
          </CardContent>
        </Card>
      </div>

      {/* Threshold Controls */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-blue-800">SV Score Threshold:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={svThreshold}
                onChange={(e) => setSvThreshold(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm font-bold text-blue-900 w-8">{svThreshold}</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-blue-800">AE Score Threshold:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={aeThreshold}
                onChange={(e) => setAeThreshold(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm font-bold text-blue-900 w-8">{aeThreshold}</span>
            </div>
            <div className="text-sm text-blue-700">
              Selection: <span className="font-bold text-green-700">{selectedCount} selected</span>,{' '}
              <span className="font-bold text-red-700">{rejectedCount} rejected</span>
              <span className="text-blue-600 ml-2">(Formula: SV×60% + AE×40% &gt; {Math.round((svThreshold + aeThreshold) / 2)})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bubble Chart */}
      {scoredProjects.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <Circle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No scored projects available</p>
          <p className="text-gray-500 text-sm mt-1">
            Projects need SV Scores (via PPM &gt; Prioritize) and AE Scores (via PPM &gt; Score)
            in Costbars before they appear on the bubble chart. Publish scored data to see results here.
          </p>
        </div>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0, 100]}
                  name="SV Score"
                  label={{ value: 'Strategic Value (SV Score)', position: 'bottom', offset: 20, style: { fontWeight: 'bold', fontSize: 13 } }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, 100]}
                  name="AE Score"
                  label={{ value: 'Ability to Execute (AE Score)', angle: -90, position: 'insideLeft', offset: -5, style: { fontWeight: 'bold', fontSize: 13 } }}
                  tick={{ fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="z" range={[200, 2000]} />
                <Tooltip content={<CustomTooltip />} />

                {/* Threshold reference lines */}
                <ReferenceLine x={svThreshold} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={2} />
                <ReferenceLine y={aeThreshold} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={2} />

                {/* Score thresholds at 60 and 80 */}
                <ReferenceLine x={60} stroke="#e5e7eb" strokeDasharray="2 2" />
                <ReferenceLine x={80} stroke="#e5e7eb" strokeDasharray="2 2" />
                <ReferenceLine y={60} stroke="#e5e7eb" strokeDasharray="2 2" />
                <ReferenceLine y={80} stroke="#e5e7eb" strokeDasharray="2 2" />

                <Scatter data={withSelection} name="Projects">
                  {withSelection.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={getDecisionColor(entry.decision)}
                      fillOpacity={0.7}
                      stroke={entry.selected ? '#1d4ed8' : '#6b7280'}
                      strokeWidth={entry.selected ? 2 : 1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quadrant Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-3 pb-3">
            <p className="text-sm font-bold text-green-800">Top-Right Quadrant</p>
            <p className="text-xs text-green-700">High SV + High AE</p>
            <p className="text-xs text-green-600 mt-1">Strategically aligned and likely to succeed. Proceed.</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-3 pb-3">
            <p className="text-sm font-bold text-amber-800">Top-Left Quadrant</p>
            <p className="text-xs text-amber-700">Low SV + High AE</p>
            <p className="text-xs text-amber-600 mt-1">Misaligned but low risk. Review strategic fit.</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-3 pb-3">
            <p className="text-sm font-bold text-orange-800">Bottom-Right Quadrant</p>
            <p className="text-xs text-orange-700">High SV + Low AE</p>
            <p className="text-xs text-orange-600 mt-1">Strategic but at risk. Needs intervention.</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-3 pb-3">
            <p className="text-sm font-bold text-red-800">Bottom-Left Quadrant</p>
            <p className="text-xs text-red-700">Low SV + Low AE</p>
            <p className="text-xs text-red-600 mt-1">Misaligned and risky. Kill candidates.</p>
          </CardContent>
        </Card>
      </div>

      {/* Scoring Info */}
      <Card className="mt-6 border-gray-200 bg-gray-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="mb-1">
                <span className="font-medium">SV Score</span> (Strategic Value) is computed in Costbars from
                Investment Category, Initiative, Objective, and Strategy alignment values, plus financial data
                (NPV, IRR, Payback Period) when available.
              </p>
              <p>
                <span className="font-medium">AE Score</span> (Ability to Execute) is computed from health indicators,
                risk/size/complexity, executive commitment, budget performance, hours performance, and top 3 risk scores.
                Selection formula: (SV&times;60%) + (AE&times;40%) &gt; threshold.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unscored Projects */}
      {unscoredProjects.length > 0 && (
        <Card className="mt-4 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              {unscoredProjects.length} project{unscoredProjects.length !== 1 ? 's' : ''} not shown (no SV or AE scores):
            </p>
            <div className="flex flex-wrap gap-2">
              {unscoredProjects.map(p => (
                <span key={p.tbID} className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                  {p.tbName}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BubbleChartPage
