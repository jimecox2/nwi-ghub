"use client";

import { useEffect, useState } from "react";

// Read-only project detail, rendered from the tbmdjoined row's core (tb*) and
// metadata (tbMD*) fields. Sections and labels mirror lib/dashboard/columnConfig.
// Empty/placeholder values are hidden, and a whole section is skipped when none
// of its fields are populated.
const SECTIONS = [
  {
    title: "Identity",
    fields: [
      { key: "tbName", label: "Name" },
      { key: "tbID", label: "ID" },
      { key: "tbMDProjectNumber", label: "Project #" },
      { key: "tbMDProjectType", label: "Type" },
      { key: "tbType", label: "Item Type" },
      { key: "tbOwner", label: "Owner" },
      { key: "tbMDPM", label: "Project Manager" },
      { key: "tbMDExSponsor", label: "Executive Sponsor" },
      { key: "tbMDDepartment", label: "Department" },
      { key: "tbMDProduct", label: "Product" },
      { key: "tbMDCustomerID", label: "Client" },
      { key: "tbMDNameShort", label: "Short Name" },
    ],
  },
  {
    title: "Status & Workflow",
    fields: [
      { key: "tbMDStatus", label: "Status", type: "badge" },
      { key: "tbMDStage", label: "Stage", type: "badge" },
      { key: "tbMDState", label: "Approval State", type: "badge" },
      { key: "tbMDPhase", label: "Phase" },
      { key: "tbMDPriority", label: "Priority" },
      { key: "tbMDHealth", label: "Schedule Status" },
      { key: "tbMDCategory", label: "Category" },
      { key: "tbMDEscalationLevel", label: "Escalation" },
    ],
  },
  {
    title: "Schedule",
    fields: [
      { key: "tbStart", label: "Start", type: "date" },
      { key: "tbFinish", label: "Finish", type: "date" },
      { key: "tbAStart", label: "Actual Start", type: "date" },
      { key: "tbAFinish", label: "Actual Finish", type: "date" },
      { key: "tbDuration", label: "Duration" },
      { key: "tbRemainingDuration", label: "Remaining Duration" },
      { key: "tbPercentComplete", label: "% Complete", type: "percent" },
    ],
  },
  {
    title: "Budget & Effort",
    fields: [
      { key: "tbBudgetCost", label: "Budget Cost", type: "currency" },
      { key: "tbBudgetHours", label: "Budget Hours", type: "number" },
      { key: "tbCost", label: "Cost", type: "currency" },
      { key: "tbWork", label: "Work", type: "number" },
      { key: "tbMDROMEstimate", label: "Budget Estimate" },
      { key: "tbMDSize", label: "Size" },
      { key: "tbMDEstimationClass", label: "Estimation Class" },
      { key: "tbMDWeighting", label: "Weighting" },
    ],
  },
  {
    title: "Narrative",
    fields: [
      { key: "tbMDDescription", label: "Description", type: "rich" },
      { key: "tbMDExecutiveSummary", label: "Executive Summary", type: "rich" },
      { key: "tbMDProblemOpportunity", label: "Problem / Opportunity", type: "rich" },
      { key: "tbMDObjectivesAndScope", label: "Objectives & Scope", type: "rich" },
      { key: "tbMDExpectedBenefits", label: "Expected Benefits", type: "rich" },
      { key: "tbMDNotesProject", label: "Project Notes", type: "rich" },
      { key: "tbMDNotes", label: "Notes", type: "rich" },
    ],
  },
  {
    title: "Business Case / Charter",
    fields: [
      { key: "tbMDValueProposition", label: "Value Proposition", type: "rich" },
      { key: "tbMDSuccessCriteria", label: "Success Criteria", type: "rich" },
      { key: "tbMDKeyDependencies", label: "Key Dependencies", type: "rich" },
      { key: "tbMDConstraintsAssumptions", label: "Constraints & Assumptions", type: "rich" },
      { key: "tbMDCostBenefitAnalysis", label: "Cost-Benefit Analysis", type: "rich" },
      { key: "tbMDOptionsAnalysis", label: "Options Analysis", type: "rich" },
      { key: "tbMDImplementationApproach", label: "Implementation Approach", type: "rich" },
      { key: "tbMDNextSteps", label: "Next Steps", type: "rich" },
      { key: "tbMDBackgroundInfo", label: "Background", type: "rich" },
    ],
  },
  {
    title: "Strategic & Investment",
    fields: [
      { key: "tbMDPriorityStrategic", label: "SV Score", type: "score" },
      { key: "tbMDCostbarsScore", label: "AE Score", type: "score" },
      { key: "tbMDFinancialScore", label: "Financial Score", type: "score" },
      { key: "tbMDDecisionStrategic", label: "Strategic Decision" },
      { key: "tbMDInvestmentCategory", label: "Investment Category" },
      { key: "tbMDInvestmentInitiative", label: "Investment Initiative" },
      { key: "tbMDInvestmentObjective", label: "Investment Objective" },
      { key: "tbMDInvestmentStrategy", label: "Investment Strategy" },
      { key: "tbMDRiskVsSizeAndComplexity", label: "Risk vs Size & Complexity" },
    ],
  },
  {
    title: "Financials",
    fields: [
      { key: "tbMDBenefitCostRatio", label: "Benefit-Cost Ratio" },
      { key: "tbMDNetPresentValue", label: "Net Present Value", type: "currency" },
      { key: "tbMDInternalRateOfReturn", label: "Internal Rate of Return" },
      { key: "tbMDPaybackPeriod", label: "Payback Period" },
      { key: "tbMDEconomicValueAdded", label: "Economic Value Added", type: "currency" },
      { key: "tbMDEcnomicValueAdded", label: "Economic Value Added", type: "currency" },
      { key: "tbMDOpportunityCost", label: "Opportunity Cost", type: "currency" },
      { key: "tbMDSunkCosts", label: "Sunk Costs", type: "currency" },
    ],
  },
];

const EMPTY_TOKENS = new Set(["", "0", "0.0", "0.00", "na", "n/a", "null", "undefined"]);

function isEmpty(v) {
  if (v === null || v === undefined) return true;
  return EMPTY_TOKENS.has(String(v).trim().toLowerCase());
}

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function formatCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

function formatNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-CA") : String(value);
}

function toPercent(value) {
  let n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n > 0 && n <= 1) n *= 100;
  return Math.max(0, Math.min(100, n));
}

function ScalarValue({ type, value }) {
  if (type === "badge") {
    return (
      <span className="inline-block rounded-full bg-[#eaf2fb] px-2.5 py-0.5 text-xs font-medium text-[#0b4d8e]">
        {String(value)}
      </span>
    );
  }
  if (type === "percent") {
    const pct = toPercent(value);
    if (pct === null) return <span className="text-gray-900">{String(value)}</span>;
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-[#2b8fd9]" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-gray-900">{Math.round(pct)}%</span>
      </div>
    );
  }
  if (type === "score") {
    const pct = toPercent(value);
    return (
      <span className="inline-block rounded-md bg-[#062f57] px-2 py-0.5 text-xs font-semibold text-white">
        {pct === null ? String(value) : `${Math.round(pct)} / 100`}
      </span>
    );
  }
  let text = String(value);
  if (type === "date") text = formatDate(value);
  else if (type === "currency") text = formatCurrency(value);
  else if (type === "number") text = formatNumber(value);
  return <span className="text-gray-900">{text}</span>;
}

export default function ProjectDetailDrawer({ tbID, onClose }) {
  const [project, setProject] = useState(null);
  const [state, setState] = useState("loading"); // loading | ready | error
  const [message, setMessage] = useState("");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(true);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/dashboard/pubsets/active/project/${encodeURIComponent(tbID)}?product=Costbars`
        );
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (!res.ok) {
          setMessage(data.error || "Failed to load project.");
          setState("error");
          return;
        }
        setProject(data.project || null);
        setState("ready");
      } catch (err) {
        if (active) {
          setMessage(err.message);
          setState("error");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [tbID]);

  const sections =
    project &&
    SECTIONS.map((section) => ({
      ...section,
      fields: section.fields.filter((f) => !isEmpty(project[f.key])),
    })).filter((section) => section.fields.length > 0);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${shown ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl transition-transform duration-300 ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#2b8fd9]">Project</p>
            <h2 className="text-lg font-semibold text-[#062f57]">
              {project?.tbName || (state === "loading" ? "Loading…" : "Project detail")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {state === "loading" ? (
            <p className="text-sm text-gray-500">Loading project…</p>
          ) : state === "error" ? (
            <p className="text-sm text-red-600">{message}</p>
          ) : sections && sections.length === 0 ? (
            <p className="text-sm text-gray-600">No populated fields for this project.</p>
          ) : (
            <div className="space-y-8">
              {sections.map((section) => {
                const scalars = section.fields.filter((f) => f.type !== "rich");
                const rich = section.fields.filter((f) => f.type === "rich");
                return (
                  <section key={section.title}>
                    <h3 className="mb-3 border-b border-gray-100 pb-2 text-sm font-semibold uppercase tracking-wide text-[#0b4d8e]">
                      {section.title}
                    </h3>

                    {scalars.length > 0 && (
                      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        {scalars.map((f) => (
                          <div key={f.key}>
                            <dt className="text-xs font-medium uppercase tracking-wide text-gray-700">
                              {f.label}
                            </dt>
                            <dd className="mt-0.5 text-sm">
                              <ScalarValue type={f.type} value={project[f.key]} />
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    {rich.length > 0 && (
                      <div className={`space-y-4 ${scalars.length > 0 ? "mt-4" : ""}`}>
                        {rich.map((f) => (
                          <div key={f.key}>
                            <dt className="text-xs font-medium uppercase tracking-wide text-gray-700">
                              {f.label}
                            </dt>
                            <dd className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-800">
                              {String(project[f.key])}
                            </dd>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
