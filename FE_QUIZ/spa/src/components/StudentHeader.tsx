import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface StudentHeaderProps {
  title: string
  subtitle: string
  icon: string
  showBackButton?: boolean
  backButtonText?: string
  backButtonPath?: string
  additionalButtons?: React.ReactNode
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  title,
  subtitle,
  icon,
  showBackButton = false,
  backButtonText = "Back",
  backButtonPath = "/student/dashboard",
  additionalButtons
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-lg shadow-2xl border-b-4 border-gradient-to-r from-pink-300 to-purple-300 sticky top-0 z-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full -translate-x-16 -translate-y-16 opacity-60 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full translate-x-12 -translate-y-12 opacity-70 animate-bounce"></div>
        <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-blue-200 rounded-full -translate-y-10 opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/3 w-16 h-16 bg-green-200 rounded-full -translate-y-8 opacity-60 animate-bounce"></div>
      </div>
      
      {/* Header decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute top-8 right-8 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 left-8 w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-8 right-4 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute top-12 left-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-12 right-1/4 w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl animate-heartbeat bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 relative overflow-hidden">
                <span className="text-3xl animate-bounce">{icon}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">
                {title}
              </h1>
              <p className="text-lg text-white font-semibold animate-fade-in">
                {subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-lg text-white font-semibold">
              Xin chào, <span className="font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">{user?.name || 'Student'}</span>
            </div>
            <div className="flex space-x-4">
              {showBackButton && (
                <button
                  onClick={() => navigate(backButtonPath)}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span className="text-xl">←</span>
                    <span>{backButtonText}</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}
              {additionalButtons}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default StudentHeader
