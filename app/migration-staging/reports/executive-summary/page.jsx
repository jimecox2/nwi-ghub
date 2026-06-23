// app/dashboard/reports/executive-summary/page.jsx
'use client'

import { useState } from 'react'
import { Briefcase, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'

/**
 * Executive Portfolio Summary
 *
 * A PPM decision-making dashboard showing each Portfolio/Project with:
 * - 7-dimension health indicators (colored circles)
 * - Key financials: planned vs actual cost, cost variance
 * - Schedule status: planned vs actual dates, schedule variance
 * - Resource status: planned vs actual work
 * - Risk/issue counts per project
 * - Priority and weighting
 * - Overall status classification (On Track / At Risk / Critical)
 *
 * Designed for executive decision makers who need to assess project health
 * and recommend which projects to continue, watch, or terminate.
 */

const healthLabels = [
  { key: 'tbMDHealthOverall', label: 'Overall' },
  { key: 'tbMDHealthSchedule', label: 'Schedule' },
  { key: 'tbMDHealthCost', label: 'Cost' },
  { key: 'tbMDHealthHours', label: 'Hours' },
  { key: 'tbMDHealthScope', label: 'Scope' },
  { key: 'tbMDHealthRisk', label: 'Risk' },
  { key: 'tbMDHealthIssues', label: 'Issues' },
]

const getHealthColor = (value) => {
  if (!value || value === 'N/A') return 'bg-gray-300'
  if (value === 'Not Assessed') return 'bg-orange-400'
  const v = value.toLowerCase()
  if (v === 'green') return 'bg-green-500'
  if (v === 'amber' || v === 'yellow' || v === 'orange') return 'bg-amber-500'
  if (v === 'red') return 'bg-red-500'
  return 'bg-gray-300'
}

const getHealthScore = (value) => {
  if (!value || value === 'N/A' || value === 'Not Assessed') return 0
  const v = value.toLowerCase()
  if (v === 'green') return 1
  if (v === 'amber' || v === 'yellow' || v === 'orange') return 2
  if (v === 'red') return 3
  return 0
}

const classifyProject = (project, riskCount, issueCount) => {
  // Calculate composite health score (0 = no data, higher = worse)
  const healthScores = healthLabels.map(h => getHealthScore(project[h.key]))
  const assessedScores = healthScores.filter(s => s > 0)
  const avgHealth = assessedScores.length > 0
    ? assessedScores.reduce((a, b) => a + b, 0) / assessedScores.length
    : 0

  // Check cost variance
  const costVar = parseFloat(project.blCostVariance) || 0
  const schedVar = parseFloat(project.blFinishVariance) || 0

  // Count red indicators
  const redCount = healthLabels.filter(h => {
    const v = project[h.key]
    return v && v.toLowerCase() === 'red'
  }).length

  // Critical: 2+ red indicators, or very high cost overrun
  if (redCount >= 2 || costVar > 20 || avgHealth >= 2.5) {
    return { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', icon: XCircle }
  }
  // At Risk: any red indicator, any amber, or moderate variance
  if (redCount >= 1 || avgHealth >= 1.5 || costVar > 10 || riskCount > 3 || issueCount > 5) {
    return { label: 'At Risk', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', icon: AlertTriangle }
  }
  // On Track
  return { label: 'On Track', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300', icon: CheckCircle }
}

const formatNumber = (val) => {
  const num = parseFloat(val)
  if (isNaN(num)) return '-'
  if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toFixed(0)
}

const ExecutiveSummaryPage = () => {
  const { dashboardSource, session, status, isLoading, error } =
    useEnterpriseDashboardSource()
  const [expandedId, setExpandedId] = useState(null)
  const [sortBy, setSortBy] = useState('status') // status, name, cost, priority

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Executive Portfolio Summary"
        icon={Briefcase}
        message="Loading portfolio data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the executive summary" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Executive Portfolio Summary" icon={Briefcase} />
  }

  if (error) {
    return <EnterpriseError title="Executive Portfolio Summary" icon={Briefcase} error={error} />
  }

  const allRows = dashboardSource.tbmdjoined || []

  // Get Portfolio and Project level items
  const projectRows = allRows.filter(row =>
    row.tbType === 'Portfolio' || row.tbType === 'Project'
  )

  // Count risks and issues per project (by tbL2 project name)
  const risksByProject = {}
  const issuesByProject = {}
  allRows.forEach(row => {
    const proj = row.tbL2 || row.tbL1 || 'Unknown'
    if (row.tbSubType === 'Risk') {
      risksByProject[proj] = (risksByProject[proj] || 0) + 1
    }
    if (row.tbSubType === 'Issue') {
      issuesByProject[proj] = (issuesByProject[proj] || 0) + 1
    }
  })

  // Build enriched project cards
  const projectCards = projectRows.map(project => {
    const projName = project.tbL2 || project.tbL1 || project.tbName || 'Unknown'
    const riskCount = risksByProject[projName] || 0
    const issueCount = issuesByProject[projName] || 0
    const classification = classifyProject(project, riskCount, issueCount)

    return {
      ...project,
      riskCount,
      issueCount,
      classification,
    }
  })

  // Sort projects
  const sortedCards = [...projectCards].sort((a, b) => {
    if (sortBy === 'status') {
      const statusOrder = { 'Critical': 0, 'At Risk': 1, 'On Track': 2 }
      return (statusOrder[a.classification.label] || 2) - (statusOrder[b.classification.label] || 2)
    }
    if (sortBy === 'name') return (a.tbName || '').localeCompare(b.tbName || '')
    if (sortBy === 'cost') return (parseFloat(b.tbCost) || 0) - (parseFloat(a.tbCost) || 0)
    if (sortBy === 'priority') return (a.tbPriority || '').localeCompare(b.tbPriority || '')
    return 0
  })

  // Summary counts
  const criticalCount = projectCards.filter(p => p.classification.label === 'Critical').length
  const atRiskCount = projectCards.filter(p => p.classification.label === 'At Risk').length
  const onTrackCount = projectCards.filter(p => p.classification.label === 'On Track').length

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-blue-800" />
          Executive Portfolio Summary
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Portfolio health overview for executive decision making &mdash; assess which projects to continue, watch, or recommend for termination
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-gray-200">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{projectCards.length}</p>
            <p className="text-sm text-gray-500">Total Projects</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-green-700">{onTrackCount}</p>
            <p className="text-sm text-green-600">On Track</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-amber-700">{atRiskCount}</p>
            <p className="text-sm text-amber-600">At Risk</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-3xl font-bold text-red-700">{criticalCount}</p>
            <p className="text-sm text-red-600">Critical</p>
          </CardContent>
        </Card>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-600 font-medium">Sort by:</span>
        {[
          { value: 'status', label: 'Status (Critical First)' },
          { value: 'name', label: 'Name' },
          { value: 'cost', label: 'Cost (Highest)' },
          { value: 'priority', label: 'Priority' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              sortBy === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Project Cards */}
      {sortedCards.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No portfolio or project data available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCards.map((project) => {
            const StatusIcon = project.classification.icon
            const isExpanded = expandedId === project.tbID

            return (
              <Card
                key={project.tbID}
                className={`${project.classification.border} ${project.classification.bg} transition-all duration-200`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <StatusIcon className={`w-5 h-5 ${project.classification.color}`} />
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${project.classification.color} ${project.classification.bg}`}>
                          {project.classification.label}
                        </span>
                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                          {project.tbType}
                        </span>
                        {project.tbPriority && (
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                            Priority: {project.tbPriority}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg text-gray-900">
                        {project.tbID}: {project.tbName}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        {project.tbMDPM && <span>PM: {project.tbMDPM}</span>}
                        {project.tbMDPhase && <span>Phase: {project.tbMDPhase}</span>}
                        {project.tbMDStage && <span>Stage: {project.tbMDStage}</span>}
                        {project.tbMDSponsoringDepartment && <span>Sponsor: {project.tbMDSponsoringDepartment}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : project.tbID)}
                      className="p-1 rounded hover:bg-white/50 transition-colors"
                    >
                      {isExpanded
                        ? <ChevronUp className="w-5 h-5 text-gray-500" />
                        : <ChevronDown className="w-5 h-5 text-gray-500" />
                      }
                    </button>
                  </div>

                  {/* Health Indicators */}
                  <div className="flex items-center gap-3 mt-3">
                    {healthLabels.map(h => (
                      <div key={h.key} className="flex flex-col items-center">
                        <div
                          title={`${h.label}: ${project[h.key] || 'N/A'}`}
                          className={`w-6 h-6 rounded-full ${getHealthColor(project[h.key])}`}
                        />
                        <span className="text-[10px] text-gray-500 mt-0.5">{h.label}</span>
                      </div>
                    ))}

                    <div className="ml-4 flex items-center gap-3 text-sm">
                      {project.riskCount > 0 && (
                        <span className="text-red-600 font-medium">{project.riskCount} Risk{project.riskCount !== 1 ? 's' : ''}</span>
                      )}
                      {project.issueCount > 0 && (
                        <span className="text-orange-600 font-medium">{project.issueCount} Issue{project.issueCount !== 1 ? 's' : ''}</span>
                      )}
                      {project.riskCount === 0 && project.issueCount === 0 && (
                        <span className="text-green-600 text-xs">No risks or issues</span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Details */}
                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      {/* Schedule */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Schedule</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start</span>
                            <span className="font-medium">{project.tbStart || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Finish</span>
                            <span className="font-medium">{project.tbFinish || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual Start</span>
                            <span className="font-medium">{project.tbAStart || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual Finish</span>
                            <span className="font-medium">{project.tbAFinish || '-'}</span>
                          </div>
                          {project.blStartVariance && (
                            <div className="flex justify-between border-t pt-1">
                              <span className="text-gray-600">Start Variance</span>
                              <span className={`font-medium ${parseFloat(project.blStartVariance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {project.blStartVariance}
                              </span>
                            </div>
                          )}
                          {project.blFinishVariance && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Finish Variance</span>
                              <span className={`font-medium ${parseFloat(project.blFinishVariance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {project.blFinishVariance}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cost */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Cost &amp; Budget</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Planned Cost</span>
                            <span className="font-medium">{formatNumber(project.tbCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual Cost</span>
                            <span className="font-medium">{formatNumber(project.tbACost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cost Remaining</span>
                            <span className="font-medium">{formatNumber(project.tbCostRemaining)}</span>
                          </div>
                          {project.blCostVariance && (
                            <div className="flex justify-between border-t pt-1">
                              <span className="text-gray-600">Cost Variance</span>
                              <span className={`font-medium ${parseFloat(project.blCostVariance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {project.blCostVariance}
                              </span>
                            </div>
                          )}
                          {project.blCost && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Baseline Cost</span>
                              <span className="font-medium">{formatNumber(project.blCost)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Resources & Effort */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Resources &amp; Effort</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Planned Work</span>
                            <span className="font-medium">{formatNumber(project.tbWork)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual Work</span>
                            <span className="font-medium">{formatNumber(project.tbAWork)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Work Remaining</span>
                            <span className="font-medium">{formatNumber(project.tbWorkRemaining)}</span>
                          </div>
                          {project.tbPercentComplete && (
                            <div className="flex justify-between border-t pt-1">
                              <span className="text-gray-600">% Complete</span>
                              <span className="font-medium">{project.tbPercentComplete}%</span>
                            </div>
                          )}
                          {project.tbMDWeighting && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Weighting</span>
                              <span className="font-medium">{project.tbMDWeighting}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description and Notes */}
                    {(project.tbMDDescription || project.tbMDNotes) && (
                      <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                        {project.tbMDDescription && (
                          <div className="mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">Description</span>
                            <p className="text-sm text-gray-700 mt-1">{project.tbMDDescription}</p>
                          </div>
                        )}
                        {project.tbMDNotes && (
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Status Notes</span>
                            <p className="text-sm text-gray-700 mt-1">{project.tbMDNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ExecutiveSummaryPage
