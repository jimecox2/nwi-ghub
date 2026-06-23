// app/dashboard/analytics/page.jsx
'use client'

import Link from 'next/link'
import { TrendingUp, Activity, ArrowRight, LineChart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Enterprise Analytics Landing Page
 * Lists all available analytics reports
 */
const EnterpriseAnalyticsPage = () => {
  const analytics = [
    {
      title: 'Performance Analytics',
      description: 'Analyze project performance trends, schedule adherence, and delivery metrics across your portfolio',
      icon: TrendingUp,
      href: '/dashboard/analytics/performance',
      color: 'violet',
      features: ['Schedule performance index', 'Delivery trends', 'Milestone tracking', 'Team velocity']
    },
    {
      title: 'Cost Analytics',
      description: 'Deep-dive into cost performance, budget variance, and financial health indicators',
      icon: Activity,
      href: '/dashboard/analytics/cost',
      color: 'rose',
      features: ['Cost performance index', 'Budget variance trends', 'Earned value analysis', 'Forecast accuracy']
    },
  ]

  const getColorClasses = (color) => {
    const colors = {
      violet: {
        icon: 'text-violet-600',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        hover: 'hover:border-violet-400',
        button: 'bg-violet-600 hover:bg-violet-700'
      },
      rose: {
        icon: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        hover: 'hover:border-rose-400',
        button: 'bg-rose-600 hover:bg-rose-700'
      },
    }
    return colors[color]
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <LineChart className="w-10 h-10 text-violet-600" />
          <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
        </div>
        <p className="text-lg text-gray-600">
          Performance and cost analytics for data-driven project decisions
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Analytics reports provide advanced analysis of project performance and financial health.
          These reports are planned for a future phase.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analytics.map((item) => {
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
                    View Analytics
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
            <LineChart className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About Analytics</h3>
              <p className="text-sm text-gray-600 mb-3">
                Analytics reports go beyond standard reporting to provide trend analysis, performance
                indices, and predictive insights. These advanced reports help executives and project
                managers make data-driven decisions about portfolio priorities and resource allocation.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Coming soon:</strong> Performance and Cost Analytics are planned for a future phase.
                In the meantime, explore the{' '}
                <Link href="/dashboard/reports" className="text-blue-600 hover:underline">
                  Reports
                </Link>
                {' '}and{' '}
                <Link href="/dashboard/visualizations" className="text-blue-600 hover:underline">
                  Visualizations
                </Link>
                {' '}sections for current data analysis capabilities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnterpriseAnalyticsPage
