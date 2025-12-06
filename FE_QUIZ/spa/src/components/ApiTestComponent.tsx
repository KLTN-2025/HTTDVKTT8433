import React, { useState } from 'react'
import { transformApiUserProfile } from '@/utils/apiTransform'

export const ApiTestComponent: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Mock API response based on your actual data
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

  const testTransformation = () => {
    try {
      setError(null)
      const transformed = transformApiUserProfile(mockApiResponse)
      setTestResult(transformed)
      console.log('Transformation successful:', transformed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Transformation failed:', err)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🧪 API Transformation Test</h3>
      
      <div className="space-y-4">
        {/* Test Button */}
        <button
          onClick={testTransformation}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Test API Transformation
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <span className="text-red-700">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-green-500">✅</span>
                <span className="text-green-700 font-medium">Transformation Successful!</span>
              </div>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Basic Info</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Name:</strong> {testResult.firstName} {testResult.lastName}</div>
                  <div><strong>Username:</strong> {testResult.username}</div>
                  <div><strong>Email:</strong> {testResult.email}</div>
                  <div><strong>Status:</strong> {testResult.status}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">Roles & Permissions</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Roles:</strong> {testResult.roles.join(', ')}</div>
                  <div><strong>Permissions:</strong> {testResult.permissions.join(', ')}</div>
                  <div><strong>Is Teacher:</strong> {testResult.roles.includes('ROLE_TEACHER') ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>
            </div>

            {/* Full Result */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Full Transformed Data</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Raw API Response */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Raw API Response (Mock)</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(mockApiResponse, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiTestComponent
