import { HealthStatus } from '@/api/actuatorClient'

interface SystemHealthProps {
  health: HealthStatus | null
  loading: boolean
}

export default function SystemHealth({ health, loading }: SystemHealthProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UP':
        return 'text-green-600 bg-green-100'
      case 'DOWN':
        return 'text-red-600 bg-red-100'
      case 'OUT_OF_SERVICE':
        return 'text-orange-600 bg-orange-100'
      case 'UNKNOWN':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return '✅'
      case 'DOWN':
        return '❌'
      case 'OUT_OF_SERVICE':
        return '⚠️'
      case 'UNKNOWN':
        return '❓'
      default:
        return '❓'
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatPercentage = (used: number, total: number) => {
    return ((used / total) * 100).toFixed(1)
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

  if (!health) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p>Không thể tải thông tin health status</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">System Health Status</h3>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
            {getStatusIcon(health.status)} {health.status}
          </div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(health.components).map(([name, component]) => (
            <div key={name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">
                  {name.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                  {getStatusIcon(component.status)} {component.status}
                </span>
              </div>

              {/* Component Details */}
              {component.details && (
                <div className="mt-3 space-y-2">
                  {Object.entries(component.details).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-600 font-medium">
                        {key === 'database' ? 'Database' :
                         key === 'validationQuery' ? 'Validation' :
                         key === 'total' ? 'Total Space' :
                         key === 'free' ? 'Free Space' :
                         key === 'threshold' ? 'Threshold' :
                         key === 'path' ? 'Path' :
                         key === 'exists' ? 'Exists' :
                         key === 'maxWireVersion' ? 'Max Wire Version' :
                         key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span className="ml-2 text-gray-900">
                        {key === 'total' || key === 'free' || key === 'threshold' ? 
                          formatBytes(Number(value)) :
                          key === 'exists' ? 
                            (value ? 'Yes' : 'No') :
                          String(value)
                        }
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Disk Space Progress Bar */}
              {name === 'diskSpace' && component.details && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Disk Usage</span>
                    <span>
                      {formatPercentage(
                        Number(component.details.total) - Number(component.details.free),
                        Number(component.details.total)
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${formatPercentage(
                          Number(component.details.total) - Number(component.details.free),
                          Number(component.details.total)
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Description */}
              {component.description && (
                <div className="mt-2 text-sm text-gray-600">
                  {component.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Health Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Health Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(health.components).filter(c => c.status === 'UP').length}
            </div>
            <div className="text-sm text-gray-600">UP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {Object.values(health.components).filter(c => c.status === 'DOWN').length}
            </div>
            <div className="text-sm text-gray-600">DOWN</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Object.values(health.components).filter(c => c.status === 'OUT_OF_SERVICE').length}
            </div>
            <div className="text-sm text-gray-600">OUT_OF_SERVICE</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {Object.values(health.components).filter(c => c.status === 'UNKNOWN').length}
            </div>
            <div className="text-sm text-gray-600">UNKNOWN</div>
          </div>
        </div>
      </div>
    </div>
  )
}
