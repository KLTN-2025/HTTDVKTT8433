import { useState, useEffect } from 'react'
import { getMetrics, getMetricDetails, MetricInfo } from '@/api/actuatorClient'

interface SystemMetricsProps {
  loading: boolean
  onLoadMetrics: () => void
}

export default function SystemMetrics({ loading, onLoadMetrics }: SystemMetricsProps) {
  const [metrics, setMetrics] = useState<string[]>([])
  const [selectedMetrics, setSelectedMetrics] = useState<{ [key: string]: MetricInfo }>({})
  const [loadingDetails, setLoadingDetails] = useState<{ [key: string]: boolean }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = {
    'all': 'All Metrics',
    'jvm': 'JVM Metrics',
    'http': 'HTTP Metrics',
    'database': 'Database Metrics',
    'system': 'System Metrics',
    'spring': 'Spring Metrics',
    'tomcat': 'Tomcat Metrics',
    'mongodb': 'MongoDB Metrics',
    'hikaricp': 'HikariCP Metrics',
    'kafka': 'Kafka Metrics'
  }

  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = metric.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || metric.toLowerCase().includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  const loadMetricDetails = async (metricName: string) => {
    if (selectedMetrics[metricName]) return

    setLoadingDetails(prev => ({ ...prev, [metricName]: true }))
    try {
      const details = await getMetricDetails(metricName)
      setSelectedMetrics(prev => ({ ...prev, [metricName]: details }))
    } catch (error) {
      console.error(`Error loading metric ${metricName}:`, error)
    } finally {
      setLoadingDetails(prev => ({ ...prev, [metricName]: false }))
    }
  }

  const formatValue = (value: number, baseUnit?: string) => {
    if (baseUnit === 'bytes') {
      return formatBytes(value)
    } else if (baseUnit === 'percent') {
      return `${(value * 100).toFixed(2)}%`
    } else if (baseUnit === 'seconds') {
      return `${value.toFixed(3)}s`
    } else if (baseUnit === 'milliseconds') {
      return `${value.toFixed(2)}ms`
    }
    return value.toFixed(2)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getMetricIcon = (metricName: string) => {
    if (metricName.includes('memory')) return '🧠'
    if (metricName.includes('cpu')) return '⚡'
    if (metricName.includes('disk')) return '💾'
    if (metricName.includes('http')) return '🌐'
    if (metricName.includes('database') || metricName.includes('jdbc')) return '🗄️'
    if (metricName.includes('thread')) return '🧵'
    if (metricName.includes('gc')) return '🗑️'
    if (metricName.includes('connection')) return '🔗'
    if (metricName.includes('session')) return '📝'
    if (metricName.includes('kafka')) return '📨'
    if (metricName.includes('mongodb')) return '🍃'
    return '📊'
  }

  const getMetricColor = (metricName: string) => {
    if (metricName.includes('memory')) return 'text-blue-600 bg-blue-100'
    if (metricName.includes('cpu')) return 'text-green-600 bg-green-100'
    if (metricName.includes('disk')) return 'text-purple-600 bg-purple-100'
    if (metricName.includes('http')) return 'text-orange-600 bg-orange-100'
    if (metricName.includes('database') || metricName.includes('jdbc')) return 'text-indigo-600 bg-indigo-100'
    if (metricName.includes('thread')) return 'text-pink-600 bg-pink-100'
    if (metricName.includes('gc')) return 'text-red-600 bg-red-100'
    if (metricName.includes('connection')) return 'text-cyan-600 bg-cyan-100'
    if (metricName.includes('session')) return 'text-yellow-600 bg-yellow-100'
    if (metricName.includes('kafka')) return 'text-emerald-600 bg-emerald-100'
    if (metricName.includes('mongodb')) return 'text-lime-600 bg-lime-100'
    return 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">System Metrics</h3>
          <button
            onClick={onLoadMetrics}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select metric category"
            >
              {Object.entries(categories).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Metrics Count */}
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredMetrics.length} of {metrics.length} metrics
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMetrics.map((metricName) => {
          const metricDetails = selectedMetrics[metricName]
          const isLoading = loadingDetails[metricName]
          
          return (
            <div key={metricName} className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getMetricIcon(metricName)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMetricColor(metricName)}`}>
                    {metricName.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => loadMetricDetails(metricName)}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : metricDetails ? 'Loaded' : 'Load Details'}
                </button>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                <div className="font-medium text-gray-900">{metricName}</div>
                {metricDetails?.description && (
                  <div className="text-xs text-gray-500 mt-1">{metricDetails.description}</div>
                )}
              </div>

              {/* Metric Details */}
              {metricDetails && (
                <div className="mt-3 space-y-2">
                  {metricDetails.measurements.map((measurement, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 capitalize">
                        {measurement.statistic.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatValue(measurement.value, metricDetails.baseUnit)}
                      </span>
                    </div>
                  ))}
                  
                  {metricDetails.baseUnit && (
                    <div className="text-xs text-gray-500 mt-2">
                      Unit: {metricDetails.baseUnit}
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="mt-3 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading...</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredMetrics.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No metrics found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
