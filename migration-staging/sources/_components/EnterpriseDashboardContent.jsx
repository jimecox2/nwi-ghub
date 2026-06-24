'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ConsolidatedReportComponent from "@/components/Dashboard/Reports/ConsolidatedReportComponent.jsx"
import { getAllDashboardSources } from '@/lib/crud/coreCrud'

/**
 * Enterprise Dashboard Content Component
 * Displays the data from the selected dashboard source
 */
const EnterpriseDashboardContent = ({ selectedSourceId, userEmail, jwt }) => {
  const [dashboardSource, setDashboardSource] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (selectedSourceId) {
      fetchDashboardSource()
    } else {
      setDashboardSource(null)
    }
  }, [selectedSourceId])

  const fetchDashboardSource = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch dashboard sources directly from Strapi using CRUD function
      const dashboardSources = await getAllDashboardSources(userEmail, jwt)
      const source = dashboardSources?.find(s => s.id.toString() === selectedSourceId)

      if (!source) {
        throw new Error('Dashboard source not found')
      }

      setDashboardSource(source)

    } catch (err) {
      console.error('Error fetching dashboard source:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedSourceId) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600 text-center">
            Select a dashboard source above to view your enterprise project data
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading dashboard data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Error loading dashboard</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!dashboardSource || !dashboardSource.tbmdjoined || dashboardSource.tbmdjoined.length === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="py-8">
          <p className="text-yellow-900 text-center">
            No data available in this dashboard source
          </p>
        </CardContent>
      </Card>
    )
  }

  // Create a pseudo-pubset object for compatibility with ConsolidatedReportComponent
  const pseudoPubsets = [{
    id: dashboardSource.id,
    name: dashboardSource.name,
    owner: dashboardSource.owner,
    source_product: dashboardSource.source_product,
    publish_status: dashboardSource.publish_status,
    aggregation_level: dashboardSource.aggregation_level,
    division: dashboardSource.division,
    cost_center: dashboardSource.cost_center,
    geographic_region: dashboardSource.geographic_region,
  }]

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Portfolio and Project Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">
                {dashboardSource.tbmdjoined.length}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Portfolios</p>
              <p className="text-2xl font-bold text-green-900">
                {dashboardSource.tbmdjoined.filter(item => item.tbType === 'Portfolio').length}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Projects</p>
              <p className="text-2xl font-bold text-purple-900">
                {dashboardSource.tbmdjoined.filter(item => item.tbType === 'Project').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consolidated Report Component */}
      <ConsolidatedReportComponent
        data={dashboardSource.tbmdjoined}
        pubsets={pseudoPubsets}
        token={jwt}
        userEmail={userEmail}
      />
    </div>
  )
}

export default EnterpriseDashboardContent
