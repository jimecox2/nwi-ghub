
export const defaultFields = {
    tbID: { title: 'ID', width: '30px' },
    //tbHierarchyOrder: { title: 'WBS', width: '80px' },
    tbType: { title: 'Type', width: '50px' },
    tbSubType: { title: "Sub Type", width: '50px' },
    tbL2: { title: 'Project Name', width: '250px' },
    tbName: { title: 'Name', width: '250px' },
    tbOwner: { title: 'Owner', width: '120px' },
    tbMDEscalationLevel: { title: 'Escalation', width: '120px' },
    tbMDStatus: { title: 'Status', width: '100px' },
    tbStart: { title: 'Start', width: '150px' },
    tbFinish: { title: 'Finish', width: '150px' },
    tbAStart: { title: 'A Start', width: '100px' },
    tbAFinish: { title: 'A Finish', width: '100px' },
    tbDuration: { title: 'Dur', width: '100px' },
    tbRemainingDuration: { title: 'Rem. Dur.', width: '150px' },
    tbWork: { title: 'Work', width: '50px' },
    tbAWork: { title: 'A Work', width: '50px' },
    tbWorkRemaining: { title: 'Work Rem.', width: '150px' },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbBudgetHours: { title: 'Budget Hours', width: '50px' },
    tbMDShowIn: { title: "Show In Report", width: '300px' },
};

export const ganttFields = {
    tbID: { title: 'ID', width: '30px' },
    //tbHierarchyOrder: { title: 'WBS', width: '80px' },
    tbType: { title: 'Type', width: '50px' },
    // tbSubType: { title: "Sub Type", width: "75px" },
    tbName: { title: 'Name of Item', width: '250px' },
    //  tbOwner: { title: 'Owner', width: '120px' },
    //  tbMDEscalationLevel: { title: 'Escalation', width: '120px' },
    tbMDStatus: { title: 'Status', width: '100px' },
    tbStart: { title: 'Start', width: '150px' },
    tbFinish: { title: 'Finish', width: '150px' },
    tbAStart: { title: 'A Start', width: '100px' },
    tbAFinish: { title: 'A Finish', width: '100px' },
    tbDuration: { title: 'Dur', width: '100px' },
    tbRemainingDuration: { title: 'Rem. Dur.', width: '150px' },
    tbWork: { title: 'Work', width: '50px' },
    tbAWork: { title: 'A Work', width: '50px' },
    tbWorkRemaining: { title: 'Work Rem.', width: '150px' },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbBudgetHours: { title: 'Budget Hours', width: '50px' },
};

export const commonFields = {
    tbCost: { title: "Cost", width: "50px" },
    tbACost: { title: "A Cost", width: "50px" },
    tbCostRemaining: { title: "Cost Remaining", width: "75px" },
    tbMDPriority: { title: 'Priority', width: '100px' },
    tbMDState: { title: 'State', width: '100px' },
    tbMDStage: { title: 'Stage', width: '100px' },
    tbMDPhase: { title: 'Phase', width: '100px' },
    tbMDCategory: { title: 'Category', width: '100px' },
    tbMDProjectNumber: { title: 'Project Number', width: '100px' },
    tbMDPM: { title: 'PM', width: '100px' },
    tbMDExSponsor: { title: 'Ex Sponsor', width: '100px' },
    tbMDPrimaryContact: { title: 'Primary Contact', width: '100px' },
    tbMDDepartment: { title: 'Department', width: '100px' },
    tbMDProduct: { title: 'Product', width: '100px' },
    tbMDNameShort: { title: 'Name Short', width: '100px' },
    tbMDContractNumber: { title: 'Contract Number', width: '100px' },
    tbMDProjectType: { title: 'Project Type', width: '100px' },
    tbMDRiskVsSizeAndComplexity: { title: 'Risk Vs Size And Complexity', width: '100px' },
    tbMDROMEstimate: { title: 'Budget Estimate', width: '100px' },
    tbMDEstimationClass: { title: 'Estimation Class', width: '100px' },
    tbMDWeighting: { title: 'Weighting', width: '100px' },
    tbMDSize: { title: 'Size', width: '100px' },
    tbMDGate: { title: 'Gate', width: '100px' },
};

export const notesColumns = {
    tbMDDescription: { title: "Description.", width: "275px" },
    tbMDExecutiveSummary: { title: "Executive Summary", width: "275px" },
    tbMDNotesProject: { title: "Notes Project", width: "275px" },
    tbMDNotes: { title: "Notes", width: "275px" },
    //tbMDNotesWorkflow: { title: "Notes Workflow", width: "175px" },
    //tbMDDecisionNotes: { title: 'Costbars Analysis -  Prioritize Results & Decision Results', width: '250px' },
    //tbMDSyncNotes: { title: "Sync Notes", width: "175px" },
}

export const largeTextReport = {
    // Firstfields
    tbID: { title: "ID", width: '30px' },
    tbSelfKey2: { title: "Parent", width: "30px" },

    tbName: { title: "Name", width: '250px' },
    tbType: { title: "Type", width: '50px' },
    tbOwner: { title: "Owner", width: '120px' },
    tbHierarchyOrder: { title: "WBS", width: "40px" },
    tbSubType: { title: "Sub Type", width: '50px' },
    tbMDProjectNumber: { title: "Project Number", width: "75px" },

    // large text fields
    tbMDDescription: { title: "Description", width: "375px" },
    tbMDNotes: { title: "Notes", width: "375px" },
    tbMDExecutiveSummary: { title: "Executive Summary", width: "375px" },
    tbMDNotesProject: { title: "Notes Project", width: "375px" },
    tbMDNotesWorkflow: { title: "Notes Workflow", width: "175px" },
    tbMDDecisionNotes: { title: 'Costbars Analysis -  Prioritize Results & Decision Results', width: '250px' },
    //tbMDSyncNotes: { title: "Sync Notes", width: "175px" },

    // project charter

    tbMDPrimaryLineOfBusiness: { title: "Primary Line Of Business", width: "175px" },
    tbMDBackgroundInfo: { title: "Background Info", width: "175px" },
    tbMDCapabilitiesNeeded: { title: "Capabilities Needed", width: "175px" },
    tbMDConsequence: { title: "Consequence", width: "175px" },
    tbMDExpectedBenefits: { title: "Expected Benefits", width: "175px" },
    tbMDProblemOpportunity: { title: "Problem Opportunity", width: "175px" },
    tbMDConstraintsAssumptions: { title: "Constraints Assumptions", width: "175px" },
    tbMDCostBenefitAnalysis: { title: "Cost Benefit Analysis", width: "175px" },
    tbMDSeniorLevelCommitment: { title: "Senior Level Committment", width: "175px" },
    tbMDStakeholderDescription: { title: "Stakeholder Description", width: "175px" },
    tbMDObjectivesAndScope: { title: "Objectives And Scope", width: "175px" },
    tbMDOptionsAnalysis: { title: "Options Analysis", width: "175px" },
    tbMDImplementationApproach: { title: "Implementation Approach", width: "175px" },
    tbMDNextSteps: { title: "Next Steps", width: "175px" },
    tbMDVersion: { title: "B Case Version", width: "175px" },
    tbMDCharterDateApproved: { title: "B Case Date Approved", width: "175px" },

    // may 6
    tbMDKeyDependencies: { title: "Key Dependencies", width: "175px" },
    tbMDValueProposition: { title: "Value Proposition", width: "175px" },
    tbMDSuccessCriteria: { title: "Success Criteria", width: "175px" },
    tbMDDecisionsRequired: { title: "Decisions Required", width: "175px" },
    tbMDKeyRecommendations: { title: "Key Recommendations", width: "175px" },
    tbMDMarketAnalysis: { title: "Market Analysis", width: "175px" },
    tbMDPortfolioImpactAnalysis: { title: "Portfolio Impact Analysis", width: "175px" },
    tbMDKeyProjectMetrics: { title: "Key Project Metrics", width: "175px" },


    // commentary fields
    tbMDPrerequisitesChecklist: { title: "Prerequisites Checklist", width: "175px" },
    tbMDScheduleCommentary: { title: "Schedule Commentary", width: "175px" },
    tbMDBudgetCommentary: { title: "Budget Commentary", width: "175px" },
    tbMDScopeCommentary: { title: "Scope Commentary", width: "175px" },
    tbMDResourceCommentary: { title: "Resource Commentary", width: "175px" },
    tbMDFinancialCommentary: { title: "Financial Commentary", width: "175px" },


    // sched fields
    tbPredecessor: { title: "Pred -ecessor", width: "30px" },
    tbStart: { title: "Start", width: '150px' },
    tbFinish: { title: "Finish", width: '150px' },
    tbAStart: { title: "A Start", width: '100px' },
    tbAFinish: { title: "A Finish", width: '100px' },
    tbDuration: { title: "Duration", width: '100px' },
    tbRemainingDuration: { title: "Remaining Duration", width: '150px' },
    tbWork: { title: "Work", width: '50px' },
    tbAWork: { title: "A Work", width: '50px' },
    tbWorkRemaining: { title: "Work Remaining", width: '150px' },
    tbPercentComplete: { title: "Percent Complete", width: "75px" },
    tbCost: { title: "Cost", width: "50px" },
    tbACost: { title: "A Cost", width: "50px" },
    tbCostRemaining: { title: "Cost Remaining", width: "75px" },
    tbCostID: { title: "Cost ID", width: "75px" },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbBudgetHours: { title: 'Budget Hours', width: '50px' },
};


// columnConfig.js - Contains all column configurations

// Core Column configuration
export const coreColumnsAB = {
    tbID: { title: 'ID', width: '30px' },
    //tbHierarchyOrder: { title: 'WBS', width: '80px' },
    tbType: { title: 'Type', width: '50px' },
    tbSubType: { title: "Sub Type", width: '50px' },
    tbMDEscalationLevel: { title: 'Escalation', width: '120px' },
    tbName: { title: 'Name of Item', width: '250px' },
    tbOwner: { title: 'Owner', width: '120px' },
    tbMDStatus: { title: 'Status', width: '100px' },
    tbMDHealth: { title: 'Sch. Status', width: '100px' },
    tbStart: { title: 'Start', width: '150px' },
    tbFinish: { title: 'Finish', width: '150px' },
    tbAStart: { title: 'A Start', width: '100px' },
    tbAFinish: { title: 'A Finish', width: '100px' },
    tbDuration: { title: 'Dur', width: '100px' },
    tbRemainingDuration: { title: 'Rem. Dur.', width: '150px' },
    tbWork: { title: 'Work', width: '50px' },
    tbAWork: { title: 'A Work', width: '50px' },
    tbWorkRemaining: { title: 'Work Rem.', width: '150px' },
    tbMDPriority: { title: 'Priority', width: '100px' },
    tbMDState: { title: 'WF State', width: '100px' },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbBudgetHours: { title: 'Budget Hours', width: '50px' },
};

export const coreColumnsABAdv = {
    tbID: { title: 'ID', width: '30px' },
    tbSelfKey2: { title: "Parent", width: "30px" },
    tbHierarchyOrder: { title: 'WBS', width: '80px' },
    tbType: { title: 'Type', width: '50px' },
    tbSubType: { title: "Sub Type", width: '50px' },
    tbMDEscalationLevel: { title: 'Escalation', width: '120px' },
    tbName: { title: 'Name of Item', width: '250px' },
    tbOwner: { title: 'Owner', width: '120px' },

    tbMDDescription: { title: "Description", width: "375px" },
    tbMDNotes: { title: "Notes", width: "375px" },
    tbMDExecutiveSummary: { title: "Executive Summary", width: "375px" },
    tbMDNotesProject: { title: "Notes Project", width: "375px" },

    tbStart: { title: 'Start', width: '150px' },
    tbFinish: { title: 'Finish', width: '150px' },
    tbAStart: { title: 'A Start', width: '100px' },
    tbAFinish: { title: 'A Finish', width: '100px' },
    tbDuration: { title: 'Dur', width: '100px' },
    tbRemainingDuration: { title: 'Rem. Dur.', width: '150px' },
    tbWork: { title: 'Work', width: '50px' },
    tbAWork: { title: 'A Work', width: '50px' },
    tbWorkRemaining: { title: 'Work Rem.', width: '150px' },
    tbMDStatus: { title: 'Status', width: '100px' },
    tbMDHealth: { title: 'Sch. Status', width: '100px' },
    tbMDPriority: { title: 'Priority', width: '100px' },
    tbMDState: { title: 'WF State', width: '100px' },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbBudgetHours: { title: 'Budget Hours', width: '50px' },
};


export const coreColumnsTB = {
    tbID: { title: "ID", width: '30px' },
    tbSelfKey2: { title: "Parent", width: "30px" },
    tbPredecessor: { title: "Predecessor", width: "30px" },
    tbName: { title: "Name", width: '250px' },
    tbType: { title: "Type", width: '50px' },
    tbOwner: { title: "Owner", width: '120px' },
    tbHierarchyOrder: { title: "WBS", width: "40px" },
    tbSubType: { title: "Sub Type", width: '50px' },
    tbMDProjectNumber: { title: "Project Number", width: "75px" },
    // sched fields
    tbStart: { title: "Start", width: '150px' },
    tbFinish: { title: "Finish", width: '150px' },
    tbAStart: { title: "A Start", width: '100px' },
    tbAFinish: { title: "A Finish", width: '100px' },
    tbDuration: { title: "Duration", width: '100px' },
    tbRemainingDuration: { title: "Remaining Duration", width: '150px' },
    tbWork: { title: "Work", width: '50px' },
    tbAWork: { title: "A Work", width: '50px' },
    tbWorkRemaining: { title: "Work Remaining", width: '150px' },
    tbPercentComplete: { title: "Percent Complete", width: "75px" },
    tbCost: { title: "Cost", width: "50px" },
    tbACost: { title: "A Cost", width: "50px" },
    tbCostRemaining: { title: "Cost Remaining", width: "75px" },
    tbCostID: { title: "Cost ID", width: "75px" },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbBudgetHours: { title: 'Budget Hours', width: '50px' },

    // core and progress
    tbMDHealth: { title: "Sch. Status", width: "75px" },
    tbMDStatus: { title: "Status", width: '100px' },
    tbMDState: { title: "State", width: "110px" },
    tbMDPriority: { title: "Priority", width: "110px" },
    tbMDStage: { title: "Stage", width: "110px" },
    tbMDPhase: { title: "Phase", width: "110px" },
    tbMDCategory: { title: "Category", width: "110px" },
    tbMDExSponsor: { title: "Ex Sponsor", width: "110px" },
    tbMDPM: { title: "PM", width: "110px" },
    tbMDProduct: { title: "Product", width: "210px" },
    tbMDEscalationLevel: { title: "Escalation Level", width: '120px' },
    tbMDNameShort: { title: "Name Short", width: "110px" },
    tbMDResponsibility: { title: "Responsibility", width: "110px" },
    tbMDDepartment: { title: "Department", width: "210px" },
    tbMDContact: { title: "Contact", width: "110px" },
    tbMDWeighting: { title: "Weighting", width: "75px" },
    tbMDRiskVsSizeAndComplexity: { title: "Risk Vs Size And Complexity", width: "75px" },
    tbMDLocation: { title: "Location", width: "120px" },
    tbMDContractNumber: { title: "Contract Number", width: "75px" },
};

export const coreColumnsTBAdv = {
    tbID: { title: "ID", width: '30px' },
    tbSelfKey2: { title: "Parent", width: "30px" },
    tbPredecessor: { title: "Predecessor", width: "30px" },
    tbName: { title: "Name", width: '250px' },
    tbType: { title: "Type", width: '50px' },
    tbOwner: { title: "Owner", width: '120px' },
    tbHierarchyOrder: { title: "WBS", width: "40px" },
    tbSubType: { title: "Sub Type", width: '50px' },
    tbMDProjectNumber: { title: "Project Number", width: "75px" },
    tbMDDescription: { title: "Description", width: "375px" },
    tbMDNotes: { title: "Notes", width: "375px" },
    tbMDExecutiveSummary: { title: "Executive Summary", width: "375px" },
    tbMDNotesProject: { title: "Notes Project", width: "375px" },
    // sched fields
    tbStart: { title: "Start", width: '150px' },
    tbFinish: { title: "Finish", width: '150px' },
    tbAStart: { title: "A Start", width: '100px' },
    tbAFinish: { title: "A Finish", width: '100px' },
    tbDuration: { title: "Duration", width: '100px' },
    tbRemainingDuration: { title: "Remaining Duration", width: '150px' },
    tbWork: { title: "Work", width: '50px' },
    tbAWork: { title: "A Work", width: '50px' },
    tbWorkRemaining: { title: "Work Remaining", width: '150px' },
    tbPercentComplete: { title: "Percent Complete", width: "75px" },
    tbCost: { title: "Cost", width: "50px" },
    tbACost: { title: "A Cost", width: "50px" },
    tbCostRemaining: { title: "Cost Remaining", width: "75px" },
    tbCostID: { title: "Cost ID", width: "75px" },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbBudgetHours: { title: 'Budget Hours', width: '50px' },

    // core and progress
    tbMDHealth: { title: "Sch. Status", width: "75px" },
    tbMDStatus: { title: "Status", width: '100px' },
    tbMDState: { title: "State", width: "110px" },
    tbMDPriority: { title: "Priority", width: "110px" },
    tbMDStage: { title: "Stage", width: "110px" },
    tbMDPhase: { title: "Phase", width: "110px" },
    tbMDCategory: { title: "Category", width: "110px" },
    tbMDExSponsor: { title: "Ex Sponsor", width: "110px" },
    tbMDPM: { title: "PM", width: "110px" },
    tbMDProduct: { title: "Product", width: "210px" },
    tbMDEscalationLevel: { title: "Escalation Level", width: '120px' },
    tbMDNameShort: { title: "Name Short", width: "110px" },
    tbMDResponsibility: { title: "Responsibility", width: "110px" },
    tbMDDepartment: { title: "Department", width: "210px" },
    tbMDContact: { title: "Contact", width: "110px" },
    tbMDWeighting: { title: "Weighting", width: "75px" },
    tbMDRiskVsSizeAndComplexity: { title: "Risk Vs Size And Complexity", width: "75px" },
    tbMDLocation: { title: "Location", width: "120px" },
    tbMDContractNumber: { title: "Contract Number", width: "75px" },
};

export const coreColumnsCBStd = {
    tbID: { title: 'ID', width: '30px' },

    tbType: { title: 'Type', width: '50px' },
    tbMDStatus: { title: 'Status', width: '100px' },
    tbName: { title: 'Name', width: '250px' },

    tbMDProduct: { title: 'Product', width: '100' },
    // tbPASStatus: { title: 'Asmt Risk', width: '50' },
    tbPASOverallFeasibilityScore: { title: 'PAS Score', width: '50px' },
    //tbPASPoliticalRiskScore: { title: 'Political Risk', width: '50px' },
    //tbPASRiskScore: { title: 'Tech Risk', width: '50px' },

    tbMDPriorityStrategic: { title: 'SV Score', width: '50' },
    tbMDCostbarsScore: { title: 'AE Score', width: '50' },
    //  tbFinalScore: { title: 'Final Score', width: '50px' }, // not added to system yet. New column added here
    tbMDYesNoSelector: { title: 'Selected YN', width: '100px' },
    tbMDDecisionStrategic: { title: 'Decision (By system)', width: '100px' },
    /*     tbPASRiskScore: { title: 'Asmt. Risk', width: '50px' },  using tbPASStatus instead*/
    tbMDRiskVsSizeAndComplexity: { title: "Risk Size And Complexity", width: "75px" },

    tbMDInvestmentCategory: { title: 'Investment Category', width: '120px' },
    tbMDInvestmentInitiative: { title: 'Investment Initiative', width: '120px' },
    tbMDInvestmentObjective: { title: 'Investment Objective', width: '120px' },
    tbMDInvestmentStrategy: { title: 'Investment Strategy', width: '120px' },
    tbMDFinancialScore: { title: 'Financial Score', width: '50' },
    tbMDState: { title: 'State', width: '100px' },
    tbWork: { title: 'Hours', width: '50px' },
    tbCost: { title: 'Cost', width: '150px' },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbBudgetHours: { title: 'Budget Hours', width: '50px' },

    tbHierarchyOrder: { title: 'WBS', width: '80px' },
    tbStart: { title: 'Start', width: '150px' },
    tbFinish: { title: 'Finish', width: '150px' },
    tbAStart: { title: 'A Start', width: '100px' },
    tbAFinish: { title: 'A Finish', width: '100px' },

    tbOwner: { title: 'Owner', width: '120px' },
    tbMDSponsoringDepartment: { title: 'Sponsoring Department.', width: '150px' },
    tbMDSponsor: { title: 'Sponsor', width: '120px' },
    tbMDProjectNumber: { title: 'Project No.', width: '150px' },
    tbMDBenefitCostRatio: { title: 'BCR.', width: '150px' },
    tbMDEcnomicValueAdded: { title: 'EVA', width: '150px' },
    tbMDInternalRateOfReturn: { title: 'IRR', width: '150px' },
    tbMDSunkCosts: { title: 'Sunk Costs', width: '150px' },
    tbMDNetPresentValue: { title: 'NPV', width: '150px' },
    tbMDOpportunityCost: { title: 'Opp. Cost.', width: '150px' },
    tbMDPaybackPeriod: { title: 'Payback P.', width: '150px' },
};

export const coreColumnsCBAdv = {
    tbID: { title: "ID", width: '30px' },
    tbSelfKey2: { title: "Parent", width: "30px" },
    tbPredecessor: { title: "Predecessor", width: "30px" },
    tbName: { title: "Name", width: '250px' },
    tbType: { title: "Type", width: '50px' },
    tbOwner: { title: "Owner", width: '120px' },
    tbHierarchyOrder: { title: "WBS", width: "40px" },
    tbSubType: { title: "Sub Type", width: '50px' },
    tbMDProjectNumber: { title: "Project Number", width: "75px" },

    tbMDPriorityStrategic: { title: "Priority Strategic", width: "175px" },
    tbMDInvestmentCategory: { title: "Investment Category", width: "175px" },
    tbMDInvestmentInitiative: { title: "Investment Initiative", width: "175px" },
    tbMDInvestmentObjective: { title: "Investment Objective", width: "175px" },
    tbMDInvestmentStrategy: { title: "Investment Strategy", width: "175px" },
    tbMDROMEstimate: { title: "Budget Estimate", width: "175px" },
    tbMDPortfolio: { title: "Portfolio", width: "175px" },
    tbMDProgram: { title: "Program", width: "175px" },
    tbMDProgActivityAlignment: { title: "Prog Activity Alignment", width: "75px" },
    tbMDSize: { title: "Size", width: "50px" },
    tbMDEstimationClass: { title: "Estimation Class", width: "100px" },


    tbMDDescription: { title: "Description", width: "375px" },
    tbMDDecisionNotes: { title: 'Costbars Analysis Results', width: '250px' },
    tbMDExecutiveSummary: { title: "Executive Summary", width: "375px" },
    tbMDNotesProject: { title: "Notes Project", width: "375px" },
    tbMDNotes: { title: "Notes General", width: "375px" },
    //tbMDNotesWorkflow: { title: "Notes Workflow", width: "175px" },


    tbStart: { title: "Start", width: '150px' },
    tbFinish: { title: "Finish", width: '150px' },
    tbAStart: { title: "A Start", width: '100px' },
    tbAFinish: { title: "A Finish", width: '100px' },
    tbDuration: { title: "Duration", width: '100px' },
    tbRemainingDuration: { title: "Remaining Duration", width: '150px' },
    tbWork: { title: "Work", width: '50px' },
    tbAWork: { title: "A Work", width: '50px' },
    tbWorkRemaining: { title: "Work Remaining", width: '150px' },
    tbPercentComplete: { title: "Percent Complete", width: "75px" },
    tbCost: { title: "Cost", width: "50px" },
    tbACost: { title: "A Cost", width: "50px" },
    tbCostRemaining: { title: "Cost Remaining", width: "75px" },
    tbCostID: { title: "Cost ID", width: "75px" },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbBudgetHours: { title: 'Budget Hours', width: '50px' },

    tbMDHealth: { title: "Sch. Status", width: "75px" },
    tbMDStatus: { title: "Status", width: '100px' },
    tbMDState: { title: "State", width: "110px" },
    tbMDPriority: { title: "Priority", width: "110px" },
    tbMDStage: { title: "Stage", width: "110px" },
    tbMDPhase: { title: "Phase", width: "110px" },
    tbMDCategory: { title: "Category", width: "110px" },
    tbMDExSponsor: { title: "Ex Sponsor", width: "110px" },
    tbMDPM: { title: "PM", width: "110px" },
    tbMDProduct: { title: "Product", width: "210px" },
    tbMDEscalationLevel: { title: "Escalation Level", width: '120px' },
    tbMDNameShort: { title: "Name Short", width: "110px" },
    tbMDResponsibility: { title: "Responsibility", width: "110px" },
    tbMDDepartment: { title: "Department", width: "210px" },
    tbMDContact: { title: "Contact", width: "110px" },
    tbMDWeighting: { title: "Weighting", width: "75px" },
    tbMDRiskVsSizeAndComplexity: { title: "Risk Vs Size And Complexity", width: "75px" },
    tbMDLocation: { title: "Location", width: "120px" },
    tbMDContractNumber: { title: "Contract Number", width: "75px" },
    tbMDSeverity: { title: "Severity", width: "110px" },

};

// std Variance Column configuration
export const varianceColumnsStd = {
    tbID: { title: 'ID', width: '30px' },
    tbHierarchyOrder: { title: 'WBS', width: '30px' },
    tbType: { title: 'Type', width: '50px' },
    tbName: { title: 'Name', width: '250px' },
    tbMDHealth: { title: 'Sch. Status', width: '75px' },
    tbMDPriority: { title: 'Priority', width: '75px' },

    blStartVariance: { title: 'Start Var.', width: '30px' },
    blFinishVariance: { title: 'Finish Var', width: '30px' },
    blDurationVariance: { title: 'Dur. Var', width: '50px' },
    blWorkVariance: { title: 'Work Var', width: '50px' },
    blCostVariance: { title: 'Cost Var', width: '50px' },

    tbOwner: { title: 'Owner', width: '120px' },
    tbMDStatus: { title: 'Status', width: '100px' },
    tbMDState: { title: 'WF State', width: '100px' },

    tbStart: { title: 'Start', width: '150px' },
    tbFinish: { title: 'Finish', width: '150px' },
    tbAStart: { title: 'A Start', width: '100px' },
    tbAFinish: { title: 'A Finish', width: '100px' },

    blStart: { title: 'BL Start', width: '100px' },
    blFinish: { title: 'BL Finish', width: '100px' },

    tbDuration: { title: 'Dur', width: '100px' },
    tbRemainingDuration: { title: 'Rem. Dur.', width: '150px' },
    blDuration: { title: 'BL Dur', width: '50px' },
    blRemainingDuration: { title: 'BL Rem. Dur.', width: '50px' },

    tbBudgetHours: { title: 'Budget Hours', width: '50px' },
    tbWork: { title: 'Work', width: '50px' },
    tbAWork: { title: 'A Work', width: '50px' },
    tbWorkRemaining: { title: 'Rem Work', width: '150px' },

    blWork: { title: 'BL Work', width: '50px' },
    blAWork: { title: 'BL A Work', width: '50px' },
    blWorkRemaining: { title: 'BL Rem Work', width: '50px' },

    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbCost: { title: 'Cost', width: '50px' },
    tbACost: { title: 'A Cost', width: '50px' },
    tbCostRemaining: { title: 'Rem Cost', width: '50px' },

    blCost: { title: 'BL Cost', width: '50px' },
    blACost: { title: 'BL A Cost', width: '50px' },
    blCostRemaining: { title: 'BL Rem Cost', width: '50px' },
};

// adv variance cols.
export const varianceColumnsAdv = {
    tbID: { title: 'ID', width: '30px' },
    tbHierarchyOrder: { title: 'WBS', width: '30px' },
    tbType: { title: 'Type', width: '50px' },
    tbName: { title: 'Name', width: '250px' },
    tbMDHealth: { title: 'Sch. Status', width: '75px' },
    tbMDPriority: { title: 'Priority', width: '75px' },

    tbOwner: { title: 'Owner', width: '120px' },
    tbMDStatus: { title: 'Status', width: '100px' },
    tbMDState: { title: 'WF State', width: '100px' },

    tbStart: { title: 'Start', width: '150px' },
    tbFinish: { title: 'Finish', width: '150px' },
    tbAStart: { title: 'A Start', width: '100px' },
    tbAFinish: { title: 'A Finish', width: '100px' },

    blStart: { title: 'BL Start', width: '100px' },
    blFinish: { title: 'BL Finish', width: '100px' },
    blStartVariance: { title: 'S Var.', width: '30px' },
    blFinishVariance: { title: 'F Var', width: '30px' },

    tbDuration: { title: 'Dur', width: '100px' },
    tbRemainingDuration: { title: 'Rem. Dur.', width: '150px' },
    blDuration: { title: 'BL Dur', width: '50px' },
    blRemainingDuration: { title: 'BL Rem. Dur.', width: '50px' },
    blDurationVariance: { title: 'Dur. Var', width: '50px' },

    tbBudgetHours: { title: 'Budget Hours', width: '50px' },
    tbWork: { title: 'Work', width: '50px' },
    tbAWork: { title: 'A Work', width: '50px' },
    tbWorkRemaining: { title: 'Rem Work', width: '150px' },

    blWork: { title: 'BL Work', width: '50px' },
    blAWork: { title: 'BL A Work', width: '50px' },
    blWorkRemaining: { title: 'BL Rem Work', width: '50px' },
    blWorkVariance: { title: 'Work Var', width: '50px' },

    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbCost: { title: 'Cost', width: '50px' },
    tbACost: { title: 'A Cost', width: '50px' },
    tbCostRemaining: { title: 'Rem Cost', width: '50px' },

    blCost: { title: 'BL Cost', width: '50px' },
    blACost: { title: 'BL A Cost', width: '50px' },
    blCostRemaining: { title: 'BL Rem Cost', width: '50px' },
    blCostVariance: { title: 'Cost Var', width: '50px' },
    tbMDStatus: { title: 'Status', width: '100px' },
    tbMDState: { title: 'WF State', width: '100px' },
}

// risks and issues
export const randiColumns = {
    tbID: { title: 'ID', width: '30px' },
    tbSubType: { title: 'Type', width: '50px' },
    tbName: { title: 'Name of Item', width: '250px' },
    tbOwner: { title: 'Owner', width: '120px' },
    tbMDStatus: { title: 'Status', width: '100px' },
    tbMDEscalationLevel: { title: 'Escalation', width: '120px' },
    tbMDHealth: { title: 'Sch Status', width: '120px' },
    tbMDPriority: { title: 'Priority', width: '100px' },
    tbMDRiskCategory: { title: "Risk Category", width: "175px" },
    tbMDIssueCategory: { title: "Issue Category", width: "175px" },
    tbMDCategory: { title: "CR Category", width: "175px" },
    tbMDState: { title: 'State', width: '100px' },
    tbStart: { title: 'Start', width: '150px' },
    tbFinish: { title: 'Finish', width: '150px' },
    tbAStart: { title: 'A Start', width: '100px' },
    tbAFinish: { title: 'A Finish', width: '100px' },
    tbHierarchyOrder: { title: 'WBS', width: '180px' },
    tbMDDescription: { title: 'Summary Description', width: '250px' },
    tbMDProbability: { title: 'Risk Probability', width: '150px' },
    tbMDImpact: { title: 'Risk Impact', width: '150px' },
    tbMDScore: { title: 'Rsk Score', width: '150px' },
    tbMDMitigationStatus: { title: 'Mitigation Status', width: '100' },
    tbMDTriggerEvent: { title: 'Trigger Event', width: '300px' },
    tbMDEarlyWarningIndicators: { title: 'Early Warning Indicators', width: '300px' },
    tbMDContingencyPlan: { title: 'Contingency Plan', width: '300px' },
    tbMDMitigationPlan: { title: 'Mitigation Plan', width: '300px' },
    tbMDRiskResponseStrategy: { title: 'Risk Response Strategy', width: '300px' },
    tbMDRiskResponseStrategy: { title: 'Risk Response Strategy', width: '300px' },
    tbMDExecutiveSummary: { title: 'Executive Summary', width: '150px' },
    tbMDProblemOpportunity: { title: 'Problem Opportunity', width: '150px' },
    tbMDScheduleCommentary: { title: 'Schedule Commentary', width: '150px' },
    tbMDBudgetCommentary: { title: 'Budget Commentary', width: '150px' },
    tbMDScopeCommentary: { title: 'Scope Commentary', width: '150px' },
    tbMDResourceCommentary: { title: 'Resource Commentary', width: '150px' },
    tbMDKeyDependencies: { title: 'Key Dependencies', width: '150px' },
    tbMDExpectedBenefits: { title: 'Expected Benefits', width: '150px' },
    tbMDCostBenefitAnalysis: { title: 'Cost Benefit Analysis', width: '150px' },
    tbMDOptionsAnalysis: { title: 'Options Analysis', width: '150px' },
    tbMDNotes: { title: 'Notes', width: '150px' },
    tbMDImplementationApproach: { title: 'Implementation Approach', width: '150px' },
    tbMDNextSteps: { title: 'Next Steps', width: '150px' }
};

export const allocationFields = {
    tbCost: { title: "Cost", width: "50px" },
    tbACost: { title: "A Cost", width: "50px" },
    tbCostRemaining: { title: "Cost Remaining", width: "75px" },
    // tbCostID: { title: "Cost ID", width: "75px" },
    tbMDLocation: { title: 'Location', width: '100px' },
    // tbMDResID: { title: 'Res ID', width: '100px' },
    tbMDPrimarySkill: { title: 'Primary Skill', width: '100px' },
    tbMDPrimaryRole: { title: 'Primary Role', width: '100px' },
    tbMDResponsibility: { title: 'Responsibility', width: '100px' },

};

// imvestment 
export const investmentFields = {
    tbMDInvestmentCategory: { title: 'Investment Category', width: '100px' },
    tbMDInvestmentInitiative: { title: 'Investment Initiative', width: '100px' },
    tbMDInvestmentObjective: { title: 'Investment Objective', width: '100px' },
    tbMDInvestmentStrategy: { title: 'Investment Strategy', width: '100px' },
    tbMDPriorityStrategic: { title: 'SV Score', width: '50' },
    tbMDCostbarsScore: { title: 'AE Score', width: '100px' },
    tbMDFinancialScore: { title: 'Financial Score', width: '100px' },
    tbMDDecisionStrategic: { title: 'Strategic Decision', width: '100px' },
    tbMDYesNoSelector: { title: 'Yes No Selector', width: '100px' },
    tbMDDecisionNotes: { title: 'Decision Notes', width: '100px' },
    // financial fields
    tbMDBenefitCostRatio: { title: 'Benefit Cost Ratio', width: '100px' },
    tbMDEconomicValueAdded: { title: 'Economic Value Added', width: '100px' },
    tbMDInternalRateOfReturn: { title: 'Internal Rate Of Return', width: '100px' },
    tbMDSunkCosts: { title: 'Sunk Costs', width: '100px' },
    tbMDNetPresentValue: { title: 'Net Present Value', width: '100px' },
    tbMDOpportunityCost: { title: 'Opportunity Cost', width: '100px' },
    tbMDPaybackPeriod: { title: 'Payback Period', width: '100px' },
};

// investment metadata
export const investmentMetadata = {
    tbMDPrimaryLineOfBusiness: { title: 'Primary Line Of Business', width: '100px' },
    tbMDSponsoringDepartment: { title: 'Sponsoring Department', width: '100px' },
    tbMDContact: { title: 'Contact', width: '100px' },
    tbMDContactNumber: { title: 'Contact Number', width: '100px' },
    tbMDResponsibleTeam: { title: 'Responsible Team', width: '100px' },
    tbMDBusinessAdvisor: { title: 'Business Advisor', width: '100px' },
    tbMDDeliveryManager: { title: 'Delivery Manager', width: '100px' },
    tbMDOrgManager: { title: 'Org Manager', width: '100px' },
};

// busoness case
export const projectCharter = {
    tbMDBusinessOwner: { title: 'Business Owner', width: '100px' },
    tbMDBackgroundInfo: { title: 'Background Info', width: '100px' },
    // may 6
    tbMDKeyDependencies: { title: "Key Dependencies", width: "175px" },
    tbMDValueProposition: { title: "Value Proposition", width: "175px" },
    tbMDSuccessCriteria: { title: "Success Criteria", width: "175px" },
    tbMDDecisionsRequired: { title: "Decisions Required", width: "175px" },
    tbMDKeyRecommendations: { title: "Key Recommendations", width: "175px" },
    tbMDMarketAnalysis: { title: "Market Analysis", width: "175px" },
    tbMDPortfolioImpactAnalysis: { title: "Portfolio Impact Analysis", width: "175px" },
    tbMDKeyProjectMetrics: { title: "Key Project Metrics", width: "175px" },

    tbMDCapabilitiesNeeded: { title: 'Capabilities Needed', width: '100px' },
    tbMDConsequence: { title: 'Consequence', width: '100px' },
    tbMDExpectedBenefits: { title: 'Expected Benefits', width: '100px' },
    tbMDProblemOpportunity: { title: 'Problem Opportunity', width: '100px' },
    tbMDConstraintsAssumptions: { title: 'Constraints Assumptions', width: '100px' },
    tbMDCostBenefitAnalysis: { title: 'Cost Benefit Analysis', width: '100px' },
    tbMDSeniorLevelCommitment: { title: 'Senior Level Commitment', width: '100px' },
    tbMDStakeholderDescription: { title: 'Stakeholder Description', width: '100px' },
    tbMDObjectivesAndScope: { title: "Objectives And Scope", width: "175px" },
    tbMDOptionsAnalysis: { title: "Options Analysis", width: "175px" },
    tbMDImplementationApproach: { title: "Implementation Approach", width: "175px" },
    tbMDNextSteps: { title: "Next Steps", width: "175px" },
    tbMDVersion: { title: "B Case Version", width: "175px" },
    tbMDCharterDateApproved: { title: "B Case Date Approved", width: "175px" },
    tbMDWrittenBy: { title: 'Written By', width: '100px' },
};

// use this to make othe sets of fields
export const allColumns = {
    // Firstfields
    tbID: { title: "ID", width: '30px' },
    tbSelfKey2: { title: "Parent", width: "30px" },
    tbName: { title: "Name", width: '250px' },
    tbType: { title: "Type", width: '50px' },
    tbOwner: { title: "Owner", width: '120px' },
    tbHierarchyOrder: { title: "WBS", width: "40px" },
    tbSubType: { title: "Sub Type", width: '50px' },
    tbMDProjectNumber: { title: "Project Number", width: "75px" },
    // sched fields
    tbPredecessor: { title: "Pred -ecessor", width: "30px" },
    tbStart: { title: "Start", width: '150px' },
    tbFinish: { title: "Finish", width: '150px' },
    tbAStart: { title: "A Start", width: '100px' },
    tbAFinish: { title: "A Finish", width: '100px' },
    tbDuration: { title: "Duration", width: '100px' },
    tbRemainingDuration: { title: "Remaining Duration", width: '150px' },

    tbBudgetHours: { title: 'Budget Hours', width: '50px' },
    tbWork: { title: "Work", width: '50px' },
    tbAWork: { title: "A Work", width: '50px' },
    tbWorkRemaining: { title: "Work Remaining", width: '150px' },
    tbPercentComplete: { title: "Percent Complete", width: "75px" },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbCost: { title: "Cost", width: "50px" },
    tbACost: { title: "A Cost", width: "50px" },
    tbCostRemaining: { title: "Cost Remaining", width: "75px" },
    tbCostID: { title: "Cost ID", width: "75px" },

    // projecct fields

    tbMDDescription: { title: "Description", width: "375px" },
    tbMDNotes: { title: "Notes", width: "375px" },
    tbMDExecutiveSummary: { title: "Executive Summary", width: "375px" },
    tbMDNotesProject: { title: "Notes Project", width: "375px" },
    tbMDDecisionNotes: { title: 'Costbars Analysis -  Prioritize Results & Decision Results', width: '250px' },
    tbMDSyncNotes: { title: "Sync Notes", width: "175px" },
    tbMDNotesWorkflow: { title: "Notes Workflow", width: "175px" },

    // core and progress
    tbMDHealth: { title: "Sch. Status", width: "75px" },
    tbMDStatus: { title: "Status", width: '100px' },
    tbMDState: { title: "State", width: "110px" },
    tbMDPriority: { title: "Priority", width: "110px" },
    tbMDStage: { title: "Stage", width: "110px" },
    tbMDPhase: { title: "Phase", width: "110px" },
    tbMDCategory: { title: "Category", width: "110px" },
    tbMDExSponsor: { title: "Ex Sponsor", width: "110px" },
    tbMDPM: { title: "PM", width: "110px" },
    tbMDProduct: { title: "Product", width: "210px" },
    tbMDEscalationLevel: { title: "Escalation Level", width: '120px' },
    tbMDNameShort: { title: "Name Short", width: "110px" },
    tbMDResponsibility: { title: "Responsibility", width: "110px" },
    tbMDDepartment: { title: "Department", width: "210px" },
    tbMDContact: { title: "Contact", width: "110px" },
    tbMDWeighting: { title: "Weighting", width: "75px" },
    tbMDRiskVsSizeAndComplexity: { title: "Risk Vs Size And Complexity", width: "75px" },
    tbMDLocation: { title: "Location", width: "120px" },
    tbMDContractNumber: { title: "Contract Number", width: "75px" },
    tbMDSeverity: { title: "Severity", width: "110px" },


    // miscl fields
    tbMDShowIn: { title: "Show In", width: '300px' },
    tbMDYesNoSelector: { title: "Yes No Selector", width: "75px" },
    tbL1: { title: "L1", width: "175px" },
    tbL2: { title: "L2", width: '250px' },
    tbL3: { title: "L3", width: "175px" },
    tbL4: { title: "L4", width: "175px" },
    tbL5: { title: "L5", width: "175px" },
    tbCustomerID: { title: "Customer ID", width: "75px" },
    tbMDWBS: { title: "WBS", width: "75px" },
    tbWbsDescription: { title: "Wbs Description", width: "175px" },
    tbCoordTop: { title: "Coord Top", width: "75px" },

    // alloc fields
    tbExpHoursPerWeek: { title: "Exp Hours Per Week", width: "75px" },
    tbResCostCode: { title: "Res Cost Code", width: "75px" },
    tbResID: { title: "Res ID", width: "50px" },
    tbCalendar: { title: "Calendar", width: "75px" },
    tbPercentTimeOn: { title: "Percent Time On", width: "75px" },
    tbCostType: { title: "Cost Type", width: "75px" },
    tbPayRate: { title: "Pay Rate", width: "75px" },
    tbSchEngOverride: { title: "Sch Eng Override", width: "75px" },
    tbMDPrimarySkill: { title: "Primary Skill", width: "75px" },
    tbMDPrimaryRole: { title: "Primary Role", width: "75px" },

    // health 
    tbMDHealthOverall: { title: "Health Overall", width: "75px" },
    tbMDHealthScope: { title: "Health Scope", width: "75px" },
    tbMDHealthCost: { title: "Health Cost", width: "75px" },
    tbMDHealthIssues: { title: "Health Issues", width: "75px" },
    tbMDHealthRisk: { title: "Health Risk", width: "75px" },
    tbMDHealthSchedule: { title: "Health Schedule", width: "75px" },
    tbMDHealthHours: { title: "Health Hours", width: "75px" },


    // portfolio fields
    tbMDInvestmentCategory: { title: "Investment Category", width: "175px" },
    tbMDInvestmentInitiative: { title: "Investment Initiative", width: "175px" },
    tbMDInvestmentObjective: { title: "Investment Objective", width: "175px" },
    tbMDInvestmentStrategy: { title: "Investment Strategy", width: "175px" },
    tbMDPriorityStrategic: { title: 'SV Score', width: '50' },
    tbMDCostbarsScore: { title: 'AE Score', width: '100px' },
    tbMDFinancialScore: { title: 'Financial Score', width: '100px' },
    tbMDDecisionStrategic: { title: 'Strategic Decision', width: '100px' },
    tbMDROMEstimate: { title: "Budget Estimate", width: "175px" },
    tbMDSize: { title: "Size", width: "50px" },
    tbMDEstimationClass: { title: "Estimation Class", width: "100px" },


    //business fields
    tbMDBusinessAdvisor: { title: "Business Advisor", width: "75px" },
    tbMDBusinessOwner: { title: "Business Owner", width: "75px" },
    tbMDDeliveryManager: { title: "Delivery Manager", width: "75px" },
    tbMDOrgManager: { title: "Org Manager", width: "75px" },
    tbMDSponsoringDepartment: { title: "Sponsoring Department", width: "75px" },
    tbMDPrimaryContact: { title: "Primary Contact", width: "75px" },
    tbMDContactNumber: { title: "Contact Number", width: "75px" },
    tbMDResponsibleTeam: { title: "Responsible Team", width: "75px" },


    // financial fields
    tbMDBenefitCostRatio: { title: "Benefit Cost Ratio", width: "75px" },
    tbMDEcnomicValueAdded: { title: "Ecnomic Value Added", width: "75px" },
    tbMDInternalRateOfReturn: { title: "Internal Rate Of Return", width: "75px" },
    tbMDSunkCosts: { title: "Sunk Costs", width: "75px" },
    tbMDNetPresentValue: { title: "Net Present Value", width: "75px" },
    tbMDOpportunityCost: { title: "Opportunity Cost", width: "75px" },
    tbMDPaybackPeriod: { title: "Payback Period", width: "75px" },

    // project charter
    tbMDPrimaryLineOfBusiness: { title: "Primary Line Of Business", width: "175px" },
    tbMDBackgroundInfo: { title: "Background Info", width: "175px" },
    // may 6
    tbMDKeyDependencies: { title: "Key Dependencies", width: "175px" },
    tbMDValueProposition: { title: "Value Proposition", width: "175px" },
    tbMDSuccessCriteria: { title: "Success Criteria", width: "175px" },
    tbMDDecisionsRequired: { title: "Decisions Required", width: "175px" },
    tbMDKeyRecommendations: { title: "Key Recommendations", width: "175px" },
    tbMDMarketAnalysis: { title: "Market Analysis", width: "175px" },
    tbMDPortfolioImpactAnalysis: { title: "Portfolio Impact Analysis", width: "175px" },
    tbMDKeyProjectMetrics: { title: "Key Project Metrics", width: "175px" },


    tbMDCapabilitiesNeeded: { title: "Capabilities Needed", width: "175px" },
    tbMDConsequence: { title: "Consequence", width: "175px" },
    tbMDExpectedBenefits: { title: "Expected Benefits", width: "175px" },
    tbMDProblemOpportunity: { title: "Problem Opportunity", width: "175px" },
    tbMDConstraintsAssumptions: { title: "Constraints Assumptions", width: "175px" },
    tbMDCostBenefitAnalysis: { title: "Cost Benefit Analysis", width: "175px" },
    tbMDSeniorLevelCommitment: { title: "Senior Level Committment", width: "175px" },
    tbMDStakeholderDescription: { title: "Stakeholder Description", width: "175px" },
    tbMDObjectivesAndScope: { title: "Objectives And Scope", width: "175px" },
    tbMDOptionsAnalysis: { title: "Options Analysis", width: "175px" },
    tbMDImplementationApproach: { title: "Implementation Approach", width: "175px" },
    tbMDNextSteps: { title: "Next Steps", width: "175px" },
    tbMDVersion: { title: "B Case Version", width: "175px" },
    tbMDCharterDateApproved: { title: "B Case Date Approved", width: "175px" },


    // other md fields
    tbMDOther2: { title: "Other 2", width: "75px" },
    tbMDOther3: { title: "Other 3", width: "75px" },
    tbMDOther4: { title: "Other 4", width: "75px" },
    tbMDOther5: { title: "Other 5", width: "75px" },
    tbMDOther6: { title: "Other 6", width: "75px" },
    tbMDOther7: { title: "Other 7", width: "75px" },
    tbMDOther8: { title: "Other 8", width: "75px" },
    tbMDOther9: { title: "Other 9", width: "75px" },
    tbMDOther10: { title: "Other 10", width: "75px" },
    tbMDOther12: { title: "Other 11", width: "75px" },
    tbMDOther13: { title: "Other 12", width: "75px" },
    tbMDPortfolio: { title: "Portfolio", width: "175px" },
    tbMDProgram: { title: "Program", width: "175px" },
    tbMDProgActivityAlignment: { title: "Prog Activity Alignment", width: "75px" },
    tbMDGate: { title: "Gate", width: "75px" },
    tbMDExtLink1: { title: "Ext Link 1", width: "75px" },
    tbMDExtSystemID1: { title: "Ext System ID 1", width: "75px" },
    tbMDRefID: { title: "Ref ID", width: "75px" },
    tbMDSprintName: { title: "Sprint Name", width: "75px" },
    tbMDStageApprover: { title: "Stage Approver", width: "75px" },
    tbMDWrittenBy: { title: "Written By", width: "75px" },
    tbMDCustomerID: { title: "Customer ID", width: "75px" },
    tbMDAzureID: { title: "Azure ID", width: "75px" },
    tbMDSortOrder: { title: "Sort Order", width: "75px" },
    tbMDtbLastModified: { title: "tb Last Modified", width: "75px" },

    /* Project Assessment Score */
    tbPASTeamSize: { title: "Team Size", width: "75px" },
    tbPASStakeholderCount: { title: "Stakeholder Count", width: "75px" },
    tbPASTechnologyNovelty: { title: "Technology Novelty", width: "75px" },
    tbPASTeamTechExperience: { title: "Team Tech Experience", width: "75px" },
    tbPASProjectSimilarity: { title: "Project Similarity", width: "75px" },
    tbPASDomainExperience: { title: "Domain Experience", width: "75px" },
    tbPASExternalIntegrations: { title: "External Integrations", width: "75px" },
    tbPASVendorDependencies: { title: "Vendor Dependencies", width: "75px" },
    tbPASCrossTeamCollaboration: { title: "Cross Team Collaboration", width: "75px" },
    tbPASRegulatoryApprovals: { title: "Regulatory Approvals", width: "75px" },
    tbPASMarketTiming: { title: "Market Timing", width: "75px" },
    tbPASProjectType: { title: "Project Type", width: "75px" },
    tbPASOverallFeasibilityScore: { title: "Overall Feasibility Score", width: "75px" },
    tbPASComplexityScore: { title: "Complexity Score", width: "75px" },
    tbPASRiskScore: { title: "PAS Risk Score", width: "75px" },
    tbPASPoliticalRiskScore: { title: 'Political Risk', width: '70px' },

    tbPASScaleScore: { title: "Scale Score", width: "75px" },
    tbPASTechnologyScore: { title: "Technology Score", width: "75px" },
    tbPASFamiliarityScore: { title: "Familiarity Score", width: "75px" },
    tbPASDependencyScore: { title: "Dependency Score", width: "75px" },
    tbPASRegulatoryScore: { title: "Regulatory Score", width: "75px" },
    tbPASMarketScore: { title: "Market Score", width: "75px" },
    tbPASAssessmentVersion: { title: "Assessment Version", width: "75px" },
    tbPASStatus: { title: "Status", width: "75px" },
    tbPASApprovalRequired: { title: "Approval Required", width: "75px" },
    tbPASAssessmentDate: { title: "Assessment Date", width: "75px" },
    tbPASAssessorName: { title: "Assessor Name", width: "75px" },

    // bl fields
    blStart: { title: "BL Start", width: "75px" },
    blFinish: { title: "BL Finish", width: "75px" },
    blAStart: { title: "BL A Start", width: "75px" },
    blAFinish: { title: "BL A Finish", width: "75px" },
    blDuration: { title: "BL Duration", width: "50px" },
    blRemainingDuration: { title: "BL Remaining Duration", width: "75px" },
    blWork: { title: "BL Work", width: "50px" },
    blAWork: { title: "BL A Work", width: "50px" },
    blWorkRemaining: { title: "BL Work Remaining", width: "75px" },
    blPercentComplete: { title: "BL Percent Complete", width: "75px" },
    blCost: { title: "BL Cost", width: "50px" },
    blACost: { title: "BL A Cost", width: "50px" },
    blCostRemaining: { title: "BL Cost Remaining", width: "75px" },

    // variance fields
    blStartVariance: { title: "BL Start Variance", width: "75px" },
    blFinishVariance: { title: "BL Finish Variance", width: "75px" },
    blCostVariance: { title: "BL Cost Variance", width: "75px" },
    blWorkVariance: { title: "BL Work Variance", width: "75px" },
    blDurationVariance: { title: "BL Duration Variance", width: "75px" },

    // bl alloc fields
    blResCostCode: { title: "BL Res Cost Code", width: "75px" },
    blResID: { title: "BL Res ID", width: "50px" },
    blCalendar: { title: "BL Calendar", width: "75px" },
    blPercentTimeOn: { title: "BL Percent Time On", width: "75px" },
    blCostType: { title: "BL Cost Type", width: "75px" },
    blPayRate: { title: "BL Pay Rate", width: "75px" },
    blSchEngOverride: { title: "BL Sch Eng Override", width: "75px" },
    blOwner: { title: "BL Owner", width: "75px" },
    blExpHoursPerWeek: { title: "BL Exp Hours Per Week", width: "75px" },

    // bl other
    blID: { title: "BL ID", width: "30px" },
    blName: { title: "BL Name", width: "175px" },
    blSelfKey2: { title: "BL Self Key 2", width: "50px" },
    blType: { title: "BL Type", width: "50px" },
    blL1: { title: "BL L1", width: "175px" },
    blL2: { title: "BL L2", width: "175px" },
    blL3: { title: "BL L3", width: "175px" },
    blL4: { title: "BL L4", width: "175px" },
    blL5: { title: "BL L5", width: "175px" },
    blHierarchyOrder: { title: "BL WBS", width: "30px" },
    blSubType: { title: "BL Sub Type", width: "75px" },
    blPredecessor: { title: "BL Predecessor", width: "75px" },
    blCustomerID: { title: "BL Customer ID", width: "75px" },
    blCostID: { title: "BL Cost ID", width: "75px" },
    blWbsDescription: { title: "BL Wbs Description", width: "175px" },
    blCoordTop: { title: "BL Coord Top", width: "75px" },
    blCoordLeft: { title: "BL Coord Left", width: "75px" },
}

