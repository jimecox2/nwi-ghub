// app/dashboard/settings/preprocess/page.jsx
'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle, Loader2, Database, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
} from '@/app/dashboard/_components/EnterprisePageStates'
import { preprocessDashboardSourceData } from '@/lib/crud/coreCrud'

/**
 * Preprocess Resource Data Page
 * Allows users to manually trigger preprocessing of tbrescalcs2 data
 * from source pubsets into the active dashboard source.
 */
const PreprocessPage = () => {
  const { dashboardSource, session, status, isLoading, error } =
    useEnterpriseDashboardSource()

  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Preprocess Resource Data"
        icon={RefreshCw}
        message="Loading dashboard source..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="preprocessing" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Preprocess Resource Data" icon={RefreshCw} />
  }

  const hasResCalcs = Array.isArray(dashboardSource.tbrescalcs2) && dashboardSource.tbrescalcs2.length > 0
  const hasCharts = Array.isArray(dashboardSource.tbcharts) && dashboardSource.tbcharts.length > 0
  const allocationCount = Array.isArray(dashboardSource.tbmdjoined)
    ? dashboardSource.tbmdjoined.filter(row => row.tbType === 'Allocation').length
    : 0

  const handlePreprocess = async () => {
    setIsProcessing(true)
    setResult(null)

    try {
      const preprocessResult = await preprocessDashboardSourceData(dashboardSource, session.jwt)
      setResult(preprocessResult)
    } catch (err) {
      setResult({
        success: false,
        message: `Error: ${err.message}`,
        resCalcsCount: 0,
        chartsCount: 0,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600" />
          Preprocess Resource Data
        </h1>
        <p className="text-gray-600">
          Extract and reshape Allocation rows from your dashboard source for resource visualization charts
        </p>
      </div>

      {/* Current Source Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5 text-blue-600" />
            Active Dashboard Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Source Name</p>
              <p className="font-semibold">{dashboardSource.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Source Product</p>
              <p className="font-semibold">{dashboardSource.source_product || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items in tbmdjoined</p>
              <p className="font-semibold">{dashboardSource.tbmdjoined?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Allocation Rows (source for preprocessing)</p>
              <p className={`font-semibold ${allocationCount > 0 ? 'text-green-700' : 'text-amber-600'}`}>
                {allocationCount > 0 ? `${allocationCount} rows available` : 'None found'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Data Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Data Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {hasResCalcs ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium">Resource Calculations (tbrescalcs2)</p>
                <p className="text-sm text-gray-500">
                  {hasResCalcs
                    ? `${dashboardSource.tbrescalcs2.length} resource calculation records available`
                    : 'Not yet preprocessed - run preprocessing to populate'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasCharts ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className="font-medium">Burndown Chart Data (tbcharts)</p>
                <p className="text-sm text-gray-500">
                  {hasCharts
                    ? `${dashboardSource.tbcharts.length} chart entries available`
                    : 'Not yet available - burndown chart data is provided separately when available'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">What does preprocessing do?</p>
              <p className="mb-2">
                Dashboard sources contain all hierarchy levels including Allocation rows in tbmdjoined.
                Preprocessing extracts those Allocation rows and reshapes them into the resource
                calculation format (tbrescalcs2) used by the cost charts, usage charts, and other
                resource visualization reports.
              </p>
              <p>
                <strong>When to run:</strong> After creating or updating a dashboard source,
                or whenever you need resource visualization data for enterprise reports.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePreprocess}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {hasResCalcs ? 'Re-run Preprocessing' : 'Run Preprocessing'}
                </>
              )}
            </Button>
            {hasResCalcs && (
              <p className="text-sm text-gray-500">
                Re-running will replace existing preprocessed data with a fresh extraction from Allocation rows.
              </p>
            )}
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-4 p-4 rounded-lg border ${
              result.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.success ? 'Preprocessing Complete' : 'Preprocessing Failed'}
                  </p>
                  <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {result.success && (
                    <p className="text-sm text-green-600 mt-2">
                      Reload the enterprise dashboard or visualization pages to see the updated data.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PreprocessPage
