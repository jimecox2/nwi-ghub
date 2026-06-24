/**
 * Enterprise Data Adapter
 *
 * Transforms dashboard-source data (from getActiveDashboardSource)
 * into the same shape returned by fetchDataWithToken (from pubsetDataFetcher.js).
 *
 * This allows all existing display components (ItemDetailsDataTable,
 * ResourceCostUsagePie, ResourceUsageChart, CollapsibleCardLights, etc.)
 * to be reused in the enterprise section without modification.
 *
 * Data availability on dashboard-sources:
 *   - tbmdjoined:   Always available (project items with embedded bl* variance fields)
 *   - tbresources:  Always available (resource pool)
 *   - tbtags:       Always available (tags)
 *   - tb:           Always available (pubset catalog metadata)
 *   - tbrescalcs2:  Available after preprocessing (resource calculations)
 *   - tbcharts:     Available when provided (burndown chart data)
 *
 * Note: Variance reports work directly from tbmdjoined because bl* fields
 * (blStart, blFinish, blStartVariance, blCostVariance, etc.) are embedded
 * in each row. No separate tbbaseline array is needed.
 */

const sortByHierarchyOrder = (a, b) => a.tbHierarchyOrder - b.tbHierarchyOrder

/**
 * Adapt dashboard source data to the format expected by dashboard display components.
 * Returns the same shape as fetchDataWithToken() from pubsetDataFetcher.js.
 *
 * @param {Object} dashboardSource - Object from getActiveDashboardSource()
 * @returns {Object} Adapted data in fetchDataWithToken format
 */
export function adaptDashboardSourceData(dashboardSource) {
  if (!dashboardSource || !dashboardSource.tbmdjoined) {
    return {
      allRows: [],
      pfRows: [],
      pjRows: [],
      workPackageRows: [],
      wpL4Rows: [],
      pjL3And4Rows: [],
      allPlannedRows: [],
      pfRowsPlanned: [],
      pjRowsPlanned: [],
      workPackageRowsPlanned: [],
      bdCharts: [],
      resCalcs: [],
    }
  }

  const allRows = [...dashboardSource.tbmdjoined].sort(sortByHierarchyOrder)

  // Resource calculations - available after preprocessing (extracted from Allocation rows)
  const resCalcs = Array.isArray(dashboardSource.tbrescalcs2) ? dashboardSource.tbrescalcs2 : []

  // Burndown chart data - available when provided
  const bdCharts = Array.isArray(dashboardSource.tbcharts) ? dashboardSource.tbcharts : []

  return {
    // Current or forecast data (bl* variance fields are embedded in each row)
    allRows,
    pfRows: allRows.filter(row => row.tbType === 'Portfolio'),
    pjRows: allRows.filter(row => row.tbType === 'Project'),
    workPackageRows: allRows.filter(row => row.tbType === 'Sub-Project'),
    wpL4Rows: allRows.filter(row => row.tbType === 'Task' || row.tbType === 'Milestone'),
    pjL3And4Rows: allRows.filter(row => row.tbType === 'Task' || row.tbType === 'Sub-Project'),

    // Planned rows (used by card drilldown for planned vs current comparison)
    allPlannedRows: [],
    pfRowsPlanned: [],
    pjRowsPlanned: [],
    workPackageRowsPlanned: [],

    // Chart and resource data
    bdCharts,
    resCalcs,
  }
}
