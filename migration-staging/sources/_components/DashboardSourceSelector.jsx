'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, Database, Trash2, Share2, AlertCircle, CheckCircle2, Info, Download } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { getAllDashboardSources, deleteDashboardSource, getUserRole, setActiveDashboardSource } from '@/lib/crud/coreCrud'
import { buildInflightRollupSummary } from '@/lib/crud/inflightRollup'
import { FULL_ACCESS_ADMIN_TOKEN } from '@/config/index'
import ShareDialog from './ShareDialog'

/**
 * Dashboard Source Selector Component
 * Simple page for managing dashboard sources — view active source, switch, delete, share.
 */
const DashboardSourceSelector = ({ userEmail, jwt, customerId }) => {
  const [sources, setSources] = useState([])
  const [activeSource, setActiveSource] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [sourceToShare, setSourceToShare] = useState(null)

  useEffect(() => {
    fetchDashboardSources()
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    try {
      const role = await getUserRole(userEmail, jwt)
      setUserRole(role)
    } catch (err) {
      console.error('Error fetching user role:', err)
    }
  }

  const fetchDashboardSources = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const dashboardSources = await getAllDashboardSources(userEmail, jwt)
      setSources(dashboardSources || [])

      if (!customerId) {
        console.error('No Customer_id provided')
        setIsLoading(false)
        return
      }

      // Find the active source only among sources this user can access
      const active = dashboardSources?.find(s => s.isActive) || null

      if (active) {
        setActiveSource(active)
      } else if (dashboardSources && dashboardSources.length > 0) {
        const mostRecent = dashboardSources[0]
        await setActiveDashboardSource(mostRecent.id, customerId, jwt)
        setActiveSource(mostRecent)
      }
    } catch (err) {
      console.error('Error fetching dashboard sources:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSourceChange = async (sourceId) => {
    if (!customerId) {
      console.error('No Customer_id available')
      return
    }

    try {
      await setActiveDashboardSource(sourceId, customerId, jwt)
      const source = sources.find(s => s.id.toString() === sourceId)
      setActiveSource(source)
    } catch (err) {
      console.error('Error setting active source:', err)
      alert('Failed to set active source')
    }
  }

  const canCreate = () => {
    if (!userRole) return false
    return ['Administrator', 'Project Manager', 'Executive'].includes(userRole)
  }

  const canShare = () => {
    if (!userRole) return false
    return ['Administrator', 'Project Manager', 'Executive'].includes(userRole)
  }

  const canDelete = (source) => {
    if (!source || !userRole) return false
    if (userRole === 'Administrator') return true
    if (userRole === 'Project Manager' || userRole === 'Executive') {
      return source.owner === userEmail
    }
    return false
  }

  const handleShare = (source) => {
    setSourceToShare(source)
    setIsShareDialogOpen(true)
  }

  const handleShareSuccess = () => {
    fetchDashboardSources()
  }

  const handleDownloadCsv = () => {
    if (!activeSource) return

    const downloadCsv = (rows, filename) => {
      if (!Array.isArray(rows) || rows.length === 0) return
      const headers = Object.keys(rows[0])
      const escape = v => {
        if (v === null || v === undefined) return ''
        const str = typeof v === 'object' ? JSON.stringify(v) : String(v)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }
      const csv = [
        headers.join(','),
        ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }

    downloadCsv(activeSource.tb, 'tbTimebars.csv')
    downloadCsv(activeSource.tbmd, 'tbMetaData.csv')
  }

  const handleDownloadSummaryCsv = () => {
    if (!activeSource?.tbmdjoined) return

    const downloadCsv = (rows, filename) => {
      if (!Array.isArray(rows) || rows.length === 0) return
      const headers = Object.keys(rows[0])
      const escape = v => {
        if (v === null || v === undefined) return ''
        const str = typeof v === 'object' ? JSON.stringify(v) : String(v)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }
      const csv = [
        headers.join(','),
        ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }

    const summary = buildInflightRollupSummary(activeSource.tbmdjoined)
    if (!summary) return
    downloadCsv(summary.tb, 'tbTimebars_summary.csv')
    downloadCsv(summary.tbmd, 'tbMetaData_summary.csv')
  }

  const handleDelete = async () => {
    if (!activeSource) {
      alert('No dashboard source selected')
      return
    }

    if (!canDelete(activeSource)) {
      alert('You do not have permission to delete this source')
      return
    }

    const confirmMessage = `Are you sure you want to delete "${activeSource?.name}"?\n\nThis action cannot be undone.`

    if (!window.confirm(confirmMessage)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteDashboardSource(activeSource.id, FULL_ACCESS_ADMIN_TOKEN)

      const updatedSources = sources.filter(s => s.id !== activeSource.id)
      setSources(updatedSources)

      if (updatedSources.length > 0 && customerId) {
        await setActiveDashboardSource(updatedSources[0].id, customerId, jwt)
        setActiveSource(updatedSources[0])
      } else {
        setActiveSource(null)
      }

      alert('Dashboard source deleted successfully')
    } catch (err) {
      console.error('Error deleting dashboard source:', err)
      alert(`Failed to delete dashboard source: ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading dashboard sources...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Error loading dashboard sources: {error}</p>
      </div>
    )
  }

  // No sources at all
  if (sources.length === 0) {
    if (!canCreate()) {
      return (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-900">Access Required</h3>
          </div>
          <p className="text-sm text-orange-700">
            You need Administrator, Project Manager, or Executive role to create dashboard sources.
            Please contact your administrator to request access or have dashboard sources shared with you.
          </p>
        </div>
      )
    }

    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <h3 className="font-semibold text-yellow-900 mb-3">No Dashboard Sources Found</h3>
        <p className="text-sm text-yellow-800 mb-2">
          Dashboard sources combine data from your published project pubsets into a single
          view for enterprise reporting.
        </p>
        <p className="text-sm text-yellow-800">
          To create your first source, visit the{' '}
          <Link href="/dashboard/pubsets" className="underline font-medium hover:text-yellow-900">
            Pubsets page
          </Link>
          , select the datasets you want to include, and generate a dashboard source.
        </p>
      </div>
    )
  }

  const isOwnedSource = activeSource?.owner === userEmail

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Manage Dashboard Sources</h1>
        </div>
        <p className="text-gray-600">
          Your enterprise reports use the active dashboard source shown below. You can switch to a
          different source, delete sources you own, or share them with colleagues. To create a new
          source, visit the{' '}
          <Link href="/dashboard/pubsets" className="text-blue-600 hover:underline font-medium">
            Pubsets page
          </Link>.
        </p>
      </div>

      {/* Active source */}
      {activeSource && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-green-900">Active Source</h2>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-bold text-xl text-gray-900">{activeSource.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {activeSource.tbmdjoined?.length || 0} items
                {activeSource.source_product && (
                  <span className={`ml-3 px-2 py-0.5 rounded text-xs font-medium ${
                    activeSource.source_product === 'Agilebars' ? 'bg-purple-100 text-purple-800' :
                    activeSource.source_product === 'Timebars' ? 'bg-blue-100 text-blue-800' :
                    activeSource.source_product === 'Costbars' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activeSource.source_product}
                  </span>
                )}
                <span className="ml-3">Owner: {activeSource.owner}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isOwnedSource && canShare() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(activeSource)}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              )}

              {activeSource?.tb && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCsv}
                  className="flex items-center gap-2"
                  title="Per-project breakdown: one L2 per source project, each with its own role allocations. Downloads tbTimebars.csv and tbMetaData.csv."
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </Button>
              )}

              {activeSource?.tbmdjoined && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSummaryCsv}
                  className="flex items-center gap-2"
                  title="Single summary: all projects collapsed into one L2 'Current inflight projects' with roles and hours summed across all projects. Downloads tbTimebars_summary.csv and tbMetaData_summary.csv."
                >
                  <Download className="w-4 h-4" />
                  Download Summary CSV
                </Button>
              )}

              {canDelete(activeSource) && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Single source guidance */}
      {sources.length === 1 && activeSource && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">This is your only dashboard source</h3>
              <p className="text-sm text-blue-800 mb-2">
                All enterprise reports — including project status, resource charts, facilities schedule,
                and executive summaries — draw their data from this source.
              </p>
              {canCreate() && (
                <p className="text-sm text-blue-800">
                  To compare different datasets or time periods, create an additional source from the{' '}
                  <Link href="/dashboard/pubsets" className="underline font-medium hover:text-blue-900">
                    Pubsets page
                  </Link>
                  . You can then switch between sources here, and all reports will update automatically.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Switch source */}
      {sources.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Switch to a different source ({sources.length} available)
          </label>
          <Select
            value={activeSource?.id.toString() || ''}
            onValueChange={handleSourceChange}
          >
            <SelectTrigger className="max-w-xl">
              <SelectValue placeholder="Select a dashboard source..." />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.id} value={source.id.toString()}>
                  <div className="flex items-center gap-2">
                    {source.id === activeSource?.id && (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    )}
                    <span className="font-medium">{source.name}</span>
                    <span className="text-xs text-gray-500">
                      ({source.tbmdjoined?.length || 0} items)
                    </span>
                    {source.owner !== userEmail && (
                      <span className="text-xs text-gray-500">
                        — shared by {source.owner}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Share Dialog */}
      {sourceToShare && (
        <ShareDialog
          source={sourceToShare}
          isOpen={isShareDialogOpen}
          onClose={() => {
            setIsShareDialogOpen(false)
            setSourceToShare(null)
          }}
          onSuccess={handleShareSuccess}
          customerId={customerId}
          jwt={jwt}
        />
      )}
    </div>
  )
}

export default DashboardSourceSelector
