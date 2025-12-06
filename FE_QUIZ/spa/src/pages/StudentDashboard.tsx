import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isStudent } from '@/utils/apiTransform'
import { StudentNavigation } from '@/components/StudentNavigation'
import { getAllQuizzes, getQuizStatistics, getAllSubjects } from '@/api/quizClient'
import FloatingAIAssistant from '@/components/FloatingAIAssistant'
import StudentSettings from '@/components/StudentSettings'

// New Doodle Icons Component with flat pastel style
const DoodleIcons = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
  const iconStyle = {
    width: size,
    height: size,
    fill: 'none',
    stroke: '#2d3748',
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  const icons: { [key: string]: JSX.Element } = {
    'target': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    'books': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <path d="M8 2v20"/>
      </svg>
    ),
    'refresh': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
      </svg>
    ),
    'chart': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M18 20V10"/>
        <path d="M12 20V4"/>
        <path d="M6 20v-6"/>
      </svg>
    ),
    'history': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M12 7v5l4 2"/>
      </svg>
    ),
    'edit': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    'plus': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M12 5v14"/>
        <path d="M5 12h14"/>
      </svg>
    ),
    'star': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
      </svg>
    )
  }

  return icons[name] || icons['star']
}

interface DashboardStats {
  totalQuizzes: number
  availableQuizzes: number
  completedQuizzes: number
  totalSubmissions: number
  averageScore: number
  totalSubjects: number
  recentActivity: Array<{
    id: string
    type: 'quiz_started' | 'quiz_completed' | 'quiz_reviewed'
    title: string
    timestamp: string
  }>
}

export default function StudentDashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    availableQuizzes: 0,
    completedQuizzes: 0,
    totalSubmissions: 0,
    averageScore: 0,
    totalSubjects: 0,
    recentActivity: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [quizzes, subjects, analyticsData] = await Promise.all([
        getAllQuizzes(),
        getAllSubjects(),
        loadAnalyticsData()
      ])
      
      const totalQuizzes = quizzes.length
      const availableQuizzes = quizzes.filter(q => q.status === 'PUBLISHED').length
      const completedQuizzes = 0 // This would need to be fetched from student submissions
      const totalSubjects = subjects.length
      const totalSubmissions = analyticsData?.overview?.totalSubmissions || 0
      const averageScore = analyticsData?.overview?.averageScore || 0

      setStats({
        totalQuizzes,
        availableQuizzes,
        completedQuizzes,
        totalSubmissions,
        averageScore,
        totalSubjects,
        recentActivity: quizzes.slice(0, 5).map(quiz => ({
          id: quiz.id,
          type: quiz.status === 'PUBLISHED' ? 'quiz_started' : 'quiz_reviewed',
          title: quiz.title,
          timestamp: quiz.updatedAt || quiz.createdAt || new Date().toISOString()
        }))
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        return null
      }

      const response = await fetch('https://api.duongtech.me/api/v1/quiz/Ai/quiz/statistics/student', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.warn('Analytics API not available, using fallback data')
        return null
      }

      const data = await response.json()
      
      if (data.code === 1000 && data.result) {
        return data.result
      } else {
        console.warn('Analytics API returned error, using fallback data')
        return null
      }
    } catch (error) {
      console.warn('Error loading analytics data, using fallback:', error)
      return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-300 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-reverse-slow"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isStudent(user)) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
          <p className="text-gray-600">You need student permissions to access this page.</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      id: 'take-quiz',
      title: 'Take Quiz',
      description: 'Practice with quizzes',
      icon: 'target',
      color: 'from-orange-400 to-red-400',
      hoverColor: 'from-orange-500 to-red-500',
      action: () => navigate('/student/quiz-taking')
    },
    {
      id: 'subjects',
      title: 'Subjects',
      description: 'Browse all subjects',
      icon: 'books',
      color: 'from-teal-400 to-cyan-400',
      hoverColor: 'from-teal-500 to-cyan-500',
      action: () => navigate('/student/subjects')
    },
    {
      id: 'review-quizzes',
      title: 'Review Quizzes',
      description: 'Personalized practice',
      icon: 'refresh',
      color: 'from-purple-400 to-indigo-400',
      hoverColor: 'from-purple-500 to-indigo-500',
      action: () => navigate('/student/review-quizzes')
    },
    {
      id: 'my-results',
      title: 'My Results',
      description: 'View your performance',
      icon: 'chart',
      color: 'from-emerald-400 to-teal-400',
      hoverColor: 'from-emerald-500 to-teal-500',
      action: () => navigate('/student/results')
    },
    {
      id: 'quiz-history',
      title: 'Quiz History',
      description: 'View your quiz attempts',
      icon: 'history',
      color: 'from-teal-400 to-cyan-400',
      hoverColor: 'from-teal-500 to-cyan-500',
      action: () => navigate('/student/quiz-history')
    },
    {
      id: 'edit-quiz',
      title: 'Edit Quiz',
      description: 'Create and edit quizzes',
      icon: 'edit',
      color: 'from-pink-400 to-rose-400',
      hoverColor: 'from-pink-500 to-rose-500',
      action: () => navigate('/student/quiz-management')
    },
    {
      id: 'create-quiz',
      title: 'Create Quiz',
      description: 'Create new quiz',
      icon: 'plus',
      color: 'from-purple-400 to-indigo-400',
      hoverColor: 'from-purple-500 to-indigo-500',
      action: () => navigate('/student/create-quiz')
    }
  ]

  const statCards = [
    {
      title: 'Available Quizzes',
      value: stats.availableQuizzes,
      icon: '📚',
      color: 'from-amber-400 to-orange-400',
      bgColor: 'from-amber-50 to-orange-50'
    },
    {
      title: 'Completed',
      value: stats.completedQuizzes,
      icon: '✅',
      color: 'from-emerald-400 to-green-400',
      bgColor: 'from-emerald-50 to-green-50'
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore.toFixed(1)}%`,
      icon: '📊',
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Subjects',
      value: stats.totalSubjects,
      icon: '📖',
      color: 'from-purple-400 to-pink-400',
      bgColor: 'from-purple-50 to-pink-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Beautiful floating shapes with enhanced animations */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-amber-200/30 rounded-full blur-xl animate-bounce" />
      
      {/* Additional floating elements */}
      <div className="absolute top-10 left-1/3 w-6 h-6 bg-yellow-300 rounded-full animate-float opacity-60"></div>
      <div className="absolute top-20 right-1/3 w-4 h-4 bg-pink-300 rounded-full animate-float-delayed opacity-70"></div>
      <div className="absolute bottom-10 left-20 w-8 h-8 bg-green-300 rounded-full animate-float-slow opacity-50"></div>
      <div className="absolute bottom-20 right-10 w-5 h-5 bg-blue-300 rounded-full animate-float-delayed-2 opacity-60"></div>
      
      <StudentNavigation />

      {/* Beautiful Header with enhanced styling */}
      <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 shadow-2xl border-b-4 border-pink-300 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full -translate-x-16 -translate-y-16 opacity-60 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full translate-x-12 -translate-y-12 opacity-70 animate-bounce"></div>
          <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-green-200 rounded-full -translate-y-10 opacity-50 animate-ping"></div>
          <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-blue-200 rounded-full -translate-y-8 opacity-60 animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-300 to-pink-300 rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 animate-heartbeat btn-magic">
                <span className="text-3xl animate-wiggle">🎓</span>
            </div>
              <div>
                <h1 className="text-4xl font-rounded font-bold text-rainbow animate-heartbeat">
                  🎓 Student Dashboard
                </h1>
                <p className="text-lg text-gray-600 mt-2 font-rounded font-semibold animate-fade-in">
                  ✨ Welcome back, {user.firstName}! Let's learn and grow together. ✨
                </p>
            </div>
            </div>
            </div>
            </div>
            </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="relative mb-8">
              <div className="w-16 h-16 border-4 border-pink-200 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-purple-300 rounded-full animate-spin absolute top-0 left-0 animate-reverse-slow"></div>
              <div className="w-16 h-16 border-4 border-indigo-400 rounded-full animate-spin absolute top-0 left-0 animate-pulse"></div>
            </div>
            <p className="text-xl text-gray-600 font-rounded font-bold animate-fade-in">🔄 Loading dashboard...</p>
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="gradient-pastel-pink rounded-3xl shadow-xl p-8 border-4 border-pink-300">
              <h2 className="text-2xl font-rounded font-bold text-rainbow mb-8 flex items-center animate-heartbeat">
                <span className="w-8 h-8 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex items-center justify-center mr-3 text-white text-sm animate-wiggle">⚡</span>
                🚀 Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {quickActions.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="group relative overflow-hidden bg-white rounded-3xl shadow-lg border-4 border-gray-100 hover:border-rose-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl btn-magic animate-fade-in-up"
                  >
                    <div className="p-8">
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br ${action.color} btn-magic animate-float`}>
                        <DoodleIcons name={action.icon} size={32} className="text-white group-hover:animate-bounce filter drop-shadow-lg" />
                      </div>
                      <h3 className="text-xl font-rounded font-bold text-gray-800 mb-2 group-hover:text-rainbow transition-all duration-300 animate-fade-in">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 font-rounded font-semibold group-hover:text-glow transition-all duration-300 animate-slide-up">
                        {action.description}
              </p>
            </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.hoverColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-4 border-gray-100 hover:border-rose-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${stat.bgColor} hover-lift animate-fade-in-up`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${stat.color} btn-magic animate-float`}>
                      <span className="text-2xl animate-wiggle">{stat.icon}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-rounded font-bold text-gray-800 animate-heartbeat">
                        {stat.value}
                      </div>
                      <div className="text-sm font-rounded font-semibold text-gray-600 animate-fade-in">
                        {stat.title}
                      </div>
                  </div>
                  </div>
                </div>
              ))}
        </div>

            {/* Recent Activity */}
            <div className="gradient-pastel-blue rounded-3xl shadow-xl p-8 border-4 border-blue-300">
              <h2 className="text-2xl font-rounded font-bold text-rainbow mb-8 flex items-center animate-heartbeat">
                <span className="w-8 h-8 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex items-center justify-center mr-3 text-white text-sm animate-wiggle">🕒</span>
                📊 Recent Activity
              </h2>
              
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <span className="text-2xl animate-wiggle">📝</span>
                  </div>
                  <p className="text-gray-500 font-rounded font-bold animate-fade-in">No recent activity</p>
                  <p className="text-sm text-gray-400 font-rounded font-semibold animate-slide-up">Start taking quizzes to see activity here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-rose-50 rounded-2xl border-4 border-gray-100 hover:border-rose-200 transition-all duration-300 hover-lift animate-fade-in-up"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex items-center justify-center btn-magic animate-float">
                        <span className="text-lg animate-wiggle">
                          {activity.type === 'quiz_started' ? '🎯' : '📚'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-rounded font-bold text-gray-800 animate-fade-in">{activity.title}</h4>
                        <p className="text-sm text-gray-600 font-rounded font-semibold animate-slide-up">
                          {activity.type === 'quiz_started' ? 'Quiz started' : 'Quiz reviewed'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 font-rounded font-semibold animate-fade-in">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>

            {/* Performance Overview */}
            <div className="gradient-pastel-green rounded-3xl shadow-xl p-8 border-4 border-green-300">
              <h2 className="text-2xl font-rounded font-bold text-rainbow mb-8 flex items-center animate-heartbeat">
                <span className="w-8 h-8 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex items-center justify-center mr-3 text-white text-sm animate-wiggle">📈</span>
                📊 Performance Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-4 border-emerald-200 hover-lift animate-fade-in-up">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center btn-magic animate-float">
                      <span className="text-2xl animate-wiggle">📊</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-rounded font-bold text-gray-800 animate-fade-in">Average Score</h3>
                      <p className="text-3xl font-rounded font-bold text-emerald-600 animate-heartbeat">
                        {stats.averageScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-4 border-blue-200 hover-lift animate-fade-in-up">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center btn-magic animate-float">
                      <span className="text-2xl animate-wiggle">👥</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-rounded font-bold text-gray-800 animate-fade-in">Total Submissions</h3>
                      <p className="text-3xl font-rounded font-bold text-blue-600 animate-heartbeat">
                        {stats.totalSubmissions}
                      </p>
                    </div>
                  </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
      
      {/* Student Settings */}
      <StudentSettings />
    </div>
  )
}