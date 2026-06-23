'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle, CheckCircle, Calendar, BarChart3, CheckCircle2, Database, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllDashboardSources, setActiveDashboardSource, getUserByEmail, getUserRole } from '@/lib/crud/coreCrud'

/**
 * Executive Dashboard Component
 * Shows high-level insights and stats from the active dashboard source
 * Only one source can be active at a time per organization
 */
const ExecutiveDashboard = ({ userEmail, jwt }) => {
  const [sources, setSources] = useState([])
  const [activeSource, setActiveSource] = useState(null)
  const [customerId, setCustomerId] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchCustomerIdAndSources()
  }, [])

  useEffect(() => {
    if (activeSource) {
      calculateStats(activeSource)
    }
  }, [activeSource])

  const fetchCustomerIdAndSources = async () => {
    setIsLoading(true)
    try {
      // Get user's Customer_id and role
      const strapiUser = await getUserByEmail(userEmail, jwt)
      const custId = strapiUser?.Customer_id || null
      setCustomerId(custId)

      const role = await getUserRole(userEmail, jwt)
      setUserRole(role)

      if (!custId) {
        setIsLoading(false)
        return
      }

      // Fetch RBAC-filtered sources only
      const dashboardSources = await getAllDashboardSources(userEmail, jwt)

      if (!dashboardSources || dashboardSources.length === 0) {
        setSources([])
        setIsLoading(false)
        return
      }

      setSources(dashboardSources)

      // Pick the active source from RBAC-filtered list only
      const active = dashboardSources.find(s => s.isActive) || null

      if (active) {
        setActiveSource(active)
      } else {
        // No active source in accessible list, set the most recent as active
        const mostRecent = dashboardSources[0]
        await setActiveDashboardSource(mostRecent.id, custId, jwt)
        setActiveSource(mostRecent)
      }
    } catch (err) {
      console.error('Error fetching dashboard sources:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const canCreate = () => {
    if (!userRole) return false
    return ['Administrator', 'Project Manager', 'Executive'].includes(userRole)
  }

  const calculateStats = (source) => {
    const projects = source.tbmdjoined || []

    // Calculate various stats
    const portfolios = projects.filter(p => p.tbType === 'Portfolio')
    const projectsOnly = projects.filter(p => p.tbType === 'Project')

    // Cost calculations
    const totalCost = projects.reduce((sum, p) => sum + (parseFloat(p.tbCost) || 0), 0)
    const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.tbBudget) || 0), 0)

    // Work hours
    const totalWork = projects.reduce((sum, p) => sum + (parseFloat(p.tbWork) || 0), 0)
    const totalBaselineWork = projects.reduce((sum, p) => sum + (parseFloat(p.tbBaselineWork) || 0), 0)

    // Find most expensive
    const mostExpensivePortfolio = portfolios.reduce((max, p) =>
      (parseFloat(p.tbCost) || 0) > (parseFloat(max.tbCost) || 0) ? p : max
    , portfolios[0] || {})

    const mostExpensiveProject = projectsOnly.reduce((max, p) =>
      (parseFloat(p.tbCost) || 0) > (parseFloat(max.tbCost) || 0) ? p : max
    , projectsOnly[0] || {})

    // Latest project (by start date)
    const latestProject = projectsOnly.reduce((latest, p) => {
      const pStart = new Date(p.tbStart || 0)
      const latestStart = new Date(latest.tbStart || 0)
      return pStart > latestStart ? p : latest
    }, projectsOnly[0] || {})

    // Project with most work hours
    const mostWorkProject = projectsOnly.reduce((max, p) =>
      (parseFloat(p.tbWork) || 0) > (parseFloat(max.tbWork) || 0) ? p : max
    , projectsOnly[0] || {})

    // Status distribution
    const statusCounts = {}
    projectsOnly.forEach(p => {
      const status = p.tbMDStatus || 'Unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    // Risk and issues
    const highRiskCount = projects.filter(p => (p.tbRisk || '').toLowerCase() === 'high').length
    const mediumRiskCount = projects.filter(p => (p.tbRisk || '').toLowerCase() === 'medium').length
    const openIssuesCount = projects.reduce((sum, p) => sum + (parseInt(p.tbIssuesOpen) || 0), 0)

    // Schedule variance (work vs baseline work)
    const scheduleVariance = ((totalWork - totalBaselineWork) / totalBaselineWork * 100) || 0

    // Budget variance
    const budgetVariance = ((totalCost - totalBudget) / totalBudget * 100) || 0

    setStats({
      totalPortfolios: portfolios.length,
      totalProjects: projectsOnly.length,
      totalCost,
      totalBudget,
      budgetVariance,
      totalWork,
      totalBaselineWork,
      scheduleVariance,
      mostExpensivePortfolio,
      mostExpensiveProject,
      latestProject,
      mostWorkProject,
      statusCounts,
      highRiskCount,
      mediumRiskCount,
      openIssuesCount,
      completedProjects: statusCounts['Completed'] || 0,
      inProgressProjects: statusCounts['In progress'] || 0,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

  if (sources.length === 0) {
    if (canCreate()) {
      return (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">No Dashboard Sources Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-2">
              Dashboard sources combine published project pubsets into a single view
              for enterprise reporting across all dashboard pages.
            </p>
            <p className="text-yellow-700">
              Create your first dashboard source by selecting pubsets from the{' '}
              <Link href="/dashboard/pubsets" className="underline font-medium hover:text-yellow-900">
                Pubsets page
              </Link>.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="w-5 h-5" />
            No Dashboard Sources Available
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-orange-700">
            You don&apos;t currently have access to any dashboard sources. This can happen when:
          </p>
          <ul className="list-disc list-inside text-sm text-orange-700 space-y-1 ml-2">
            <li>No dashboard sources have been created for your organization yet</li>
            <li>Existing sources haven&apos;t been shared with your account</li>
            <li>Your role does not include access to the available sources</li>
          </ul>
          <p className="text-orange-700 text-sm pt-1">
            Contact your Administrator or Project Manager to have a dashboard source shared with you.
            Once shared, all reports and visualizations will be available automatically.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Source Display (Green Box) */}
      {activeSource && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Active Dashboard Source</h3>
              <Link
                href="/dashboard/sources"
                className="flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-medium ml-auto"
              >
                <Database className="w-4 h-4" />
                Change Source
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-xl text-gray-900">{activeSource.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{activeSource.tbmdjoined?.length || 0} items</span>
                    {activeSource.source_product && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        activeSource.source_product === 'Agilebars' ? 'bg-purple-100 text-purple-800' :
                        activeSource.source_product === 'Timebars' ? 'bg-blue-100 text-blue-800' :
                        activeSource.source_product === 'Costbars' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activeSource.source_product}
                      </span>
                    )}
                    <span>Owner: {activeSource.owner}</span>
                  </div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolios</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPortfolios}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.inProgressProjects} in progress, {stats.completedProjects} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(stats.totalCost || 0).toLocaleString()}</div>
                <p className={`text-xs flex items-center gap-1 mt-1 ${stats.budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.budgetVariance > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stats.budgetVariance).toFixed(1)}% {stats.budgetVariance > 0 ? 'over' : 'under'} budget
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Work Hours</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.totalWork || 0).toLocaleString()}h</div>
                <p className={`text-xs flex items-center gap-1 mt-1 ${stats.scheduleVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.scheduleVariance > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stats.scheduleVariance).toFixed(1)}% variance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Risk & Issues */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.highRiskCount}</div>
                <p className="text-xs text-gray-500 mt-1">{stats.mediumRiskCount} medium risk</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.openIssuesCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Track Projects</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalProjects - stats.highRiskCount - stats.mediumRiskCount}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((stats.totalProjects - stats.highRiskCount - stats.mediumRiskCount) / stats.totalProjects * 100).toFixed(0)}% success rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Items */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most Expensive Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.mostExpensivePortfolio?.tbName ? (
                  <div>
                    <p className="font-medium text-lg">{stats.mostExpensivePortfolio.tbName}</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">
                      ${(parseFloat(stats.mostExpensivePortfolio.tbCost) || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.mostExpensivePortfolio.tbMDStatus || 'Status unknown'}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No portfolios found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most Expensive Project</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.mostExpensiveProject?.tbName ? (
                  <div>
                    <p className="font-medium text-lg">{stats.mostExpensiveProject.tbName}</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">
                      ${(parseFloat(stats.mostExpensiveProject.tbCost) || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.mostExpensiveProject.tbMDStatus || 'Status unknown'}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No projects found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Latest Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.latestProject?.tbName ? (
                  <div>
                    <p className="font-medium text-lg">{stats.latestProject.tbName}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Start: {stats.latestProject.tbStart ? new Date(stats.latestProject.tbStart).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {stats.latestProject.tbMDStatus || 'Status unknown'}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No projects found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Highest Work Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.mostWorkProject?.tbName ? (
                  <div>
                    <p className="font-medium text-lg">{stats.mostWorkProject.tbName}</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">
                      {(parseFloat(stats.mostWorkProject.tbWork) || 0).toLocaleString()}h
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.mostWorkProject.tbMDStatus || 'Status unknown'}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No projects found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Project Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(stats.statusCounts).map(([status, count]) => (
                  <div key={status} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">{status}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default ExecutiveDashboard
