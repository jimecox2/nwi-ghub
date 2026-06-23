// app/dashboard/reports/variance/page.jsx
'use client'

import { GitCompare } from 'lucide-react'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'
import ItemDetailsDataTable from '@/components/Dashboard/Reports/ItemDetailsDataTable'

/**
 * Enterprise Variance Report Page
 * Shows variance report (current vs baseline) from the active dashboard source.
 * Reuses the existing ItemDetailsDataTable with reportType="variance".
 *
 * The bl* variance fields (blStart, blFinish, blStartVariance, blCostVariance, etc.)
 * are embedded directly in each tbmdjoined row, so no separate tbbaseline array
 * is needed for this report to display correctly.
 */
const VarianceReportPage = () => {
  const { dashboardSource, adaptedData, session, status, isLoading, error } =
    useEnterpriseDashboardSource()

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Variance Report"
        icon={GitCompare}
        message="Loading variance data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="variance reports" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Variance Report" icon={GitCompare} />
  }

  if (error) {
    return <EnterpriseError title="Variance Report" icon={GitCompare} error={error} />
  }

  const { allRows, allPlannedRows } = adaptedData

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-blue-600" />
          Variance Report
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Compare current project data against baseline plans to identify schedule and cost deviations
        </p>
      </div>

      {allRows.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <GitCompare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            No project data available in this dashboard source.
          </p>
        </div>
      ) : (
        <ItemDetailsDataTable
          data={allRows}
          allPlannedRows={allPlannedRows}
          currrentUser={session.user.name}
          token={session.jwt}
          userEmail={session.user.email}
          reportType="variance"
        />
      )}
    </div>
  )
}

export default VarianceReportPage
