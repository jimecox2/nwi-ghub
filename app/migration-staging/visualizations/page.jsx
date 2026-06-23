// app/dashboard/visualizations/page.jsx
'use client'

import Link from 'next/link'
import { PieChart, BarChart3, Activity, ArrowRight, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Enterprise Visualizations Landing Page
 * Lists all available visualization reports
 */
const EnterpriseVisualizationsPage = () => {
  const visualizations = [
    {
      title: 'Resource Cost Charts',
      description: 'Interactive pie charts showing cost distribution by project, role, location, and department',
      icon: PieChart,
      href: '/dashboard/visualizations/cost-charts',
      color: 'indigo',
      features: ['Cost by project', 'Cost by role', 'Cost by location', 'Cost by department']
    },
    {
      title: 'Resource Usage Charts',
      description: 'Bar charts showing resource utilization across six dimensions with weekly breakdowns',
      icon: BarChart3,
      href: '/dashboard/visualizations/usage-charts',
      color: 'teal',
      features: ['Usage by resource', 'Usage by project', 'Usage by skill', 'Weekly breakdown']
    },
    {
      title: 'Burndown Charts',
      description: 'Sprint burndown charts showing planned vs forecast progress over time',
      icon: Activity,
      href: '/dashboard/visualizations/burndown',
      color: 'cyan',
      features: ['Planned vs forecast', 'Sprint velocity', 'Report date marker', 'Multiple projects']
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      indigo: {
        icon: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        hover: 'hover:border-indigo-400',
        button: 'bg-indigo-600 hover:bg-indigo-700'
      },
      teal: {
        icon: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        hover: 'hover:border-teal-400',
        button: 'bg-teal-600 hover:bg-teal-700'
      },
      cyan: {
        icon: 'text-cyan-600',
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        hover: 'hover:border-cyan-400',
        button: 'bg-cyan-600 hover:bg-cyan-700'
      },
    }
    return colors[color]
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Eye className="w-10 h-10 text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-900">Visualizations</h1>
        </div>
        <p className="text-lg text-gray-600">
          Interactive charts and graphs for resource cost, usage, and burndown analysis
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Visualization charts require preprocessed resource data. If charts appear empty, run{' '}
          <Link href="/dashboard/settings/preprocess" className="text-blue-600 hover:underline font-medium">
            Preprocess Resource Data
          </Link>
          {' '}from the Settings menu first.
        </p>
      </div>

      {/* Visualization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visualizations.map((viz) => {
          const colors = getColorClasses(viz.color)
          const Icon = viz.icon

          return (
            <Card
              key={viz.href}
              className={`${colors.border} ${colors.hover} transition-all duration-200 hover:shadow-lg`}
            >
              <CardHeader>
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <CardTitle className="text-xl text-gray-900">{viz.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {viz.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {viz.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.icon.replace('text-', 'bg-')} mr-2`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={viz.href}>
                  <button
                    className={`w-full ${colors.button} text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
                  >
                    View Chart
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Box */}
      <Card className="mt-8 border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About Visualizations</h3>
              <p className="text-sm text-gray-600 mb-3">
                Resource cost and usage charts are powered by preprocessed Allocation data (tbrescalcs2) extracted
                from your dashboard source. Burndown charts use separately provided chart data when available.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Data not showing?</strong> Run{' '}
                <Link href="/dashboard/settings/preprocess" className="text-blue-600 hover:underline">
                  Preprocess Resource Data
                </Link>
                {' '}to extract resource calculations from your active dashboard source.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnterpriseVisualizationsPage
