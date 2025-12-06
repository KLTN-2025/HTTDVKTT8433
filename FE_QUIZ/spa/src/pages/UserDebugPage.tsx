import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { RoleBasedNavigationBar } from '@/components/RoleBasedNavigationBar'
import { TeacherAccessPrompt } from '@/components/TeacherAccessPrompt'
import { UserDebugInfo } from '@/components/UserDebugInfo'
import { ApiTestComponent } from '@/components/ApiTestComponent'
import { LoginHandler } from '@/components/LoginHandler'
import { LoginFlow } from '@/components/LoginFlow'
import { LoginFlowTest } from '@/components/LoginFlowTest'
import { AutoRedirectTest } from '@/components/AutoRedirectTest'
import { ApiResponseTest } from '@/components/ApiResponseTest'
import { QuizHomeTest } from '@/components/QuizHomeTest'
import { TeacherAccessTest } from '@/components/TeacherAccessTest'

export default function UserDebugPage() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <RoleBasedNavigationBar />
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔍 User Debug Page</h1>
          <p className="text-gray-600">
            This page helps debug user authentication and role-based access.
          </p>
        </div>

        {/* API Response Test */}
        <div className="mb-8">
          <ApiResponseTest />
        </div>

        {/* QuizHome Test */}
        <div className="mb-8">
          <QuizHomeTest />
        </div>

        {/* Teacher Access Test */}
        <div className="mb-8">
          <TeacherAccessTest />
        </div>

        {/* Login Flow Test */}
        <div className="mb-8">
          <LoginFlowTest />
        </div>

        {/* Auto Redirect Test */}
        <div className="mb-8">
          <AutoRedirectTest />
        </div>

        {/* Login Flow */}
        <div className="mb-8">
          <LoginFlow />
        </div>

        {/* Login Handler */}
        <div className="mb-8">
          <LoginHandler />
        </div>

        {/* API Test Component */}
        <div className="mb-8">
          <ApiTestComponent />
        </div>

        {/* User Debug Info */}
        <div className="mb-8">
          <UserDebugInfo />
        </div>

        {/* Teacher Access Prompt */}
        {user && (
          <div className="mb-8">
            <TeacherAccessPrompt />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">📋 Instructions</h3>
          <div className="space-y-3 text-blue-700">
            <p>
              <strong>1. Check User Data:</strong> Verify that your user data is loaded correctly above.
            </p>
            <p>
              <strong>2. Check Roles:</strong> Make sure you have ROLE_TEACHER in your roles array.
            </p>
            <p>
              <strong>3. Check Role Functions:</strong> The role check functions should show "Yes" for Is Teacher.
            </p>
            <p>
              <strong>4. Navigation:</strong> Use the navigation bar above to access teacher features.
            </p>
            <p>
              <strong>5. Quick Links:</strong> Use the quick navigation links in the debug info section.
            </p>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-4">🔧 Troubleshooting</h3>
          <div className="space-y-3 text-yellow-700">
            <p>
              <strong>If you don't see teacher features:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Check that your user has ROLE_TEACHER in the roles array</li>
              <li>Verify that the role transformation is working correctly</li>
              <li>Check browser console for any errors</li>
              <li>Try refreshing the page</li>
            </ul>
            <p>
              <strong>If you see errors:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Check that the API response structure matches expected format</li>
              <li>Verify that all required fields are present</li>
              <li>Check network requests in browser dev tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
