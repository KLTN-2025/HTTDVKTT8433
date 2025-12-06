import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isTeacher, getUserDisplayName, getRoleDisplayName } from '@/utils/apiTransform'

export const TeacherAccessPrompt: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Not Authenticated</h1>
          <p className="text-gray-600">Please log in to access the system.</p>
        </div>
      </div>
    )
  }

  if (!isTeacher(user)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
          <p className="text-gray-600">You need teacher permissions to access this page.</p>
        </div>
      </div>
    )
  }

  const displayName = getUserDisplayName(user)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-lg border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👨‍🏫</span>
              <span className="text-xl font-bold text-gray-800">Teacher Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {displayName}</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">👨‍🏫</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Teacher Portal!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            You have teacher permissions. Access your teacher dashboard to manage quizzes and students.
          </p>
        </div>

        {/* Teacher Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Quiz Management</h3>
              <p className="text-gray-600 text-sm mb-4">Create, edit, and manage your quizzes</p>
              <Link
                to="/teacher/quizzes"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Manage Quizzes
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
            <div className="text-center">
              <div className="text-4xl mb-4">➕</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Create Quiz</h3>
              <p className="text-gray-600 text-sm mb-4">Create new quizzes with questions and answers</p>
              <Link
                to="/teacher/create-quiz"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Create Quiz
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">Track student performance and quiz statistics</p>
              <Link
                to="/teacher/analytics"
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                View Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/teacher/dashboard"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 transition-colors duration-200 flex items-center space-x-4"
            >
              <span className="text-3xl">🏠</span>
              <div>
                <h3 className="text-lg font-bold">Teacher Dashboard</h3>
                <p className="text-blue-100">Overview of your teaching activities</p>
              </div>
            </Link>

            <Link
              to="/teacher/quizzes"
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 transition-colors duration-200 flex items-center space-x-4"
            >
              <span className="text-3xl">📚</span>
              <div>
                <h3 className="text-lg font-bold">My Quizzes</h3>
                <p className="text-green-100">Manage your quiz collection</p>
              </div>
            </Link>

            <Link
              to="/teacher/create-quiz"
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 transition-colors duration-200 flex items-center space-x-4"
            >
              <span className="text-3xl">➕</span>
              <div>
                <h3 className="text-lg font-bold">Create New Quiz</h3>
                <p className="text-purple-100">Start creating a new quiz</p>
              </div>
            </Link>

            <Link
              to="/teacher/analytics"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-6 transition-colors duration-200 flex items-center space-x-4"
            >
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="text-lg font-bold">Analytics</h3>
                <p className="text-orange-100">View performance insights</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Role Information */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="text-center">
            <div className="text-4xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-bold text-blue-800 mb-2">Teacher Account</h3>
            <p className="text-blue-600">
              You are logged in as <strong>{displayName}</strong> with <strong>Teacher</strong> permissions.
            </p>
            <p className="text-blue-600 text-sm mt-2">
              You can create quizzes, manage students, and view analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherAccessPrompt
