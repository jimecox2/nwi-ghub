'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Save, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSession } from 'next-auth/react'
import { createDashboardSource, getUserByEmail, getUserRole, preprocessDashboardSourceData } from '@/lib/crud/coreCrud'
import { buildInflightRollup } from '@/lib/crud/inflightRollup'
import { FULL_ACCESS_ADMIN_TOKEN } from '@/config/index'

/**
 * Collapsible section showing metadata for included pubsets
 * @param {Object} props
 * @param {Array} props.pubsets - Array of pubset objects
 * @param {Array} props.consolidatedData - Filtered and merged data
 */
const IncludedPubsetsSection = ({ pubsets, consolidatedData }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [dashboardName, setDashboardName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('')
  const [userRole, setUserRole] = useState(null)
  const [isCheckingPermission, setIsCheckingPermission] = useState(true)

  const { data: session } = useSession()

  // Check user permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (!session?.jwt || !session?.user?.email) {
        setIsCheckingPermission(false)
        return
      }

      try {
        const role = await getUserRole(session.user.email, session.jwt)
        setUserRole(role)
      } catch (error) {
        console.error('Error checking user role:', error)
      } finally {
        setIsCheckingPermission(false)
      }
    }

    checkPermissions()
  }, [session])

  // Check if user can create dashboard sources
  const canCreateDashboardSource = () => {
    if (!userRole) return false
    return ['Administrator', 'Project Manager', 'Executive'].includes(userRole)
  }

  /**
   * Generate a human-readable dashboard source name.
   * Format: {Product} — {PubsetNames} [PubsetIds] — MMM DD, YYYY HH:MM
   * e.g.  "Timebars — Project Alpha, Project Beta [22-26] — Jan 29, 2026 22:12"
   */
  const generateSourceName = () => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

    // Determine product label
    const products = [...new Set(pubsets.map(p => p.source_product).filter(Boolean))]
    const productLabel = products.length === 1 ? products[0] : products.length > 1 ? 'Mixed' : 'Unknown'

    // Pubset names (truncate if too many)
    const pubsetNames = pubsets.map(p => p.name).filter(Boolean)
    const namesStr = pubsetNames.length <= 3
      ? pubsetNames.join(', ')
      : `${pubsetNames.slice(0, 2).join(', ')} +${pubsetNames.length - 2} more`

    // Pubset IDs in bracket format matching uid field
    const idsStr = pubsets.map(p => p.id).join('-')

    return `${productLabel} — ${namesStr} [${idsStr}] — ${dateStr} ${timeStr}`
  }

  const handleSaveAsDashboardSource = () => {
    setShowDialog(true)
    setSaveStatus(null)
    setErrorMessage('')
    setDashboardName(generateSourceName())
  }

  const handleSave = async () => {
    if (!session?.jwt || !session?.user?.email) {
      setErrorMessage('Authentication required. Please sign in again.')
      return
    }

    setIsSaving(true)
    setSaveStatus(null)
    setErrorMessage('')

    try {
      // Fetch user from Strapi to get correct Customer_id
      const strapiUser = await getUserByEmail(session.user.email, session.jwt)

      if (!strapiUser || !strapiUser.Customer_id) {
        throw new Error('Could not retrieve user Customer_id from database')
      }

      // Use the name from the dialog (user may have edited it)
      const generatedName = dashboardName.trim() || generateSourceName()

      // Find first pubset that actually has tbresources data (any product type)
      const pubsetWithResources = pubsets.find(p =>
        Array.isArray(p.tbresources) ? p.tbresources.length > 0 : !!p.tbresources
      )
      const tbresources = pubsetWithResources?.tbresources || null

      // Find first pubset that actually has tbtags data (any product type)
      const pubsetWithTags = pubsets.find(p =>
        Array.isArray(p.tbtags) ? p.tbtags.length > 0 : !!p.tbtags
      )
      const tbtags = pubsetWithTags?.tbtags || null

      // Merge tbcharts from ALL pubsets (typically populated by Agilebars, may be null for others)
      const mergedCharts = []
      pubsets.forEach(p => {
        if (Array.isArray(p.tbcharts) && p.tbcharts.length > 0) {
          mergedCharts.push(...p.tbcharts)
        }
      })
      const tbcharts = mergedCharts.length > 0 ? mergedCharts : null

      // Create pubset catalog stored in tbdocuments (name and id for each pubset)
      const pubsetCatalog = pubsets.map(p => ({
        id: p.id,
        name: p.name,
        owner: p.owner,
        source_product: p.source_product,
        publish_status: p.publish_status,
      }))

      // Aggregate unique values from all pubsets for the four fields
      const getUniqueValues = (field) => {
        const values = pubsets
          .map(p => p[field])
          .filter(val => val !== null && val !== undefined && val !== '')
        return [...new Set(values)].join(', ')
      }

      const aggregation_level = getUniqueValues('aggregation_level')
      const division = getUniqueValues('division')
      const cost_center = getUniqueValues('cost_center')
      const geographic_region = getUniqueValues('geographic_region')

      // Build inflight rollup — virtual L1→L2→L4→L5 structure by role
      const rollup = buildInflightRollup(consolidatedData)

      // Prepare dashboard source data
      const dashboardSourceData = {
        name: generatedName,
        owner: session.user.email,
        Customer_id: strapiUser.Customer_id.toString(), // Use correct Customer_id from Strapi
        tbmdjoined: consolidatedData || [],
        tbresources: tbresources,
        tbtags: tbtags,
        tbcharts: tbcharts,
        tbdocuments: pubsetCatalog, // Pubset catalog — which source pubsets were consolidated
        tb: rollup?.tb || null,   // Virtual tbTimebars rows (inflight resource plan)
        tbmd: rollup?.tbmd || null, // Virtual tbMetaData rows (companion metadata)
        source_product: pubsets[0]?.source_product || null,
        aggregation_level: aggregation_level || null,
        publish_status: 'Final',
        division: division || null,
        cost_center: cost_center || null,
        geographic_region: geographic_region || null,
        isActive: true,
        published_date: new Date().toISOString(),
        uid: pubsets.map(p => p.id).join('-'), // Hyphen-separated pubset IDs
      }

      console.log('Saving dashboard source:', {
        name: dashboardSourceData.name,
        owner: dashboardSourceData.owner,
        Customer_id: dashboardSourceData.Customer_id,
        itemCount: consolidatedData?.length || 0,
        pubsetCount: pubsets.length,
        resourcesFrom: pubsetWithResources?.name || 'None',
        tagsFrom: pubsetWithTags?.name || 'None',
        resourcesCount: Array.isArray(tbresources) ? tbresources.length : (tbresources ? 'not an array' : 'null'),
        tagsCount: Array.isArray(tbtags) ? tbtags.length : (tbtags ? 'not an array' : 'null'),
        chartsCount: Array.isArray(tbcharts) ? tbcharts.length : (tbcharts ? 'not an array' : 'null'),
        catalogSize: pubsetCatalog.length,
        rollupTbRows: rollup?.tb?.length || 0,
        rollupTbmdRows: rollup?.tbmd?.length || 0,
        aggregation_level,
        division,
        cost_center,
        geographic_region,
      })

      // Save directly to Strapi using CRUD function
      const savedSource = await createDashboardSource(dashboardSourceData, FULL_ACCESS_ADMIN_TOKEN)

      // Auto-preprocess: if Allocation rows exist, generate tbrescalcs2 immediately
      const allocationRows = (consolidatedData || []).filter(r => r.tbType === 'Allocation')
      if (allocationRows.length > 0) {
        setSaveStatus('preprocessing')
        const sourceForPreprocess = {
          id: savedSource.id,
          tbmdjoined: consolidatedData,
        }
        const preprocessResult = await preprocessDashboardSourceData(sourceForPreprocess, FULL_ACCESS_ADMIN_TOKEN)
        console.log('Auto-preprocessing result:', preprocessResult)
      }

      setSaveStatus('success')

      // Redirect to enterprise dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)

    } catch (error) {
      console.error('Error saving dashboard source:', error)
      setSaveStatus('error')
      setErrorMessage(error.message || 'Failed to save dashboard source')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setShowDialog(false)
    setDashboardName('')
    setSaveStatus(null)
    setErrorMessage('')
  }

  return (
    <>
      {/* Prominent Save Button Section */}
      <div className="mb-6">
        {isCheckingPermission ? (
          <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Checking permissions...</span>
          </div>
        ) : canCreateDashboardSource() ? (
          <button
            onClick={handleSaveAsDashboardSource}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg"
            title="Save these pubsets as a dashboard source"
          >
            <Save className="w-6 h-6" />
            Save As Dashboard Source
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-yellow-900">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Administrator, Project Manager, or Executive role required to save dashboard sources</span>
          </div>
        )}
      </div>

      {/* Collapsible Pubsets Details */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        {/* Header with toggle */}
        <div className="flex items-center mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-lg font-semibold text-blue-900 hover:text-blue-700 transition-colors"
            aria-expanded={isExpanded}
            aria-controls="included-pubsets-content"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            <span>Included Pubsets ({pubsets.length})</span>
          </button>
        </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div id="included-pubsets-content" className="space-y-3">
          {pubsets.map((pubset) => (
            <div key={pubset.id} className="p-3 bg-white rounded border border-blue-100">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className="font-mono text-gray-600 font-semibold">ID: {pubset.id}</span>
                <span className="font-medium text-gray-900">{pubset.name}</span>
                <span className="text-gray-600">Owner: {pubset.owner}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap text-xs">
                {pubset.source_product && (
                  <span className={`px-2 py-1 rounded font-medium ${
                    pubset.source_product === 'Agilebars' ? 'bg-purple-100 text-purple-800' :
                    pubset.source_product === 'Timebars' ? 'bg-blue-100 text-blue-800' :
                    pubset.source_product === 'Costbars' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pubset.source_product}
                  </span>
                )}
                {pubset.publish_status && (
                  <span className={`px-2 py-1 rounded font-medium ${
                    pubset.publish_status === 'Final' ? 'bg-green-100 text-green-800' :
                    pubset.publish_status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                    pubset.publish_status === 'Archived' ? 'bg-gray-100 text-gray-600' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pubset.publish_status}
                  </span>
                )}
                {pubset.aggregation_level && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {pubset.aggregation_level}
                  </span>
                )}
                {pubset.division && (
                  <span className="text-gray-600">Division: {pubset.division}</span>
                )}
                {pubset.cost_center && (
                  <span className="text-gray-600">Cost Center: {pubset.cost_center}</span>
                )}
                {pubset.geographic_region && (
                  <span className="text-gray-600">Region: {pubset.geographic_region}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Save Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Save As Dashboard Source</DialogTitle>
            <DialogDescription>
              Create a new dashboard source from {pubsets.length} selected pubset{pubsets.length !== 1 ? 's' : ''} containing {consolidatedData?.length || 0} items.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dashboard-name">Dashboard Source Name</Label>
              <Input
                id="dashboard-name"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="Enter a name for this dashboard source"
                disabled={isSaving || saveStatus === 'preprocessing' || saveStatus === 'success'}
              />
              <p className="text-xs text-gray-500">
                System-proposed name — edit to customize. Format: Product — Pubset Names [IDs] — Date Time
              </p>
            </div>

            {/* Status messages */}
            {saveStatus === 'preprocessing' && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Source saved. Auto-preprocessing resource allocation data...</span>
              </div>
            )}

            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span>Dashboard source saved successfully!</span>
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <XCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Failed to save</p>
                  {errorMessage && <p className="text-sm">{errorMessage}</p>}
                </div>
              </div>
            )}

            {/* Pubset details */}
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Source Pubsets:</strong> {pubsets.map(p => p.name).join(', ')}</p>
              <p><strong>Total Items:</strong> {consolidatedData?.length || 0} (all hierarchy levels)</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving || saveStatus === 'preprocessing' || saveStatus === 'success'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || saveStatus === 'preprocessing' || saveStatus === 'success'}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'preprocessing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default IncludedPubsetsSection
