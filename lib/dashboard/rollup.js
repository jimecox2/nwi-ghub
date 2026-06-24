/**
 * Inflight Resource Rollup
 *
 * Builds a virtual L1 → L2 → L4 → L5 hierarchy from consolidated tbmdjoined data.
 * One virtual L2 per original L2 Project row found. L4 is always "Resource Plan
 * Summary". L5s are one per unique tbMDPrimaryRole found under that project.
 * Human allocations with no role are silently skipped. Projects with no qualifying
 * allocations are also skipped.
 *
 * Output is stored in dashboard-source .tb (tbTimebars rows) and .tbmd (tbMetaData rows)
 * so Costbars can import the inflight demand into a supply/demand analysis.
 */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function parseDate(str) {
  if (!str || typeof str !== 'string') return null
  const parts = str.split('-')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0], 10)
  const mon = MONTHS.indexOf(parts[1])
  const year = parseInt(parts[2], 10)
  if (isNaN(day) || mon === -1 || isNaN(year)) return null
  return new Date(year, mon, day)
}

function formatDate(date) {
  if (!date) return ''
  const d = String(date.getDate()).padStart(2, '0')
  const m = MONTHS[date.getMonth()]
  const y = date.getFullYear()
  return `${d}-${m}-${y}`
}

function minDateStr(dateStrs) {
  const valid = dateStrs.map(parseDate).filter(Boolean)
  if (!valid.length) return ''
  return formatDate(new Date(Math.min(...valid.map(d => d.getTime()))))
}

function maxDateStr(dateStrs) {
  const valid = dateStrs.map(parseDate).filter(Boolean)
  if (!valid.length) return ''
  return formatDate(new Date(Math.max(...valid.map(d => d.getTime()))))
}

function sumField(rows, field) {
  return rows.reduce((acc, r) => acc + (parseFloat(r[field]) || 0), 0)
}

function hierarchyOrder(l1, l2 = 0, l3 = 0, l4 = 0, l5 = 0) {
  const p = n => String(n).padStart(2, '0')
  return `${p(l1)}.${p(l2)}.${p(l3)}.${p(l4)}.${p(l5)}`
}

// Extract only tbTimebars fields from a joined row (strips tbMD-prefixed keys)
function extractTbFields(row) {
  const result = {}
  for (const [key, val] of Object.entries(row)) {
    if (!key.startsWith('tbMD')) result[key] = val
  }
  return result
}

// Extract only tbMetaData fields from a joined row (strips non-tbMD keys, keeps canvasNo)
function extractMdFields(row) {
  const result = {}
  for (const [key, val] of Object.entries(row)) {
    if (key.startsWith('tbMD') || key === 'canvasNo') result[key] = val
  }
  return result
}

function buildMinimalTbmd(id, name, customerID) {
  return {
    tbMDID: id,
    tbMDName: `Auto Created tbID:${id}, Matching tbName: ${name}`,
    tbMDCustomerID: customerID,
    tbMDDecisionStrategic: null,
    tbMDDecisionNotes: null,
    tbMDFinancialScore: null,
    tbMDGate: null,
    tbMDHealthOverall: null,
    tbMDHealthScope: null,
    tbMDHealthCost: null,
    tbMDHealthIssues: null,
    tbMDHealthRisk: null,
    tbMDHealthSchedule: null,
    tbMDHealthHours: null,
    tbMDInvestmentCategory: null,
    tbMDInvestmentInitiative: null,
    tbMDInvestmentObjective: null,
    tbMDInvestmentStrategy: null,
    tbMDROMEstimate: null,
    tbMDPortfolio: null,
    tbMDProgram: null,
    tbMDSize: null,
    tbMDPrimaryContact: null,
    tbMDBenefitCostRatio: null,
    tbMDResponsibleTeam: null,
    tbMDEcnomicValueAdded: null,
    tbMDEstimationClass: null,
    tbMDInternalRateOfReturn: null,
    tbMDSunkCosts: null,
    tbMDNotesProject: null,
    tbMDContractNumber: null,
    tbMDNetPresentValue: null,
    tbMDOpportunityCost: null,
    tbMDPaybackPeriod: null,
    tbMDPrimaryLineOfBusiness: null,
    tbMDBackgroundInfo: null,
    tbMDExpectedBenefits: null,
    tbMDConstraintsAssumptions: null,
    tbMDNotesWorkflow: null,
    tbMDSortOrder: null,
    tbMDtbLastModified: null,
    tbMDPriority: null,
    tbMDStatus: null,
    tbMDState: null,
    tbMDSeverity: null,
    tbMDStage: null,
    tbMDPhase: null,
    tbMDCategory: null,
    tbMDHealth: null,
    tbMDPM: null,
    tbMDProjectType: null,
    tbMDShowIn: null,
    tbMDProduct: null,
    tbMDWeighting: null,
    tbMDCostbarsScore: 0,
    tbMDObjectivesAndScope: null,
    tbMDOptionsAnalysis: null,
    tbMDImplementationApproach: null,
    tbMDNextSteps: null,
    tbMDScheduleCommentary: null,
    tbMDBudgetCommentary: null,
    tbMDScopeCommentary: null,
    tbMDResourceCommentary: null,
    tbMDFinancialCommentary: null,
    tbMDKeyDependencies: null,
    tbMDValueProposition: null,
    tbMDSuccessCriteria: null,
    tbMDDecisionsRequired: null,
    tbMDKeyRecommendations: null,
    tbMDPortfolioImpactAnalysis: null,
    tbMDKeyProjectMetrics: null,
    tbMDRiskCategory: null,
    tbMDIssueCategory: null,
    canvasNo: 1,
  }
}

function buildL2Tbmd(virtualId, l2Row, customerID) {
  const mdFields = extractMdFields(l2Row)
  return {
    ...mdFields,
    tbMDID: virtualId,
    tbMDCustomerID: customerID,
  }
}

/**
 * Build the virtual inflight hierarchy from consolidated tbmdjoined data.
 *
 * @param {Array} consolidatedData - Full merged tbmdjoined (all hierarchy levels)
 * @returns {{ tb: Array, tbmd: Array } | null} - null if no qualifying projects found
 */
export function buildInflightRollup(consolidatedData) {
  if (!Array.isArray(consolidatedData) || consolidatedData.length === 0) return null

  // Customer ID — take from the first row that has it
  const customerRow = consolidatedData.find(r => r.tbCustomerID)
  const customerID = customerRow?.tbCustomerID || ''

  // Find all L2 Project rows, sorted by start date (earliest first)
  const l2Rows = consolidatedData
    .filter(r => r.tbType === 'Project')
    .sort((a, b) => {
      const da = parseDate(a.tbStart)
      const db = parseDate(b.tbStart)
      if (!da && !db) return 0
      if (!da) return 1
      if (!db) return -1
      return da.getTime() - db.getTime()
    })

  if (l2Rows.length === 0) return null

  const tbRows = []
  const tbmdRows = []
  const l2Blocks = []   // holds built blocks before we assemble in order
  let l2PositionIndex = 0  // used for coordTop and hierarchyOrder (1-based after increment)

  for (const l2Row of l2Rows) {
    // Pubset prefix: "25-A01" → "25"
    const pubsetPrefix = String(l2Row.tbID).split('-')[0]

    // Allocations for this L2:
    //   - tbType Allocation
    //   - same pubset (ID prefix matches)
    //   - tbL2 breadcrumb matches this project's name
    //   - tbMDPrimaryRole is populated (no role = skip per q3)
    const allocations = consolidatedData.filter(r =>
      r.tbType === 'Allocation' &&
      String(r.tbID).startsWith(pubsetPrefix + '-') &&
      r.tbL2 === l2Row.tbName &&
      r.tbMDPrimaryRole &&
      r.tbMDPrimaryRole.trim() !== ''
    )

    // Skip projects with no qualifying allocations (q5)
    if (allocations.length === 0) continue

    // Group by role, sort alphabetically
    const roleMap = new Map()
    for (const alloc of allocations) {
      const role = alloc.tbMDPrimaryRole.trim()
      if (!roleMap.has(role)) roleMap.set(role, [])
      roleMap.get(role).push(alloc)
    }
    const sortedRoles = [...roleMap.keys()].sort()

    // Position (1-based)
    l2PositionIndex++
    const l2CoordTop = 150 + ((l2PositionIndex - 1) * 250)
    const l4CoordTop = l2CoordTop + 50

    // Virtual IDs
    const vL2ID = 'v' + l2Row.tbID
    const vL4ID = 'v' + l2Row.tbID + '-t'

    // --- Build L5 rows (one per role) ---
    const l5Tb = []
    const l5Tbmd = []

    for (let roleIdx = 0; roleIdx < sortedRoles.length; roleIdx++) {
      const role = sortedRoles[roleIdx]
      const roleAllocs = roleMap.get(role)
      const vL5ID = 'v' + l2Row.tbID + '-r' + roleIdx
      const l5CoordTop = l4CoordTop + 50 + (roleIdx * 25)

      l5Tb.push({
        tbID: vL5ID,
        tbSelfKey2: vL4ID,
        tbName: role,
        tbType: 'Allocation',
        tbSubType: '',
        tbCoordTop: l5CoordTop,
        tbCoordLeft: '0',
        tbStart: minDateStr(roleAllocs.map(a => a.tbStart)),
        tbFinish: maxDateStr(roleAllocs.map(a => a.tbFinish)),
        tbAStart: minDateStr(roleAllocs.map(a => a.tbAStart).filter(Boolean)),
        tbAFinish: maxDateStr(roleAllocs.map(a => a.tbAFinish).filter(Boolean)),
        tbDuration: 0,
        tbRemainingDuration: 0,
        tbBudgetHours: 0,
        tbWork: sumField(roleAllocs, 'tbWork'),
        tbAWork: sumField(roleAllocs, 'tbAWork'),
        tbWorkRemaining: sumField(roleAllocs, 'tbWorkRemaining'),
        tbPercentComplete: 0,
        tbExpHoursPerWeek: null,
        tbBudgetCost: 0,
        tbCost: sumField(roleAllocs, 'tbCost'),
        tbACost: sumField(roleAllocs, 'tbACost'),
        tbCostRemaining: sumField(roleAllocs, 'tbCostRemaining'),
        tbResID: 0,
        tbCostID: null,
        tbCustomerID: customerID,
        tbOwner: role,
        tbBarHeight: null,
        tbBLID: '',
        tbPredecessor: '',
        tbConstraintType: '',
        tbConstraintDate: '',
        tbFloat: 0,
        tbFreeFloat: 0,
        tbL1: 'Latest Inflight Project Usage',
        tbL2: l2Row.tbName,
        tbL3: '',
        tbL4: 'Resource Plan Summary',
        tbL5: role,
        tbWbsDescription: null,
        tbHierarchyOrder: hierarchyOrder(1, l2PositionIndex, 0, 1, roleIdx + 1),
        canvasNo: 1,
        kbCoordTop: 0,
        kbCoordLeft: '0',
        tbStatus: 'Active',
        tbState: '',
        tbStep: null,
        tbStepStatus: null,
        tbStage: null,
        tbPriority: null,
        tbPhase: null,
        tbBarColor: null,
        tbTextColor: null,
      })

      l5Tbmd.push(buildMinimalTbmd(vL5ID, role, customerID))
    }

    // --- Build L4 row ("Resource Plan Summary") ---
    const l4Work = l5Tb.reduce((s, r) => s + r.tbWork, 0)
    const l4AWork = l5Tb.reduce((s, r) => s + r.tbAWork, 0)
    const l4WorkRemaining = l5Tb.reduce((s, r) => s + r.tbWorkRemaining, 0)
    const l4Cost = l5Tb.reduce((s, r) => s + r.tbCost, 0)
    const l4ACost = l5Tb.reduce((s, r) => s + r.tbACost, 0)
    const l4CostRemaining = l5Tb.reduce((s, r) => s + r.tbCostRemaining, 0)

    const l4TbRow = {
      tbID: vL4ID,
      tbSelfKey2: vL2ID,
      tbName: 'Resource Plan Summary',
      tbType: 'Task',
      tbSubType: 'Task',
      tbCoordTop: l4CoordTop,
      tbCoordLeft: '0',
      tbStart: minDateStr(allocations.map(a => a.tbStart)),
      tbFinish: maxDateStr(allocations.map(a => a.tbFinish)),
      tbAStart: minDateStr(allocations.map(a => a.tbAStart).filter(Boolean)),
      tbAFinish: maxDateStr(allocations.map(a => a.tbAFinish).filter(Boolean)),
      tbDuration: 0,
      tbRemainingDuration: 0,
      tbBudgetHours: 0,
      tbWork: l4Work,
      tbAWork: l4AWork,
      tbWorkRemaining: l4WorkRemaining,
      tbPercentComplete: 0,
      tbExpHoursPerWeek: null,
      tbBudgetCost: 0,
      tbCost: l4Cost,
      tbACost: l4ACost,
      tbCostRemaining: l4CostRemaining,
      tbResID: 0,
      tbCostID: null,
      tbCustomerID: customerID,
      tbOwner: '',
      tbBarHeight: null,
      tbBLID: '',
      tbPredecessor: '',
      tbConstraintType: '',
      tbConstraintDate: '',
      tbFloat: 0,
      tbFreeFloat: 0,
      tbL1: 'Latest Inflight Project Usage',
      tbL2: l2Row.tbName,
      tbL3: '',
      tbL4: 'Resource Plan Summary',
      tbL5: '',
      tbWbsDescription: null,
      tbHierarchyOrder: hierarchyOrder(1, l2PositionIndex, 0, 1, 0),
      canvasNo: 1,
      kbCoordTop: 0,
      kbCoordLeft: '0',
      tbStatus: 'Active',
      tbState: '',
      tbStep: null,
      tbStepStatus: null,
      tbStage: null,
      tbPriority: null,
      tbPhase: null,
      tbBarColor: null,
      tbTextColor: null,
    }

    // --- Build virtual L2 row (copy original tbTimebars fields, override key ones) ---
    const vL2TbRow = {
      ...extractTbFields(l2Row),
      tbID: vL2ID,
      tbSelfKey2: 'v-l1',
      tbCoordTop: l2CoordTop,
      tbWork: l4Work,
      tbAWork: l4AWork,
      tbWorkRemaining: l4WorkRemaining,
      tbCost: l4Cost,
      tbACost: l4ACost,
      tbCostRemaining: l4CostRemaining,
      tbL1: 'Latest Inflight Project Usage',
      tbL2: l2Row.tbName,
      tbL3: '',
      tbL4: '',
      tbL5: '',
      tbHierarchyOrder: hierarchyOrder(1, l2PositionIndex, 0, 0, 0),
    }

    l2Blocks.push({
      l2Tb: vL2TbRow,
      l2Tbmd: buildL2Tbmd(vL2ID, l2Row, customerID),
      l4Tb: l4TbRow,
      l4Tbmd: buildMinimalTbmd(vL4ID, 'Resource Plan Summary', customerID),
      l5Tb,
      l5Tbmd,
    })
  }

  if (l2Blocks.length === 0) return null

  // --- Build L1 (Portfolio) ---
  const allL2 = l2Blocks.map(b => b.l2Tb)
  const l1Work = allL2.reduce((s, r) => s + r.tbWork, 0)
  const l1AWork = allL2.reduce((s, r) => s + r.tbAWork, 0)
  const l1WorkRemaining = allL2.reduce((s, r) => s + r.tbWorkRemaining, 0)
  const l1Cost = allL2.reduce((s, r) => s + r.tbCost, 0)
  const l1ACost = allL2.reduce((s, r) => s + r.tbACost, 0)
  const l1CostRemaining = allL2.reduce((s, r) => s + r.tbCostRemaining, 0)

  const l1TbRow = {
    tbID: 'v-l1',
    tbSelfKey2: null,
    tbName: 'Latest Inflight Project Usage',
    tbType: 'Portfolio',
    tbSubType: '',
    tbCoordTop: 100,
    tbCoordLeft: '0',
    tbStart: minDateStr(allL2.map(r => r.tbStart)),
    tbFinish: maxDateStr(allL2.map(r => r.tbFinish)),
    tbAStart: minDateStr(allL2.map(r => r.tbAStart).filter(Boolean)),
    tbAFinish: maxDateStr(allL2.map(r => r.tbAFinish).filter(Boolean)),
    tbDuration: 0,
    tbRemainingDuration: 0,
    tbBudgetHours: 0,
    tbWork: l1Work,
    tbAWork: l1AWork,
    tbWorkRemaining: l1WorkRemaining,
    tbPercentComplete: 0,
    tbExpHoursPerWeek: null,
    tbBudgetCost: 0,
    tbCost: l1Cost,
    tbACost: l1ACost,
    tbCostRemaining: l1CostRemaining,
    tbResID: 0,
    tbCostID: null,
    tbCustomerID: customerID,
    tbOwner: '',
    tbBarHeight: null,
    tbBLID: '',
    tbPredecessor: '',
    tbConstraintType: '',
    tbConstraintDate: '',
    tbFloat: 0,
    tbFreeFloat: 0,
    tbL1: 'Latest Inflight Project Usage',
    tbL2: '',
    tbL3: '',
    tbL4: '',
    tbL5: '',
    tbWbsDescription: null,
    tbHierarchyOrder: hierarchyOrder(1, 0, 0, 0, 0),
    canvasNo: 1,
    kbCoordTop: 0,
    kbCoordLeft: '0',
    tbStatus: 'Active',
    tbState: '',
    tbStep: null,
    tbStepStatus: null,
    tbStage: null,
    tbPriority: null,
    tbPhase: null,
    tbBarColor: null,
    tbTextColor: null,
  }

  // --- Assemble final arrays in WBS order ---
  tbRows.push(l1TbRow)
  tbmdRows.push(buildMinimalTbmd('v-l1', 'Latest Inflight Project Usage', customerID))

  for (const block of l2Blocks) {
    tbRows.push(block.l2Tb)
    tbmdRows.push(block.l2Tbmd)
    tbRows.push(block.l4Tb)
    tbmdRows.push(block.l4Tbmd)
    for (let i = 0; i < block.l5Tb.length; i++) {
      tbRows.push(block.l5Tb[i])
      tbmdRows.push(block.l5Tbmd[i])
    }
  }

  return { tb: tbRows, tbmd: tbmdRows }
}

/**
 * Build a single-project summary rollup from consolidated tbmdjoined data.
 * All allocations across every source project are merged into one flat structure:
 *   L1 "Inflight resource usage summary"
 *     L2 "Current inflight projects"
 *       L4 "Resource Plan Summary by Role"
 *         L5 per unique role (hours/cost summed across all projects)
 *
 * @param {Array} consolidatedData - Full merged tbmdjoined (all hierarchy levels)
 * @returns {{ tb: Array, tbmd: Array } | null}
 */
export function buildInflightRollupSummary(consolidatedData) {
  if (!Array.isArray(consolidatedData) || consolidatedData.length === 0) return null

  const customerRow = consolidatedData.find(r => r.tbCustomerID)
  const customerID = customerRow?.tbCustomerID || ''

  // All qualifying allocations across ALL projects (skip those with no role)
  const allocations = consolidatedData.filter(r =>
    r.tbType === 'Allocation' &&
    r.tbMDPrimaryRole &&
    r.tbMDPrimaryRole.trim() !== ''
  )

  if (allocations.length === 0) return null

  // Group by role, sorted alphabetically
  const roleMap = new Map()
  for (const alloc of allocations) {
    const role = alloc.tbMDPrimaryRole.trim()
    if (!roleMap.has(role)) roleMap.set(role, [])
    roleMap.get(role).push(alloc)
  }
  const sortedRoles = [...roleMap.keys()].sort()

  if (sortedRoles.length === 0) return null

  // Fixed virtual IDs for the single-summary structure
  const vL1ID = 'vs-l1'
  const vL2ID = 'vs-l2'
  const vL4ID = 'vs-l4'

  const l2CoordTop = 150
  const l4CoordTop = l2CoordTop + 50  // 200

  // --- L5 rows (one per role, summed across all projects) ---
  const l5Tb = []
  const l5Tbmd = []

  for (let roleIdx = 0; roleIdx < sortedRoles.length; roleIdx++) {
    const role = sortedRoles[roleIdx]
    const roleAllocs = roleMap.get(role)
    const vL5ID = 'vs-r' + roleIdx
    const l5CoordTop = l4CoordTop + 50 + (roleIdx * 25)

    l5Tb.push({
      tbID: vL5ID,
      tbSelfKey2: vL4ID,
      tbName: role,
      tbType: 'Allocation',
      tbSubType: '',
      tbCoordTop: l5CoordTop,
      tbCoordLeft: '0',
      tbStart: minDateStr(roleAllocs.map(a => a.tbStart)),
      tbFinish: maxDateStr(roleAllocs.map(a => a.tbFinish)),
      tbAStart: minDateStr(roleAllocs.map(a => a.tbAStart).filter(Boolean)),
      tbAFinish: maxDateStr(roleAllocs.map(a => a.tbAFinish).filter(Boolean)),
      tbDuration: 0,
      tbRemainingDuration: 0,
      tbBudgetHours: 0,
      tbWork: sumField(roleAllocs, 'tbWork'),
      tbAWork: sumField(roleAllocs, 'tbAWork'),
      tbWorkRemaining: sumField(roleAllocs, 'tbWorkRemaining'),
      tbPercentComplete: 0,
      tbExpHoursPerWeek: null,
      tbBudgetCost: 0,
      tbCost: sumField(roleAllocs, 'tbCost'),
      tbACost: sumField(roleAllocs, 'tbACost'),
      tbCostRemaining: sumField(roleAllocs, 'tbCostRemaining'),
      tbResID: 0,
      tbCostID: null,
      tbCustomerID: customerID,
      tbOwner: role,
      tbBarHeight: null,
      tbBLID: '',
      tbPredecessor: '',
      tbConstraintType: '',
      tbConstraintDate: '',
      tbFloat: 0,
      tbFreeFloat: 0,
      tbL1: 'Inflight resource usage summary',
      tbL2: 'Current inflight projects',
      tbL3: '',
      tbL4: 'Resource Plan Summary by Role',
      tbL5: role,
      tbWbsDescription: null,
      tbHierarchyOrder: hierarchyOrder(1, 1, 0, 1, roleIdx + 1),
      canvasNo: 1,
      kbCoordTop: 0,
      kbCoordLeft: '0',
      tbStatus: 'Active',
      tbState: '',
      tbStep: null,
      tbStepStatus: null,
      tbStage: null,
      tbPriority: null,
      tbPhase: null,
      tbBarColor: null,
      tbTextColor: null,
    })

    l5Tbmd.push(buildMinimalTbmd(vL5ID, role, customerID))
  }

  // --- L4 row ---
  const l4Work = l5Tb.reduce((s, r) => s + r.tbWork, 0)
  const l4AWork = l5Tb.reduce((s, r) => s + r.tbAWork, 0)
  const l4WorkRemaining = l5Tb.reduce((s, r) => s + r.tbWorkRemaining, 0)
  const l4Cost = l5Tb.reduce((s, r) => s + r.tbCost, 0)
  const l4ACost = l5Tb.reduce((s, r) => s + r.tbACost, 0)
  const l4CostRemaining = l5Tb.reduce((s, r) => s + r.tbCostRemaining, 0)

  const l4TbRow = {
    tbID: vL4ID,
    tbSelfKey2: vL2ID,
    tbName: 'Resource Plan Summary by Role',
    tbType: 'Task',
    tbSubType: 'Task',
    tbCoordTop: l4CoordTop,
    tbCoordLeft: '0',
    tbStart: minDateStr(allocations.map(a => a.tbStart)),
    tbFinish: maxDateStr(allocations.map(a => a.tbFinish)),
    tbAStart: minDateStr(allocations.map(a => a.tbAStart).filter(Boolean)),
    tbAFinish: maxDateStr(allocations.map(a => a.tbAFinish).filter(Boolean)),
    tbDuration: 0,
    tbRemainingDuration: 0,
    tbBudgetHours: 0,
    tbWork: l4Work,
    tbAWork: l4AWork,
    tbWorkRemaining: l4WorkRemaining,
    tbPercentComplete: 0,
    tbExpHoursPerWeek: null,
    tbBudgetCost: 0,
    tbCost: l4Cost,
    tbACost: l4ACost,
    tbCostRemaining: l4CostRemaining,
    tbResID: 0,
    tbCostID: null,
    tbCustomerID: customerID,
    tbOwner: '',
    tbBarHeight: null,
    tbBLID: '',
    tbPredecessor: '',
    tbConstraintType: '',
    tbConstraintDate: '',
    tbFloat: 0,
    tbFreeFloat: 0,
    tbL1: 'Inflight resource usage summary',
    tbL2: 'Current inflight projects',
    tbL3: '',
    tbL4: 'Resource Plan Summary by Role',
    tbL5: '',
    tbWbsDescription: null,
    tbHierarchyOrder: hierarchyOrder(1, 1, 0, 1, 0),
    canvasNo: 1,
    kbCoordTop: 0,
    kbCoordLeft: '0',
    tbStatus: 'Active',
    tbState: '',
    tbStep: null,
    tbStepStatus: null,
    tbStage: null,
    tbPriority: null,
    tbPhase: null,
    tbBarColor: null,
    tbTextColor: null,
  }

  // --- L2 row ---
  const l2TbRow = {
    tbID: vL2ID,
    tbSelfKey2: vL1ID,
    tbName: 'Current inflight projects',
    tbType: 'Project',
    tbSubType: '',
    tbCoordTop: l2CoordTop,
    tbCoordLeft: '0',
    tbStart: l4TbRow.tbStart,
    tbFinish: l4TbRow.tbFinish,
    tbAStart: l4TbRow.tbAStart,
    tbAFinish: l4TbRow.tbAFinish,
    tbDuration: 0,
    tbRemainingDuration: 0,
    tbBudgetHours: 0,
    tbWork: l4Work,
    tbAWork: l4AWork,
    tbWorkRemaining: l4WorkRemaining,
    tbPercentComplete: 0,
    tbExpHoursPerWeek: null,
    tbBudgetCost: 0,
    tbCost: l4Cost,
    tbACost: l4ACost,
    tbCostRemaining: l4CostRemaining,
    tbResID: 0,
    tbCostID: null,
    tbCustomerID: customerID,
    tbOwner: '',
    tbBarHeight: null,
    tbBLID: '',
    tbPredecessor: '',
    tbConstraintType: '',
    tbConstraintDate: '',
    tbFloat: 0,
    tbFreeFloat: 0,
    tbL1: 'Inflight resource usage summary',
    tbL2: 'Current inflight projects',
    tbL3: '',
    tbL4: '',
    tbL5: '',
    tbWbsDescription: null,
    tbHierarchyOrder: hierarchyOrder(1, 1, 0, 0, 0),
    canvasNo: 1,
    kbCoordTop: 0,
    kbCoordLeft: '0',
    tbStatus: 'Active',
    tbState: '',
    tbStep: null,
    tbStepStatus: null,
    tbStage: null,
    tbPriority: null,
    tbPhase: null,
    tbBarColor: null,
    tbTextColor: null,
  }

  // --- L1 row ---
  const l1TbRow = {
    tbID: vL1ID,
    tbSelfKey2: null,
    tbName: 'Inflight resource usage summary',
    tbType: 'Portfolio',
    tbSubType: '',
    tbCoordTop: 100,
    tbCoordLeft: '0',
    tbStart: l2TbRow.tbStart,
    tbFinish: l2TbRow.tbFinish,
    tbAStart: l2TbRow.tbAStart,
    tbAFinish: l2TbRow.tbAFinish,
    tbDuration: 0,
    tbRemainingDuration: 0,
    tbBudgetHours: 0,
    tbWork: l4Work,
    tbAWork: l4AWork,
    tbWorkRemaining: l4WorkRemaining,
    tbPercentComplete: 0,
    tbExpHoursPerWeek: null,
    tbBudgetCost: 0,
    tbCost: l4Cost,
    tbACost: l4ACost,
    tbCostRemaining: l4CostRemaining,
    tbResID: 0,
    tbCostID: null,
    tbCustomerID: customerID,
    tbOwner: '',
    tbBarHeight: null,
    tbBLID: '',
    tbPredecessor: '',
    tbConstraintType: '',
    tbConstraintDate: '',
    tbFloat: 0,
    tbFreeFloat: 0,
    tbL1: 'Inflight resource usage summary',
    tbL2: '',
    tbL3: '',
    tbL4: '',
    tbL5: '',
    tbWbsDescription: null,
    tbHierarchyOrder: hierarchyOrder(1, 0, 0, 0, 0),
    canvasNo: 1,
    kbCoordTop: 0,
    kbCoordLeft: '0',
    tbStatus: 'Active',
    tbState: '',
    tbStep: null,
    tbStepStatus: null,
    tbStage: null,
    tbPriority: null,
    tbPhase: null,
    tbBarColor: null,
    tbTextColor: null,
  }

  return {
    tb: [l1TbRow, l2TbRow, l4TbRow, ...l5Tb],
    tbmd: [
      buildMinimalTbmd(vL1ID, 'Inflight resource usage summary', customerID),
      buildMinimalTbmd(vL2ID, 'Current inflight projects', customerID),
      buildMinimalTbmd(vL4ID, 'Resource Plan Summary by Role', customerID),
      ...l5Tbmd,
    ],
  }
}
