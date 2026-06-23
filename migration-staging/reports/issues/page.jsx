// app/dashboard/reports/issues/page.jsx
'use client'

import { AlertOctagon } from 'lucide-react'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'
import ItemDetailsDataTable from '@/components/Dashboard/Reports/ItemDetailsDataTable'

/**
 * Enterprise Issues Log Page
 * Filters tbmdjoined rows where tbSubType === 'Issue' and displays them
 * with the risk/issue field configuration (impact, escalation, mitigation, etc.).
 */
const IssuesLogPage = () => {
  const { dashboardSource, adaptedData, session, status, isLoading, error } =
    useEnterpriseDashboardSource()

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Issues Log"
        icon={AlertOctagon}
        message="Loading issue data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the issues log" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Issues Log" icon={AlertOctagon} />
  }

  if (error) {
    return <EnterpriseError title="Issues Log" icon={AlertOctagon} error={error} />
  }

  const allRows = dashboardSource.tbmdjoined || []
  const issueRows = allRows.filter(row => row.tbSubType === 'Issue')

  // Categorize by escalation
  const escalatedCount = issueRows.filter(r =>
    r.tbMDEscalationLevel && r.tbMDEscalationLevel !== 'N/A' && r.tbMDEscalationLevel !== ''
  ).length
  const openCount = issueRows.filter(r =>
    r.tbStatus && r.tbStatus.toLowerCase() !== 'closed' && r.tbStatus.toLowerCase() !== 'resolved'
  ).length

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <AlertOctagon className="w-8 h-8 text-orange-600" />
          Issues Log
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          All tracked issues across the portfolio with impact assessment, mitigation status, and escalation tracking
        </p>
        <div className="mt-3 flex items-center gap-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            {issueRows.length} Issue{issueRows.length !== 1 ? 's' : ''} Logged
          </span>
          {openCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {openCount} Open
            </span>
          )}
          {escalatedCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              {escalatedCount} Escalated
            </span>
          )}
        </div>
      </div>

      {issueRows.length === 0 ? (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <AlertOctagon className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-green-800 font-medium">No issues logged</p>
          <p className="text-green-600 text-sm mt-1">
            No items with Sub-Type &quot;Issue&quot; found in this dashboard source.
            Issues are created in the source project tools (Timebars, Costbars, or Agilebars)
            and published to the enterprise dashboard.
          </p>
        </div>
      ) : (
        <ItemDetailsDataTable
          data={issueRows}
          allPlannedRows={allRows}
          currrentUser={session.user.name}
          token={session.jwt}
          userEmail={session.user.email}
          reportType="risk"
        />
      )}
    </div>
  )
}

export default IssuesLogPage
