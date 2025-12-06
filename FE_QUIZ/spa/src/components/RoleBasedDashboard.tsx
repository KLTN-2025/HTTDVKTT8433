import React from 'react'
import { UserProfile } from '@/types/auth'
import { RoleGuard, AdminOnly, TeacherOnly, StudentOnly, TeacherOrAdmin } from './RoleGuard'
import { UserProfileCard } from './UserProfileCard'
import { 
  isAdmin, 
  isTeacher, 
  isStudent, 
  canCreateContent, 
  canManageUsers,
  getUserDisplayName,
  getPrimaryRole,
  getRoleDisplayName
} from '@/utils/roleUtils'

interface RoleBasedDashboardProps {
  user: UserProfile | null
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access the dashboard</h1>
          <p className="text-gray-600">You need to be authenticated to view this content.</p>
        </div>
      </div>
    )
  }

  const displayName = getUserDisplayName(user)
  const primaryRole = getPrimaryRole(user)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {getRoleDisplayName(primaryRole || 'ROLE_USER')} Dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">{displayName}</div>
                <div className="text-xs text-gray-500">{getRoleDisplayName(primaryRole || 'ROLE_USER')}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <UserProfileCard user={user} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-yellow-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Score</p>
                    <p className="text-2xl font-bold text-gray-900">85%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-based Content */}
            <div className="space-y-6">
              {/* Student Content */}
              <StudentOnly user={user} fallback={null}>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🎓</span>
                    Student Dashboard
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Available Quizzes</h4>
                      <p className="text-sm text-green-600">Take quizzes to test your knowledge</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Your Progress</h4>
                      <p className="text-sm text-blue-600">Track your learning journey</p>
                    </div>
                  </div>
                </div>
              </StudentOnly>

              {/* Teacher Content */}
              <TeacherOnly user={user} fallback={null}>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">👨‍🏫</span>
                    Teacher Dashboard
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Create Quiz</h4>
                      <p className="text-sm text-blue-600">Design new quizzes for your students</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Analytics</h4>
                      <p className="text-sm text-purple-600">View student performance metrics</p>
                    </div>
                  </div>
                </div>
              </TeacherOnly>

              {/* Admin Content */}
              <AdminOnly user={user} fallback={null}>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">👑</span>
                    Admin Dashboard
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">User Management</h4>
                      <p className="text-sm text-red-600">Manage users and permissions</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">System Settings</h4>
                      <p className="text-sm text-orange-600">Configure system parameters</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Reports</h4>
                      <p className="text-sm text-gray-600">Generate system reports</p>
                    </div>
                  </div>
                </div>
              </AdminOnly>

              {/* Teacher or Admin Content */}
              <TeacherOrAdmin user={user} fallback={null}>
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">📚</span>
                    Content Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-800 mb-2">Manage Quizzes</h4>
                      <p className="text-sm text-indigo-600">Edit and organize your quiz content</p>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-800 mb-2">Student Analytics</h4>
                      <p className="text-sm text-teal-600">Monitor student performance and progress</p>
                    </div>
                  </div>
                </div>
              </TeacherOrAdmin>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 transition-colors duration-200">
                  <div className="text-center">
                    <span className="text-2xl block mb-2">📝</span>
                    <span className="font-medium">Take Quiz</span>
                  </div>
                </button>
                
                <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-4 transition-colors duration-200">
                  <div className="text-center">
                    <span className="text-2xl block mb-2">📊</span>
                    <span className="font-medium">View Results</span>
                  </div>
                </button>

                <RoleGuard user={user} requireRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
                  <button className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-4 transition-colors duration-200">
                    <div className="text-center">
                      <span className="text-2xl block mb-2">➕</span>
                      <span className="font-medium">Create Quiz</span>
                    </div>
                  </button>
                </RoleGuard>

                <RoleGuard user={user} requireRole="ROLE_ADMIN">
                  <button className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-4 transition-colors duration-200">
                    <div className="text-center">
                      <span className="text-2xl block mb-2">👥</span>
                      <span className="font-medium">Manage Users</span>
                    </div>
                  </button>
                </RoleGuard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleBasedDashboard
