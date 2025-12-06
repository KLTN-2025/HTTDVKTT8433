import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { transformApiUserProfile } from '@/utils/apiTransform'
import { getPrimaryRole, isTeacher, isAdmin, isStudent } from '@/utils/apiTransform'

export const QuizHomeTest: React.FC = () => {
  const navigate = useNavigate()
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearResults = () => {
    setTestResults([])
  }

  const testQuizHomeLogic = async () => {
    setIsRunning(true)
    clearResults()
    
    try {
      addResult('🚀 Testing QuizHome logic...')
      
      // Step 1: Check token
      const token = localStorage.getItem('access_token')
      if (!token) {
        addResult('❌ No access token found')
        addResult('💡 Please login first at /login')
        return
      }
      
      addResult('✅ Access token found')
      
      // Step 2: Mock API response (actual response from your data)
      const mockApiResponse = {
        "code": 1000,
        "result": {
          "id": "68ecce6253414248f4f10473",
          "userId": "af458dcf-d843-49a7-bcbf-c33e97d2479c",
          "username": "ngocduong3",
          "status": "ONLINE",
          "email": "ngocduong3@yopmail.com",
          "firstName": "duong",
          "lastName": "Loi",
          "imageUrl": null,
          "gender": "female",
          "phoneNumber": "1234567872",
          "dateOfBirth": "0012-11-16T00:00:00.000+00:00",
          "city": "DN",
          "emailVerified": false,
          "roles": [
            "ROLE_TEACHER",
            "ROLE_USER"
          ],
          "permissions": [
            "TEACHER"
          ],
          "createdAt": null,
          "bio": null,
          "quote": null,
          "jobTitle": null,
          "company": null,
          "themeColor": null,
          "coverImageUrl": null,
          "privateProfile": false
        }
      }
      
      addResult('📥 Mock API response prepared')
      addResult(`   - Username: ${mockApiResponse.result.username}`)
      addResult(`   - Roles: ${mockApiResponse.result.roles.join(', ')}`)
      addResult(`   - Permissions: ${mockApiResponse.result.permissions.join(', ')}`)
      
      // Step 3: Transform API response
      addResult('🔄 Transforming API response...')
      const transformedUser = transformApiUserProfile(mockApiResponse.result)
      addResult(`   - Transformed roles: ${transformedUser.roles.join(', ')}`)
      addResult(`   - Transformed permissions: ${transformedUser.permissions.join(', ')}`)
      
      // Step 4: Check role
      addResult('🔍 Checking user role...')
      const primaryRole = getPrimaryRole(transformedUser)
      addResult(`   - Primary role: ${primaryRole}`)
      addResult(`   - Is teacher: ${isTeacher(transformedUser) ? 'Yes' : 'No'}`)
      addResult(`   - Is admin: ${isAdmin(transformedUser) ? 'Yes' : 'No'}`)
      addResult(`   - Is student: ${isStudent(transformedUser) ? 'Yes' : 'No'}`)
      
      // Step 5: Simulate redirect logic
      addResult('🔄 Simulating redirect logic...')
      if (isTeacher(transformedUser)) {
        addResult('👨‍🏫 Teacher detected - would redirect to /teacher/dashboard')
        addResult('✅ QuizHome logic test completed successfully!')
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

  const testActualQuizHome = async () => {
    setIsRunning(true)
    clearResults()
    
    try {
      addResult('🔐 Testing actual QuizHome...')
      
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

  const simulateQuizHomeRedirect = () => {
    addResult('🔄 Simulating QuizHome redirect to teacher dashboard...')
    setTimeout(() => {
      navigate('/teacher/dashboard')
    }, 2000)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🧪 QuizHome Test</h3>
      
      <div className="space-y-4">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testQuizHomeLogic}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {isRunning ? 'Running...' : 'Test QuizHome Logic'}
          </button>
          
          <button
            onClick={testActualQuizHome}
            disabled={isRunning}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Test Actual QuizHome
          </button>
          
          <button
            onClick={simulateQuizHomeRedirect}
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
            <p><strong>1. Test QuizHome Logic:</strong> Tests the complete QuizHome logic with mock data</p>
            <p><strong>2. Test Actual QuizHome:</strong> Tests with your actual logged-in user data</p>
            <p><strong>3. Simulate Redirect:</strong> Redirects to teacher dashboard</p>
            <p><strong>4. Expected Flow:</strong> QuizHome → Check Role → Redirect to Teacher Dashboard</p>
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

export default QuizHomeTest
