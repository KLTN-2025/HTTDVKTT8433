import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isTeacher } from '@/utils/apiTransform'
import { TeacherNavigation } from '@/components/TeacherNavigation'

interface TeacherStatisticsResponse {
  code: number
  message: string
  result: {
    overview: {
      totalQuizzes: number
      totalQuestions: number
      totalSubmissions: number
      averageScore: number
      totalAnswers: number
      correctAnswers: number
      accuracyRate: number
      topQuizzesByAttempts: any[]
    }
    perQuiz: Array<{
      quizId: string
      quizTitle: string
      subjectId: string
      questions: number
      attempts: number
      correct: number
      accuracy: number
      difficultyDistribution: Record<string, number>
      hardestQuestions: Array<{
        questionId: string
        quizId: string
        subjectId: string
        contentPreview: string
        attempts: number
        correct: number
        accuracy: number
        difficultyBucket: string
      }>
      easiestQuestions: Array<{
        questionId: string
        quizId: string
        subjectId: string
        contentPreview: string
        attempts: number
        correct: number
        accuracy: number
        difficultyBucket: string
      }>
    }>
    perQuestion: Array<{
      questionId: string
      quizId: string
      subjectId: string
      contentPreview: string
      attempts: number
      correct: number
      accuracy: number
      difficultyBucket: string
    }>
    students: {
      perQuiz: any[]
      groupSummary: Record<string, any>
    }
    timeSeries: {
      attemptsPerWeek: Record<string, any>
      avgScorePerWeek: Record<string, any>
    }
  }
}

