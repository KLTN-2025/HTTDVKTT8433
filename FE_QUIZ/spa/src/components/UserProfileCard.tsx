import React from 'react'
import { UserProfile } from '@/types/auth'
import { getUserDisplayName, getPrimaryRole, getRoleDisplayName, isAdmin, isTeacher, isStudent } from '@/utils/roleUtils'

interface UserProfileCardProps {
  user: UserProfile | null
  showRoles?: boolean
  showPermissions?: boolean
  className?: string
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  showRoles = true,
  showPermissions = false,
  className = ''
}) => {
  if (!user) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <p className="text-gray-500">No user data available</p>
      </div>
    )
  }

  const primaryRole = getPrimaryRole(user)
  const displayName = getUserDisplayName(user)

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'ROLE_TEACHER':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ROLE_STUDENT':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ROLE_USER':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'ONLINE' 
      ? 'bg-green-500' 
      : 'bg-gray-400'
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 ${className}`}>
      {/* Header with avatar and basic info */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          {user.imageUrl ? (
            <img 
              src={user.imageUrl} 
              alt={displayName}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{displayName}</h3>
          <p className="text-gray-600">@{user.username}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* User details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.status === 'ONLINE' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {user.status}
          </span>
        </div>

        {user.city && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Location:</span>
            <span className="text-sm text-gray-800">{user.city}</span>
          </div>
        )}

        {user.phoneNumber && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Phone:</span>
            <span className="text-sm text-gray-800">{user.phoneNumber}</span>
          </div>
        )}

        {user.emailVerified && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Email:</span>
            <span className="text-sm text-gray-800">Verified ✓</span>
          </div>
        )}
      </div>

      {/* Roles */}
      {showRoles && user.roles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Roles:</h4>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(role)}`}
              >
                {getRoleDisplayName(role)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Permissions */}
      {showPermissions && user.permissions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Permissions:</h4>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((permission, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full border border-purple-200"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick role indicators */}
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
        {isAdmin(user) && (
          <div className="flex items-center space-x-1">
            <span className="text-red-500">👑</span>
            <span className="text-sm font-medium text-red-600">Administrator</span>
          </div>
        )}
        {isTeacher(user) && !isAdmin(user) && (
          <div className="flex items-center space-x-1">
            <span className="text-blue-500">👨‍🏫</span>
            <span className="text-sm font-medium text-blue-600">Teacher</span>
          </div>
        )}
        {isStudent(user) && !isTeacher(user) && !isAdmin(user) && (
          <div className="flex items-center space-x-1">
            <span className="text-green-500">🎓</span>
            <span className="text-sm font-medium text-green-600">Student</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfileCard
