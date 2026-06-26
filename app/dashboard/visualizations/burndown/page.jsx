"use client";

// Burndown Charts. Two views: computed project burndown (from tbmdjoined task
// rows) and Agilebars sprint charts (from tbcharts). Ported from the legacy
// page; moment replaced with small native date helpers.
import { useState } from "react";
import { Activity, Info, ChevronDown, ChevronUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import ReportShell from "@/components/dashboard/ReportShell";
import BurndownChart from "@/components/dashboard/charts/BurndownChart";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const parseNum = (v) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
};

function parseDate(d) {
  if (!d) return null;
  if (d instanceof Date) return Number.isNaN(d.getTime()) ? null : d;
  const s = String(d).trim();
  const m = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/); // DD-MMM-YYYY
  if (m) {
    const mi = MONTHS.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
    if (mi >= 0) return new Date(+m[3], mi, +m[1]);
  }
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function startOfIsoWeek(date) {
  const x = new Date(date);
  const day = (x.getDay() + 6) % 7; // Mon=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

const fmtShort = (date) => `${String(date.getDate()).padStart(2, "0")}${MONTHS[date.getMonth()]}${String(date.getFullYear()).slice(-2)}`;
const fmtLong = (date) => `${String(date.getDate()).padStart(2, "0")}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
const formatHours = (h) => (h >= 1000 ? `${(h / 1000).toFixed(1)}K` : `${Math.round(h)}`);

function computeProjectBurndown(projectName, tasks, reportDate) {
  const valid = (tasks || []).filter((t) => parseNum(t.tbWork) > 0 && parseDate(t.tbStart) && parseDate(t.tbFinish));
  if (valid.length === 0) return null;

  const totalWork = valid.reduce((s, t) => s + parseNum(t.tbWork), 0);
  const totalActualWork = valid.reduce((s, t) => s + parseNum(t.tbAWork), 0);
  const totalRemaining = valid.reduce((s, t) => {
    const wr = parseNum(t.tbWorkRemaining);
    if (wr > 0) return s + wr;
    return s + parseNum(t.tbWork) * (1 - parseNum(t.tbPercentComplete) / 100);
  }, 0);

  const startTimes = valid.map((t) => parseDate(t.tbStart).getTime());
  const finishTimes = valid.map((t) => parseDate(t.tbFinish).getTime());
  const projectStart = new Date(Math.min(...startTimes));
  const projectFinish = new Date(Math.max(...finishTimes));
  if (projectStart >= projectFinish) return null;

  const weeks = [];
  let cursor = startOfIsoWeek(projectStart);
  const end = startOfIsoWeek(projectFinish).getTime();
  while (cursor.getTime() <= end) {
    weeks.push(new Date(cursor));
    cursor = new Date(cursor.getTime() + WEEK_MS);
  }
  if (weeks.length < 2 || weeks.length > 104) return null;

  const planned = weeks.map((week) => {
    const completed = valid.reduce((s, t) => {
      const f = startOfIsoWeek(parseDate(t.tbFinish));
      return f.getTime() <= week.getTime() ? s + parseNum(t.tbWork) : s;
    }, 0);
    return Math.max(totalWork - completed, 0);
  });

  const reportMoment = reportDate ? parseDate(reportDate) : new Date();
  const reportWeek = reportMoment ? startOfIsoWeek(reportMoment).getTime() : null;
  let reportIdx = reportWeek != null ? weeks.findIndex((w) => w.getTime() >= reportWeek) : -1;
  const actualReportIdx = reportIdx >= 0 ? reportIdx : weeks.length - 1;

  const currentRemaining = Math.max(totalRemaining, 0);
  const burnedSoFar = totalWork - currentRemaining;
  const burnRate = actualReportIdx > 0 ? burnedSoFar / actualReportIdx : burnedSoFar;
  const weeksToComplete = burnRate > 0 ? currentRemaining / burnRate : 0;

  const actual = weeks.map((_, idx) => {
    if (idx <= actualReportIdx) {
      const progress = actualReportIdx > 0 ? idx / actualReportIdx : 1;
      return Math.max(totalWork - burnedSoFar * progress, 0);
    }
    return Math.max(currentRemaining - burnRate * (idx - actualReportIdx), 0);
  });

  return {
    projectName,
    totalWork: Math.round(totalWork),
    totalActualWork: Math.round(totalActualWork),
    totalRemaining: Math.round(currentRemaining),
    percentComplete: totalWork > 0 ? Math.round((burnedSoFar / totalWork) * 100) : 0,
    taskCount: valid.length,
    startDate: fmtLong(projectStart),
    finishDate: fmtLong(projectFinish),
    reportDate: reportMoment ? fmtShort(startOfIsoWeek(reportMoment)) : null,
    burnRate: Math.round(burnRate),
    weeksToComplete: Math.round(weeksToComplete),
    chartPoints: weeks.map((week, idx) => ({ date: fmtShort(week), planned: Math.round(planned[idx]), actual: Math.round(actual[idx]) })),
  };
}

function ComputedBurndownCard({ burndown }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="border-gray-200">
      <CardContent className="pt-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{burndown.projectName}</h3>
          <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-500 hover:text-gray-700">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        <div className="mb-3 flex flex-wrap gap-3 text-xs">
          <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">{burndown.taskCount} tasks</span>
          <span className="rounded bg-gray-50 px-2 py-1 text-gray-700">{formatHours(burndown.totalWork)} hrs planned</span>
          <span className="rounded bg-green-50 px-2 py-1 text-green-700">{burndown.percentComplete}% complete</span>
          <span className="rounded bg-amber-50 px-2 py-1 text-amber-700">{formatHours(burndown.totalRemaining)} hrs remaining</span>
          {burndown.burnRate > 0 && <span className="rounded bg-purple-50 px-2 py-1 text-purple-700">~{formatHours(burndown.burnRate)} hrs/wk</span>}
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={burndown.chartPoints} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} domain={[0, "auto"]} tickFormatter={formatHours} />
              <Tooltip formatter={(v, n) => [`${formatHours(v)} hours`, n === "planned" ? "Planned Remaining" : "Actual / Forecast"]} />
              <Legend formatter={(v) => (v === "planned" ? "Planned Remaining" : "Actual / Forecast")} />
              <Line type="monotone" dataKey="planned" stroke="#ff0080" strokeWidth={2} dot={{ r: 3 }} name="planned" />
              <Line type="monotone" dataKey="actual" stroke="#0099ff" strokeWidth={2} dot={{ r: 3 }} name="actual" />
              {burndown.reportDate && (
                <ReferenceLine x={burndown.reportDate} stroke="#333" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Report: ${burndown.reportDate}`, position: "insideTopRight", fill: "#333", fontSize: 11 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {expanded && (
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 text-sm md:grid-cols-4">
            <Detail label="Planned Work" value={`${formatHours(burndown.totalWork)} hrs`} />
            <Detail label="Actual Work Done" value={`${formatHours(burndown.totalActualWork)} hrs`} />
            <Detail label="Remaining Work" value={`${formatHours(burndown.totalRemaining)} hrs`} />
            <Detail label="Completion" value={`${burndown.percentComplete}%`} />
            <Detail label="Burn Rate" value={burndown.burnRate > 0 ? `${formatHours(burndown.burnRate)} hrs/wk` : "N/A"} />
            <Detail label="Est. Weeks to Complete" value={burndown.weeksToComplete > 0 ? `${burndown.weeksToComplete} wks` : "Done"} />
            <Detail label="Start" value={burndown.startDate} />
            <Detail label="Finish" value={burndown.finishDate} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

function PortfolioSummaryChart({ burndowns }) {
  const data = burndowns.map((b) => ({
    name: b.projectName.length > 20 ? b.projectName.slice(0, 18) + "…" : b.projectName,
    completed: b.totalActualWork,
    remaining: b.totalRemaining,
  }));
  return (
    <Card className="mb-6 border-gray-200">
      <CardContent className="pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Portfolio Work Status</h3>
        <ResponsiveContainer width="100%" height={Math.max(200, burndowns.length * 40)}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tickFormatter={formatHours} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
            <Tooltip formatter={(v) => `${formatHours(v)} hrs`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
            <Bar dataKey="remaining" stackId="a" fill="#f59e0b" name="Remaining" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function BurndownBody({ dashboardSource, adaptedData }) {
  const [tab, setTab] = useState("computed");
  const bdCharts = adaptedData?.bdCharts || [];
  const allRows = dashboardSource.tbmdjoined || [];

  const taskRows = allRows.filter((r) => r.tbType === "Task" || r.tbType === "Milestone");
  const groups = {};
  taskRows.forEach((t) => {
    const name = t.tbL2 || t.tbL1 || "Unknown Project";
    (groups[name] = groups[name] || []).push(t);
  });
  const reportDate = allRows.find((r) => r.apStatusDate)?.apStatusDate || null;
  const computed = Object.entries(groups)
    .map(([name, tasks]) => computeProjectBurndown(name, tasks, reportDate))
    .filter(Boolean)
    .sort((a, b) => b.totalWork - a.totalWork);

  const totalPlanned = computed.reduce((s, b) => s + b.totalWork, 0);
  const totalCompleted = computed.reduce((s, b) => s + b.totalActualWork, 0);
  const totalRemaining = computed.reduce((s, b) => s + b.totalRemaining, 0);
  const overall = totalPlanned > 0 ? Math.round(((totalPlanned - totalRemaining) / totalPlanned) * 100) : 0;

  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        <TabBtn active={tab === "computed"} onClick={() => setTab("computed")}>Project Burndown ({computed.length})</TabBtn>
        <TabBtn active={tab === "sprint"} onClick={() => setTab("sprint")}>Sprint Charts ({bdCharts.length})</TabBtn>
      </div>

      {tab === "computed" &&
        (computed.length > 0 ? (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
              <Stat value={computed.length} label="Projects" cls="border-blue-200 bg-blue-50 text-blue-800" />
              <Stat value={formatHours(totalPlanned)} label="Planned (hrs)" cls="border-gray-200 text-gray-800" />
              <Stat value={formatHours(totalCompleted)} label="Completed (hrs)" cls="border-green-200 bg-green-50 text-green-700" />
              <Stat value={formatHours(totalRemaining)} label="Remaining (hrs)" cls="border-amber-200 bg-amber-50 text-amber-700" />
              <Stat value={`${overall}%`} label="Overall Complete" cls="border-indigo-200 bg-indigo-50 text-indigo-700" />
            </div>
            {computed.length > 1 && <PortfolioSummaryChart burndowns={computed} />}
            <div className="space-y-6">
              {computed.map((b, i) => (
                <ComputedBurndownCard key={i} burndown={b} />
              ))}
            </div>
          </>
        ) : (
          <Notice>No tasks with valid work hours and date ranges were found. Project burndowns are computed from Task rows with tbWork, tbStart, and tbFinish.</Notice>
        ))}

      {tab === "sprint" &&
        (bdCharts.length > 0 ? (
          <div className="space-y-8">
            {bdCharts.map((c, i) => (
              <BurndownChart key={i} chartData={c} />
            ))}
          </div>
        ) : (
          <Notice>This source has no Agilebars sprint chart data (tbcharts). Include an Agilebars pubset when creating the source to see sprint charts.</Notice>
        ))}
    </>
  );
}

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
  >
    {children}
  </button>
);

const Stat = ({ value, label, cls }) => (
  <Card className={cls.split(" ").filter((c) => c.startsWith("border") || c.startsWith("bg")).join(" ")}>
    <CardContent className="py-3 text-center">
      <p className={`text-xl font-bold ${cls.split(" ").find((c) => c.startsWith("text")) || "text-gray-800"}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </CardContent>
  </Card>
);

const Notice = ({ children }) => (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
    <div className="flex items-start gap-3">
      <Info className="mt-1 h-6 w-6 flex-shrink-0 text-amber-600" />
      <p className="text-sm text-amber-800">{children}</p>
    </div>
  </div>
);

export default function BurndownPage() {
  return (
    <ReportShell title="Burndown Charts" icon={Activity} subtitle="Work remaining over time — planned schedule vs actual progress.">
      {({ dashboardSource, adaptedData }) => <BurndownBody dashboardSource={dashboardSource} adaptedData={adaptedData} />}
    </ReportShell>
  );
}
