// app/dashboard/drilldown/cards/page.jsx
'use client'

import { useState } from 'react'
import { Layers, ChevronRight } from 'lucide-react'
import { useEnterpriseDashboardSource } from '@/app/dashboard/_hooks/useEnterpriseDashboardSource'
import { filterL4Data, filterL3AndL4Data } from '@/lib/crud/pubsetDataFetcher'
import {
  EnterpriseLoading,
  EnterpriseUnauthenticated,
  EnterpriseNoSource,
  EnterpriseError,
} from '@/app/dashboard/_components/EnterprisePageStates'
import CollapsibleCardLights from '@/components/Dashboard/Cards/CollapsibleCardLights'
import TabsBelowCardsComponent from '@/components/Dashboard/Cards/TabsBelowCardsComponent'

/**
 * Enterprise Project Cards Drilldown Page
 * Reuses CollapsibleCardLights and TabsBelowCardsComponent from the dashboard.
 * Provides hierarchical card-based navigation: Portfolio > Project > Work Package > Tasks
 * with 7-dimension health indicators on each card.
 */
const ProjectCardsPage = () => {
  const [projid, setProjid] = useState(null)
  const [subprojid, setSubprojid] = useState(null)
  const [l4Id, setL4Id] = useState(null)
  const [tbL2, settbL2] = useState(null)

  const { dashboardSource, adaptedData, session, status, isLoading, error } =
    useEnterpriseDashboardSource()

  if (isLoading) {
    return (
      <EnterpriseLoading
        title="Project Cards"
        icon={Layers}
        message="Loading project cards..."
      />
    )
  }

  if (status === 'unauthenticated') {
    return <EnterpriseUnauthenticated reportName="project cards" />
  }

  if (!dashboardSource) {
    return <EnterpriseNoSource title="Project Cards" icon={Layers} />
  }

  if (error) {
    return <EnterpriseError title="Project Cards" icon={Layers} error={error} />
  }

  const currentUser = session.user.name

  // Deconstruct adapted data (same shape as fetchDataWithToken)
  let {
    pfRows,
    pjRows,
    workPackageRows,
    wpL4Rows,
    pjL3And4Rows,
    allPlannedRows,
    pfRowsPlanned,
    pjRowsPlanned,
    workPackageRowsPlanned,
  } = adaptedData

  // Apply drill-down filters (same logic as CardTopDataComponent)
  const { l4Tasks, l4Risks, l4Issues } = filterL4Data(wpL4Rows, l4Id)
  const { l3L4Tasks, l3L4Risks, l3L4Issues } = filterL3AndL4Data(pjL3And4Rows, tbL2)

  pjRows = pjRows.filter(row => row.tbSelfKey2 === projid)
  workPackageRows = workPackageRows.filter(row => row.tbSelfKey2 === subprojid)
  const tasksRisksIssuesForProject = pjL3And4Rows.filter(row => row.tbL2 === tbL2)

  // Card click handlers
  const handleClickOnPfCard = (id, tbL2Value = null) => {
    setProjid(id)
    if (tbL2Value !== null) settbL2(tbL2Value)
  }
  const handleClickOnPjCard = (id, tbL2Value = null) => {
    setSubprojid(id)
    if (tbL2Value !== null) settbL2(tbL2Value)
  }
  const handleClickOnWpCard = (id, tbL2Value = null) => {
    setL4Id(id)
    if (tbL2Value !== null) settbL2(tbL2Value)
  }

  // Visibility toggles
  const handleHideProjid = () => setProjid(null)
  const handleHideSubprojid = () => setSubprojid(null)
  const handleHideL4Id = () => setL4Id(null)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Layers className="w-8 h-8 text-blue-600" />
          Project Cards - Drilldown
        </h1>
        <p className="text-gray-600">
          Source: <span className="font-medium">{dashboardSource.name}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Click cards to drill down through the portfolio hierarchy with health indicators
        </p>
      </div>

      {pfRows.length === 0 && pjRows.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            No portfolio or project data available in this dashboard source.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg shadow-md">
          {/* Level 1 - Portfolio Cards */}
          <div className="bg-gradient-to-r from-brown-100 to-brown-50 p-6">
            <h2 className="text-2xl font-semibold text-brown-800 mb-4">Level 1 - Portfolio</h2>
            <CollapsibleCardLights
              currentRows={adaptedData.pfRows}
              plannedRows={pfRowsPlanned}
              handleClickOnCard={handleClickOnPfCard}
              type="portfolio"
            />
          </div>

          {/* Level 2 - Project Cards and L3/L4 Tasks */}
          <div className="bg-gradient-to-r from-green-50 to-green-10 p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-semibold text-green-800">Level 2 - Projects</h2>
              {projid !== null && (
                <button
                  onClick={handleHideProjid}
                  className="text-blue-400 hover:text-blue-600 transition-colors duration-200 ml-5"
                >
                  Hide cards
                </button>
              )}
            </div>

            {projid === null && (
              <div className="text-gray-600 italic mb-4">Level 2 Cards show here!</div>
            )}

            <CollapsibleCardLights
              currentRows={pjRows}
              plannedRows={pjRowsPlanned}
              handleClickOnCard={handleClickOnPjCard}
              type="project"
            />

            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-semibold text-blue-800 mb-1">Level 3 &amp; 4 Tasks, Risks and Issues</h2>
              {subprojid !== null && (
                <button
                  onClick={handleHideSubprojid}
                  className="text-blue-400 hover:text-blue-600 transition-colors duration-200 ml-5"
                >
                  Hide Panel
                </button>
              )}
            </div>

            {workPackageRows.length ? (
              <div>
                <div className="flex items-center space-x-2">
                  <span className="py-2">Card Path: {workPackageRows[0].tbL1}</span>
                  <ChevronRight className="h-5 w-5 text-green-500" />
                  <span>{workPackageRows[0].tbL2}</span>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-10 p-2 rounded-lg shadow-sm">
                  <div className="space-y-4">
                    <TabsBelowCardsComponent
                      tasks={l3L4Tasks}
                      risks={l3L4Risks}
                      issues={l3L4Issues}
                      tasksRisksIssues={tasksRisksIssuesForProject}
                      allPlannedRows={allPlannedRows}
                      currrentUser={currentUser}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 italic">
                To show the associated Project and Workpackage Risks, Issues and Tasks, click a Level 1 Card {' > '} Level 2 Card!
              </div>
            )}
          </div>

          {/* Level 3 - Work Package Cards */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-10 p-6">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-semibold text-orange-800 mb-4">Level 3 - Work Packages</h2>
              {subprojid !== null && (
                <button
                  onClick={handleHideSubprojid}
                  className="text-blue-400 hover:text-blue-600 transition-colors duration-200 ml-5"
                >
                  Hide cards
                </button>
              )}
            </div>
            {subprojid === null && (
              <div className="text-gray-600 italic">Level 3 Cards show here!</div>
            )}
            <CollapsibleCardLights
              currentRows={workPackageRows}
              plannedRows={workPackageRowsPlanned}
              handleClickOnCard={handleClickOnWpCard}
              type="subproject"
            />

            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-semibold text-blue-800 mb-1">Level 4 - Tasks, Risks and Issues</h2>
              {subprojid !== null && (
                <button
                  onClick={handleHideL4Id}
                  className="text-blue-400 hover:text-blue-600 transition-colors duration-200 ml-5"
                >
                  Hide Panel
                </button>
              )}
            </div>
            {l4Id ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="py-2">Card Path: {workPackageRows[0]?.tbL1}</span>
                  <ChevronRight className="h-5 w-5 text-green-500" />
                  <span>{workPackageRows[0]?.tbL2}</span>
                  <ChevronRight className="h-5 w-5 text-orange-500" />
                  <span>{workPackageRows[0]?.tbL3}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 italic">
                To show the associated Project Risks, Issues and Tasks, click a Level 1 Card {' > '} Level 2 Card {' > '} Level 3 Card!
              </div>
            )}
          </div>

          {/* Level 4 - Tasks/Risks/Issues Detail */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-10 p-6">
            {l4Id ? (
              <div className="space-y-4">
                <TabsBelowCardsComponent
                  tasks={l4Tasks}
                  risks={l4Risks}
                  issues={l4Issues}
                  tasksRisksIssues={wpL4Rows}
                  allPlannedRows={allPlannedRows}
                  currrentUser={currentUser}
                />
              </div>
            ) : (
              <div className="text-gray-600 italic" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectCardsPage
