import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { RoleBasedNavigation } from '@/components/RoleBasedNavigation'
import { RoleBasedDashboard } from '@/components/RoleBasedDashboard'
import { ProtectedRoute, AdminRoute, TeacherRoute, StudentRoute } from '@/components/ProtectedRoute'
import { RoleGuard } from '@/components/RoleGuard'
import { UserProfile } from '@/types/auth'

// Example pages/components
const LoginPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Login Page</h1>
      <p className="text-gray-600">This would be your login form</p>
    </div>
  </div>
)

const UnauthorizedPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Unauthorized</h1>
      <p className="text-gray-600">You don't have permission to access this page.</p>
    </div>
  </div>
)

const AdminUsersPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">👥 User Management</h1>
    <div className="bg-white rounded-lg shadow-lg p-6">
      <p className="text-gray-600">Admin-only user management interface</p>
    </div>
  </div>
)

const CreateQuizPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">➕ Create Quiz</h1>
    <div className="bg-white rounded-lg shadow-lg p-6">
      <p className="text-gray-600">Teacher/Admin quiz creation interface</p>
    </div>
  </div>
)

const QuizzesPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">📝 Quizzes</h1>
    <div className="bg-white rounded-lg shadow-lg p-6">
      <p className="text-gray-600">Student/Teacher quiz interface</p>
    </div>
  </div>
)

const ProfilePage = ({ user }: { user: UserProfile | null }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">👤 Profile</h1>
    <div className="bg-white rounded-lg shadow-lg p-6">
      {user ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">{user.firstName} {user.lastName}</h2>
          <p className="text-gray-600">Email: {user.email}</p>
          <p className="text-gray-600">Roles: {user.roles.join(', ')}</p>
        </div>
      ) : (
        <p className="text-gray-600">No user data available</p>
      )}
    </div>
  </div>
)

// Main App Component
export const RoleBasedAppExample: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth()

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

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation - only show if authenticated */}
        {isAuthenticated && <RoleBasedNavigation user={user} />}
        
        {/* Main Content */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={user}>
                <RoleBasedDashboard user={user} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute user={user}>
                <ProfilePage user={user} />
              </ProtectedRoute>
            } 
          />
          
          {/* Student Routes */}
          <Route 
            path="/quizzes" 
            element={
              <StudentRoute user={user}>
                <QuizzesPage />
              </StudentRoute>
            } 
          />
          
          {/* Teacher Routes */}
          <Route 
            path="/create-quiz" 
            element={
              <TeacherRoute user={user}>
                <CreateQuizPage />
              </TeacherRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/users" 
            element={
              <AdminRoute user={user}>
                <AdminUsersPage />
              </AdminRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default RoleBasedAppExample
