import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { TeacherNavigation } from '@/components/TeacherNavigation'
import { ProtectedRoute, TeacherRoute } from '@/components/ProtectedRoute'
import { RoleGuard } from '@/components/RoleGuard'
import { UserProfile } from '@/types/auth'

// Import Teacher Pages
import TeacherDashboard from '@/pages/TeacherDashboard'
import TeacherQuizManagement from '@/pages/TeacherQuizManagement'
import TeacherCreateQuiz from '@/pages/TeacherCreateQuiz'
import TeacherQuizEditor from '@/pages/TeacherQuizEditor'
import TeacherAnalytics from '@/pages/TeacherAnalytics'

// Example pages/components
const LoginPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Teacher Login</h1>
      <p className="text-gray-600">This would be your login form</p>
    </div>
  </div>
)

const UnauthorizedPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Unauthorized</h1>
      <p className="text-gray-600">You don't have teacher permissions to access this page.</p>
    </div>
  </div>
)

const TeacherStudentsPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">👥 Student Management</h1>
    <div className="bg-white rounded-lg shadow-lg p-6">
      <p className="text-gray-600">Teacher-only student management interface</p>
    </div>
  </div>
)

const TeacherSettingsPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">⚙️ Teacher Settings</h1>
    <div className="bg-white rounded-lg shadow-lg p-6">
      <p className="text-gray-600">Teacher settings and preferences</p>
    </div>
  </div>
)

// Main Teacher App Component
export const TeacherAppExample: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teacher portal...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Teacher Navigation - only show if authenticated and is teacher */}
        {isAuthenticated && user && (
          <RoleGuard user={user} requireRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
            <TeacherNavigation user={user} />
          </RoleGuard>
        )}
        
        {/* Main Content */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Teacher Protected Routes */}
          <Route 
            path="/teacher/dashboard" 
            element={
              <TeacherRoute user={user}>
                <TeacherDashboard />
              </TeacherRoute>
            } 
          />
          
          <Route 
            path="/teacher/quizzes" 
            element={
              <TeacherRoute user={user}>
                <TeacherQuizManagement />
              </TeacherRoute>
            } 
          />
          
          <Route 
            path="/teacher/create-quiz" 
            element={
              <TeacherRoute user={user}>
                <TeacherCreateQuiz />
              </TeacherRoute>
            } 
          />
          
          <Route 
            path="/teacher/quiz/:quizId/edit" 
            element={
              <TeacherRoute user={user}>
                <TeacherQuizEditor />
              </TeacherRoute>
            } 
          />
          
          <Route 
            path="/teacher/analytics" 
            element={
              <TeacherRoute user={user}>
                <TeacherAnalytics />
              </TeacherRoute>
            } 
          />
          
          <Route 
            path="/teacher/students" 
            element={
              <TeacherRoute user={user}>
                <TeacherStudentsPage />
              </TeacherRoute>
            } 
          />
          
          <Route 
            path="/teacher/settings" 
            element={
              <TeacherRoute user={user}>
                <TeacherSettingsPage />
              </TeacherRoute>
            } 
          />
          
          {/* Default redirect */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/teacher/dashboard" replace /> : 
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

export default TeacherAppExample
