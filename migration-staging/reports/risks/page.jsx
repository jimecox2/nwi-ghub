// app/dashboard/reports/risks/page.jsx
'use client'

import { ShieldAlert } from 'lucide-react'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'
import ItemDetailsDataTable from '@/components/Dashboard/Reports/ItemDetailsDataTable'

/**
 * Enterprise Risk Register Page
 * Filters tbmdjoined rows where tbSubType === 'Risk' and displays them
 * with the risk-specific field configuration (probability, impact, score,
 * mitigation plan, response strategy, escalation level, etc.).
 */
const RiskRegisterPage = () => {
  const { dashboardSource, adaptedData, session, status, isLoading, error } =
    useEnterpriseDashboardSource()

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Risk Register"
        icon={ShieldAlert}
        message="Loading risk data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the risk register" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Risk Register" icon={ShieldAlert} />
  }

  if (error) {
    return <EnterpriseError title="Risk Register" icon={ShieldAlert} error={error} />
  }

  const allRows = dashboardSource.tbmdjoined || []
  const riskRows = allRows.filter(row => row.tbSubType === 'Risk')

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          Risk Register
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          All identified risks across the portfolio with probability, impact scoring, and mitigation plans
        </p>
        <div className="mt-3 flex items-center gap-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {riskRows.length} Risk{riskRows.length !== 1 ? 's' : ''} Identified
          </span>
          {riskRows.filter(r => r.tbMDEscalationLevel && r.tbMDEscalationLevel !== 'N/A').length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
              {riskRows.filter(r => r.tbMDEscalationLevel && r.tbMDEscalationLevel !== 'N/A').length} Escalated
            </span>
          )}
        </div>
      </div>

      {riskRows.length === 0 ? (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <ShieldAlert className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-green-800 font-medium">No risks registered</p>
          <p className="text-green-600 text-sm mt-1">
            No items with Sub-Type &quot;Risk&quot; found in this dashboard source.
            Risks are created in the source project tools (Timebars, Costbars, or Agilebars)
            and published to the enterprise dashboard.
          </p>
        </div>
      ) : (
        <ItemDetailsDataTable
          data={riskRows}
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

export default RiskRegisterPage
