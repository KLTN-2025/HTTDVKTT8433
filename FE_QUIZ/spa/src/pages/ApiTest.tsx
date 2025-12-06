import { useState } from 'react'
// import { 
//   testApiConnection, 
//   testRegistrationEndpoint, 
//   testLoginEndpoint, 
//   testOtpGenerationEndpoint,
//   testRoleApi,
//   testPermissionApi,
//   testUserRoleAssignmentApi,
//   testSystemIntegration,
//   runApiTests
// } from '../utils/apiTest'

interface TestResult {
  success: boolean
  status?: number
  data?: any
  error?: string
  workflowResults?: any[]
}

export default function ApiTest() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const runSingleTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(true)
    try {
      const result = await testFunction()
      setResults(prev => ({
        ...prev,
        [testName]: result
      }))
    } catch (error: any) {
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error.message || 'Unknown error'
        }
      }))
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    try {
      // const allResults = await runApiTests()
      const allResults = { success: true, message: 'API Tests disabled' }
      setResults(allResults)
    } catch (error: any) {
      console.error('Failed to run all tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (result: TestResult) => {
    if (!result) return '⏳'
    if (result.success) return '✅'
    if (result.error?.includes('Authentication required')) return '🔐'
    return '❌'
  }

  const getStatusColor = (result: TestResult) => {
    if (!result) return 'text-gray-500'
    if (result.success) return 'text-green-600'
    return 'text-red-600'
  }

  const TestCard = ({ 
    title, 
    description, 
    testName, 
    testFunction, 
    icon, 
    color 
  }: {
    title: string
    description: string
    testName: string
    testFunction: () => Promise<any>
    icon: string
    color: string
  }) => {
    const result = results[testName]
    const isExpanded = expandedSections[testName]

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                <span className="text-2xl">{icon}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${getStatusColor(result)}`}>
                {getStatusIcon(result)}
              </span>
              <button
                onClick={() => runSingleTest(testName, testFunction)}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                {loading ? 'Testing...' : 'Test'}
              </button>
              <button
                onClick={() => toggleSection(testName)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle test details"
              >
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          </div>

          {isExpanded && result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                {result.status && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">HTTP Status:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {result.status}
                    </span>
                  </div>
                )}
                {result.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="font-semibold text-red-800">Error:</span>
                    <p className="text-red-700 text-sm mt-1">{result.error}</p>
                  </div>
                )}
                {result.data && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="font-semibold text-blue-800">Response Data:</span>
                    <pre className="text-blue-700 text-xs mt-1 overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
                {result.workflowResults && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="font-semibold text-purple-800">Workflow Results:</span>
                    <div className="mt-2 space-y-1">
                      {result.workflowResults.map((step: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className={step.success ? 'text-green-600' : 'text-red-600'}>
                            {step.success ? '✅' : '❌'}
                          </span>
                          <span>{step.step}</span>
                          <span className="text-gray-500">({step.status})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🧪</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                  API Test Center
                </h1>
                <p className="mt-2 text-gray-600 text-lg">Test and validate all system APIs with comprehensive health checks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔐</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">Authentication Status</h2>
                <p className="text-gray-600">
                  {localStorage.getItem('token') || sessionStorage.getItem('token') 
                    ? '✅ Authenticated - You can run all API tests' 
                    : '⚠️ Not authenticated - Please login first to test protected APIs'
                  }
                </p>
              </div>
              {!(localStorage.getItem('token') || sessionStorage.getItem('token')) && (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Run All Tests Button */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Comprehensive API Testing</h2>
                <p className="text-gray-600">Run all tests at once to check system health</p>
              </div>
              <button
                onClick={runAllTests}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
              >
                {loading ? 'Running All Tests...' : '🚀 Run All Tests'}
              </button>
            </div>
          </div>
        </div>

        {/* Test Categories */}
        <div className="space-y-6">
          {/* System Health Tests */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🏥</span>
              </div>
              System Health Tests
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TestCard
                title="API Connection"
                description="Test basic connectivity to the API server"
                testName="connection"
                testFunction={undefined}
                icon="🔗"
                color="bg-gradient-to-r from-blue-500 to-cyan-600"
              />
              <TestCard
                title="User Registration"
                description="Test user registration endpoint functionality"
                testName="registration"
                testFunction={undefined}
                icon="👤"
                color="bg-gradient-to-r from-green-500 to-emerald-600"
              />
              <TestCard
                title="User Login"
                description="Test authentication and login process"
                testName="login"
                testFunction={undefined}
                icon="🔐"
                color="bg-gradient-to-r from-orange-500 to-red-600"
              />
              <TestCard
                title="OTP Generation"
                description="Test two-factor authentication OTP generation"
                testName="otpGeneration"
                testFunction={undefined}
                icon="📱"
                color="bg-gradient-to-r from-purple-500 to-pink-600"
              />
            </div>
          </div>

          {/* Role & Permission Tests */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🛡️</span>
              </div>
              Role & Permission Management
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TestCard
                title="Role API"
                description="Test role creation, retrieval, and management"
                testName="roleApi"
                testFunction={undefined}
                icon="👥"
                color="bg-gradient-to-r from-blue-500 to-indigo-600"
              />
              <TestCard
                title="Permission API"
                description="Test permission creation and management"
                testName="permissionApi"
                testFunction={undefined}
                icon="🔑"
                color="bg-gradient-to-r from-green-500 to-emerald-600"
              />
              <TestCard
                title="User Role Assignment"
                description="Test role assignment to users"
                testName="userRoleAssignmentApi"
                testFunction={undefined}
                icon="🔗"
                color="bg-gradient-to-r from-purple-500 to-pink-600"
              />
              <TestCard
                title="System Integration"
                description="Test complete workflow and error handling"
                testName="systemIntegration"
                testFunction={undefined}
                icon="⚙️"
                color="bg-gradient-to-r from-orange-500 to-red-600"
              />
            </div>
          </div>
        </div>

        {/* Test Results Summary */}
        {Object.keys(results).length > 0 && (
          <div className="mt-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Test Results Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(results).map(([testName, result]) => (
                  <div key={testName} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-2">{getStatusIcon(result)}</div>
                    <div className="text-sm font-medium text-gray-800 capitalize">
                      {testName.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className={`text-xs ${getStatusColor(result)}`}>
                      {result?.success ? 'Success' : 'Failed'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
