// app/dashboard/reports/page.jsx
'use client'

import Link from 'next/link'
import {
  FileText, PieChart, Users, BarChart3, ArrowRight, GitCompare, Layers, Activity,
  ShieldAlert, AlertOctagon, FilePenLine, Briefcase, Target, CircleDot, Scale, Gauge,
  DollarSign, Grid3X3, SlidersHorizontal,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Enterprise Reports Landing Page
 *
 * Sections organised by domain so users can quickly find reports relevant
 * to their product mix (Agilebars / Timebars / Costbars).
 */
const EnterpriseReportsPage = () => {
  // ── General Reports (all products) ──────────────────────────────────
  const generalReports = [
    {
      title: 'Project Status Report',
      description: 'Detailed project and portfolio status with timelines, budgets, and health metrics',
      icon: FileText,
      href: '/dashboard/reports/projects',
      color: 'blue',
      features: ['Project timelines', 'Budget tracking', 'Health indicators', 'Risk assessment'],
    },
    {
      title: 'Portfolio Report',
      description: 'Portfolio-level insights and strategic project analysis across the organization',
      icon: PieChart,
      href: '/dashboard/reports/portfolio',
      color: 'purple',
      features: ['Portfolio view', 'Strategic analysis', 'Cross-project insights', 'Executive summary'],
    },
    {
      title: 'Variance Report',
      description: 'Compare current project data against baseline plans to identify schedule and cost deviations',
      icon: GitCompare,
      href: '/dashboard/reports/variance',
      color: 'amber',
      features: ['Baseline comparison', 'Schedule variance', 'Cost variance', 'Deviation highlighting'],
    },
  ]

  // ── Drilldown Reports (all products) ────────────────────────────────
  const drilldownReports = [
    {
      title: 'Project Cards Drilldown',
      description: 'Interactive card-based navigation through portfolio hierarchy with health indicators',
      icon: Layers,
      href: '/dashboard/drilldown/cards',
      color: 'orange',
      features: ['4-level drilldown', '7 health indicators', 'Tasks/risks/issues tabs', 'Breadcrumb navigation'],
    },
  ]

  // ── Risk, Issues & Change Requests (all products) ───────────────────
  const riskIssueReports = [
    {
      title: 'Risk Register',
      description: 'All identified risks across the portfolio with probability, impact scoring, and mitigation plans',
      icon: ShieldAlert,
      href: '/dashboard/reports/risks',
      color: 'red',
      features: ['Probability & impact', 'Risk score matrix', 'Mitigation plans', 'Escalation tracking'],
    },
    {
      title: 'Issues Log',
      description: 'Tracked issues across the portfolio with impact assessment, mitigation status, and escalation',
      icon: AlertOctagon,
      href: '/dashboard/reports/issues',
      color: 'orange',
      features: ['Issue tracking', 'Impact assessment', 'Mitigation status', 'Escalation levels'],
    },
    {
      title: 'Change Requests',
      description: 'Formal change requests to project scope, schedule, or budget across the portfolio',
      icon: FilePenLine,
      href: '/dashboard/reports/change-requests',
      color: 'violet',
      features: ['Scope changes', 'Budget changes', 'Schedule changes', 'Approval tracking'],
    },
  ]

  // ── Resource Reports (Timebars & Costbars) ──────────────────────────
  const resourceReports = [
    {
      title: 'Resource Pool',
      description: 'Comprehensive resource capacity and allocation data with availability tracking',
      icon: Users,
      href: '/dashboard/reports/resources',
      color: 'green',
      features: ['Resource capacity', 'Team allocation', 'Availability tracking', 'Skills inventory'],
    },
    {
      title: 'Capacity vs Demand',
      description: 'Resource supply and demand planning with weekly timeline, utilization tracking, and role analysis',
      icon: Gauge,
      href: '/dashboard/reports/capacity-demand',
      color: 'teal',
      features: ['Weekly timeline', 'Supply vs demand', 'Utilization tracking', 'Role-based analysis'],
    },
    {
      title: 'Resource Cost Charts',
      description: 'Interactive pie charts showing cost distribution by project, role, location, and department',
      icon: PieChart,
      href: '/dashboard/visualizations/cost-charts',
      color: 'indigo',
      features: ['Cost by project', 'Cost by role', 'Cost by location', 'Cost by department'],
    },
    {
      title: 'Resource Usage Charts',
      description: 'Bar charts showing resource utilization across six dimensions with weekly breakdowns',
      icon: BarChart3,
      href: '/dashboard/visualizations/usage-charts',
      color: 'teal',
      features: ['Usage by resource', 'Usage by project', 'Usage by skill', 'Weekly breakdown'],
    },
  ]

  // ── Agile Reports (Agilebars, computed view for all) ────────────────
  const agileReports = [
    {
      title: 'Burndown Charts',
      description: 'Computed project burndown from task data plus Agilebars sprint burndown charts when available',
      icon: Activity,
      href: '/dashboard/visualizations/burndown',
      color: 'cyan',
      features: ['Computed burndown (all products)', 'Sprint charts (Agilebars)', 'Portfolio stacked view', 'Per-project breakdown'],
    },
  ]

  // ── PPM Decision Making (Costbars primarily) ────────────────────────
  const ppmReports = [
    {
      title: 'Executive Portfolio Summary',
      description: 'At-a-glance portfolio health for executive decision makers with health indicators and financial summaries',
      icon: Briefcase,
      href: '/dashboard/reports/executive-summary',
      color: 'slate',
      features: ['7-dimension health', 'Cost & schedule summary', 'Risk & issue counts', 'Status classification'],
    },
    {
      title: 'Prioritization Matrix',
      description: 'Composite scoring to identify projects to continue, restructure, or terminate',
      icon: Target,
      href: '/dashboard/reports/prioritization',
      color: 'indigo',
      features: ['Composite scoring', 'Kill / continue decisions', 'Ranked by severity', 'Variance integration'],
    },
    {
      title: 'Bubble Chart',
      description: 'Strategic Value vs Ability to Execute scatter plot with interactive selection thresholds',
      icon: CircleDot,
      href: '/dashboard/reports/bubble-chart',
      color: 'emerald',
      features: ['SV vs AE scoring', 'Cost-weighted bubbles', 'Selection algorithm', 'Quadrant analysis'],
    },
    {
      title: 'Balanced Scorecard',
      description: 'Portfolio balance assessment across 8 KPI dimensions including investment, risk, and duration',
      icon: Scale,
      href: '/dashboard/reports/balanced-scorecard',
      color: 'purple',
      features: ['8 KPI dimensions', 'Score distributions', 'Investment balance', 'Balance indicators'],
    },
    {
      title: 'Financial Summary',
      description: 'Aggregate portfolio financial data with NPV, IRR, Payback Period, ROM Estimates, and cost analysis',
      icon: DollarSign,
      href: '/dashboard/reports/financial-summary',
      color: 'green',
      features: ['NPV & IRR analysis', 'ROM estimates', 'Estimation class', 'Cost by category'],
    },
    {
      title: 'Strategic Alignment',
      description: 'Investment Objective vs Category heatmap showing where portfolio spend is concentrated',
      icon: Grid3X3,
      href: '/dashboard/reports/strategic-alignment',
      color: 'blue',
      features: ['Objective/Category matrix', 'Investment heatmap', 'Strategy distribution', 'Initiative tracking'],
    },
    {
      title: 'What-If Scenarios',
      description: 'Adjust SV/AE weights and thresholds to simulate portfolio decisions and see financial impact',
      icon: SlidersHorizontal,
      href: '/dashboard/reports/what-if',
      color: 'violet',
      features: ['Threshold simulation', 'Decision comparison', 'Health radar', 'AE component breakdown'],
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        icon: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        hover: 'hover:border-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      purple: {
        icon: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        hover: 'hover:border-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
      green: {
        icon: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        hover: 'hover:border-green-400',
        button: 'bg-green-600 hover:bg-green-700',
      },
      amber: {
        icon: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        hover: 'hover:border-amber-400',
        button: 'bg-amber-600 hover:bg-amber-700',
      },
      indigo: {
        icon: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        hover: 'hover:border-indigo-400',
        button: 'bg-indigo-600 hover:bg-indigo-700',
      },
      teal: {
        icon: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        hover: 'hover:border-teal-400',
        button: 'bg-teal-600 hover:bg-teal-700',
      },
      cyan: {
        icon: 'text-cyan-600',
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        hover: 'hover:border-cyan-400',
        button: 'bg-cyan-600 hover:bg-cyan-700',
      },
      orange: {
        icon: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        hover: 'hover:border-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700',
      },
      red: {
        icon: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        hover: 'hover:border-red-400',
        button: 'bg-red-600 hover:bg-red-700',
      },
      violet: {
        icon: 'text-violet-600',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        hover: 'hover:border-violet-400',
        button: 'bg-violet-600 hover:bg-violet-700',
      },
      slate: {
        icon: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        hover: 'hover:border-slate-400',
        button: 'bg-slate-600 hover:bg-slate-700',
      },
      emerald: {
        icon: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        hover: 'hover:border-emerald-400',
        button: 'bg-emerald-600 hover:bg-emerald-700',
      },
    }
    return colors[color]
  }

  const renderReportCard = (report) => {
    const colors = getColorClasses(report.color)
    const Icon = report.icon

    return (
      <Card
        key={report.href}
        className={`${colors.border} ${colors.hover} transition-all duration-200 hover:shadow-lg`}
      >
        <CardHeader>
          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-3`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          <CardTitle className="text-xl text-gray-900">{report.title}</CardTitle>
          <CardDescription className="text-gray-600">
            {report.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-4">
            {report.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-sm text-gray-600">
                <div className={`w-1.5 h-1.5 rounded-full ${colors.icon.replace('text-', 'bg-')} mr-2`} />
                {feature}
              </li>
            ))}
          </ul>
          <Link href={report.href}>
            <button
              className={`w-full ${colors.button} text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
            >
              View Report
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  /** Render a section with heading, optional subtitle, and report cards */
  const renderSection = (title, subtitle, reports, gridCols = 'lg:grid-cols-3') => (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-1 mt-10">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-6`}>
        {reports.map(renderReportCard)}
      </div>
    </>
  )

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Enterprise Reports</h1>
        </div>
        <p className="text-lg text-gray-600">
          Access comprehensive reports from your active dashboard source
        </p>
        <p className="text-sm text-gray-500 mt-2">
          All reports use the currently active dashboard source. Change the active source from the{' '}
          <Link href="/dashboard" className="text-blue-600 hover:underline font-medium">
            Enterprise Dashboard
          </Link>
          {' '}or{' '}
          <Link href="/dashboard/sources" className="text-blue-600 hover:underline font-medium">
            Manage Sources
          </Link>
          {' '}page.
        </p>
      </div>

      {/* General Reports */}
      {renderSection(
        'Project - General Reports',
        'Available for all products — Agilebars, Timebars, and Costbars',
        generalReports,
        'lg:grid-cols-3',
      )}

      {/* Drilldown Reports */}
      {renderSection(
        'Project - Drilldown Reports',
        'Interactive navigation through your project portfolio hierarchy',
        drilldownReports,
        'lg:grid-cols-3',
      )}

      {/* Risk, Issues & Change Requests */}
      {renderSection(
        'Project - Risk, Issues & Change Requests',
        null,
        riskIssueReports,
        'lg:grid-cols-3',
      )}

      {/* Resource Reports */}
      {renderSection(
        'Resource Reports',
        'Requires Timebars or Costbars resource-loaded schedules',
        resourceReports,
        'lg:grid-cols-4',
      )}

      {/* Agile Reports */}
      {renderSection(
        'Agile Reports',
        'Computed burndown for all products, sprint charts for Agilebars',
        agileReports,
        'lg:grid-cols-3',
      )}

      {/* PPM Decision Making */}
      {renderSection(
        'PPM Decision Making',
        'Executive-level reports for portfolio prioritization, project health assessment, and go/kill decisions',
        ppmReports,
        'lg:grid-cols-3',
      )}

      {/* Info Box */}
      <Card className="mt-8 border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About Enterprise Reports</h3>
              <p className="text-sm text-gray-600 mb-3">
                Enterprise reports provide organization-wide insights by consolidating data from multiple
                project pubsets into unified dashboard sources. All reports automatically use the currently
                active dashboard source for your organization.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Need help?</strong> Visit the{' '}
                <Link href="/knowledgebase" className="text-blue-600 hover:underline">
                  Knowledge Base
                </Link>
                {' '}to learn more about dashboard sources and enterprise reporting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnterpriseReportsPage
