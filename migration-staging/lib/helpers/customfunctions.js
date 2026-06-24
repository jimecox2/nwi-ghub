// nofificatins
// Helper function to convert HH:mm to HH:mm:ss.SSS format
export const formatTimeForStrapi = (timeString) => {
  if (!timeString) return null;
  
  // If already in correct format, return as is
  if (timeString.includes(':') && timeString.split(':').length >= 3) {
    return timeString;
  }
  
  // Convert HH:mm to HH:mm:ss.SSS
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return `${timeString}:00.000`;
  }
  
  // Convert HH:mm:ss to HH:mm:ss.SSS
  if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return `${timeString}.000`;
  }
  
  return timeString;
};


/* START DASHBOARD */

// lib/fieldConfigs.js
export const abFields = {
  tbID: "tbID", //mandatory
  tbSelfKey2: 'Parent',
  tbType: 'Type',
  tbSubType: 'Sub-Type',
  tbHierarchyOrder: 'WBS',  //mandatory
  tbName: 'Name of Item',  //mandatory
  tbOwner: 'Owner', //mandatory 
  tbStatus: 'Status',  //mandatory
  tbMDDescription: 'Summary Description',
  tbStart: 'Start',
  tbFinish: 'Finish',
  tbAStart: 'A Start',
  tbAFinish: 'A finish',
  tbDuration: 'Dur',
  tbRemainingDuration: 'Rem Dur',
  tbWork: 'Work',
  tbAWork: 'A work',
  tbWorkRemaining: 'Rem work',
  tbPercentComplete: 'Percent Compl',
  tbPriority: 'Priority',
  tbMDNotes: 'Weekly Status Notes',
  tbMDNotesProject: 'Notes Project',
  tbMDPM: 'PM',
  tbMDHealth: 'Health',
  tbMDHealthCost: 'Health Cost',
  tbMDHealthHours: 'Health Hours',
  tbMDHealthIssues: 'Health Issues',
  tbMDHealthOverall: 'Health Overall',
  tbMDHealthRisk: 'Health Risk',
  tbMDHealthSchedule: 'Health Schedule',
  tbMDHealthScope: 'Health Scope',
  tbL1: 'L1 Name',
  tbL2: 'L2 Name'
};

export const tbFields = {
  tbID: "tbID", //mandatory
  tbSelfKey2: 'Parent',
  tbType: 'Type',
  tbSubType: 'Sub-Type',
  tbHierarchyOrder: 'WBS',  //mandatory
  tbName: 'Name of Item',  //mandatory
  tbMDCategory: 'Category', //mandatory
  tbOwner: 'Owner', //mandatory 
  tbStatus: 'Status',  //mandatory
  tbMDDescription: 'Summary Description',
  tbStart: 'Start',
  tbFinish: 'Finish',
  tbAStart: 'A Start',
  tbAFinish: 'A finish',
  tbDuration: 'Dur',
  tbRemainingDuration: 'Rem Dur',
  tbCost: 'Cost',
  tbACost: 'A Cost',
  tbCost: 'Cost Rem',
  tbWork: 'Work',
  tbAWork: 'A work',
  tbWorkRemaining: 'Work Rem',
  tbPercentComplete: 'Percent Compl',
  tbPriority: 'Priority',
  tbCostType: 'Cost Type',
  tbMDNotes: 'Weekly Status Notes',
  tbL1: 'L1 Name',
  tbL2: 'L2 Name',
  tbL3: 'L3 Name',
  tbMDHealth: 'Health',
  tbMDHealthCost: 'Health Cost',
  tbMDHealthHours: 'Health Hours',
  tbMDHealthIssues: 'Health Issues',
  tbMDHealthOverall: 'Health Overall',
  tbMDHealthRisk: 'Health Risk',
  tbMDHealthSchedule: 'Health Schedule',
  tbMDHealthScope: 'Health Scope',
  tbMDLocation: 'Location',
  tbMDNotesProject: 'Notes Project',
  tbMDPM: 'PM',
  tbMDPhase: 'Phase',
  tbMDProjectNumber: 'Project Number',
  tbMDResponsibility: 'Responsibility',
  tbMDSize: 'size',
  tbMDSponsoringDepartment: 'Sponsor',
  tbMDStage: 'Stage',
  tbMDStatus: 'MD Status',
  tbMDWeighting: 'Weight',
  tbMDtbLastModified: 'Last Modified',
  tbMDMitigationPlan: 'Mitigation Plan',
  tbMDMitigationStatus: 'Mitigation Status',
  tbMDProbability: 'Probability',
  tbMDImpact: 'Impact',
  tbMDScore: 'Score',
  tbMDRiskResponseStrategy: 'Risk Response Strategy',
  tbMDContingencyPlan: 'Contingency Plan',
  tbMDEscalationLevel: 'Escalation Level',
  tbMDTriggerEvent: 'Trigger Event',
  tbMDEarlyWarningIndicators: 'Early Warning Indicators'
};

export const cbFields = {
  tbID: "tbID", //mandatory
  tbSelfKey2: 'Parent',
  tbType: 'Type',
  tbSubType: 'Sub-Type',
  tbHierarchyOrder: 'WBS',  //mandatory
  tbName: 'Name of Item',  //mandatory
  tbMDCategory: 'Category', //mandatory
  tbOwner: 'Owner', //mandatory 
  tbStatus: 'Status',  //mandatory
  tbMDDescription: 'Summary Description',
  tbStart: 'Start',
  tbFinish: 'Finish',
  tbAStart: 'A Start',
  tbAFinish: 'A finish',
  tbDuration: 'Dur',
  tbRemainingDuration: 'Rem Dur',
  tbCost: 'Cost',
  tbACost: 'A Cost',
  tbCost: 'Cost Rem',
  tbWork: 'Work',
  tbAWork: 'A work',
  tbWorkRemaining: 'Work Rem',
  tbPercentComplete: 'Percent Compl',
  tbPriority: 'Priority',
  tbCostType: 'Cost Type',
  tbMDNotes: 'Weekly Status Notes',
  tbL1: 'L1 Name',
  tbL2: 'L2 Name',
  tbL3: 'L3 Name',
  tbMDHealth: 'Health',
  tbMDHealthCost: 'Health Cost',
  tbMDHealthHours: 'Health Hours',
  tbMDHealthIssues: 'Health Issues',
  tbMDHealthOverall: 'Health Overall',
  tbMDHealthRisk: 'Health Risk',
  tbMDHealthSchedule: 'Health Schedule',
  tbMDHealthScope: 'Health Scope',
  tbMDLocation: 'Location',
  tbMDNotesProject: 'Notes Project',
  tbMDPM: 'PM',
  tbMDPhase: 'Phase',
  tbMDProjectNumber: 'Project Number',
  tbMDResponsibility: 'Responsibility',
  tbMDSize: 'size',
  tbMDSponsoringDepartment: 'Sponsor',
  tbMDStage: 'Stage',
  tbMDStatus: 'MD Status',
  tbMDWeighting: 'Weight',
  tbMDtbLastModified: 'Last Modified',
  tbMDMitigationPlan: 'Mitigation Plan',
  tbMDMitigationStatus: 'Mitigation Status',
  tbMDProbability: 'Probability',
  tbMDImpact: 'Impact',
  tbMDScore: 'Score',
  tbMDRiskResponseStrategy: 'Risk Response Strategy',
  tbMDContingencyPlan: 'Contingency Plan',
  tbMDEscalationLevel: 'Escalation Level',
  tbMDTriggerEvent: 'Trigger Event',
  tbMDEarlyWarningIndicators: 'Early Warning Indicators'
};

export const pubsetReport = {
  tbID: "ID", //mandatory - renamed from tbID, will be prefixed with pubset ID
  tbSelfKey2: 'Parent',
  tbType: 'Type',
  // Removed: tbSubType (Sub-Type)
  // Removed: tbHierarchyOrder (WBS)
  tbName: 'Name of Item',  //mandatory
  tbMDCategory: 'Category', //mandatory
  tbOwner: 'Owner', //mandatory
  tbStatus: 'Status',  //mandatory
  tbMDDescription: 'Summary Description',
  tbStart: 'Start',
  tbFinish: 'Finish',
  tbAStart: 'A Start',
  tbAFinish: 'A finish',
  tbDuration: 'Dur',
  tbRemainingDuration: 'Rem Dur',
  tbCost: 'Cost',
  tbACost: 'A Cost',
  tbWork: 'Work',
  tbAWork: 'A work',
  tbWorkRemaining: 'Work Rem',
  tbPercentComplete: 'Percent Compl',
  tbPriority: 'Priority',
  tbCostType: 'Cost Type',
  tbMDNotes: 'Weekly Status Notes',
  tbL1: 'L1 Name',
  tbL2: 'L2 Name',
  tbL3: 'L3 Name',
  tbMDHealth: 'Health',
  tbMDHealthCost: 'Health Cost',
  tbMDHealthHours: 'Health Hours',
  tbMDHealthIssues: 'Health Issues',
  tbMDHealthOverall: 'Health Overall',
  tbMDHealthRisk: 'Health Risk',
  tbMDHealthSchedule: 'Health Schedule',
  tbMDHealthScope: 'Health Scope',
  tbMDLocation: 'Location',
  tbMDNotesProject: 'Notes Project',
  tbMDPM: 'PM',
  tbMDPhase: 'Phase',
  tbMDProjectNumber: 'Project Number',
  tbMDResponsibility: 'Responsibility',
  tbMDSize: 'size',
  tbMDSponsoringDepartment: 'Sponsor',
  tbMDStage: 'Stage',
  tbMDStatus: 'MD Status',
  tbMDWeighting: 'Weight',
  tbMDtbLastModified: 'Last Modified'
  // Removed fields: Mitigation Plan, Mitigation Status, Probability, Impact, Score, Risk Response Strategy, Contingency Plan, Escalation Level, Trigger Event, Early Warning Indicators
};

export const riskIssuesReport = {
  tbID: "tbID", //mandatory
  tbSelfKey2: 'Parent',
  tbType: 'Type',
  tbSubType: 'Sub-Type',
  tbHierarchyOrder: 'WBS',  //mandatory
  tbName: 'Name of Item',  //mandatory
  tbMDCategory: 'Category', //mandatory
  tbOwner: 'Owner', //mandatory
  tbStatus: 'Status',  //mandatory
  tbMDDescription: 'Summary Description',
  tbStart: 'Start',
  tbFinish: 'Finish',
  tbAStart: 'A Start',
  tbAFinish: 'A finish',
  tbDuration: 'Dur',
  tbRemainingDuration: 'Rem Dur',
  tbCost: 'Cost',
  tbACost: 'A Cost',
  tbCost: 'Cost Rem',
  tbWork: 'Work',
  tbAWork: 'A work',
  tbWorkRemaining: 'Work Rem',
  tbPercentComplete: 'Percent Compl',
  tbPriority: 'Priority',
  tbCostType: 'Cost Type',
  tbMDNotes: 'Weekly Status Notes',
  tbType: 'Type',
  tbSubType: 'Sub-Type',
  tbID: "ID", //mandatory
  tbSelfKey2: 'Parent',
  tbMDHealth: 'Health',
  tbMDNotesProject: 'Notes Project',
  tbMDPM: 'PM',
  tbMDMitigationPlan: 'Mitigation Plan',
  tbMDMitigationStatus: 'Mitigation Status',
  tbMDProbability: 'Probability',
  tbMDImpact: 'Impact',
  tbMDScore: 'Score',
  tbMDRiskResponseStrategy: 'Risk Response Strategy',
  tbMDContingencyPlan: 'Contingency Plan',
  tbMDEscalationLevel: 'Escalation Level',
  tbMDTriggerEvent: 'Trigger Event',
  tbMDEarlyWarningIndicators: 'Early Warning Indicators',
  tbL1: 'L1 Name',
  tbL2: 'L2 Name',
  tbL3: 'L3 Name',
};

export const varianceReport = {
  tbID: "tbID", //mandatory
  tbSelfKey2: 'Parent',
  tbType: 'Type',
  tbSubType: 'Sub-Type',
  tbHierarchyOrder: 'WBS',  //mandatory
  tbName: 'Name of Item',  //mandatory
  tbMDCategory: 'Category', //mandatory
  tbOwner: 'Owner', //mandatory 
  tbStatus: 'Status',  //mandatory
  tbOwner: "Owner",
  tbMDStatus: "Status",
  tbMDState: "WF State",
  tbStart: "Start",
  tbFinish: "Finish",
  tbAStart: "A Start",
  tbAFinish: "A Finish",
  blStartVariance: 'S Var.',
  blFinishVariance: 'F Var',
  blDurationVariance: 'Dur. Var',
  blWorkVariance: 'Work Var',
  blCostVariance: 'Cost Var',
  blStart: 'BL Start',
  blFinish: 'BL Finish',
  blDuration: 'BL Dur',
  blRemainingDuration: 'BL Rem. Dur.',
  blWork: 'BL Work',
  blAWork: 'BL A Work',
  blWorkRemaining: 'BL Rem Work',
  blCost: 'BL Cost',
  blACost: 'BL A Cost',
  blCostRemaining: 'BL Rem Cost',
  tbMDDescription: 'Summary Description',
  tbL1: 'L1 Name',
  tbL2: 'L2 Name',
  tbL3: 'L3 Name',
};

/* 
tbID: "ID",
tbHierarchyOrder: "Hierarchy",
tbType: "Type",
tbName: "Name",
tbMDHealth: "Sch. Status",
tbMDPriority: "Priority",
blStartVariance: "S Var.",
blFinishVariance: "F Var",
blDurationVariance: "Dur. Var",
blWorkVariance: "Work Var",
blCostVariance: "Cost Var",
tbOwner: "Owner",
tbMDStatus: "Status",
tbMDState: "WF State",
tbStart: "Start",
tbFinish: "Finish",
tbAStart: "A Start",
tbAFinish: "A Finish",
blStart: "BL Start",
blFinish: "BL Finish",
tbDuration: "Dur",
tbRemainingDuration: "Rem. Dur.",
blDuration: "BL Dur",
blRemainingDuration: "BL Rem. Dur.",
tbWork: "Work",
tbAWork: "A Work",
tbWorkRemaining: "Rem Work",
blWork: "BL Work",
blAWork: "BL A Work",
blWorkRemaining: "BL Rem Work",
tbCost: "Cost",
tbACost: "A Cost",
tbCostRemaining: "Rem Cost",
blCost: "BL Cost",
blACost: "BL A Cost",
blCostRemaining: "BL Rem Cost",
*/


//lib/helpers/customfunctions.js
export const getFieldsForProduct = (license, reportType = 'default') => {
  // First check report type
  if (reportType === 'risk') return riskIssuesReport;
  if (reportType === 'variance') return varianceReport;
  if (reportType === 'pubset') return pubsetReport;

  // Then check product license
  if (!license) return abFields;

  const productPrefix = license.substring(0, 2);
  switch (productPrefix) {
    case 'AB': return abFields;
    case 'TB': return tbFields;
    case 'CB': return cbFields;
    default: return abFields;
  }
};
/* END DASHBOARD */


/**
 * Checks user license information from the API
 * @param {string} useremail - The email of the user
 * @param {string} token - Authentication token for API
 * @param {string} API_URL - Base URL of the API
 * @returns {Promise<{license: string, expires: string}>} License and expiration information
 */
export const licenseCheck = async (useremail, token, API_URL) => {
  // Default values if no license is found
  let license = "No License Found";
  let expires = "Date not found";

  // Only attempt to fetch if useremail is provided
  if (useremail) {
    try {
      const res = await fetch(`${API_URL}/orders?populate[0]=product&populate[1]=user&[filters][owner][$eq]=${useremail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data && data.data) {
        const activeOrder = data.data.find(item => item.attributes.active_status);

        if (activeOrder) {
          license = activeOrder.attributes.product.data.attributes.product_code;
          expires = activeOrder.attributes.expires_on;
        }
      }
    } catch (error) {
      console.error("Error fetching license:", error);
      // Keep the default values in case of error
    }
  }

  // Return the license information as an object
  return { license, expires };
};



export function addMonthsToDate(months) {
  // Get today's date
  let today = new Date();

  // Add the number of months
  today.setMonth(today.getMonth() + months);

  // Define the month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get the day, month, and year from the new date
  let day = today.getDate();
  let month = monthNames[today.getMonth()];
  let year = today.getFullYear();

  // Format and return the date as "27 September 2024"
  return `${day} ${month} ${year}`;
}

export function formatDate(date) {
  // Ensure the input is a valid Date object
  const formattedDate = new Date(date);

  // Check if the date is valid
  if (isNaN(formattedDate.getTime())) {
    return 'Invalid Date';
  }

  // Define the month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get the day, month, and year from the date
  const day = formattedDate.getDate();
  const month = monthNames[formattedDate.getMonth()];
  const year = formattedDate.getFullYear();

  // Format and return the date as "27 September 2024"
  return `${day} ${month} ${year}`;
}

/* these work
console.log(formatDate("2024-09-27"));
console.log(formatDate("September 27, 2024"));
console.log(formatDate(1727308800000));
console.log(formatDate(new Date(2024, 8, 27)));
*/