import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface QuizSubmission {
  submissionId: string
  quizId: string
  quizTitle: string
  startedAt: string
  submittedAt: string | null
  scorePercent: number | null
  totalQuestions: number | null
  correctAnswers: number | null
  durationSeconds: number
}

interface QuizHistoryResponse {
  content: QuizSubmission[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: any[]
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: any[]
  numberOfElements: number
  first: boolean
  empty: boolean
}

const QuizHistory: React.FC = () => {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Determine the correct back navigation based on user role
  const getBackNavigation = () => {
    if (authUser?.roles?.includes('ROLE_STUDENT')) {
      return '/student/dashboard'
    } else if (authUser?.roles?.includes('ROLE_TEACHER')) {
      return '/teacher/dashboard'
    } else if (authUser?.roles?.includes('ROLE_ADMIN')) {
      return '/admin/dashboard'
    }
    return '/dashboard'
  }

  // Detect dark mode preference
  useEffect(() => {
    const checkDarkMode = () => {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark') {
        setIsDarkMode(true)
        return
      }
      
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true)
        return
      }
      
      setIsDarkMode(false)
    }

    checkDarkMode()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => checkDarkMode()
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Theme-aware color system
  const getThemeColors = () => {
    if (isDarkMode) {
      return {
        background: '#1a1a1a',
        surface: '#2d2d2d',
        surfaceLight: '#3a3a3a',
        text: '#ffffff',
        textSecondary: '#b3b3b3',
        textMuted: '#808080',
        border: '#404040',
        borderLight: '#4a4a4a',
        primary: '#FFB6C1',
        primaryLight: '#FF9BB3',
        secondary: '#A8E6CF',
        accent: '#E8D5B7',
        warning: '#FFB3BA',
        success: '#A8E6CF',
        error: '#FF6B6B',
        shadow: 'rgba(0, 0, 0, 0.5)',
        shadowLight: 'rgba(0, 0, 0, 0.3)'
      }
    } else {
      return {
        background: '#FFF6ED',
        surface: '#FFFFFF',
        surfaceLight: '#FFF9F3',
        text: '#5D4E75',
        textSecondary: '#8B5A96',
        textMuted: '#A67C8A',
        border: '#E8D5B7',
        borderLight: '#F4E4C1',
        primary: '#FFB6C1',
        primaryLight: '#FF9BB3',
        secondary: '#A8E6CF',
        accent: '#E8D5B7',
        warning: '#FFB3BA',
        success: '#A8E6CF',
        error: '#FF6B6B',
        shadow: 'rgba(0, 0, 0, 0.1)',
        shadowLight: 'rgba(0, 0, 0, 0.05)'
      }
    }
  }

  const fetchQuizHistory = async (page: number = 0) => {
    try {
      setLoading(true)
      
      // Debug: Check token
      const token = localStorage.getItem('access_token')
      console.log('🔍 QuizHistory - Token status:', token ? 'Token exists' : 'No token found')
      console.log('🔍 QuizHistory - Full token:', token)
      console.log('🔍 QuizHistory - All localStorage keys:', Object.keys(localStorage))
      
      if (!token) {
        throw new Error('No access token found. Please login first.')
      }
      
      const response = await fetch(`https://api.duongtech.me/api/v1/quiz/submissions/me?page=${page}&size=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.')
        }
        throw new Error(`Failed to fetch quiz history: ${response.status} ${response.statusText}`)
      }

      const data: QuizHistoryResponse = await response.json()
      setSubmissions(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quiz history. Please try again.'
      setError(errorMessage)
      console.error('Error fetching quiz history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizHistory(currentPage)
  }, [currentPage])

  // Debug: Log submissions to check for duplicates
  useEffect(() => {
    if (submissions.length > 0) {
      console.log('🔍 QuizHistory - Submissions:', submissions.map(s => ({ 
        id: s.submissionId, 
        title: s.quizTitle,
        submittedAt: s.submittedAt 
      })))
      
      // Check for duplicate submissionIds
      const ids = submissions.map(s => s.submissionId)
      const uniqueIds = [...new Set(ids)]
      if (ids.length !== uniqueIds.length) {
        console.warn('⚠️ QuizHistory - Duplicate submissionIds detected:', {
          total: ids.length,
          unique: uniqueIds.length,
          duplicates: ids.filter((id, index) => ids.indexOf(id) !== index)
        })
      }
    }
  }, [submissions])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0 || isNaN(seconds)) return 'Chưa hoàn thành'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getStatusInfo = (submission: QuizSubmission) => {
    if (submission.submittedAt) {
      // Check if score is available (not null and not NaN)
      const hasScore = submission.scorePercent !== null && !isNaN(submission.scorePercent)
      
      return {
        status: 'completed',
        icon: hasScore ? '✅' : '📊',
        text: hasScore ? 'Đã chấm' : 'Đang chấm',
        color: hasScore ? getThemeColors().success : getThemeColors().info,
        bgColor: hasScore ? (isDarkMode ? '#1a4d1a' : '#e8f5e8') : (isDarkMode ? '#1a3d4d' : '#e8f4f8')
      }
    } else {
      return {
        status: 'incomplete',
        icon: '⏳',
        text: 'Chưa hoàn thành',
        color: getThemeColors().warning,
        bgColor: isDarkMode ? '#4d3d1a' : '#fff3cd'
      }
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleQuizClick = (submission: QuizSubmission) => {
    if (submission.submittedAt) {
      // Navigate to submission detail page for completed quizzes
      navigate(`/quiz-submission/${submission.submissionId}`)
    } else {
      // Navigate to continue quiz for incomplete quizzes
      navigate(`/teacher/quiz-taking?continue=true&submissionId=${submission.submissionId}&quizId=${submission.quizId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        {/* Floating decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-20 right-20 w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-spin"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mx-auto mb-6 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 animate-ping"></div>
          </div>
          <p className="text-white text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            ✨ Đang tải lịch sử bài kiểm tra... ✨
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: getThemeColors().background }}>
        <div className="text-center p-8 rounded-3xl border-2" style={{ 
          borderColor: getThemeColors().error, 
          backgroundColor: getThemeColors().surface 
        }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: getThemeColors().error }}>
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: getThemeColors().text }}>
            Lỗi tải dữ liệu
          </h2>
          <p className="mb-4" style={{ color: getThemeColors().textMuted }}>
            {error}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => fetchQuizHistory(currentPage)}
              className="px-6 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
              style={{ 
                backgroundColor: getThemeColors().primary,
                color: getThemeColors().text
              }}
            >
              🔄 Thử lại
            </button>
            {error?.includes('Authentication') && (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
                style={{ 
                  backgroundColor: getThemeColors().error,
                  color: getThemeColors().text
                }}
              >
                🔐 Đăng nhập lại
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced floating decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-xl animate-pulse opacity-30"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-lg animate-bounce opacity-30"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-2xl animate-pulse opacity-20"></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-lg animate-spin opacity-25"></div>
      </div>
      
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate(getBackNavigation())}
                className="group w-16 h-16 rounded-3xl flex items-center justify-center transform hover:scale-110 transition-all duration-500 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 shadow-2xl hover:shadow-3xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="text-2xl animate-wiggle relative z-10">⬅️</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">
                  🎯 Lịch sử làm bài 🎯
                </h1>
                <p className="text-xl text-white font-semibold animate-fade-in">
                  ✨ Xem lại các bài kiểm tra đã làm ✨
                </p>
                <div className="mt-3 px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white border border-pink-300/30">
                  👨‍🏫 Giao diện giáo viên
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                📊 {totalElements} bài kiểm tra
              </div>
              <div className="text-lg text-white/80 font-semibold">
                Tổng cộng {totalPages} trang
              </div>
            </div>
          </div>
        </div>

        {/* Quiz History List */}
        {submissions.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 shadow-2xl animate-bounce">
                <span className="text-5xl animate-wiggle">📝</span>
              </div>
              {/* Floating sparkles */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
              <div className="absolute -top-2 -right-4 w-6 h-6 bg-pink-400 rounded-full animate-bounce opacity-60"></div>
              <div className="absolute -bottom-4 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-green-400 rounded-full animate-ping opacity-60"></div>
            </div>
            <h2 className="text-4xl font-bold mb-6 text-white bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Chưa có bài kiểm tra nào
            </h2>
            <p className="text-xl mb-10 text-white/80 font-semibold">
              Hãy bắt đầu làm bài kiểm tra để xem lịch sử ở đây!
            </p>
            <button
              onClick={() => navigate(getBackNavigation())}
              className="group relative px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="mr-3 text-2xl animate-wiggle relative z-10">🚀</span>
              <span className="relative z-10 text-lg">Bắt đầu làm bài</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission, index) => {
              const statusInfo = getStatusInfo(submission)
              return (
                <div
                  key={`submission-${submission.submissionId}-${index}`}
                  onClick={() => handleQuizClick(submission)}
                  className="group relative p-8 rounded-3xl border-4 cursor-pointer transition-all duration-700 transform hover:scale-105 hover:shadow-3xl bg-white/90 backdrop-blur-lg overflow-hidden"
                  style={{ 
                    borderColor: statusInfo.status === 'completed' ? '#10b981' : '#f59e0b',
                    boxShadow: `0 8px 32px rgba(0,0,0,0.1)`
                  }}
                >
                  {/* Magic shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Floating sparkles */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Quiz Icon */}
                      <div className="w-20 h-20 rounded-3xl flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 shadow-2xl group-hover:shadow-3xl relative overflow-hidden">
                        <span className="text-3xl group-hover:animate-bounce">📝</span>
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </div>

                      {/* Quiz Info */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                          {submission.quizTitle}
                        </h3>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg animate-pulse">🕒</span>
                            <span style={{ color: getThemeColors().textMuted }}>
                              Bắt đầu: {formatDate(submission.startedAt)}
                            </span>
                          </div>
                          {submission.submittedAt && (
                            <div className="flex items-center space-x-2">
                              <span className="text-lg animate-bounce">🏁</span>
                              <span style={{ color: getThemeColors().textMuted }}>
                                Hoàn thành: {formatDate(submission.submittedAt)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className="text-lg animate-ping">⏱️</span>
                            <span style={{ color: getThemeColors().textMuted }}>
                              Thời gian: {formatDuration(submission.durationSeconds)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Score */}
                      <div className="flex items-center space-x-4">
                        {/* Status Badge */}
                        <div
                          className="px-6 py-3 rounded-2xl font-bold text-lg shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110"
                          style={{ 
                            backgroundColor: statusInfo.bgColor,
                            color: statusInfo.color
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl group-hover:animate-bounce">{statusInfo.icon}</span>
                            <span className="font-bold">{statusInfo.text}</span>
                          </div>
                        </div>

                        {/* Score (if completed) */}
                        {submission.submittedAt && submission.scorePercent !== null && !isNaN(submission.scorePercent) && (
                          <div className="text-center bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110">
                            <div className="text-3xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-300">
                              {submission.scorePercent.toFixed(1)}%
                            </div>
                            <div className="text-sm font-semibold text-green-500">
                              📊 Điểm số
                            </div>
                          </div>
                        )}

                        {/* Action Arrow */}
                        <div className="w-12 h-12 rounded-full flex items-center justify-center transform group-hover:scale-125 transition-all duration-500 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 shadow-xl group-hover:shadow-2xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <span className="text-2xl group-hover:animate-bounce relative z-10">
                            {submission.submittedAt ? '👁️' : '➡️'}
                          </span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: currentPage === 0 ? getThemeColors().border : getThemeColors().accent,
                color: getThemeColors().text
              }}
            >
              ⬅️ Trước
            </button>

            <div className="flex items-center space-x-2">
              {(() => {
                const pages = []
                const maxVisiblePages = 5
                
                // Calculate start and end pages
                let startPage = Math.max(0, currentPage - 2)
                let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1)
                
                // Adjust if we're near the end
                if (endPage - startPage < maxVisiblePages - 1) {
                  startPage = Math.max(0, endPage - maxVisiblePages + 1)
                }
                
                console.log('🔍 Pagination Debug:', {
                  currentPage,
                  totalPages,
                  startPage,
                  endPage,
                  maxVisiblePages,
                  pagesToShow: endPage - startPage + 1
                })
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={`page-${i}`}
                      onClick={() => handlePageChange(i)}
                      className={`px-4 py-2 rounded-2xl font-semibold transition-all duration-300 ${
                        i === currentPage ? 'transform scale-110' : ''
                      }`}
                      style={{ 
                        backgroundColor: i === currentPage ? getThemeColors().primary : getThemeColors().surface,
                        color: getThemeColors().text,
                        border: `2px solid ${i === currentPage ? getThemeColors().primary : getThemeColors().border}`
                      }}
                    >
                      {i + 1}
                    </button>
                  )
                }
                return pages
              })()}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: currentPage === totalPages - 1 ? getThemeColors().border : getThemeColors().accent,
                color: getThemeColors().text
              }}
            >
              Sau ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizHistory
