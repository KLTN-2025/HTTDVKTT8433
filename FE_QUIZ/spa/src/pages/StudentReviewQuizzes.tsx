import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getMyReviewQuizzes, ReviewQuizResponse } from '@/api/quizClient'
import { StudentNavigation } from '@/components/StudentNavigation'
import { RoleGuard } from '@/components/RoleGuard'
import { UserRole } from '@/types/auth'

const StudentReviewQuizzes: React.FC = () => {
  const { user } = useAuth()
  const [reviewQuizzes, setReviewQuizzes] = useState<ReviewQuizResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReviewQuizzes()
  }, [])

  const loadReviewQuizzes = async () => {
    try {
      setLoading(true)
      const data = await getMyReviewQuizzes()
      setReviewQuizzes(data)
    } catch (err) {
      console.error('Error loading review quizzes:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Recently'
    }
  }

  const getDifficultyColor = (count: number) => {
    if (count <= 5) return 'from-green-200 to-emerald-200'
    if (count <= 10) return 'from-yellow-200 to-amber-200'
    return 'from-red-200 to-pink-200'
  }

  const getDifficultyText = (count: number) => {
    if (count <= 5) return 'Easy'
    if (count <= 10) return 'Medium'
    return 'Hard'
  }

  if (loading) {
    return (
      <RoleGuard user={user} requireRoles={['ROLE_STUDENT'] as UserRole[]}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
          {/* Beautiful floating shapes with enhanced animations */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-amber-200/30 rounded-full blur-xl animate-bounce" />
          
          <div className="text-center relative z-10">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 w-32 h-32 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animate-reverse-slow"></div>
              <div className="absolute inset-4 w-24 h-24 border-4 border-transparent border-t-rose-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl animate-bounce filter drop-shadow-lg animate-wiggle">📚</span>
              </div>
            </div>
            <h3 className="text-2xl font-rounded font-bold text-amber-700 mb-2 tracking-wide animate-heartbeat">🔄 Loading Your Review Universe</h3>
            <p className="text-lg text-amber-600 font-rounded font-bold animate-fade-in">✨ Preparing magical review quizzes... ✨</p>
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (error) {
    return (
      <RoleGuard user={user} requireRoles={['ROLE_STUDENT'] as UserRole[]}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
          {/* Beautiful floating shapes with enhanced animations */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-amber-200/30 rounded-full blur-xl animate-bounce" />
          
          <div className="text-center relative z-10">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-rose-300 animate-pulse">
                <span className="text-6xl filter drop-shadow-lg animate-wiggle">😞</span>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
            </div>
            <h2 className="text-4xl font-rounded font-bold text-rose-700 mb-4 tracking-wide animate-heartbeat">Oops! Something went wrong</h2>
            <p className="text-xl text-rose-600 mb-8 font-rounded font-bold max-w-2xl mx-auto leading-relaxed animate-fade-in">
              ✨ {error} ✨
            </p>
            <button
              onClick={loadReviewQuizzes}
              className="group relative overflow-hidden bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white px-10 py-5 rounded-full font-rounded font-bold text-xl transition-all duration-700 transform hover:scale-110 shadow-2xl hover:shadow-3xl border-4 border-rose-300 hover:border-rose-400 btn-magic"
            >
              <span className="relative z-10 flex items-center space-x-4">
                <span className="text-3xl group-hover:rotate-180 transition-transform duration-700 animate-wiggle">🔄</span>
                <span className="tracking-wide">Try Again</span>
                <span className="text-2xl group-hover:translate-x-2 transition-transform duration-500">✨</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-40 blur-2xl transition-all duration-700"></div>
            </button>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard user={user} requireRoles={['ROLE_STUDENT'] as UserRole[]}>
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
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="group relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-500 group-hover:rotate-6 border-4 border-amber-300 animate-heartbeat btn-magic">
                    <span className="text-2xl group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">📚</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-rounded font-bold text-rainbow tracking-tight animate-heartbeat">
                    🎓 Review Quizzes Hub
                  </h1>
                  <p className="text-lg text-amber-700 font-rounded font-bold flex items-center space-x-2 animate-fade-in">
                    <span className="text-xl animate-bounce filter drop-shadow-md">✨</span>
                    <span className="tracking-wide">🌟 Practice with personalized review quizzes 🌟</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="gradient-pastel-green border-4 border-green-300 rounded-2xl px-6 py-3 shadow-lg animate-fade-in">
                  <span className="text-sm font-rounded font-bold text-green-800 flex items-center space-x-2">
                    <span className="animate-wiggle">📊</span>
                    <span>{reviewQuizzes.length} Review Quizzes Available</span>
                  </span>
                </div>
                
                <Link
                  to="/student/quiz-taking"
                  className="group relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white px-6 py-3 rounded-xl font-rounded font-bold text-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl border-4 border-amber-300 hover:border-amber-400 btn-magic"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span className="text-xl group-hover:rotate-180 transition-transform duration-500 animate-wiggle">🎯</span>
                    <span className="tracking-wide">Take Regular Quiz</span>
                    <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">✨</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Review Quizzes Grid */}
          {reviewQuizzes.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative mx-auto w-32 h-32 mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-amber-300 animate-pulse">
                  <span className="text-6xl filter drop-shadow-lg animate-wiggle">📝</span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
              </div>
              <h3 className="text-4xl font-rounded font-bold text-amber-700 mb-4 tracking-wide animate-heartbeat">🌟 No Review Quizzes Yet</h3>
              <p className="text-xl text-amber-600 mb-8 font-rounded font-bold max-w-2xl mx-auto leading-relaxed animate-fade-in">
                ✨ Complete some quizzes to get personalized review quizzes! ✨
              </p>
              <Link
                to="/student/quiz-taking"
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white px-10 py-5 rounded-full font-rounded font-bold text-xl transition-all duration-700 transform hover:scale-110 shadow-2xl hover:shadow-3xl border-4 border-emerald-300 hover:border-emerald-400 btn-magic"
              >
                <span className="relative z-10 flex items-center space-x-4">
                  <span className="text-3xl group-hover:rotate-180 transition-transform duration-700 animate-wiggle">🚀</span>
                  <span className="tracking-wide">Start Taking Quizzes</span>
                  <span className="text-2xl group-hover:translate-x-2 transition-transform duration-500">✨</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-40 blur-2xl transition-all duration-700"></div>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviewQuizzes.map((quiz, index) => {
                const quizIcons = ['🧮', '🔬', '📚', '🎨', '🌍', '💻', '🧪', '📐', '🎵', '🏛️', '⚗️', '📊']
                const icon = quizIcons[index % quizIcons.length]
                const colors = [
                  'from-amber-200 to-orange-200 border-amber-300 hover:border-amber-400',
                  'from-rose-200 to-pink-200 border-rose-300 hover:border-rose-400', 
                  'from-emerald-200 to-teal-200 border-emerald-300 hover:border-emerald-400',
                  'from-violet-200 to-purple-200 border-violet-300 hover:border-violet-400',
                  'from-cyan-200 to-blue-200 border-cyan-300 hover:border-cyan-400',
                  'from-lime-200 to-green-200 border-lime-300 hover:border-lime-400'
                ]
                const colorClass = colors[index % colors.length]
                
                return (
                  <div
                    key={quiz.id}
                    className={`group relative bg-gradient-to-br ${colorClass} backdrop-blur-sm rounded-2xl shadow-lg p-6 border-4 transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:-rotate-1 hover-lift animate-fade-in-up cursor-pointer`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                      <div className="relative">
                        {/* Quiz Header */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 btn-magic animate-float`}>
                            <span className="text-lg group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">{icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-rounded font-bold text-gray-900 group-hover:text-rainbow transition-all duration-300 tracking-wide truncate animate-fade-in">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-gray-600 font-rounded font-semibold animate-slide-up">
                              Created: {formatDate(quiz.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Quiz Stats */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-rounded font-bold text-gray-700 flex items-center space-x-2 animate-fade-in">
                              <span className="animate-wiggle">📝</span>
                              <span>Questions:</span>
                            </span>
                            <span className="text-sm font-rounded font-bold text-gray-900 animate-fade-in">
                              {quiz.targetCount}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-rounded font-bold text-gray-700 flex items-center space-x-2 animate-fade-in">
                              <span className="animate-wiggle">🎯</span>
                              <span>Difficulty:</span>
                            </span>
                            <span 
                              className={`px-3 py-1 rounded-full text-xs font-rounded font-bold bg-gradient-to-r ${getDifficultyColor(quiz.targetCount)} text-gray-800 animate-fade-in`}
                            >
                              {getDifficultyText(quiz.targetCount)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-rounded font-bold text-gray-700 flex items-center space-x-2 animate-fade-in">
                              <span className="animate-wiggle">🤖</span>
                              <span>AI Enhanced:</span>
                            </span>
                            <span className={`text-sm font-rounded font-bold ${quiz.aiToppedUp ? 'text-emerald-600' : 'text-gray-500'} animate-fade-in`}>
                              {quiz.aiToppedUp ? '✅ Yes' : '❌ No'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-rounded font-bold text-gray-700 flex items-center space-x-2 animate-fade-in">
                              <span className="animate-wiggle">🆔</span>
                              <span>Quiz ID:</span>
                            </span>
                            <span className="text-xs font-mono text-gray-500 animate-fade-in">
                              {quiz.id.substring(0, 8)}...
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-rounded font-bold text-gray-700 flex items-center space-x-2 animate-fade-in">
                              <span className="animate-wiggle">📊</span>
                              <span>Base Quiz:</span>
                            </span>
                            <span className="text-xs font-mono text-gray-500 animate-fade-in">
                              {quiz.baseQuizId.substring(0, 8)}...
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-rounded font-bold text-gray-700 flex items-center space-x-2 animate-fade-in">
                              <span className="animate-wiggle">👤</span>
                              <span>Profile:</span>
                            </span>
                            <span className="text-xs font-mono text-gray-500 animate-fade-in">
                              {quiz.profileId.substring(0, 8)}...
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          <Link
                            to={`/student/quiz-taking?quizId=${quiz.baseQuizId}&type=review&reviewQuizId=${quiz.id}`}
                            className="group relative overflow-hidden flex-1 px-4 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-rounded font-bold text-base transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl border-4 border-emerald-300 hover:border-emerald-400 btn-magic"
                          >
                            <span className="relative z-10 flex items-center justify-center space-x-2">
                              <span className="text-lg group-hover:rotate-180 transition-transform duration-500 animate-wiggle">🎯</span>
                              <span className="tracking-wide">Start Review</span>
                              <span className="text-base group-hover:translate-x-1 transition-transform duration-300">✨</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </Link>
                          
                          <button
                            className="group relative overflow-hidden px-4 py-3 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-rounded font-bold text-base transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl border-4 border-rose-300 hover:border-rose-400 btn-magic"
                          >
                            <span className="relative z-10 flex items-center justify-center space-x-2">
                              <span className="text-lg group-hover:rotate-180 transition-transform duration-500 animate-wiggle">📊</span>
                              <span className="tracking-wide">Details</span>
                              <span className="text-base group-hover:translate-x-1 transition-transform duration-300">✨</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-12 text-center">
              <div className="gradient-pastel-blue border-4 border-blue-300 rounded-3xl p-8 shadow-2xl animate-fade-in">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-xl flex items-center justify-center shadow-lg border-4 border-yellow-300 animate-heartbeat btn-magic">
                    <span className="text-2xl animate-wiggle">💡</span>
                  </div>
                  <h3 className="text-2xl font-rounded font-bold text-rainbow tracking-wide animate-heartbeat">
                    How Review Quizzes Work
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-emerald-300 group-hover:scale-110 transition-transform duration-300 animate-float">
                      <span className="text-3xl group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">🎯</span>
                    </div>
                    <h4 className="text-lg font-rounded font-bold text-gray-800 mb-3 group-hover:text-rainbow transition-all duration-300">Personalized</h4>
                    <p className="text-sm text-gray-600 font-rounded font-semibold leading-relaxed animate-fade-in">
                      Based on your previous quiz performance
                    </p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-200 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-violet-300 group-hover:scale-110 transition-transform duration-300 animate-float-delayed">
                      <span className="text-3xl group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">🤖</span>
                    </div>
                    <h4 className="text-lg font-rounded font-bold text-gray-800 mb-3 group-hover:text-rainbow transition-all duration-300">AI Enhanced</h4>
                    <p className="text-sm text-gray-600 font-rounded font-semibold leading-relaxed animate-fade-in">
                      AI-generated questions for better learning
                    </p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-200 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-rose-300 group-hover:scale-110 transition-transform duration-300 animate-float-slow">
                      <span className="text-3xl group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">📈</span>
                    </div>
                    <h4 className="text-lg font-rounded font-bold text-gray-800 mb-3 group-hover:text-rainbow transition-all duration-300">Progress Tracking</h4>
                    <p className="text-sm text-gray-600 font-rounded font-semibold leading-relaxed animate-fade-in">
                      Track your improvement over time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
}

export default StudentReviewQuizzes