export default function TeacherAnalytics() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<TeacherStatisticsResponse['result'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [selectedTimeRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const response = await fetch('https://api.duongtech.me/api/v1/quiz/Ai/quiz/statistics/teacher', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: TeacherStatisticsResponse = await response.json()
      
      if (data.code === 1000 && data.result) {
        setAnalytics(data.result)
      } else {
        throw new Error(data.message || 'Failed to load analytics')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      // Set fallback data
      setAnalytics({
        overview: {
          totalQuizzes: 0,
          totalQuestions: 0,
          totalSubmissions: 0,
          averageScore: 0,
          totalAnswers: 0,
          correctAnswers: 0,
          accuracyRate: 0,
          topQuizzesByAttempts: []
        },
        perQuiz: [],
        perQuestion: [],
        students: {
          perQuiz: [],
          groupSummary: {}
        },
        timeSeries: {
          attemptsPerWeek: {},
          avgScorePerWeek: {}
        }
      })
    } finally {
      setIsLoading(false)
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

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days', icon: '📅' },
    { value: '30d', label: 'Last 30 days', icon: '📊' },
    { value: '90d', label: 'Last 90 days', icon: '📈' },
    { value: '1y', label: 'Last year', icon: '🗓️' }
  ]

  const metricCards = analytics ? [
    {
      title: 'Total Quizzes',
      value: analytics.overview.totalQuizzes,
      icon: '📚',
      color: 'from-amber-400 to-orange-400',
      bgColor: 'from-amber-50 to-orange-50'
    },
    {
      title: 'Total Questions',
      value: analytics.overview.totalQuestions,
      icon: '❓',
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Total Submissions',
      value: analytics.overview.totalSubmissions,
      icon: '👥',
      color: 'from-emerald-400 to-green-400',
      bgColor: 'from-emerald-50 to-green-50'
    },
    {
      title: 'Average Score',
      value: `${analytics.overview.averageScore.toFixed(1)}%`,
      icon: '📊',
      color: 'from-purple-400 to-pink-400',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      title: 'Accuracy Rate',
      value: `${analytics.overview.accuracyRate.toFixed(1)}%`,
      icon: '🎯',
      color: 'from-rose-400 to-red-400',
      bgColor: 'from-rose-50 to-red-50'
    },
    {
      title: 'Correct Answers',
      value: `${analytics.overview.correctAnswers}/${analytics.overview.totalAnswers}`,
      icon: '✅',
      color: 'from-teal-400 to-emerald-400',
      bgColor: 'from-teal-50 to-emerald-50'
    }
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50">
      <TeacherNavigation />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b-2 border-rose-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-300 to-pink-300 rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <span className="text-3xl">📊</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-lg text-gray-600 mt-2 font-medium">
                  Track performance and insights across your quizzes
                </p>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex space-x-2">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeRange(option.value as any)}
                  className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                    selectedTimeRange === option.value
                      ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg'
                      : 'bg-white border-2 border-rose-200 text-gray-700 hover:border-rose-300'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {metricCards.map((metric, index) => (
                <div
                  key={index}
                  className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-2 border-gray-100 hover:border-rose-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${metric.bgColor}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br ${metric.color}`}>
                      <span className="text-2xl">{metric.icon}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800">
                        {metric.value}
                      </div>
                      <div className="text-sm font-semibold text-gray-600">
                        {metric.title}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quiz Performance Overview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-rose-200">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-8 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex items-center justify-center mr-3 text-white text-sm">🏆</span>
                  Quiz Performance Overview
                </h2>
                
                {analytics && analytics.perQuiz.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-gray-500 font-medium">No quiz data yet</p>
                    <p className="text-sm text-gray-400">Create quizzes to see performance analytics</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics && analytics.perQuiz.slice(0, 5).map((quiz, index) => (
                      <div
                        key={quiz.quizId}
                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-rose-50 rounded-2xl border border-gray-100 hover:border-rose-200 transition-all duration-300"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 line-clamp-1">{quiz.quizTitle}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {quiz.attempts} attempts
                            </span>
                            <span className="text-sm text-emerald-600 font-semibold">
                              {quiz.accuracy.toFixed(1)}% accuracy
                            </span>
                            <span className="text-sm text-blue-600 font-semibold">
                              {quiz.questions} questions
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Question Difficulty Analysis */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-rose-200">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-8 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex items-center justify-center mr-3 text-white text-sm">🎯</span>
                  Question Difficulty Analysis
                </h2>
                
                {analytics && analytics.perQuestion.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">❓</span>
                    </div>
                    <p className="text-gray-500 font-medium">No question data yet</p>
                    <p className="text-sm text-gray-400">Questions will appear here as students attempt quizzes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analytics && analytics.perQuestion.slice(0, 5).map((question, index) => (
                      <div
                        key={question.questionId}
                        className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-rose-50 rounded-2xl border border-gray-100 hover:border-rose-200 transition-all duration-300"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          question.difficultyBucket === 'Easy' ? 'bg-gradient-to-br from-emerald-300 to-green-300' :
                          question.difficultyBucket === 'Medium' ? 'bg-gradient-to-br from-amber-300 to-orange-300' :
                          'bg-gradient-to-br from-red-300 to-rose-300'
                        }`}>
                          <span className="text-lg">
                            {question.difficultyBucket === 'Easy' ? '😊' :
                             question.difficultyBucket === 'Medium' ? '😐' : '😰'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm">{question.contentPreview}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {question.attempts} attempts
                            </span>
                            <span className="text-sm text-emerald-600 font-semibold">
                              {question.accuracy.toFixed(1)}% accuracy
                            </span>
                            <span className={`text-sm font-semibold ${
                              question.difficultyBucket === 'Easy' ? 'text-emerald-600' :
                              question.difficultyBucket === 'Medium' ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {question.difficultyBucket}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Quiz Analysis */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-rose-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-8 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex items-center justify-center mr-3 text-white text-sm">📈</span>
                Detailed Quiz Analysis
              </h2>
              
              {analytics && analytics.perQuiz.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-gray-500 font-medium">No detailed analysis available</p>
                  <p className="text-sm text-gray-400">Create quizzes and get student submissions to see detailed analytics</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {analytics && analytics.perQuiz.slice(0, 3).map((quiz, index) => (
                    <div key={quiz.quizId} className="bg-gradient-to-r from-gray-50 to-rose-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{quiz.quizTitle}</h3>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{quiz.questions} questions</span>
                          <span className="text-sm text-emerald-600 font-semibold">{quiz.accuracy.toFixed(1)}% accuracy</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{quiz.attempts}</div>
                          <div className="text-sm text-gray-600">Total Attempts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">{quiz.correct}</div>
                          <div className="text-sm text-gray-600">Correct Answers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Object.keys(quiz.difficultyDistribution).length}
                          </div>
                          <div className="text-sm text-gray-600">Difficulty Levels</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">🔴 Hardest Questions</h4>
                          <div className="space-y-2">
                            {quiz.hardestQuestions.slice(0, 2).map((question) => (
                              <div key={question.questionId} className="text-sm text-gray-600 bg-white/50 rounded-lg p-2">
                                {question.contentPreview.substring(0, 50)}...
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">🟢 Easiest Questions</h4>
                          <div className="space-y-2">
                            {quiz.easiestQuestions.slice(0, 2).map((question) => (
                              <div key={question.questionId} className="text-sm text-gray-600 bg-white/50 rounded-lg p-2">
                                {question.contentPreview.substring(0, 50)}...
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-2 border-rose-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-8 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex items-center justify-center mr-3 text-white text-sm">⚡</span>
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => navigate('/teacher/create-quiz')}
                  className="group relative overflow-hidden bg-white rounded-3xl shadow-lg border-2 border-gray-100 hover:border-emerald-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className="p-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-emerald-400 to-teal-400">
                      <span className="text-4xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                      Create New Quiz
                    </h3>
                    <p className="text-gray-600 font-medium">
                      Start building your next quiz
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </button>

                <button
                  onClick={() => navigate('/teacher/quizzes')}
                  className="group relative overflow-hidden bg-white rounded-3xl shadow-lg border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className="p-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-blue-400 to-indigo-400">
                      <span className="text-4xl">📝</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      Manage Quizzes
                    </h3>
                    <p className="text-gray-600 font-medium">
                      Edit and organize your quizzes
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </button>

                <button
                  onClick={() => window.print()}
                  className="group relative overflow-hidden bg-white rounded-3xl shadow-lg border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className="p-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-purple-400 to-pink-400">
                      <span className="text-4xl">📄</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                      Export Report
                    </h3>
                    <p className="text-gray-600 font-medium">
                      Download analytics report
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}