// other likely unused fields
export const otherFields = {
    tbMDExtSystemID1: { title: 'Ext System ID 1', width: '100px' },
    tbMDStageApprover: { title: 'Stage Approver', width: '100px' },
    tbMDSprintName: { title: 'Sprint Name', width: '100px' },
    tbMDExtLink1: { title: 'Ext Link 1', width: '100px' },
    tbMDOther3: { title: 'Other 3', width: '100px' },
    tbMDcanvasNo: { title: 'Canvas No', width: '100px' },
    tbMDRefID: { title: 'Ref ID', width: '100px' },
    tbMDSortOrder: { title: 'Sort Order', width: '100px' },
    tbMDtbLastModified: { title: 'Last Modified', width: '100px' },
    tbMDShowIn: { title: 'Show In', width: '300px' },
    tbMDCustomerID: { title: 'Customer ID', width: '100px' },
    tbMDAzureID: { title: 'Azure ID', width: '100px' },
    tbMDNotesWorkflow: { title: 'Notes Workflow', width: '100px' },
    tbMDPortfolio: { title: 'Portfolio', width: '100px' },
    tbMDProgram: { title: 'Program', width: '100px' },
    tbMDProgActivityAlignment: { title: 'Program Activity Alignment', width: '100px' },
    tbMDOther2: { title: 'Other 2', width: '100px' },
    tbMDWBS: { title: 'WBS', width: '100px' },
};

// not used for now, using the report Health directly
export const healthIndicators = [
    {
        "data": "tbID",
        title: "ID",
        "render": function (data, type, row) {
            // Return HTML that includes the icon and the data
            return '<i class="material-icons edit-icon" style="cursor: pointer; margin-right: 5px;">create</i>' + data;
        }
    },
    {
        "data": "tbMDStatus",
        title: "Status"
    },
    {
        "data": "tbMDHealth",
        title: "Sch. KPI",
        width: "75px",
        render: function (data, type, row, meta) {
            switch (data) {
                case "Late":
                    return '<div title="Late" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-pink-600"></div>';
                case "Slipping":
                    return '<div title="Slipping" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-yellow-400"></div>';
                case "Early":
                    return '<div title="Early" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-green-600"></div>';
                case "On schedule":
                    return '<div title="On schedule" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-green-600"></div>';
                case "Completed":
                    return '<div title="Completed" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-green-600"></div>';
                case "Not Assessed":
                    return '<div title="Not Assessed" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-gray-300"></div>';
                default:
                    return data;
            }
        }
    },
    {
        "data": "tbMDHealthOverall",
        title: "Health Overall",
        width: "75px",
        render: function (data, type, row, meta) {
            switch (data) {
                case "Red":
                    return '<div title="Health Overall - Red - Needs attention" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-red-600"></div>';
                case "Yellow":
                    return '<div title="Health Overall - Yellow - Watching closely" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-yellow-400"></div>';
                case "Green":
                    return '<div title="Health Overall - Green - All Ok" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-green-600"></div>';
                case "Not Assessed":
                    return '<div title="Health Overall - Not Assessed yet" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-gray-300"></div>';
                default:
                    return data;
            }
        }
    },
    {
        "data": "tbName",
        title: "Name",
        width: "250px"
    },

    {
        "data": "tbStart",
        title: "Start",
        width: "100px"
    },
    {
        "data": "tbFinish",
        title: "Finish",
        width: "100px"
    },
    {
        "data": "tbMDHealthHours",
        title: "Health Hours",
        width: "75px",
        render: function (data, type, row, meta) {
            switch (data) {
                case "Red":
                    return '<div title="Hours - Red - Needs attention" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-red-600"></div>';
                case "Yellow":
                    return '<div title="Hours - Yellow - Watching closely" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-yellow-400"></div>';
                case "Green":
                    return '<div title="Hours - Green - All Ok" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-green-600"></div>';
                case "Not Assessed":
                    return '<div title="Hours - Not Assessed yet" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-gray-300"></div>';
                default:
                    return data;
            }
        }
    },
    {
        "data": "tbMDHealthScope",
        title: "Health Scope",
        width: "75px",
        render: function (data, type, row, meta) {
            switch (data) {
                case "Red":
                    return '<div title="Scope - Red - Needs attention" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-red-600"></div>';
                case "Yellow":
                    return '<div title="Scope - Yellow - Watching closely" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-yellow-400"></div>';
                case "Green":
                    return '<div title="Scope - Green - All Ok" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-green-600"></div>';
                case "Not Assessed":
                    return '<div title="Scope - Not Assessed yet" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-gray-300"></div>';
                default:
                    return data;
            }
        }
    },
    {
        "data": "tbMDHealthCost",
        title: "Health Cost",
        width: "75px",
        render: function (data, type, row, meta) {
            switch (data) {
                case "Red":
                    return '<div title="Cost - Red - Needs attention" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-red-600"></div>';
                case "Yellow":
                    return '<div title="Cost - Yellow - Watching closely" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-yellow-400"></div>';
                case "Green":
                    return '<div title="Cost - Green - All Ok" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-green-600"></div>';
                case "Not Assessed":
                    return '<div title="Cost - Not Assessed yet" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-gray-300"></div>';
                default:
                    return data;
            }
        }
    },
    {
        "data": "tbMDHealthIssues",
        title: "Health Issues",
        width: "75px",
        render: function (data, type, row, meta) {
            switch (data) {
                case "Red":
                    return '<div title="Issues - Red - Needs attention" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-red-600"></div>';
                case "Yellow":
                    return '<div title="Issues - Yellow - Watching closely" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-yellow-400"></div>';
                case "Green":
                    return '<div title="Issues - Green - All Ok" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-green-600"></div>';
                case "Not Assessed":
                    return '<div title="Issues - Not Assessed yet" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-gray-300"></div>';
                default:
                    return data;
            }
        }
    },
    {
        "data": "tbMDHealthRisk",
        title: "Health Risk",
        width: "75px",
        render: function (data, type, row, meta) {
            switch (data) {
                case "Red":
                    return '<div title="Risk - Red - Needs attention" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-red-600"></div>';
                case "Yellow":
                    return '<div title="Risk - Yellow - Watching closely" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-yellow-400"></div>';
                case "Green":
                    return '<div title="Risk - Green - All Ok" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-green-600"></div>';
                case "Not Assessed":
                    return '<div title="Risk - Not Assessed yet" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-gray-300"></div>';
                default:
                    return data;
            }
        }
    },
    {
        "data": "tbMDHealthSchedule",
        title: "Health Schedule",
        width: "75px",
        render: function (data, type, row, meta) {
            switch (data) {
                case "Red":
                    return '<div title="Schedule - Red - Needs attention" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-red-600"></div>';
                case "Yellow":
                    return '<div title="Schedule - Yellow - Watching closely" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-yellow-400"></div>';
                case "Green":
                    return '<div title="Schedule - Green - All Ok" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-green-600"></div>';
                case "Not Assessed":
                    return '<div title="Schedule - Not Assessed yet" class="tw-w-6 tw-h-6 tw-rounded-full tw-bg-gray-300"></div>';
                default:
                    return data;
            }
        }
    },
    {
        "data": "tbMDEscalationLevel",
        title: "Escalation Level",
        width: "75px",
    },
    {
        "data": "tbPercentComplete",
        title: "Percent Complete",
        width: "75px",
    },
    {
        "data": "tbBudgetHours",
        title: "Budget Hours",
        width: "75px",
    },
    {
        "data": "tbWork",
        title: "Work",
        width: "75px",
    },
    {
        "data": "tbAWork",
        title: "Actual Work",
        width: "75px",
    },
    {
        "data": "tbWorkRemaining",
        title: "Work Remaining",
        width: "75px",
    },
    {
        "data": "tbDuration",
        title: "Duration",
        width: "75px",
    },
    {
        "data": "tbRemainingDuration",
        title: "Remaining Duration",
        width: "75px",
    },
    {
        "data": "tbAStart",
        title: "Actual Start",
        width: "100px"
    },
    {
        "data": "tbAFinish",
        title: "Actual Finish",
        width: "100px"
    },
    {
        "data": "tbOwner",
        title: "Owner",
        width: "120px"
    },
    {
        "data": "tbMDPM",
        title: "PM",
        width: "120px",
    },
    {
        "data": "tbMDPriority",
        title: "Priority",
        width: "75px",
    },

    {
        "data": "tbMDProjectNumber",
        title: "Project Number",
        width: "75px",
    },
    {
        "data": "tbMDProduct",
        title: "Product",
        width: "150px"
    },

    {
        "data": "tbMDState",
        title: "State",
        width: "75px",
    }, {
        "data": "tbHierarchyOrder",
        title: "Hierarchy",
        width: "75px",
    },
    {
        "data": "tbSelfKey2",
        title: "Parent ID",
        width: "75px",
    },
]


// resource pool not used for now
export const resourceColumns = {
    tbResID: { title: 'ID', width: '80px' },
    tbResName: { title: 'Full Name', width: '150px' },
    tbResPrimaryRole: { title: 'Role', width: '100px' },
    tbResResourceCalendar: { title: 'Res Cal', width: '50px' },
    tbResPercentGeneralAvailability: { title: '% Avail.', width: '50px' },
    tbResQuantity: { title: 'Qty', width: '60px' },
    tbResLabourType: { title: 'Type', width: '60px' },
    tbResPartTimeFullTime: { title: 'PT/FT', width: '60px' },
    tbResResourceType: { title: 'Type', width: '60px' },
    tbResPrimarySkill: { title: 'Skill', width: '150px' },
    tbResNameShort: { title: 'Short Name', width: '50px' },
    tbResDaysNotAvailableByMonth: { title: 'Vacation (Wk-Days Off)', width: '50px' },
    tbResStart: { title: 'Hire Date', width: '50px' },
    tbResFinish: { title: 'Finish', width: '50px' },
    tbResMonth1: { title: 'Month 1', width: '50px' },
    tbResMonth2: { title: 'Month 2', width: '50px' },
    tbResMonth3: { title: 'Month 3', width: '50px' },
    tbResMonth4: { title: 'Month 4', width: '50px' },
    tbResMonth5: { title: 'Month 5', width: '50px' },
    tbResMonth6: { title: 'Month 6', width: '50px' },
    tbResMonth7: { title: 'Month 7', width: '50px' },
    tbResMonth8: { title: 'Month 8', width: '50px' },
    tbResMonth9: { title: 'Month 9', width: '50px' },
    tbResMonth10: { title: 'Month 10', width: '50px' },
    tbResMonth11: { title: 'Month 11', width: '50px' },
    tbResMonth12: { title: 'Month 12', width: '50px' },
    tbResMonth13: { title: 'Month 13', width: '50px' },
    tbResMonth14: { title: 'Month 14', width: '50px' },
    tbResMonth15: { title: 'Month 15', width: '50px' },
    tbResMonth16: { title: 'Month 16', width: '50px' },
    tbResMonth17: { title: 'Month 17', width: '50px' },
    tbResMonth18: { title: 'Month 18', width: '50px' },
    tbResMonth19: { title: 'Month 19', width: '50px' },
    tbResMonth20: { title: 'Month 20', width: '50px' },
    tbResMonth21: { title: 'Month 21', width: '50px' },
    tbResMonth22: { title: 'Month 22', width: '50px' },
    tbResMonth23: { title: 'Month 23', width: '50px' },
    tbResMonth24: { title: 'Month 24', width: '50px' },
    tbResEmail: { title: 'Email', width: '150px' },
    tbResDepartment: { title: 'Department', width: '150px' },
    tbResManager: { title: 'Manager', width: '150px' },
    tbResSupervisor: { title: 'Supervisor', width: '150px' },
    tbResTeam: { title: 'Team', width: '120px' },
    tbResLocation: { title: 'Location', width: '120px' },
    tbResTeamLeader: { title: 'Team Leader', width: '150px' },
    tbResResourceClass: { title: 'Class', width: '120px' },
    tbResCostCode: { title: 'Cost Code', width: '100px' },


};




/* Project Assessment Score */
export const pasFields = {

    tbMDDescription: { title: "Description", width: "375px" },
    tbMDExecutiveSummary: { title: "Executive Summary", width: "375px" },
    tbMDNotesProject: { title: "Notes Project", width: "375px" },
    tbMDNotes: { title: "Notes General", width: "375px" },

    tbMDSeniorLevelCommitment: { title: "Senior Level Committment", width: "175px" },
    tbPASTeamSize: { title: "Team Size", width: "75px" },
    tbPASStakeholderCount: { title: "Stakeholder Count", width: "75px" },
    tbPASTechnologyNovelty: { title: "Technology Novelty", width: "75px" },
    tbPASTeamTechExperience: { title: "Team Tech Experience", width: "75px" },
    tbPASProjectSimilarity: { title: "Project Similarity", width: "75px" },
    tbPASDomainExperience: { title: "Domain Experience", width: "75px" },
    tbPASExternalIntegrations: { title: "External Integrations", width: "75px" },
    tbPASVendorDependencies: { title: "Vendor Dependencies", width: "75px" },
    tbPASCrossTeamCollaboration: { title: "Cross Team Collaboration", width: "75px" },
    tbPASRegulatoryApprovals: { title: "Regulatory Approvals", width: "75px" },
    tbPASMarketTiming: { title: "Market Timing", width: "75px" },
    tbPASProjectType: { title: "Project Type", width: "75px" },

    tbPASOverallFeasibilityScore: { title: "Overall Feasibility Score", width: "75px" },
    tbPASComplexityScore: { title: "Complexity Score", width: "75px" },
    tbPASRiskScore: { title: "PAS Risk Score", width: "75px" },
    tbPASPoliticalRiskScore: { title: 'Political Risk', width: '75px' },
    tbPASScaleScore: { title: "Scale Score", width: "75px" },
    tbPASTechnologyScore: { title: "Technology Score", width: "75px" },
    tbPASFamiliarityScore: { title: "Familiarity Score", width: "75px" },
    tbPASDependencyScore: { title: "Dependency Score", width: "75px" },
    tbPASRegulatoryScore: { title: "Regulatory Score", width: "75px" },
    tbPASMarketScore: { title: "Market Score", width: "75px" },
    tbPASAssessmentVersion: { title: "Assessment Version", width: "75px" },
    tbPASStatus: { title: "Status", width: "75px" },
    tbPASApprovalRequired: { title: "Approval Required", width: "75px" },
    tbPASAssessmentDate: { title: "Assessment Date", width: "75px" },
    tbPASAssessorName: { title: "Assessor Name", width: "75px" }
};

export const aiPromptFields = {
    tbID: { title: 'ID', width: '30px' },
    tbSelfKey2: { title: 'Parent ID', width: '30px' },
    tbType: { title: 'Type', width: '50px' },
    tbSubType: { title: "Sub Type", width: '50px' },
    tbCoordTop: { title: "Coord Top", width: "75px" },
    tbName: { title: 'Name of Item', width: '250px' },
    tbMDDescription: { title: "Description.", width: "275px" },
    tbMDProduct: { title: 'Product', width: '100px' },
    tbMDNotes: { title: "Notes.", width: "275px" },
    tbMDExecutiveSummary: { title: "Executive Summary", width: "275px" },
    tbMDProblemOpportunity: { title: "Problem Opportunity", width: "175px" },
    tbMDObjectivesAndScope: { title: "Objectives And Scope", width: "175px" },
    tbMDOptionsAnalysis: { title: "Options Analysis", width: "175px" },
    tbMDBackgroundInfo: { title: "Background Info", width: "175px" },
    tbMDSeniorLevelCommitment: { title: "Senior Level Committment", width: "175px" },
    tbBudgetCost: { title: 'Budget Cost', width: '50px' },
    tbWork: { title: 'Work', width: '50px' },
    tbMDStatus: { title: 'Status', width: '100px' },
    tbStart: { title: 'Start', width: '150px' },
    tbFinish: { title: 'Finish', width: '150px' },
    tbDuration: { title: 'Dur', width: '100px' },
    tbPASTeamSize: { title: "Team Size", width: "75px" },
    tbPASStakeholderCount: { title: "Stakeholder Count", width: "75px" },
    tbPASTechnologyNovelty: { title: "Technology Novelty", width: "75px" },
    tbPASTeamTechExperience: { title: "Team Tech Experience", width: "75px" },
    tbPASProjectSimilarity: { title: "Project Similarity", width: "75px" },
    tbPASDomainExperience: { title: "Domain Experience", width: "75px" },
    tbPASExternalIntegrations: { title: "External Integrations", width: "75px" },
    tbPASVendorDependencies: { title: "Vendor Dependencies", width: "75px" },
    tbPASCrossTeamCollaboration: { title: "Cross Team Collaboration", width: "75px" },
    tbPASRegulatoryApprovals: { title: "Regulatory Approvals", width: "75px" },
    tbPASMarketTiming: { title: "Market Timing", width: "75px" },
    tbPASProjectType: { title: "Project Type", width: "75px" },
    tbPASOverallFeasibilityScore: { title: "Overall Feasibility Score", width: "75px" },

};

export const aiResultFields = {
    tbMDResourceCommentary: { title: "Resource C", width: "175px" },
    tbMDPrerequisitesChecklist: { title: "Prereqs", width: "175px" },
    tbMDKeyDependencies: { title: "Key Dep", width: "175px" },
    tbMDFinancialCommentary: { title: "Financial C", width: "175px" },
    tbMDScopeCommentary: { title: "Scope C", width: "175px" },
    tbMDBudgetCommentary: { title: "Budget C", width: "175px" },
    tbMDScheduleCommentary: { title: "Sched C", width: "175px" },
    tbMDValueProposition: { title: "Value Proposition", width: "175px" },
    tbMDSuccessCriteria: { title: "Success Criteria", width: "175px" },
    tbMDDecisionsRequired: { title: "Decisions Required", width: "175px" },
    tbMDKeyRecommendations: { title: "Key Recommendations", width: "175px" },
    tbMDMarketAnalysis: { title: "Market Analysis", width: "175px" },
    tbMDKeyProjectMetrics: { title: "Key Project Metrics", width: "175px" },
    tbMDCapabilitiesNeeded: { title: "Capabilities Needed", width: "175px" },
    tbMDConsequence: { title: "Consequence", width: "175px" },
    tbMDExpectedBenefits: { title: "Expected Benefits", width: "175px" },
    tbMDConstraintsAssumptions: { title: "Constraints Assumptions", width: "175px" },
    tbMDCostBenefitAnalysis: { title: "Cost Benefit Analysis", width: "175px" },
    tbMDStakeholderDescription: { title: "Stakeholder Description", width: "175px" },
    tbMDImplementationApproach: { title: "Implementation Approach", width: "175px" },
    tbMDNextSteps: { title: "Next Steps", width: "175px" },
    tbMDPortfolioImpactAnalysis: { title: "Pf impact", width: "175px" },
    tbMDShowIn: { title: "Show in", width: '300px' },

};

// Registry of available column sets — the shared catalog any tabular report can
// offer through ColumnSetPicker. Key is the picker <option value>; label is what
// the user sees; config is the field-set object above.
export const COLUMN_SETS = {
  defaultFields:      { label: "Default Fields",             config: defaultFields },
  varianceColumnsStd: { label: "Variance Columns Standard",  config: varianceColumnsStd },
  ganttFields:        { label: "Gantt Fields",               config: ganttFields },
  commonFields:       { label: "Common Fields",              config: commonFields },
  notesColumns:       { label: "Notes Columns",              config: notesColumns },
  largeTextReport:    { label: "Large Text Report",          config: largeTextReport },
  coreColumnsAB:      { label: "Core Columns AB",            config: coreColumnsAB },
  coreColumnsABAdv:   { label: "Core Columns AB Advanced",   config: coreColumnsABAdv },
  coreColumnsTB:      { label: "Core Columns TB",            config: coreColumnsTB },
  coreColumnsTBAdv:   { label: "Core Columns TB Advanced",   config: coreColumnsTBAdv },
  coreColumnsCBStd:   { label: "Core Columns CB Standard",   config: coreColumnsCBStd },
  coreColumnsCBAdv:   { label: "Core Columns CB Advanced",   config: coreColumnsCBAdv },
  varianceColumnsAdv: { label: "Variance Columns Advanced",  config: varianceColumnsAdv },
  randiColumns:       { label: "Risks & Issues Columns",     config: randiColumns },
  allocationFields:   { label: "Allocation Fields",          config: allocationFields },
  investmentFields:   { label: "Investment Fields",          config: investmentFields },
  investmentMetadata: { label: "Investment Metadata",        config: investmentMetadata },
  projectCharter:     { label: "Project Charter",            config: projectCharter },
  allColumns:         { label: "All Columns",                config: allColumns },
  otherFields:        { label: "Other Fields",               config: otherFields },
  healthIndicators:   { label: "Health Indicators",          config: healthIndicators },
  resourceColumns:    { label: "Resource Columns",           config: resourceColumns },
  pasFields:          { label: "PAS Fields",                 config: pasFields },
  aiPromptFields:     { label: "AI Prompt Fields",           config: aiPromptFields },
  aiResultFields:     { label: "AI Result Fields",           config: aiResultFields },
};

// Default set used when a report first renders.
export const DEFAULT_COLUMN_SET = "defaultFields";
