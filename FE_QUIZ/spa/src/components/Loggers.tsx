import { useState } from 'react'
import { LoggerInfo, updateLoggerLevel } from '@/api/actuatorClient'

interface LoggersProps {
  loggers: LoggerInfo | null
  loading: boolean
  onLoadLoggers: () => void
}

export default function Loggers({ loggers, loading, onLoadLoggers }: LoggersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [updatingLoggers, setUpdatingLoggers] = useState<{ [key: string]: boolean }>({})
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const levels = ['OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']
  const levelColors: { [key: string]: string } = {
    'OFF': 'text-gray-600 bg-gray-100',
    'ERROR': 'text-red-600 bg-red-100',
    'WARN': 'text-orange-600 bg-orange-100',
    'INFO': 'text-blue-600 bg-blue-100',
    'DEBUG': 'text-green-600 bg-green-100',
    'TRACE': 'text-purple-600 bg-purple-100'
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'OFF': return '🔇'
      case 'ERROR': return '❌'
      case 'WARN': return '⚠️'
      case 'INFO': return 'ℹ️'
      case 'DEBUG': return '🐛'
      case 'TRACE': return '🔍'
      default: return '❓'
    }
  }

  const getLoggerIcon = (loggerName: string) => {
    if (loggerName.includes('spring')) return '🍃'
    if (loggerName.includes('hibernate')) return '🗄️'
    if (loggerName.includes('tomcat')) return '🐱'
    if (loggerName.includes('mongodb')) return '🍃'
    if (loggerName.includes('kafka')) return '📨'
    if (loggerName.includes('security')) return '🔐'
    if (loggerName.includes('admin')) return '👨‍💼'
    if (loggerName.includes('root')) return '🌳'
    if (loggerName.includes('org')) return '🏢'
    if (loggerName.includes('com')) return '💼'
    return '📝'
  }

  const getLoggerColor = (loggerName: string) => {
    if (loggerName.includes('spring')) return 'text-green-600 bg-green-100'
    if (loggerName.includes('hibernate')) return 'text-indigo-600 bg-indigo-100'
    if (loggerName.includes('tomcat')) return 'text-orange-600 bg-orange-100'
    if (loggerName.includes('mongodb')) return 'text-lime-600 bg-lime-100'
    if (loggerName.includes('kafka')) return 'text-emerald-600 bg-emerald-100'
    if (loggerName.includes('security')) return 'text-red-600 bg-red-100'
    if (loggerName.includes('admin')) return 'text-blue-600 bg-blue-100'
    if (loggerName.includes('root')) return 'text-gray-600 bg-gray-100'
    if (loggerName.includes('org')) return 'text-purple-600 bg-purple-100'
    if (loggerName.includes('com')) return 'text-cyan-600 bg-cyan-100'
    return 'text-gray-600 bg-gray-100'
  }

  const handleUpdateLogger = async (loggerName: string, level: string) => {
    setUpdatingLoggers(prev => ({ ...prev, [loggerName]: true }))
    try {
      await updateLoggerLevel(loggerName, level)
      setMessage({ text: `✅ Updated logger ${loggerName} to ${level}`, type: 'success' })
      onLoadLoggers() // Refresh loggers
    } catch (error: any) {
      setMessage({ text: `❌ Failed to update logger: ${error.message}`, type: 'error' })
    } finally {
      setUpdatingLoggers(prev => ({ ...prev, [loggerName]: false }))
    }
  }

  const filteredLoggers = loggers ? Object.entries(loggers.loggers).filter(([name, logger]) => {
    const matchesSearch = searchTerm === '' || name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = selectedLevel === 'all' || logger.effectiveLevel === selectedLevel
    const matchesGroup = selectedGroup === 'all' || 
      Object.entries(loggers.groups).some(([groupName, group]) => 
        group.members.includes(name) && groupName.toLowerCase().includes(selectedGroup.toLowerCase())
      )
    return matchesSearch && matchesLevel && matchesGroup
  }) : []

  const groupedLoggers = loggers ? Object.entries(loggers.groups).map(([groupName, group]) => ({
    name: groupName,
    members: group.members,
    count: group.members.length
  })) : []

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

  if (!loggers) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p>Không thể tải thông tin loggers</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border-l-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border-green-400' :
          'bg-red-50 text-red-800 border-red-400'
        }`}>
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600"
              title="Close message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Logger Management</h3>
          <button
            onClick={onLoadLoggers}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="Search loggers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select log level filter"
            >
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select logger group filter"
            >
              <option value="all">All Groups</option>
              {groupedLoggers.map(group => (
                <option key={group.name} value={group.name}>{group.name} ({group.count})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{filteredLoggers.length}</div>
            <div className="text-sm text-gray-600">Filtered</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{Object.keys(loggers.loggers).length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{groupedLoggers.length}</div>
            <div className="text-sm text-gray-600">Groups</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{levels.length}</div>
            <div className="text-sm text-gray-600">Levels</div>
          </div>
        </div>
      </div>

      {/* Loggers List */}
      <div className="space-y-4">
        {filteredLoggers.map(([loggerName, logger]) => (
          <div key={loggerName} className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getLoggerIcon(loggerName)}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{loggerName}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLoggerColor(loggerName)}`}>
                      {loggerName.split('.').pop()?.toUpperCase() || 'LOGGER'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColors[logger.effectiveLevel]}`}>
                      {getLevelIcon(logger.effectiveLevel)} {logger.effectiveLevel}
                    </span>
                    {logger.configuredLevel && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Configured: {logger.configuredLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Level Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Set Level:</span>
              <div className="flex space-x-1">
                {levels.map(level => (
                  <button
                    key={level}
                    onClick={() => handleUpdateLogger(loggerName, level)}
                    disabled={updatingLoggers[loggerName]}
                    className={`px-3 py-1 text-xs rounded-lg transition-all duration-200 ${
                      logger.effectiveLevel === level
                        ? `${levelColors[level]} font-medium`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={`Set ${loggerName} to ${level} level`}
                  >
                    {updatingLoggers[loggerName] ? (
                      <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-blue-600"></div>
                    ) : (
                      `${getLevelIcon(level)} ${level}`
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLoggers.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">No loggers found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
