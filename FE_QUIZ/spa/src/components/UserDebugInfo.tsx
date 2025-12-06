import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  isTeacher, 
  isAdmin, 
  isStudent, 
  getUserDisplayName, 
  getPrimaryRole, 
  getRoleDisplayName 
} from '@/utils/apiTransform'

export const UserDebugInfo: React.FC = () => {
  const { user, loading, error } = useAuth()

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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-red-500">❌</span>
          <span className="text-red-700">Error: {error}</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-500">⚠️</span>
          <span className="text-yellow-700">No user data found</span>
        </div>
      </div>
    )
  }

  const displayName = getUserDisplayName(user)
  const primaryRole = getPrimaryRole(user)

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🔍 User Debug Information</h3>
      
      <div className="space-y-4">
        {/* Basic Info */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Basic Information</h4>
          <div className="bg-white rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Username:</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${user.status === 'ONLINE' ? 'text-green-600' : 'text-gray-600'}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Role Information */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Role Information</h4>
          <div className="bg-white rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Primary Role:</span>
              <span className="font-medium text-blue-600">
                {getRoleDisplayName(primaryRole || 'ROLE_USER')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">All Roles:</span>
              <div className="flex space-x-2">
                {user.roles.map((role, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Permissions:</span>
              <div className="flex space-x-2">
                {user.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Role Checks */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Role Checks</h4>
          <div className="bg-white rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Is Teacher:</span>
              <span className={`font-medium ${isTeacher(user) ? 'text-green-600' : 'text-red-600'}`}>
                {isTeacher(user) ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Is Admin:</span>
              <span className={`font-medium ${isAdmin(user) ? 'text-green-600' : 'text-red-600'}`}>
                {isAdmin(user) ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Is Student:</span>
              <span className={`font-medium ${isStudent(user) ? 'text-green-600' : 'text-red-600'}`}>
                {isStudent(user) ? '✅ Yes' : '❌ No'}
              </span>
            </div>
          </div>
        </div>

        {/* Raw User Data */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Raw User Data</h4>
          <div className="bg-white rounded-lg p-4">
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Quick Navigation</h4>
          <div className="bg-white rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isTeacher(user) && (
                <a
                  href="/teacher/dashboard"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center"
                >
                  👨‍🏫 Teacher Dashboard
                </a>
              )}
              {isAdmin(user) && (
                <a
                  href="/admin/dashboard"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center"
                >
                  👑 Admin Dashboard
                </a>
              )}
              {isStudent(user) && (
                <a
                  href="/student/dashboard"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center"
                >
                  🎓 Student Dashboard
                </a>
              )}
              <a
                href="/dashboard"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center"
              >
                🏠 General Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDebugInfo
