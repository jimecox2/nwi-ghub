// app/dashboard/reports/projects/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, FileText, AlertCircle } from 'lucide-react'
import { getActiveDashboardSource, getUserByEmail } from '@/lib/crud/coreCrud'
import ItemDetailsDataTable from '@/components/Dashboard/Reports/ItemDetailsDataTable'

/**
 * Enterprise Project Reports Page
 * Shows project status report from the active dashboard source
 * The active source is managed via isActive field in dashboard-sources
 */
const ProjectReportsPage = () => {
  const { data: session, status } = useSession()

  const [dashboardSource, setDashboardSource] = useState(null)
  const [customerId, setCustomerId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchActiveDashboardSource = async () => {
      if (status !== 'authenticated') {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Get user's Customer_id
        const strapiUser = await getUserByEmail(session.user.email, session.jwt)
        const custId = strapiUser?.Customer_id || null
        setCustomerId(custId)

        if (!custId) {
          console.error('No Customer_id found for user')
          setDashboardSource(null)
          setIsLoading(false)
          return
        }

        // Get the active dashboard source
        const activeSource = await getActiveDashboardSource(custId, session.jwt)
        setDashboardSource(activeSource)
      } catch (err) {
        console.error('Error fetching active dashboard source:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveDashboardSource()
  }, [status, session])

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Project Status Report
        </h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading project data...</span>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Please sign in to view project reports.</p>
        </div>
      </div>
    )
  }

  if (!dashboardSource) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Project Status Report
        </h1>
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-yellow-900 font-semibold mb-2">
                No Dashboard Source Available
              </p>
              <p className="text-yellow-800 mb-3">
                You need to create a dashboard source before you can view project reports.
              </p>
              <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1 mb-4">
                <li>Go to <a href="/dashboard/pubsets" className="underline font-medium hover:text-yellow-900">Make Sources</a></li>
                <li>Select the project pubsets you want to analyze</li>
                <li>Click "Generate Dashboard Source"</li>
                <li>Review and save your dashboard source</li>
                <li>Return here to view project reports</li>
              </ol>
              <a
                href="/dashboard/pubsets"
                className="inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Dashboard Source
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Project Status Report
        </h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">
            <strong>Error loading dashboard source:</strong> {error}
          </p>
        </div>
      </div>
    )
  }

  const projectData = dashboardSource.tbmdjoined || []
  const filteredData = projectData.filter(item =>
    item.tbType === 'Portfolio' || item.tbType === 'Project'
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Project Status Report
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
      </div>

      {filteredData.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            No portfolio or project data available in this dashboard source.
          </p>
        </div>
      ) : (
        <ItemDetailsDataTable
          data={filteredData}
          allPlannedRows={filteredData}
          currrentUser={session.user.name}
          token={session.jwt}
          userEmail={session.user.email}
          reportType="default"
        />
      )}
    </div>
  )
}

export default ProjectReportsPage
