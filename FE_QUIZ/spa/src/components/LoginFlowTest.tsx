import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { transformApiUserProfile } from '@/utils/apiTransform'
import { getPrimaryRole, isTeacher, isAdmin, isStudent } from '@/utils/apiTransform'

export const LoginFlowTest: React.FC = () => {
  const navigate = useNavigate()
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const testTeacherLoginFlow = async () => {
    setIsRunning(true)
    clearResults()
    
    try {
      addResult('🚀 Starting teacher login flow test...')
      
      // Step 1: Mock API response with teacher role
      const mockApiResponse = {
        id: "af458dcf-d843-49a7-bcbf-c33e97d2479c",
        username: "ngocduong3",
        status: "ONLINE",
        email: "ngocduong3@yopmail.com",
        firstName: "duong",
        lastName: "Loi",
        imageUrl: null,
        gender: "female",
        phoneNumber: "1234567872",
        dateOfBirth: "0012-11-16T00:00:00.000+00:00",
        city: "DN",
        emailVerified: false,
        roles: [
          {
            name: 'ROLE_TEACHER',
            description: 'TEACHER',
            permissions: ['TEACHER']
          },
          {
            name: 'ROLE_USER',
            description: 'Users role',
            permissions: []
          }
        ],
        createdAt: "2025-10-13T17:03:14.607131",
        bio: null,
        blocked: false,
        profileId: "68ecce6253414248f4f10473",
        mssv: "311234424",
        fullName: null
      }
      
      addResult('📥 Mock API response received')
      addResult(`   - Username: ${mockApiResponse.username}`)
      addResult(`   - Roles: ${mockApiResponse.roles.map(r => r.name).join(', ')}`)
      
      // Step 2: Transform API response
      addResult('🔄 Transforming API response...')
      const transformedUser = transformApiUserProfile(mockApiResponse)
      addResult(`   - Transformed roles: ${transformedUser.roles.join(', ')}`)
      addResult(`   - Transformed permissions: ${transformedUser.permissions.join(', ')}`)
      
      // Step 3: Check role
      addResult('🔍 Checking user role...')
      const primaryRole = getPrimaryRole(transformedUser)
      addResult(`   - Primary role: ${primaryRole}`)
      addResult(`   - Is teacher: ${isTeacher(transformedUser) ? 'Yes' : 'No'}`)
      addResult(`   - Is admin: ${isAdmin(transformedUser) ? 'Yes' : 'No'}`)
      addResult(`   - Is student: ${isStudent(transformedUser) ? 'Yes' : 'No'}`)
      
      // Step 4: Simulate redirect logic
      addResult('🔄 Simulating redirect logic...')
      if (isTeacher(transformedUser)) {
        addResult('👨‍🏫 Teacher detected - would redirect to /teacher/dashboard')
        addResult('✅ Login flow test completed successfully!')
      } else if (isAdmin(transformedUser)) {
        addResult('👑 Admin detected - would redirect to /admin')
      } else if (isStudent(transformedUser)) {
        addResult('🎓 Student detected - would stay on /quiz')
      } else {
        addResult('👤 Regular user - would stay on /quiz')
      }
      
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  const testActualLogin = async () => {
    setIsRunning(true)
    clearResults()
    
    try {
      addResult('🔐 Testing actual login flow...')
      
      // Check if user is already logged in
      const token = localStorage.getItem('access_token')
      if (!token) {
        addResult('❌ No access token found - please login first')
        addResult('💡 Go to /login to login with your credentials')
        return
      }
      
      addResult('✅ Access token found')
      
      // Fetch user profile
      addResult('📡 Fetching user profile...')
      const response = await fetch('/api/v1/profile/users/my-profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        addResult(`❌ Failed to fetch profile: ${response.status} ${response.statusText}`)
        return
      }
      
      const userData = await response.json()
      addResult('✅ User profile fetched successfully')
      addResult(`   - Response code: ${userData.code}`)
      
      if (userData.code === 1000 && userData.result) {
        // Transform API response
        addResult('🔄 Transforming API response...')
        const transformedUser = transformApiUserProfile(userData.result)
        addResult(`   - Username: ${transformedUser.username}`)
        addResult(`   - Roles: ${transformedUser.roles.join(', ')}`)
        addResult(`   - Permissions: ${transformedUser.permissions.join(', ')}`)
        
        // Check role
        const primaryRole = getPrimaryRole(transformedUser)
        addResult(`   - Primary role: ${primaryRole}`)
        addResult(`   - Is teacher: ${isTeacher(transformedUser) ? 'Yes' : 'No'}`)
        
        // Determine redirect
        if (isTeacher(transformedUser)) {
          addResult('👨‍🏫 Teacher detected - should redirect to /teacher/dashboard')
          addResult('🔄 Redirecting now...')
          setTimeout(() => {
            navigate('/teacher/dashboard')
          }, 2000)
        } else if (isAdmin(transformedUser)) {
          addResult('👑 Admin detected - should redirect to /admin')
          addResult('🔄 Redirecting now...')
          setTimeout(() => {
            navigate('/admin')
          }, 2000)
        } else {
          addResult('👤 Regular user - staying on current page')
        }
      } else {
        addResult('❌ Invalid user data response')
      }
      
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  const simulateRedirect = () => {
    addResult('🔄 Simulating redirect to teacher dashboard...')
    setTimeout(() => {
      navigate('/teacher/dashboard')
    }, 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🧪 Login Flow Test</h3>
      
      <div className="space-y-4">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testTeacherLoginFlow}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {isRunning ? 'Running...' : 'Test Teacher Flow'}
          </button>
          
          <button
            onClick={testActualLogin}
            disabled={isRunning}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Test Actual Login
          </button>
          
          <button
            onClick={simulateRedirect}
            disabled={isRunning}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Simulate Redirect
          </button>
          
          <button
            onClick={clearResults}
            disabled={isRunning}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Clear
          </button>
        </div>

        {/* Test Results */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2">Test Results</h4>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {testResults.length === 0 ? (
              <div className="text-gray-500 text-sm">No test results yet...</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm text-gray-700 font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Instructions</h4>
          <div className="space-y-2 text-blue-700 text-sm">
            <p><strong>1. Test Teacher Flow:</strong> Tests the complete login flow with mock teacher data</p>
            <p><strong>2. Test Actual Login:</strong> Tests with your actual logged-in user data</p>
            <p><strong>3. Simulate Redirect:</strong> Redirects to teacher dashboard</p>
            <p><strong>4. Expected Flow:</strong> Login → Check Role → Redirect to Teacher Dashboard</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">🔗 Quick Links</h4>
          <div className="flex flex-wrap gap-2">
            <a
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Login Page
            </a>
            <a
              href="/quiz"
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Quiz Home
            </a>
            <a
              href="/teacher/dashboard"
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
            >
              Teacher Dashboard
            </a>
            <a
              href="/debug"
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              Debug Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginFlowTest