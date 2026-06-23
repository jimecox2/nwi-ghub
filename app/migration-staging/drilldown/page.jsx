// app/dashboard/drilldown/page.jsx
'use client'

import Link from 'next/link'
import { Layers, ArrowRight, MousePointerClick } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Enterprise Drilldown Landing Page
 * Lists all available drilldown reports
 */
const EnterpriseDrilldownPage = () => {
  const drilldowns = [
    {
      title: 'Project Cards',
      description: 'Interactive card-based navigation through the full portfolio hierarchy with health indicators at every level',
      icon: Layers,
      href: '/dashboard/drilldown/cards',
      color: 'orange',
      features: ['4-level drilldown (Portfolio → Project → Sub-Project → Task)', '7 health indicator dimensions', 'Tasks, Risks, and Issues tabs', 'Breadcrumb navigation']
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      orange: {
        icon: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        hover: 'hover:border-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
    }
    return colors[color]
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <MousePointerClick className="w-10 h-10 text-orange-600" />
          <h1 className="text-4xl font-bold text-gray-900">Drilldown</h1>
        </div>
        <p className="text-lg text-gray-600">
          Interactive card-based exploration of your project portfolio hierarchy
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Drilldown reports require all hierarchy levels (Portfolio, Project, Sub-Project, Task, Allocation)
          in your dashboard source. Ensure the source was created with the full consolidation.
        </p>
      </div>

      {/* Drilldown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drilldowns.map((item) => {
          const colors = getColorClasses(item.color)
          const Icon = item.icon

          return (
            <Card
              key={item.href}
              className={`${colors.border} ${colors.hover} transition-all duration-200 hover:shadow-lg`}
            >
              <CardHeader>
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <CardTitle className="text-xl text-gray-900">{item.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.icon.replace('text-', 'bg-')} mr-2`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={item.href}>
                  <button
                    className={`w-full ${colors.button} text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
                  >
                    Open Drilldown
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
            <MousePointerClick className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About Drilldown Reports</h3>
              <p className="text-sm text-gray-600 mb-3">
                Drilldown reports let you navigate through the project hierarchy interactively.
                Start at the Portfolio level and click through to Projects, Sub-Projects, and Tasks
                to see health indicators, risks, and issues at each level.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Missing data?</strong> Make sure your dashboard source includes all 5 hierarchy levels.
                Re-create the source from the{' '}
                <Link href="/dashboard/pubsets" className="text-blue-600 hover:underline">
                  Make Sources
                </Link>
                {' '}page if needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnterpriseDrilldownPage
