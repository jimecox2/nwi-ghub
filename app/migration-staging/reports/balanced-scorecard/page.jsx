// app/dashboard/reports/balanced-scorecard/page.jsx
'use client'

import { useState } from 'react'
import { Scale, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'

/**
 * Enterprise Balanced Scorecard
 *
 * Mirrors the Costbars PPM Balanced Scorecard at the enterprise level.
 * Shows portfolio balance across 8 KPI dimensions:
 *
 * 1. SV Score Distribution (Very High to Very Low)
 * 2. AE Score Distribution (Very High to Very Low)
 * 3. Investment Strategy balance
 * 4. Investment Objectives balance (Run/Grow/Transform)
 * 5. Investment Category balance
 * 6. Risk Balance (by health risk indicator)
 * 7. Resource Balance (by priority/weighting)
 * 8. Duration Balance (Short/Medium/Long term)
 *
 * Data fields used:
 *   tbMDPriorityStrategic (SV Score), tbMDCostbarsScore (AE Score),
 *   tbMDInvestmentStrategy, tbMDInvestmentObjective, tbMDInvestmentCategory,
 *   tbMDHealthRisk, tbPriority/tbMDWeighting, tbDuration
 */

const SCORE_RANGES = [
  { label: 'Very High (80-100)', min: 80, max: 100, color: '#22c55e' },
  { label: 'High (60-79)', min: 60, max: 79, color: '#84cc16' },
  { label: 'Moderate (40-59)', min: 40, max: 59, color: '#f59e0b' },
  { label: 'Low (20-39)', min: 20, max: 39, color: '#f97316' },
  { label: 'Very Low (0-19)', min: 0, max: 19, color: '#ef4444' },
]

const PIE_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1',
]

const getBalanceKPI = (distribution) => {
  if (!distribution || distribution.length === 0) return { label: 'No Data', color: 'text-gray-500', bg: 'bg-gray-100' }
  const total = distribution.reduce((sum, d) => sum + d.count, 0)
  if (total === 0) return { label: 'No Data', color: 'text-gray-500', bg: 'bg-gray-100' }

  const maxPct = Math.max(...distribution.map(d => d.count / total))
  // If any single category has > 70%, it's heavily skewed
  if (maxPct > 0.7) return { label: 'Poor', color: 'text-red-700', bg: 'bg-red-100' }
  if (maxPct > 0.5) return { label: 'Moderate', color: 'text-amber-700', bg: 'bg-amber-100' }
  if (maxPct > 0.35) return { label: 'Good', color: 'text-green-700', bg: 'bg-green-100' }
  return { label: 'Excellent', color: 'text-emerald-700', bg: 'bg-emerald-100' }
}

const computeScoreDistribution = (projects, scoreField) => {
  const dist = SCORE_RANGES.map(range => ({ ...range, count: 0, cost: 0 }))

  projects.forEach(p => {
    const score = parseFloat(p[scoreField])
    if (isNaN(score)) return
    const bucket = dist.find(d => score >= d.min && score <= d.max)
    if (bucket) {
      bucket.count++
      bucket.cost += parseFloat(p.tbCost) || 0
    }
  })

  return dist
}

const computeCategoryDistribution = (projects, field) => {
  const counts = {}
  projects.forEach(p => {
    const val = p[field] || 'Not Set'
    counts[val] = (counts[val] || 0) + 1
  })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

const computeDurationBalance = (projects) => {
  const buckets = [
    { name: 'Short (0-4 months)', count: 0, min: 0, max: 120 },
    { name: 'Medium (4-12 months)', count: 0, min: 121, max: 365 },
    { name: 'Long (12+ months)', count: 0, min: 366, max: Infinity },
  ]

  projects.forEach(p => {
    const dur = parseFloat(p.tbDuration) || 0
    const bucket = buckets.find(b => dur >= b.min && dur <= b.max)
    if (bucket) bucket.count++
  })

  return buckets
}

const KPISection = ({ title, description, distribution, chartType = 'bar', scoreRanges = false }) => {
  const kpi = getBalanceKPI(distribution)
  const total = distribution.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
          <span className={`text-xs font-bold px-2 py-1 rounded ${kpi.color} ${kpi.bg}`}>
            {kpi.label}
          </span>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No data available</p>
        ) : chartType === 'pie' ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={distribution.filter(d => d.count > 0)}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {distribution.filter(d => d.count > 0).map((entry, index) => (
                  <Cell key={index} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} projects`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distribution.filter(d => d.count > 0)} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey={scoreRanges ? 'label' : 'name'}
                width={130}
                tick={{ fontSize: 10 }}
              />
              <Tooltip
                formatter={(value) => [`${value} projects`, 'Count']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {distribution.filter(d => d.count > 0).map((entry, index) => (
                  <Cell key={index} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Distribution table */}
        <div className="mt-3 space-y-1">
          {distribution.filter(d => d.count > 0).map((d, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: d.color || PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-gray-700">{d.label || d.name}</span>
              </div>
              <span className="font-medium text-gray-900">
                {d.count} ({total > 0 ? Math.round((d.count / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const BalancedScorecardPage = () => {
  const { dashboardSource, session, status, isLoading, error } =
    useEnterpriseDashboardSource()

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Balanced Scorecard"
        icon={Scale}
        message="Computing portfolio balance..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the balanced scorecard" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Balanced Scorecard" icon={Scale} />
  }

  if (error) {
    return <EnterpriseError title="Balanced Scorecard" icon={Scale} error={error} />
  }

  const allRows = dashboardSource.tbmdjoined || []
  const projects = allRows.filter(row => row.tbType === 'Project')

  // Compute all 8 KPI distributions
  const svDist = computeScoreDistribution(projects, 'tbMDPriorityStrategic')
  const aeDist = computeScoreDistribution(projects, 'tbMDCostbarsScore')
  const strategyDist = computeCategoryDistribution(projects, 'tbMDInvestmentStrategy')
  const objectiveDist = computeCategoryDistribution(projects, 'tbMDInvestmentObjective')
  const categoryDist = computeCategoryDistribution(projects, 'tbMDInvestmentCategory')
  const riskDist = computeCategoryDistribution(projects, 'tbMDHealthRisk')
  const priorityDist = computeCategoryDistribution(projects, 'tbPriority')
  const durationDist = computeDurationBalance(projects)

  // Overall balance score (count of Good/Excellent KPIs out of 8)
  const allKPIs = [svDist, aeDist, strategyDist, objectiveDist, categoryDist, riskDist, priorityDist, durationDist]
  const kpiResults = allKPIs.map(d => getBalanceKPI(d))
  const greenCount = kpiResults.filter(k => k.label === 'Good' || k.label === 'Excellent').length
  const redCount = kpiResults.filter(k => k.label === 'Poor').length

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Scale className="w-8 h-8 text-purple-600" />
          Balanced Scorecard
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Portfolio balance assessment across strategic, risk, resource, and time dimensions
        </p>
      </div>

      {/* Overall Balance Summary */}
      <Card className="mb-6 border-purple-200 bg-purple-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-purple-900">Portfolio Balance Overview</p>
              <p className="text-sm text-purple-700">
                {projects.length} projects analyzed across 8 balance dimensions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">{greenCount}</p>
                <p className="text-xs text-green-600">Balanced</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-700">{8 - greenCount - redCount}</p>
                <p className="text-xs text-amber-600">Moderate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-700">{redCount}</p>
                <p className="text-xs text-red-600">Imbalanced</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {projects.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <Scale className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No project data available for scorecard analysis.</p>
        </div>
      ) : (
        <>
          {/* Score Distributions (SV + AE) */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Score Distributions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <KPISection
              title="SV Score Distribution"
              description="Strategic Value scores across the portfolio"
              distribution={svDist}
              scoreRanges
            />
            <KPISection
              title="AE Score Distribution"
              description="Ability to Execute scores across the portfolio"
              distribution={aeDist}
              scoreRanges
            />
          </div>

          {/* Investment Balance */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Investment Balance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPISection
              title="Investment Strategy"
              description="Distribution across strategic approaches"
              distribution={strategyDist}
              chartType="pie"
            />
            <KPISection
              title="Investment Objectives"
              description="Run / Grow / Transform balance"
              distribution={objectiveDist}
              chartType="pie"
            />
            <KPISection
              title="Investment Category"
              description="Category concentration analysis"
              distribution={categoryDist}
              chartType="pie"
            />
          </div>

          {/* Risk, Resource & Duration Balance */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk, Resource &amp; Duration Balance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPISection
              title="Risk Balance"
              description="Risk health distribution across projects"
              distribution={riskDist}
              chartType="pie"
            />
            <KPISection
              title="Priority Balance"
              description="Resource allocation by priority level"
              distribution={priorityDist}
              chartType="pie"
            />
            <KPISection
              title="Duration Balance"
              description="Short / Medium / Long-term project mix"
              distribution={durationDist}
              chartType="pie"
            />
          </div>
        </>
      )}

      {/* Info */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p>
                The Balanced Scorecard ensures your project mix supports organizational strategy while managing risk,
                optimizing resources, and maintaining appropriate investment distribution. KPI indicators show
                <span className="text-green-600 font-medium"> Excellent/Good</span> (well-balanced),
                <span className="text-amber-600 font-medium"> Moderate</span> (some concentration), or
                <span className="text-red-600 font-medium"> Poor</span> (heavily skewed - action required).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BalancedScorecardPage
