import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { isTeacher, getUserDisplayName, getPrimaryRole } from '@/utils/apiTransform'

export const TeacherAccessTest: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-blue-700">Loading user data...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-red-500">❌</span>
          <span className="text-red-700">No user data found</span>
        </div>
      </div>
    )
  }

  const displayName = getUserDisplayName(user)
  const primaryRole = getPrimaryRole(user)
  const isTeacherUser = isTeacher(user)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🔍 Teacher Access Test</h3>
      
      <div className="space-y-4">
        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2">User Information</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Name:</strong> {displayName}</div>
            <div><strong>Username:</strong> {user.username}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Status:</strong> {user.status}</div>
          </div>
        </div>

        {/* Role Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2">Role Information</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Primary Role:</strong> {primaryRole}</div>
            <div><strong>All Roles:</strong> {user.roles.join(', ')}</div>
            <div><strong>Permissions:</strong> {user.permissions.join(', ')}</div>
          </div>
        </div>

        {/* Access Check */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2">Access Check</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{isTeacherUser ? '✅' : '❌'}</span>
              <span><strong>Is Teacher:</strong> {isTeacherUser ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{isTeacherUser ? '✅' : '❌'}</span>
              <span><strong>Can Access Teacher Dashboard:</strong> {isTeacherUser ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Debug Information</h4>
          <div className="space-y-1 text-blue-700 text-sm">
            <p><strong>User Object:</strong> {JSON.stringify(user, null, 2)}</p>
            <p><strong>isTeacher Function:</strong> {isTeacherUser.toString()}</p>
            <p><strong>Primary Role:</strong> {primaryRole}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <a
              href="/teacher/dashboard"
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Teacher Dashboard
            </a>
            <a
              href="/teacher/quizzes"
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              My Quizzes
            </a>
            <a
              href="/teacher/create-quiz"
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
            >
              Create Quiz
            </a>
            <a
              href="/teacher/analytics"
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
            >
              Analytics
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherAccessTest
