// app/dashboard/reports/resources/page.jsx
'use client'

import { Users, AlertTriangle } from 'lucide-react'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'

/**
 * Enterprise Resource Pool Report
 * Shows tabular view of resource pool from the active dashboard source.
 *
 * Uses shared hook for consistent loading/caching behaviour.
 * Detects Agilebars pubsets and shows info-only disclaimer since Agilebars
 * uses task data directly rather than the resource pool.
 */
const ResourceReportsPage = () => {
  const { dashboardSource, session, status, isLoading, error } =
    useEnterpriseDashboardSource()

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Resource Pool Report"
        icon={Users}
        message="Loading resource data..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="the resource pool report" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Resource Pool Report" icon={Users} />
  }

  if (error) {
    return <EnterpriseError title="Resource Pool Report" icon={Users} error={error} />
  }

  const resources = Array.isArray(dashboardSource.tbresources) ? dashboardSource.tbresources : []

  // Detect Agilebars pubsets
  const agilebarsPubsets = dashboardSource?.tbdocuments?.filter(p => p.source_product === 'Agilebars') || []
  const hasAgilebars = agilebarsPubsets.length > 0

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Resource Pool Report
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Resource capacity and allocation from active dashboard source
        </p>
      </div>

      {/* Agilebars warning banner */}
      {hasAgilebars && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
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
                task data directly. Resource pool reports require resource-loaded schedules
                from the <span className="font-medium">Timebars</span> or <span className="font-medium">Costbars</span> products.
              </p>
              <p className="text-amber-700 text-sm">
                To use resource reports, create a dashboard source using Timebars or Costbars pubsets.
                {resources.length > 0 && (
                  <> The resource pool data below is shown for information only.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            No resource pool data available in this dashboard source.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Short Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cell Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Finish Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Manager</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Supervisor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Team Leader</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Pay Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cost Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Resource Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Resource Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Labour Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Primary Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Primary Skill</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">PT/FT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Availability %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Calendar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Days Not Available</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.map((resource, index) => (
                  <tr key={resource.tbResID || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{resource.tbResID || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{resource.tbResName || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResNameShort || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResTeam || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResEmail || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResPhoneNo || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResCellPhoneNo || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResStart || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResFinish || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResManager || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResSupervisor || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResTeamLeader || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResDepartment || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResLocation || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResPayRate ? `$${resource.tbResPayRate}` : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResCostCode || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResResourceType || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResResourceClass || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResLabourType || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResPrimaryRole || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResPrimarySkill || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResPartTimeFullTime || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResQuantity || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResPercentGeneralAvailability ? `${resource.tbResPercentGeneralAvailability}%` : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{resource.tbResResourceCalendar || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{resource.tbResDaysNotAvailableByMonth || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{resource.tbResRemarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Total Resources:</strong> {resources.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourceReportsPage
