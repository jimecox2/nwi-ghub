// app/dataFetcher.js
'use client'
import axios from 'axios'
import { API_URL } from '@/config/index'

// Sorting function
const sortByHierarchyOrder = (a, b) => a.tbHierarchyOrder - b.tbHierarchyOrder;

export async function fetchDataWithToken(session) {
  try {
    const res = await axios.get(`${API_URL}/timebars?filters[owner][$eq]=${session.user.email}&filters[isActive][$eq]=true`, {
      headers: { 'Authorization': `Bearer ${session.jwt}` }
    });
    const pubSet = res.data.data[0]?.attributes;

    // https://be2.timebars.com/api/timebars?filters[owner][$eq]=jcox@tbcox.com&filters[isActive][$eq]=true

    if (!pubSet || pubSet.tb.length === 0) {
      throw new Error('No data found');
    }
    const allRows = pubSet.tbmdjoined.sort(sortByHierarchyOrder);
    const tbbaseline = pubSet.tbbaseline.sort(sortByHierarchyOrder);
    const bdCharts = pubSet.tbcharts
    const resCalcs = pubSet.tbrescalcs2

    /*    console.log("log fetcher: ", {
         pubSet,
         allRows,
       email: session.user.email
         }) 
        */
    return {
      // Current or forecast data  
      allRows,
      pfRows: allRows.filter(row => row.tbType === "Portfolio"),
      pjRows: allRows.filter(row => row.tbType === "Project"),
      workPackageRows: allRows.filter(row => row.tbType === "Sub-Project"),
      wpL4Rows: allRows.filter(row => row.tbType === "Task" || row.tbType === "Milestone"),
      pjL3And4Rows: allRows.filter(row => row.tbType === "Task" || row.tbType === "Sub-Project"),

      // Baseline Planned data
      allPlannedRows: tbbaseline,
      pfRowsPlanned: tbbaseline.filter(row => row.tbType === "Portfolio"),
      pjRowsPlanned: tbbaseline.filter(row => row.tbType === "Project"),
      workPackageRowsPlanned: tbbaseline.filter(row => row.tbType === "Sub-Project"),

      // chart data
      bdCharts,
      resCalcs,

    };
  } catch (error) {
    throw new Error('Failed to fetch data: ' + error.message);
  }
}

/* tbResCalcs2
{
    "id": 869,
    "tbL1": "Digital Workplace - Transformation",
    "tbL2": "Technology Upgrades",
    "tbL3": "NA",
    "tbL4": "My New Risk",
    "tbL5": "Joe Invent",
    "tbName": "Joe Invent",
    "tbType": "Allocation",
    "tbOwner": "Joe Invent",
    "tbResCalcID": "11098:700:1",
    "apStatusDate": "2024-10-28",
    "tbMDLocation": "Ottawa",
    "tbMDNameShort": "JI",
    "tbResCalcCost": "1000",
    "tbResCalcName": "weekly",
    "tbResCalcTbID": "11098",
    "tbResCalcWeek": "2024-10-21",
    "tbMDDepartment": "Delivery",
    "tbResCalcHours": "20",
    "tbResCalcResID": "700",
    "tbResCalcWdays": "5",
    "tbMDPrimaryRole": "Developer",
    "tbResCalcFriday": "2024-10-25",
    "tbResCalcMonday": "2024-10-21",
    "tbResCalcWeekNo": 1,
    "tbMDPrimarySkill": "Testing",
    "tbResCalcCustomerID": "44"
}
*/

export function filterL4Data(wpL4Rows, l4Id) {
  return {
    l4Tasks: wpL4Rows.filter(row => (row.tbType === "Task" || row.tbType === "Milestone") && row.tbSubType === "Task" && row.tbSelfKey2 === l4Id).sort(sortByHierarchyOrder),
    l4Risks: wpL4Rows.filter(row => row.tbType === "Task" && row.tbSubType === "Risk" && row.tbSelfKey2 === l4Id).sort(sortByHierarchyOrder),
    l4Issues: wpL4Rows.filter(row => row.tbType === "Task" && row.tbSubType === "Issue" && row.tbSelfKey2 === l4Id).sort(sortByHierarchyOrder)
  };
}

export function filterL3AndL4Data(pjL3And4Rows, tbL2) {
  return {
    l3L4Tasks: pjL3And4Rows.filter(row => (row.tbType === "Task" || row.tbType === "Milestone" || row.tbType === "Sub-Project") && row.tbSubType === "Task" && row.tbL2 === tbL2).sort(sortByHierarchyOrder),
    l3L4Risks: pjL3And4Rows.filter(row => (row.tbType === "Task" || row.tbType === "Sub-Project") && row.tbSubType === "Risk" && row.tbL2 === tbL2).sort(sortByHierarchyOrder),
    l3L4Issues: pjL3And4Rows.filter(row => (row.tbType === "Task" || row.tbType === "Sub-Project") && row.tbSubType === "Issue" && row.tbL2 === tbL2).sort(sortByHierarchyOrder)
  };
}


/* How to use this on client page
// swr does not work on  server page

import useSWR from 'swr'
import { fetchDataWithToken, filterL4Data, filterL3AndL4Data } from '@/lib/crud/pubsetDataFetcher'

  // get pubset data
  const fetcher = async () => {
    if (session && status === 'authenticated') {
      return await fetchDataWithToken(session)
    }
    return null;
  }
  const { data, error } = useSWR(status === 'authenticated' ? 'fetchData' : null, fetcher)
  if (status === 'loading' || !data) {
    return <div>Loading...</div> // Show a loading state while data is being fetched
  }
  if (error) {
    return <div>Failed to load data: {error.message}</div>
  }

  // deconstruct data
  const { allRows, pfRows, pjRows, workPackageRows, wpL4Rows, pjL3And4Rows, pfRowsPlanned, pjRowsPlanned, workPackageRowsPlanned } = data;
  const { l4Tasks, l4Risks, l4Issues } = filterL4Data(wpL4Rows, null);
  const { l3L4Tasks, l3L4Risks, l3L4Issues } = filterL3AndL4Data(pjL3And4Rows, null);

  console.log("all rows ", allRows);

    // for testing
  let datatest = [
    {
      tbID: 1,
      tbSelfKey2: "ISSUE-001",
      tbHierarchyOrder: 1,
      tbName: "Server Performance Issue",
      tbMDDescription: "Users are experiencing slow response times",
      tbMDNotes: "Investigating potential database bottlenecks",
      tbType: "Technical",
      tbSubType: "Performance",
      tbL1: null,
      tbL2: null,
      tbL3: null,
      tbOwner: "John Doe",
      tbStart: "2023-05-01",
      tbFinish: "2023-05-15",
      tbAStart: "",
      tbAFinish: "",
      tbWork: 40,
      tbCost: 5000,
      tbStatus: "Active",
      tbState: "In Progress",
      tbStage: null,
      tbPriority: "High",
      tbPhase: null,
      tbMDCategory: "Infrastructure",
      tbMDSeverity: "Major",
      tbMDProduct: "Web App",
      tbMDDepartment: "IT",
      tbMDHealthIssues: "None",
      tbMDSize: "Medium",
      tbMDPrimaryContact: "jane@example.com",
      tbMDPrimaryLineOfBusiness: "E-commerce",
      tbMDBackgroundInfo: "Issue started after recent server upgrade",
      tbMDSortOrder: null,
      tbMDtbLastModified: null,
      tbMDPM: "Sarah Smith",
      tbMDShowIn: "Dashboard"
    },
    {
      tbID: 2,
      tbSelfKey2: "ISSUE-002",
      tbHierarchyOrder: 2,
      tbName: "UI Bug in Checkout Process",
      tbMDDescription: "Users unable to complete purchases",
      tbMDNotes: "Error occurs when validating credit card information",
      tbType: "Bug",
      tbSubType: "Frontend",
      tbL1: null,
      tbL2: null,
      tbL3: null,
      tbOwner: "Alice Johnson",
      tbStart: "2023-05-10",
      tbFinish: "2023-05-20",
      tbAStart: "",
      tbAFinish: "",
      tbWork: 25,
      tbCost: 3000,
      tbStatus: "Active",
      tbState: "In Progress",
      tbStage: null,
      tbPriority: "Critical",
      tbPhase: null,
      tbMDCategory: "User Experience",
      tbMDSeverity: "Critical",
      tbMDProduct: "Mobile App",
      tbMDDepartment: "Development",
      tbMDHealthIssues: "None",
      tbMDSize: "Small",
      tbMDPrimaryContact: "bob@example.com",
      tbMDPrimaryLineOfBusiness: "Retail",
      tbMDBackgroundInfo: "Issue reported by multiple users on iOS devices",
      tbMDSortOrder: null,
      tbMDtbLastModified: null,
      tbMDPM: "Mike Brown",
      tbMDShowIn: "All Reports"
    },
    {
      tbID: 3,
      tbSelfKey2: "ISSUE-003",
      tbHierarchyOrder: 3,
      tbName: "Data Sync Failure",
      tbMDDescription: "Inconsistent data between mobile and web platforms",
      tbMDNotes: "Investigating API endpoints and sync mechanisms",
      tbType: "Technical",
      tbSubType: "Data",
      tbL1: null,
      tbL2: null,
      tbL3: null,
      tbOwner: "Emma Wilson",
      tbStart: "2023-05-15",
      tbFinish: "2023-05-30",
      tbAStart: "",
      tbAFinish: "",
      tbWork: 60,
      tbCost: 7500,
      tbStatus: "Active",
      tbState: "Analysis",
      tbStage: null,
      tbPriority: "High",
      tbPhase: null,
      tbMDCategory: "Data Management",
      tbMDSeverity: "Major",
      tbMDProduct: "Cross-platform",
      tbMDDepartment: "Engineering",
      tbMDHealthIssues: "None",
      tbMDSize: "Large",
      tbMDPrimaryContact: "charlie@example.com",
      tbMDPrimaryLineOfBusiness: "Finance",
      tbMDBackgroundInfo: "Issue affects data integrity across platforms",
      tbMDSortOrder: null,
      tbMDtbLastModified: null,
      tbMDPM: "David Lee",
      tbMDShowIn: "Executive Summary"
    }
  ];
*/