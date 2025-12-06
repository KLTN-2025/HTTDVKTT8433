import { useState } from 'react'
import { EnvironmentInfo } from '@/api/actuatorClient'

interface SystemInfoProps {
  environment: EnvironmentInfo | null
  loading: boolean
}

export default function SystemInfo({ environment, loading }: SystemInfoProps) {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('all')

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  const getSectionIcon = (sectionName: string) => {
    if (sectionName.includes('server')) return '🖥️'
    if (sectionName.includes('spring')) return '🍃'
    if (sectionName.includes('database') || sectionName.includes('datasource')) return '🗄️'
    if (sectionName.includes('jwt')) return '🔐'
    if (sectionName.includes('kafka')) return '📨'
    if (sectionName.includes('gemini')) return '🤖'
    if (sectionName.includes('management')) return '⚙️'
    if (sectionName.includes('info')) return 'ℹ️'
    if (sectionName.includes('system')) return '💻'
    if (sectionName.includes('cloud')) return '☁️'
    return '📋'
  }

  const getSectionColor = (sectionName: string) => {
    if (sectionName.includes('server')) return 'text-blue-600 bg-blue-100'
    if (sectionName.includes('spring')) return 'text-green-600 bg-green-100'
    if (sectionName.includes('database') || sectionName.includes('datasource')) return 'text-indigo-600 bg-indigo-100'
    if (sectionName.includes('jwt')) return 'text-red-600 bg-red-100'
    if (sectionName.includes('kafka')) return 'text-orange-600 bg-orange-100'
    if (sectionName.includes('gemini')) return 'text-purple-600 bg-purple-100'
    if (sectionName.includes('management')) return 'text-cyan-600 bg-cyan-100'
    if (sectionName.includes('info')) return 'text-pink-600 bg-pink-100'
    if (sectionName.includes('system')) return 'text-gray-600 bg-gray-100'
    if (sectionName.includes('cloud')) return 'text-sky-600 bg-sky-100'
    return 'text-gray-600 bg-gray-100'
  }

  const formatValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? '✅ Yes' : '❌ No'
    }
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...'
    }
    return String(value)
  }

  const isSensitiveProperty = (key: string) => {
    const sensitiveKeys = ['password', 'secret', 'key', 'token', 'credential', 'auth']
    return sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
  }

  const maskSensitiveValue = (value: string) => {
    if (value.length <= 4) return '****'
    return value.substring(0, 2) + '****' + value.substring(value.length - 2)
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

  if (!environment) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p>Không thể tải thông tin environment</p>
        </div>
      </div>
    )
  }

  const filteredSections = environment.propertySources.filter(section => {
    const matchesSearch = searchTerm === '' || 
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(section.properties).some(key => 
        key.toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesSection = selectedSection === 'all' || 
      section.name.toLowerCase().includes(selectedSection.toLowerCase())
    return matchesSearch && matchesSection
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Environment Information</h3>
          <div className="text-sm text-gray-600">
            {environment.activeProfiles.length > 0 ? (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                Profiles: {environment.activeProfiles.join(', ')}
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                No active profiles
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-64">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select property section"
            >
              <option value="all">All Sections</option>
              <option value="server">Server</option>
              <option value="spring">Spring</option>
              <option value="database">Database</option>
              <option value="jwt">JWT</option>
              <option value="kafka">Kafka</option>
              <option value="gemini">Gemini</option>
              <option value="management">Management</option>
              <option value="system">System</option>
              <option value="cloud">Cloud</option>
            </select>
          </div>
        </div>

        {/* Sections Count */}
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredSections.length} of {environment.propertySources.length} property sources
        </div>
      </div>

      {/* Property Sources */}
      <div className="space-y-4">
        {filteredSections.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection(section.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSectionIcon(section.name)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{section.name}</h4>
                    <p className="text-sm text-gray-600">
                      {Object.keys(section.properties).length} properties
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSectionColor(section.name)}`}>
                    {section.name.split('.').pop()?.toUpperCase() || 'CONFIG'}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections[section.name] ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {expandedSections[section.name] && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(section.properties).map(([key, property]) => (
                    <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate" title={key}>
                            {key}
                          </div>
                          {property.origin && (
                            <div className="text-xs text-gray-500 mt-1">
                              Origin: {property.origin}
                            </div>
                          )}
                        </div>
                        {isSensitiveProperty(key) && (
                          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            🔒 Sensitive
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 break-all">
                        {isSensitiveProperty(key) ? 
                          maskSensitiveValue(String(property.value)) : 
                          formatValue(property.value)
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSections.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No properties found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
