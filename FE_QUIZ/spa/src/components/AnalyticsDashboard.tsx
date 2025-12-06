import { useState } from 'react'
import { HealthStatus, LoggerInfo } from '@/api/actuatorClient'
import SystemHealth from './SystemHealth'
import SystemMetrics from './SystemMetrics'
import SystemInfo from './SystemInfo'
import Loggers from './Loggers'

interface AnalyticsDashboardProps {
  healthStatus: HealthStatus | null
  metrics: string[]
  environment: any
  loggers: LoggerInfo | null
  loading: boolean
  onLoadHealth: () => void
  onLoadMetrics: () => void
  onLoadEnvironment: () => void
  onLoadLoggers: () => void
  onLoadAllAnalytics: () => void
}

export default function AnalyticsDashboard({
  healthStatus,
  metrics,
  environment,
  loggers,
  loading,
  onLoadHealth,
  onLoadMetrics,
  onLoadEnvironment,
  onLoadLoggers,
  onLoadAllAnalytics
}: AnalyticsDashboardProps) {
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'health' | 'metrics' | 'environment' | 'loggers'>('health')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">System Analytics</h1>
            <p className="text-indigo-100">Monitor system health, metrics, environment, and logs</p>
          </div>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveAnalyticsTab('health')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeAnalyticsTab === 'health'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏥 Health Status
            </button>
            <button
              onClick={() => setActiveAnalyticsTab('metrics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeAnalyticsTab === 'metrics'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Metrics
            </button>
            <button
              onClick={() => setActiveAnalyticsTab('environment')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeAnalyticsTab === 'environment'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚙️ Environment
            </button>
            <button
              onClick={() => setActiveAnalyticsTab('loggers')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeAnalyticsTab === 'loggers'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📝 Loggers
            </button>
            <button
              onClick={onLoadAllAnalytics}
              disabled={loading}
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>🔄 Refresh All</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeAnalyticsTab === 'health' && (
            <SystemHealth health={healthStatus} loading={loading} />
          )}
          {activeAnalyticsTab === 'metrics' && (
            <SystemMetrics loading={loading} onLoadMetrics={onLoadMetrics} />
          )}
          {activeAnalyticsTab === 'environment' && (
            <SystemInfo environment={environment} loading={loading} />
          )}
          {activeAnalyticsTab === 'loggers' && (
            <Loggers loggers={loggers} loading={loading} onLoadLoggers={onLoadLoggers} />
          )}
        </div>
      </div>
    </div>
  )
}
