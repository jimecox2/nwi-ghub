'use client'

import { Loader2, AlertCircle } from 'lucide-react'

/**
 * Shared loading, error, and empty states for enterprise report pages.
 * Eliminates repeated boilerplate across enterprise report pages.
 */

export const EnterpriseLoading = ({ title, icon: Icon, message = 'Loading data...' }) => (
  <div className="container mx-auto p-6">
    {title && (
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        {Icon && <Icon className="w-8 h-8 text-blue-600" />}
        {title}
      </h1>
    )}
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="ml-3 text-gray-600">{message}</span>
    </div>
  </div>
)

export const EnterpriseUnauthenticated = ({ reportName = 'reports' }) => (
  <div className="container mx-auto p-6">
    <div className="text-center py-12">
      <p className="text-red-600">Please sign in to view {reportName}.</p>
    </div>
  </div>
)

export const EnterpriseNoSource = ({ title, icon: Icon }) => (
  <div className="container mx-auto p-6">
    {title && (
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        {Icon && <Icon className="w-8 h-8 text-blue-600" />}
        {title}
      </h1>
    )}
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
        <div>
          <p className="text-yellow-900 font-semibold mb-2">
            No Dashboard Source Available
          </p>
          <p className="text-yellow-800 mb-3">
            You need to create a dashboard source before you can view this report.
          </p>
          <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1 mb-4">
            <li>Go to <a href="/dashboard/pubsets" className="underline font-medium hover:text-yellow-900">Make Sources</a></li>
            <li>Select the project pubsets you want to analyze</li>
            <li>Click &quot;Generate Dashboard Source&quot;</li>
            <li>Review and save your dashboard source</li>
            <li>Return here to view the report</li>
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

export const EnterpriseError = ({ title, icon: Icon, error }) => (
  <div className="container mx-auto p-6">
    {title && (
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        {Icon && <Icon className="w-8 h-8 text-blue-600" />}
        {title}
      </h1>
    )}
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800">
        <strong>Error loading dashboard source:</strong> {error}
      </p>
    </div>
  </div>
)
