// app/dashboard/reports/change-requests/page.jsx
'use client'

import { FilePenLine } from 'lucide-react'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'
import ItemDetailsDataTable from '@/components/Dashboard/Reports/ItemDetailsDataTable'

/**
 * Enterprise Change Requests Page
 * Filters tbmdjoined rows where tbSubType === 'Change Request' and displays them
 * with the risk/issue field configuration.
 *
 * Change Requests are created in the source project tools when a formal change
 * to scope, schedule, or budget is proposed. They follow the same data model
 * as Risks and Issues but with tbSubType = 'Change Request'.
 */
const ChangeRequestsPage = () => {
  const { dashboardSource, adaptedData, session, status, isLoading, error } =
    useEnterpriseDashboardSource()

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Change Requests"
        icon={FilePenLine}
        message="Loading change request data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="change requests" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Change Requests" icon={FilePenLine} />
  }

  if (error) {
    return <EnterpriseError title="Change Requests" icon={FilePenLine} error={error} />
  }

  const allRows = dashboardSource.tbmdjoined || []
  const crRows = allRows.filter(row => row.tbSubType === 'Change Request')

  const approvedCount = crRows.filter(r =>
    r.tbStatus && r.tbStatus.toLowerCase() === 'approved'
  ).length
  const pendingCount = crRows.filter(r =>
    r.tbStatus && (r.tbStatus.toLowerCase() === 'pending' || r.tbStatus.toLowerCase() === 'submitted')
  ).length

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FilePenLine className="w-8 h-8 text-violet-600" />
          Change Requests
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Formal change requests to project scope, schedule, or budget across the portfolio
        </p>
        <div className="mt-3 flex items-center gap-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
            {crRows.length} Change Request{crRows.length !== 1 ? 's' : ''}
          </span>
          {approvedCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {approvedCount} Approved
            </span>
          )}
          {pendingCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {pendingCount} Pending
            </span>
          )}
        </div>
      </div>

      {crRows.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <FilePenLine className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No change requests found</p>
          <p className="text-gray-500 text-sm mt-1">
            No items with Sub-Type &quot;Change Request&quot; found in this dashboard source.
            Change requests are created in the source project tools when formal changes
            to scope, schedule, or budget are proposed.
          </p>
        </div>
      ) : (
        <ItemDetailsDataTable
          data={crRows}
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

export default ChangeRequestsPage
