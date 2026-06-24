'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { getAllDashboardSources, getActiveDashboardSource, getUserByEmail, preprocessDashboardSourceData } from '@/lib/crud/coreCrud'
import { adaptDashboardSourceData } from '@/lib/crud/enterpriseDataAdapter'

/**
 * Shared hook for enterprise pages to fetch the active dashboard source.
 * Eliminates duplicated boilerplate across enterprise report pages.
 *
 * Returns both the raw dashboard source and the adapted data
 * (in the same format as fetchDataWithToken from pubsetDataFetcher.js).
 *
 * Auto-preprocesses resource data (tbrescalcs2) on first load if missing,
 * then refreshes the dashboard source with the preprocessed data.
 *
 * @param {Object} options
 * @param {boolean} options.autoPreprocess - Auto-preprocess if tbrescalcs2 is missing (default: true)
 * @returns {Object} { dashboardSource, adaptedData, session, isLoading, error, isPreprocessing }
 */
export function useEnterpriseDashboardSource({ autoPreprocess = true } = {}) {
  const { data: session, status } = useSession()

  const [dashboardSource, setDashboardSource] = useState(null)
  const [customerId, setCustomerId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPreprocessing, setIsPreprocessing] = useState(false)
  const preprocessAttempted = useRef(false)

  useEffect(() => {
    const fetchActiveDashboardSource = async () => {
      if (status !== 'authenticated') {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Get user's Customer_id
        const strapiUser = await getUserByEmail(session.user.email, session.jwt)
        const custId = strapiUser?.Customer_id || null
        setCustomerId(custId)

        if (!custId) {
          console.error('No Customer_id found for user')
          setDashboardSource(null)
          setIsLoading(false)
          return
        }

        // Get active source from user's accessible sources only (RBAC-filtered)
        const accessibleSources = await getAllDashboardSources(session.user.email, session.jwt)
        const activeSource = accessibleSources?.find(s => s.isActive) ||
                             (accessibleSources?.length > 0 ? accessibleSources[0] : null)
        setDashboardSource(activeSource)

        // Auto-preprocess if tbrescalcs2 is missing and we haven't tried yet
        if (
          autoPreprocess &&
          activeSource &&
          !preprocessAttempted.current &&
          (!activeSource.tbrescalcs2 || !Array.isArray(activeSource.tbrescalcs2) || activeSource.tbrescalcs2.length === 0)
        ) {
          preprocessAttempted.current = true
          setIsPreprocessing(true)

          try {
            const result = await preprocessDashboardSourceData(activeSource, session.jwt)
            if (result.success && result.resCalcsCount > 0) {
              // Re-fetch the accessible sources to get the updated data
              const refreshedSources = await getAllDashboardSources(session.user.email, session.jwt)
              const refreshed = refreshedSources?.find(s => s.id === activeSource.id) || activeSource
              setDashboardSource(refreshed)
            }
          } catch (preprocessErr) {
            // Non-fatal - just log, the page will show "not available" message
            console.error('Auto-preprocess failed:', preprocessErr)
          } finally {
            setIsPreprocessing(false)
          }
        }
      } catch (err) {
        console.error('Error fetching active dashboard source:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveDashboardSource()
  }, [status, session])

  // Adapt the data to the format expected by display components
  const adaptedData = dashboardSource ? adaptDashboardSourceData(dashboardSource) : null

  return {
    dashboardSource,
    adaptedData,
    session,
    status,
    customerId,
    isLoading: status === 'loading' || isLoading,
    isPreprocessing,
    error,
  }
}
