import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { 
  isTeacher, 
  isAdmin, 
  isStudent, 
  getUserDisplayName, 
  getPrimaryRole, 
  getRoleDisplayName 
} from '@/utils/apiTransform'

export const RoleBasedNavigationBar: React.FC = () => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  if (loading || !user) {
    return null
  }

  const displayName = getUserDisplayName(user)
  const primaryRole = getPrimaryRole(user)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return '👑'
      case 'ROLE_TEACHER':
        return '👨‍🏫'
      case 'ROLE_STUDENT':
        return '🎓'
      case 'ROLE_USER':
        return '👤'
      default:
        return '👤'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'bg-red-500'
      case 'ROLE_TEACHER':
        return 'bg-blue-500'
      case 'ROLE_STUDENT':
        return 'bg-green-500'
      case 'ROLE_USER':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getNavigationItems = () => {
    if (isTeacher(user)) {
      return [
        { name: 'Teacher Dashboard', path: '/teacher/dashboard', icon: '🏠' },
        { name: 'My Quizzes', path: '/teacher/quizzes', icon: '📚' },
        { name: 'Create Quiz', path: '/teacher/create-quiz', icon: '➕' },
        { name: 'Analytics', path: '/teacher/analytics', icon: '📊' }
      ]
    } else if (isAdmin(user)) {
      return [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: '👑' },
        { name: 'User Management', path: '/admin/users', icon: '👥' },
        { name: 'System Settings', path: '/admin/settings', icon: '⚙️' }
      ]
    } else if (isStudent(user)) {
      return [
        { name: 'Student Dashboard', path: '/student/dashboard', icon: '🏠' },
        { name: 'Take Quiz', path: '/student/quizzes', icon: '📝' },
        { name: 'My Results', path: '/student/results', icon: '📊' }
      ]
    } else {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
        { name: 'Profile', path: '/profile', icon: '👤' }
      ]
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <nav className="bg-white shadow-lg border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold text-gray-800">Quiz System</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-800">{displayName}</div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <span>{getRoleIcon(primaryRole || 'ROLE_USER')}</span>
                    <span>{getRoleDisplayName(primaryRole || 'ROLE_USER')}</span>
                  </div>
                </div>

                {/* User Avatar */}
                <div className="relative">
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={displayName}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full ${getRoleColor(primaryRole || 'ROLE_USER')} flex items-center justify-center text-white text-sm font-bold`}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    user.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default RoleBasedNavigationBar
