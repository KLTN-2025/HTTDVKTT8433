import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isStudent } from '@/utils/apiTransform'
import { StudentNavigation } from '@/components/StudentNavigation'

interface StudentStatisticsResponse {
  code: number
  message: string
  result: {
    overview: {
      totalAttempts: number
      distinctQuizzes: number
      averageScore: number
      totalAnswers: number
      correctAnswers: number
      accuracyRate: number
    }
    perQuiz: Array<{
      quizId: string
      quizTitle: string
      subjectId: string
      attemptCount: number
      firstAttemptScore: number
      bestAttemptScore: number
      lastAttemptScore: number
      lastSubmittedAt: string | null
      level: string
    }>
    timeSeries: {
      attemptsPerWeek: Record<string, number>
      avgScorePerWeek: Record<string, number>
    }
    topQuizzesByAttempts: Array<{
      attempts: number
      quizTitle: string
      quizId: string
    }>
  }
}

export default function StudentStatistics() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<StudentStatisticsResponse['result'] | null>(null)
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

      const response = await fetch('https://api.duongtech.me/api/v1/quiz/Ai/quiz/statistics/student', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: StudentStatisticsResponse = await response.json()
      console.log('📊 Student Analytics data:', data)
      
      if (data.code === 1000) {
        setAnalytics(data.result)
      } else {
        throw new Error(data.message || 'Failed to load analytics')
      }
    } catch (error) {
      console.error('Error loading student analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-300 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-reverse-slow"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user || !isStudent(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
          <p className="text-gray-600">You need student permissions to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 relative overflow-hidden">
      {/* Beautiful floating shapes with enhanced animations */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200/40 to-rose-200/40 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-200/40 to-indigo-200/40 rounded-full blur-lg animate-bounce"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-br from-amber-200/40 to-yellow-200/40 rounded-full blur-xl animate-bounce"></div>
      
      {/* ✨ Sparkle decorations */}
      <div className="absolute top-10 left-1/3 w-6 h-6 bg-gradient-to-br from-yellow-300 to-amber-300 rounded-full animate-float opacity-60 shadow-lg"></div>
      <div className="absolute top-20 right-1/3 w-4 h-4 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full animate-float-delayed opacity-70 shadow-lg"></div>
      <div className="absolute bottom-10 left-20 w-8 h-8 bg-gradient-to-br from-green-300 to-emerald-300 rounded-full animate-float-slow opacity-50 shadow-lg"></div>
      <div className="absolute bottom-20 right-10 w-5 h-5 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full animate-float-delayed-2 opacity-60 shadow-lg"></div>
      
      <StudentNavigation />
      
      {/* Beautiful Header with enhanced styling */}
      <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 shadow-2xl border-b-4 border-pink-300 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-20 h-20 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-md animate-ping"></div>
          <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full blur-lg animate-pulse"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500 animate-heartbeat btn-magic">
                <span className="text-3xl animate-wiggle">📊</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-rounded font-bold text-rainbow mb-4 animate-fade-in">
              📊 Student Statistics
            </h1>
            <p className="text-xl text-gray-700 font-rounded font-semibold animate-slide-up">
              ✨ Track your learning progress and performance ✨
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: '7d', label: '7 Days' },
              { key: '30d', label: '30 Days' },
              { key: '90d', label: '90 Days' },
              { key: '1y', label: '1 Year' }
            ].map((range) => (
              <button
                key={range.key}
                onClick={() => setSelectedTimeRange(range.key as any)}
                className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                  selectedTimeRange === range.key
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 w-32 h-32 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse-slow"></div>
              <div className="absolute inset-4 w-24 h-24 border-4 border-transparent border-t-rose-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl animate-bounce filter drop-shadow-lg animate-wiggle">📊</span>
              </div>
            </div>
            <h3 className="text-2xl font-rounded font-bold text-amber-700 mb-2 tracking-wide animate-heartbeat">🔄 Loading Statistics...</h3>
            <p className="text-lg text-amber-600 font-rounded font-bold animate-fade-in">✨ Preparing your analytics data... ✨</p>
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-4 border-pink-200 hover:border-pink-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-pink-100 to-rose-100 hover-lift animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                    <span className="text-2xl animate-wiggle">📚</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-600">{analytics.overview.distinctQuizzes}</div>
                    <div className="text-sm text-gray-600 font-semibold">Distinct Quizzes</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Unique quizzes attempted</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-4 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-blue-100 to-cyan-100 hover-lift animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                    <span className="text-2xl animate-wiggle">🎯</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalAttempts}</div>
                    <div className="text-sm text-gray-600 font-semibold">Total Attempts</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Quiz attempts</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-4 border-green-200 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-green-100 to-emerald-100 hover-lift animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                    <span className="text-2xl animate-wiggle">📊</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{analytics.overview.averageScore.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600 font-semibold">Average Score</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Overall performance</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-4 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-purple-100 to-indigo-100 hover-lift animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                    <span className="text-2xl animate-wiggle">🎯</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{(analytics.overview.accuracyRate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600 font-semibold">Accuracy</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Answer accuracy</div>
              </div>
            </div>

            {/* Quiz Performance Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-4 border-gray-200 hover:border-gray-300 transition-all duration-300 hover-lift animate-fade-in-up">
              <h2 className="text-2xl font-rounded font-bold text-rainbow mb-6 flex items-center animate-heartbeat">
                <span className="w-8 h-8 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full flex items-center justify-center mr-3 text-white text-sm animate-wiggle">📈</span>
                📈 Quiz Performance
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-2 font-bold text-gray-700">Quiz Title</th>
                      <th className="text-center py-4 px-2 font-bold text-gray-700">Attempts</th>
                      <th className="text-center py-4 px-2 font-bold text-gray-700">Best Score</th>
                      <th className="text-center py-4 px-2 font-bold text-gray-700">Last Score</th>
                      <th className="text-center py-4 px-2 font-bold text-gray-700">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.perQuiz.map((quiz, index) => (
                      <tr key={quiz.quizId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-2">
                          <div className="font-semibold text-gray-800">{quiz.quizTitle}</div>
                          <div className="text-sm text-gray-500">ID: {quiz.quizId.substring(0, 8)}...</div>
                        </td>
                        <td className="text-center py-4 px-2">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {quiz.attemptCount}
                          </span>
                        </td>
                        <td className="text-center py-4 px-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            quiz.bestAttemptScore >= 80 ? 'bg-green-100 text-green-800' :
                            quiz.bestAttemptScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {quiz.bestAttemptScore.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center py-4 px-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            quiz.lastAttemptScore >= 80 ? 'bg-green-100 text-green-800' :
                            quiz.lastAttemptScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {quiz.lastAttemptScore.toFixed(1)}%
                          </span>
                        </td>
                        <td className="text-center py-4 px-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            quiz.level === 'Giỏi' ? 'bg-green-100 text-green-800' :
                            quiz.level === 'Khá' ? 'bg-blue-100 text-blue-800' :
                            quiz.level === 'Trung bình' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {quiz.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Quizzes by Attempts */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border-4 border-gray-200 hover:border-gray-300 transition-all duration-300 hover-lift animate-fade-in-up">
              <h2 className="text-2xl font-rounded font-bold text-rainbow mb-6 flex items-center animate-heartbeat">
                <span className="w-8 h-8 bg-gradient-to-br from-green-300 to-emerald-300 rounded-full flex items-center justify-center mr-3 text-white text-sm animate-wiggle">🏆</span>
                🏆 Top Quizzes by Attempts
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analytics.topQuizzesByAttempts.map((quiz, index) => (
                  <div key={quiz.quizId} className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                        <span className="text-2xl animate-wiggle">🏆</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-600">#{index + 1}</div>
                        <div className="text-sm text-gray-600 font-semibold">Rank</div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{quiz.quizTitle}</h3>
                      <div className="text-sm text-gray-500">ID: {quiz.quizId.substring(0, 8)}...</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 font-semibold">Attempts:</div>
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                        {quiz.attempts}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-amber-300 animate-pulse">
                <span className="text-6xl filter drop-shadow-lg animate-wiggle">📊</span>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
            </div>
            <h3 className="text-4xl font-rounded font-bold text-amber-700 mb-4 tracking-wide animate-heartbeat">🌟 No Data Yet</h3>
            <p className="text-xl text-amber-600 mb-8 font-rounded font-bold max-w-2xl mx-auto leading-relaxed animate-fade-in">
              ✨ Complete some quizzes to see your statistics! ✨
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
