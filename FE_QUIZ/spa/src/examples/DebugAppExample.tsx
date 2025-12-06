import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import UserDebugPage from '@/pages/UserDebugPage'
import TeacherDashboard from '@/pages/TeacherDashboard'
import { RoleBasedNavigationBar } from '@/components/RoleBasedNavigationBar'
import { TeacherAccessPrompt } from '@/components/TeacherAccessPrompt'

// Main Debug App Component
export const DebugAppExample: React.FC = () => {
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

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <RoleBasedNavigationBar />
        
        {/* Main Content */}
        <Routes>
          {/* Debug Routes */}
          <Route path="/debug" element={<UserDebugPage />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher-access" element={<TeacherAccessPrompt />} />
          
          {/* Default redirect to debug page */}
          <Route path="/" element={<Navigate to="/debug" replace />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/debug" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default DebugAppExample
