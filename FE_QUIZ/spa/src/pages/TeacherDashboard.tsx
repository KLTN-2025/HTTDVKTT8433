import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isTeacher } from '@/utils/apiTransform'
import { TeacherNavigation } from '@/components/TeacherNavigation'
import { getAllQuizzes, getQuizStatistics, getAllSubjects } from '@/api/quizClient'
import FloatingAIAssistant from '@/components/FloatingAIAssistant'
import TeacherSettings from '@/components/TeacherSettings'

interface DashboardStats {
  totalQuizzes: number
  publishedQuizzes: number
  draftQuizzes: number
  totalSubmissions: number
  averageScore: number
  totalSubjects: number
  recentActivity: Array<{
    id: string
    type: 'quiz_created' | 'quiz_published' | 'quiz_completed'
    title: string
    timestamp: string
  }>
}

export default function TeacherDashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    publishedQuizzes: 0,
    draftQuizzes: 0,
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
      const publishedQuizzes = quizzes.filter(q => q.status === 'PUBLISHED').length
      const draftQuizzes = quizzes.filter(q => q.status === 'DRAFT').length
      const totalSubjects = subjects.length
      const totalSubmissions = analyticsData?.overview?.totalSubmissions || 0
      const averageScore = analyticsData?.overview?.averageScore || 0

      setStats({
        totalQuizzes,
        publishedQuizzes,
        draftQuizzes,
        totalSubmissions,
        averageScore,
        totalSubjects,
        recentActivity: quizzes.slice(0, 5).map(quiz => ({
          id: quiz.id,
          type: quiz.status === 'PUBLISHED' ? 'quiz_published' : 'quiz_created',
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

      const response = await fetch('https://api.duongtech.me/api/v1/quiz/Ai/quiz/statistics/teacher', {
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

  if (!user || !isTeacher(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
          <p className="text-gray-600">You need teacher permissions to access this page.</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      id: 'manage-subjects',
      title: 'Manage Subjects',
      description: 'Organize your subjects',
      icon: '📖',
      color: 'from-cyan-400 to-blue-400',
      hoverColor: 'from-cyan-500 to-blue-500',
      action: () => navigate('/teacher/subjects')
    },
    {
      id: 'create-quiz',
      title: 'Create Quiz',
      description: 'Start a new quiz',
      icon: '✨',
      color: 'from-emerald-400 to-teal-400',
      hoverColor: 'from-emerald-500 to-teal-500',
      action: () => navigate('/teacher/create-quiz')
    },
    {
      id: 'take-quiz',
      title: 'Take Quiz',
      description: 'Practice with quizzes',
      icon: '🎯',
      color: 'from-orange-400 to-red-400',
      hoverColor: 'from-orange-500 to-red-500',
      action: () => navigate('/teacher/quiz-taking')
    },
    {
      id: 'review-quizzes',
      title: 'Review Quizzes',
      description: 'Personalized practice',
      icon: '🔄',
      color: 'from-purple-400 to-indigo-400',
      hoverColor: 'from-purple-500 to-indigo-500',
      action: () => navigate('/teacher/review-quizzes')
    },
    {
      id: 'manage-quizzes',
      title: 'Manage Quizzes',
      description: 'Edit existing quizzes',
      icon: '📝',
      color: 'from-blue-400 to-indigo-400',
      hoverColor: 'from-blue-500 to-indigo-500',
      action: () => navigate('/teacher/quizzes')
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View performance data',
      icon: '📊',
      color: 'from-purple-400 to-pink-400',
      hoverColor: 'from-purple-500 to-pink-500',
      action: () => navigate('/teacher/analytics')
    },
    {
      id: 'quiz-history',
      title: 'Quiz History',
      description: 'View your quiz attempts',
      icon: '📚',
      color: 'from-teal-400 to-cyan-400',
      hoverColor: 'from-teal-500 to-cyan-500',
      action: () => navigate('/quiz-history')
    }
  ]

  const statCards = [
    {
      title: 'Total Subjects',
      value: stats.totalSubjects,
      icon: '📖',
      color: 'from-cyan-400 to-blue-400',
      bgColor: 'from-cyan-50 to-blue-50'
    },
    {
      title: 'Total Quizzes',
      value: stats.totalQuizzes,
      icon: '📚',
      color: 'from-amber-400 to-orange-400',
      bgColor: 'from-amber-50 to-orange-50'
    },
    {
      title: 'Published',
      value: stats.publishedQuizzes,
      icon: '✅',
      color: 'from-emerald-400 to-green-400',
      bgColor: 'from-emerald-50 to-green-50'
    },
    {
      title: 'Drafts',
      value: stats.draftQuizzes,
      icon: '📝',
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Submissions',
      value: stats.totalSubmissions,
      icon: '👥',
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
      
      <TeacherNavigation />
      
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
                  🎓 Teacher Dashboard
                </h1>
                <p className="text-lg text-gray-600 mt-2 font-rounded font-semibold animate-fade-in">
                  ✨ Welcome back, {user.firstName}! Let's create amazing quizzes together. ✨
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {quickActions.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="group relative overflow-hidden bg-white rounded-3xl shadow-lg border-4 border-gray-100 hover:border-rose-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl btn-magic animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="p-8">
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br ${action.color} btn-magic animate-float`}>
                        <span className="text-4xl group-hover:animate-bounce">{action.icon}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-4 border-gray-100 hover:border-rose-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${stat.bgColor} hover-lift animate-fade-in-up`}
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animationFillMode: 'both'
                  }}
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
                  <p className="text-sm text-gray-400 font-rounded font-semibold animate-slide-up">Create your first quiz to see activity here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-rose-50 rounded-2xl border-4 border-gray-100 hover:border-rose-200 transition-all duration-300 hover-lift animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex items-center justify-center btn-magic animate-float">
                        <span className="text-lg animate-wiggle">
                          {activity.type === 'quiz_created' ? '📝' : '📢'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-rounded font-bold text-gray-800 animate-fade-in">{activity.title}</h4>
                        <p className="text-sm text-gray-600 font-rounded font-semibold animate-slide-up">
                          {activity.type === 'quiz_created' ? 'Quiz created' : 'Quiz published'}
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
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-4 border-blue-200 hover-lift animate-fade-in-up" style={{ animationDelay: '150ms' }}>
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
      
      {/* Teacher Settings */}
      <TeacherSettings />
    </div>
  )
}