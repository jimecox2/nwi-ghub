// app/dashboard/reports/prioritization/page.jsx
'use client'

import { useState } from 'react'
import { Target, ArrowUpDown, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEnterpriseDashboardSource } from '@/hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/components/dashboard/EnterprisePageStates'

/**
 * Project Prioritization Matrix
 *
 * Computes a composite score for each Portfolio/Project based on:
 * - Health indicators (7 dimensions)
 * - Cost variance (baseline vs actual)
 * - Schedule variance
 * - Risk count
 * - Issue count
 * - Completion percentage
 *
 * Projects are ranked worst-first so executives can identify candidates
 * for termination, restructuring, or additional oversight.
 *
 * Scoring: Lower composite = better project health.
 * Recommendation thresholds:
 *   0-25  = Continue (green)
 *   26-50 = Monitor (amber)
 *   51-75 = Restructure (orange)
 *   76+   = Terminate (red)
 */

const getHealthNumeric = (value) => {
  if (!value || value === 'N/A' || value === 'Not Assessed') return 0
  const v = value.toLowerCase()
  if (v === 'green') return 0
  if (v === 'amber' || v === 'yellow' || v === 'orange') return 5
  if (v === 'red') return 10
  return 0
}

const computeCompositeScore = (project, riskCount, issueCount) => {
  // Health score: average of 7 indicators (0-10 each, max 10)
  const healthKeys = [
    'tbMDHealthOverall', 'tbMDHealthSchedule', 'tbMDHealthCost',
    'tbMDHealthHours', 'tbMDHealthScope', 'tbMDHealthRisk', 'tbMDHealthIssues',
  ]
  const healthValues = healthKeys.map(k => getHealthNumeric(project[k]))
  const assessedValues = healthValues.filter((v, i) => {
    const raw = project[healthKeys[i]]
    return raw && raw !== 'N/A' && raw !== 'Not Assessed'
  })
  const healthScore = assessedValues.length > 0
    ? (assessedValues.reduce((a, b) => a + b, 0) / assessedValues.length) * 3
    : 0 // Scale to 0-30

  // Cost variance score (0-25)
  const costVar = Math.abs(parseFloat(project.blCostVariance) || 0)
  const costScore = Math.min(costVar * 2.5, 25)

  // Schedule variance score (0-15)
  const schedVar = Math.abs(parseFloat(project.blFinishVariance) || 0)
  const schedScore = Math.min(schedVar * 1.5, 15)

  // Risk score (0-15): each risk adds 3 points
  const riskScore = Math.min(riskCount * 3, 15)

  // Issue score (0-10): each issue adds 2 points
  const issueScore = Math.min(issueCount * 2, 10)

  // Completion penalty: projects that are behind on % complete (0-5)
  const pct = parseFloat(project.tbPercentComplete) || 0
  const completionPenalty = pct < 30 ? 5 : pct < 50 ? 3 : pct < 70 ? 1 : 0

  return Math.round(healthScore + costScore + schedScore + riskScore + issueScore + completionPenalty)
}

const getRecommendation = (score) => {
  if (score <= 25) return {
    label: 'Continue',
    color: 'text-green-700',
    bg: 'bg-green-100',
    rowBg: '',
    description: 'Project is healthy. Continue with current approach.'
  }
  if (score <= 50) return {
    label: 'Monitor',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    rowBg: 'bg-amber-50',
    description: 'Some concerns identified. Increase oversight and reporting frequency.'
  }
  if (score <= 75) return {
    label: 'Restructure',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    rowBg: 'bg-orange-50',
    description: 'Significant issues present. Consider restructuring scope, timeline, or leadership.'
  }
  return {
    label: 'Terminate',
    color: 'text-red-700',
    bg: 'bg-red-100',
    rowBg: 'bg-red-50',
    description: 'Project is in critical condition. Recommend termination or major intervention.'
  }
}

const getHealthDot = (value) => {
  if (!value || value === 'N/A') return 'bg-gray-300'
  if (value === 'Not Assessed') return 'bg-orange-300'
  const v = value.toLowerCase()
  if (v === 'green') return 'bg-green-500'
  if (v === 'amber' || v === 'yellow' || v === 'orange') return 'bg-amber-500'
  if (v === 'red') return 'bg-red-500'
  return 'bg-gray-300'
}

const PrioritizationPage = () => {
  const { dashboardSource, session, status, isLoading, error } =
    useEnterpriseDashboardSource()
  const [sortColumn, setSortColumn] = useState('score')
  const [sortDir, setSortDir] = useState('desc')

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Project Prioritization Matrix"
        icon={Target}
        message="Computing prioritization scores..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the prioritization matrix" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Project Prioritization Matrix" icon={Target} />
  }

  if (error) {
    return <EnterpriseError title="Project Prioritization Matrix" icon={Target} error={error} />
  }

  const allRows = dashboardSource.tbmdjoined || []
  const projectRows = allRows.filter(row =>
    row.tbType === 'Portfolio' || row.tbType === 'Project'
  )

  // Count risks and issues per project
  const risksByProject = {}
  const issuesByProject = {}
  allRows.forEach(row => {
    const proj = row.tbL2 || row.tbL1 || 'Unknown'
    if (row.tbSubType === 'Risk') risksByProject[proj] = (risksByProject[proj] || 0) + 1
    if (row.tbSubType === 'Issue') issuesByProject[proj] = (issuesByProject[proj] || 0) + 1
  })

  // Compute scores for each project
  const scoredProjects = projectRows.map(project => {
    const projName = project.tbL2 || project.tbL1 || project.tbName || 'Unknown'
    const riskCount = risksByProject[projName] || 0
    const issueCount = issuesByProject[projName] || 0
    const score = computeCompositeScore(project, riskCount, issueCount)
    const recommendation = getRecommendation(score)

    return {
      ...project,
      riskCount,
      issueCount,
      score,
      recommendation,
    }
  })

  // Sort
  const handleSort = (col) => {
    if (col === sortColumn) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDir(col === 'score' ? 'desc' : 'asc')
    }
  }

  const sorted = [...scoredProjects].sort((a, b) => {
    let aVal, bVal
    switch (sortColumn) {
      case 'score': aVal = a.score; bVal = b.score; break
      case 'name': aVal = a.tbName || ''; bVal = b.tbName || ''; break
      case 'type': aVal = a.tbType || ''; bVal = b.tbType || ''; break
      case 'pm': aVal = a.tbMDPM || ''; bVal = b.tbMDPM || ''; break
      case 'risks': aVal = a.riskCount; bVal = b.riskCount; break
      case 'issues': aVal = a.issueCount; bVal = b.issueCount; break
      case 'priority': aVal = a.tbPriority || ''; bVal = b.tbPriority || ''; break
      default: aVal = a.score; bVal = b.score
    }
    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal
  })

  // Summary
  const recCounts = { Continue: 0, Monitor: 0, Restructure: 0, Terminate: 0 }
  scoredProjects.forEach(p => { recCounts[p.recommendation.label]++ })

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Target className="w-8 h-8 text-indigo-600" />
          Project Prioritization Matrix
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Composite scoring for project continuation or termination decisions based on health, cost, schedule, and risk data
        </p>
      </div>

      {/* Recommendation Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-green-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-700">{recCounts.Continue}</p>
            <p className="text-sm text-green-600 font-medium">Continue</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{recCounts.Monitor}</p>
            <p className="text-sm text-amber-600 font-medium">Monitor</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-orange-700">{recCounts.Restructure}</p>
            <p className="text-sm text-orange-600 font-medium">Restructure</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-red-700">{recCounts.Terminate}</p>
            <p className="text-sm text-red-600 font-medium">Terminate</p>
          </CardContent>
        </Card>
      </div>

      {/* Scoring Legend */}
      <Card className="mb-6 border-gray-200 bg-gray-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <span className="font-medium">Composite Score</span> is calculated from 7 health indicators,
              cost/schedule variance, risk and issue counts, and completion progress.
              Lower score = healthier project. Scores above 50 warrant executive review.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prioritization Table */}
      {sorted.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No portfolio or project data available.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                {[
                  { col: 'score', label: 'Score' },
                  { col: 'name', label: 'Project Name' },
                  { col: 'type', label: 'Type' },
                  { col: 'pm', label: 'PM' },
                  { col: 'priority', label: 'Priority' },
                ].map(h => (
                  <TableHead key={h.col}>
                    <button
                      onClick={() => handleSort(h.col)}
                      className="flex items-center gap-1 font-bold text-gray-700"
                    >
                      {h.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </TableHead>
                ))}
                <TableHead className="text-center">Health</TableHead>
                <TableHead>
                  <button onClick={() => handleSort('risks')} className="flex items-center gap-1 font-bold text-gray-700">
                    Risks <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort('issues')} className="flex items-center gap-1 font-bold text-gray-700">
                    Issues <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>Cost Var.</TableHead>
                <TableHead>Sched. Var.</TableHead>
                <TableHead>% Complete</TableHead>
                <TableHead>Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((project, idx) => (
                <TableRow key={project.tbID} className={project.recommendation.rowBg}>
                  <TableCell className="text-center font-bold text-gray-500">
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${
                      project.score <= 25 ? 'bg-green-100 text-green-700' :
                      project.score <= 50 ? 'bg-amber-100 text-amber-700' :
                      project.score <= 75 ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {project.score}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{project.tbName}</div>
                    <div className="text-xs text-gray-500">{project.tbID}</div>
                  </TableCell>
                  <TableCell className="text-sm">{project.tbType}</TableCell>
                  <TableCell className="text-sm">{project.tbMDPM || '-'}</TableCell>
                  <TableCell className="text-sm">{project.tbPriority || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {['tbMDHealthOverall', 'tbMDHealthSchedule', 'tbMDHealthCost',
                        'tbMDHealthHours', 'tbMDHealthScope', 'tbMDHealthRisk', 'tbMDHealthIssues'
                      ].map(key => (
                        <div
                          key={key}
                          title={`${key.replace('tbMDHealth', '')}: ${project[key] || 'N/A'}`}
                          className={`w-4 h-4 rounded-full ${getHealthDot(project[key])}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className={`text-sm font-medium ${project.riskCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {project.riskCount}
                  </TableCell>
                  <TableCell className={`text-sm font-medium ${project.issueCount > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                    {project.issueCount}
                  </TableCell>
                  <TableCell className={`text-sm font-medium ${
                    parseFloat(project.blCostVariance) > 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {project.blCostVariance || '-'}
                  </TableCell>
                  <TableCell className={`text-sm font-medium ${
                    parseFloat(project.blFinishVariance) > 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {project.blFinishVariance || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {project.tbPercentComplete ? `${project.tbPercentComplete}%` : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${project.recommendation.color} ${project.recommendation.bg}`}>
                      {project.recommendation.label}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default PrioritizationPage
