// app/dashboard/visualizations/usage-charts/page.jsx
'use client'

import { BarChart3, AlertTriangle } from 'lucide-react'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'
import ResourceUsageChart from '@/components/Dashboard/Charts/ResourceUsageChart'

/**
 * Enterprise Resource Usage Charts Page
 * Reuses the existing ResourceUsageChart component (bar charts).
 *
 * Data requirement: tbrescalcs2 (resource calculations) from dashboard source.
 * Available after running preprocessing from Settings > Preprocess Resource Data.
 */
const UsageChartsPage = () => {
  const { dashboardSource, adaptedData, session, status, isLoading, error } =
    useEnterpriseDashboardSource()

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Resource Usage Charts"
        icon={BarChart3}
        message="Loading usage data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="usage charts" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Resource Usage Charts" icon={BarChart3} />
  }

  if (error) {
    return <EnterpriseError title="Resource Usage Charts" icon={BarChart3} error={error} />
  }

  // Detect Agilebars pubsets — resource reports don't work with Agilebars data
  const agilebarsPubsets = dashboardSource?.tbdocuments?.filter(p => p.source_product === 'Agilebars') || []
  if (agilebarsPubsets.length > 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Resource Usage Charts
          </h1>
          <p className="text-gray-600">
            Source: <span className="font-medium">{dashboardSource.name}</span>
          </p>
        </div>
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 font-semibold mb-2">
                Resource Reports Not Available for Agilebars
              </p>
              <p className="text-amber-800 text-sm mb-2">
                This dashboard source includes Agilebars pubset{agilebarsPubsets.length > 1 ? 's' : ''}:{' '}
                <span className="font-medium">{agilebarsPubsets.map(p => p.name).join(', ')}</span>.
              </p>
              <p className="text-amber-800 text-sm mb-2">
                The Agilebars product does not use the resource pool for scheduling &mdash; it uses
                task data directly. Resource usage analysis requires resource-loaded schedules
                from the <span className="font-medium">Timebars</span> or <span className="font-medium">Costbars</span> products.
              </p>
              <p className="text-amber-700 text-sm">
                To use this report, create a dashboard source using Timebars or Costbars pubsets.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quick check: does the source data contain any Allocation rows?
  const allRows = adaptedData?.allRows || []
  const allocationCount = allRows.filter(r => r.tbType === 'Allocation').length

  if (allocationCount === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Resource Usage Charts
          </h1>
          <p className="text-gray-600">
            Source: <span className="font-medium">{dashboardSource.name}</span>
          </p>
        </div>
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 font-semibold mb-2">
                No Resource Allocations Found
              </p>
              <p className="text-amber-800 text-sm mb-2">
                This dashboard source does not contain any Allocation rows in the schedule data.
                Resource usage charts require tasks with resource allocations assigned in your
                Timebars or Costbars schedules.
              </p>
              <p className="text-amber-700 text-sm">
                Ensure your source pubsets include resource-loaded schedules with allocations.
                Resource data is preprocessed automatically when a dashboard source is created.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { resCalcs } = adaptedData

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Resource Usage Charts
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Resource utilization by name, project, role, skill, location, and department
        </p>
      </div>

      {!resCalcs || resCalcs.length === 0 ? (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-amber-900 font-semibold mb-2">
                Resource Calculation Data Not Available
              </p>
              <p className="text-amber-800 text-sm">
                Resource usage charts require resource calculation data which has not been
                preprocessed for this dashboard source yet. Run{' '}
                <a href="/dashboard/settings/preprocess" className="underline font-medium hover:text-amber-900">
                  Preprocess Resource Data
                </a>
                {' '}from the Settings menu to fetch this data from your source pubsets.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <ResourceUsageChart data={resCalcs} fieldName="tbName" fieldLabel="Resource Name" />
          <ResourceUsageChart data={resCalcs} fieldName="tbL2" fieldLabel="Project (L2)" />
          <ResourceUsageChart data={resCalcs} fieldName="tbMDPrimaryRole" fieldLabel="Resource Role" />
          <ResourceUsageChart data={resCalcs} fieldName="tbMDPrimarySkill" fieldLabel="Primary Skill" />
          <ResourceUsageChart data={resCalcs} fieldName="tbMDLocation" fieldLabel="Resource Location" />
          <ResourceUsageChart data={resCalcs} fieldName="tbMDDepartment" fieldLabel="Department" />
        </div>
      )}
    </div>
  )
}

export default UsageChartsPage
