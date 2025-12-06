import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface QuestionResult {
  questionId: string
  content: string
  type: 'MCQ' | 'ESSAY' | 'SHORT'
  selectedAnswerId?: string
  selectedAnswerText?: string
  isCorrect?: boolean
  correctAnswerText?: string
  aiScore?: number
  aiComment?: string
  rubric?: Array<{
    criterion: string
    maxPoints: number
    awarded: number
    comment: string
  }>
}

interface QuizSubmissionDetail {
  submissionId: string
  quizId: string
  quizTitle: string
  startedAt: string
  submittedAt: string
  scorePercent: number
  totalQuestions: number
  correctAnswers?: number
  durationSeconds: number
  feedback?: string
  cheatingAnalysis?: string
  suggestReview?: boolean
  reviewQuizId?: string
  questions: QuestionResult[]
}

const QuizSubmissionDetail: React.FC = () => {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const { submissionId } = useParams<{ submissionId: string }>()
  const [submission, setSubmission] = useState<QuizSubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Determine the correct back navigation based on user role
  const getBackNavigation = () => {
    if (authUser?.roles?.includes('ROLE_STUDENT')) {
      return '/student/quiz-history'
    }
    return '/quiz-history'
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

  const fetchSubmissionDetail = async () => {
    if (!submissionId) {
      console.error('🔍 QuizSubmissionDetail - No submissionId provided')
      setError('No submission ID provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      const token = localStorage.getItem('access_token')
      console.log('🔍 QuizSubmissionDetail - Token status:', token ? 'Token exists' : 'No token found')
      console.log('🔍 QuizSubmissionDetail - SubmissionId:', submissionId)
      
      if (!token) {
        throw new Error('No access token found. Please login first.')
      }
      
      const response = await fetch(`https://api.duongtech.me/api/v1/quiz/submissions/${submissionId}`, {
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
        throw new Error(`Failed to fetch submission detail: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('🔍 QuizSubmissionDetail - API Response:', data)
      
      // Handle different response formats
      if (data.code === 1000 && data.result) {
        console.log('🔍 QuizSubmissionDetail - Result data:', data.result)
        setSubmission(data.result)
        setError(null)
      } else if (data.submissionId) {
        // Direct response format (without wrapper)
        console.log('🔍 QuizSubmissionDetail - Direct response format:', data)
        setSubmission(data)
        setError(null)
      } else {
        console.error('🔍 QuizSubmissionDetail - Invalid response format:', {
          hasCode: 'code' in data,
          code: data.code,
          hasResult: 'result' in data,
          resultType: typeof data.result,
          hasSubmissionId: 'submissionId' in data,
          fullResponse: data
        })
        throw new Error('Invalid response format')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load submission detail. Please try again.'
      setError(errorMessage)
      console.error('Error fetching submission detail:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissionDetail()
  }, [submissionId])

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
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return getThemeColors().success
    if (score >= 60) return getThemeColors().warning
    return getThemeColors().error
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return '🎉'
    if (score >= 60) return '👍'
    return '📚'
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MCQ': return '🔘'
      case 'ESSAY': return '📝'
      case 'SHORT': return '✏️'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: getThemeColors().background }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full animate-spin" style={{ backgroundColor: getThemeColors().primary }}>
              <div className="absolute inset-2 rounded-full" style={{ backgroundColor: getThemeColors().background }}>
                <div className="absolute inset-2 rounded-full animate-ping" style={{ backgroundColor: getThemeColors().primary }}></div>
              </div>
            </div>
          </div>
          <p className="text-lg font-semibold" style={{ color: getThemeColors().text }}>
            📊 Đang tải chi tiết bài kiểm tra...
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
              onClick={() => fetchSubmissionDetail()}
              className="px-6 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
              style={{ 
                backgroundColor: getThemeColors().primary,
                color: getThemeColors().text
              }}
            >
              🔄 Thử lại
            </button>
            <button
              onClick={() => {
                console.log('🔍 Test API call with submissionId:', submissionId)
                fetch(`https://api.duongtech.me/api/v1/quiz/submissions/${submissionId}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                  }
                })
                .then(response => response.json())
                .then(data => console.log('🔍 Direct API test result:', data))
                .catch(err => console.error('🔍 Direct API test error:', err))
              }}
              className="px-6 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
              style={{ 
                backgroundColor: getThemeColors().warning,
                color: getThemeColors().text
              }}
            >
              🧪 Test API
            </button>
            <button
              onClick={() => navigate(getBackNavigation())}
              className="px-6 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
              style={{ 
                backgroundColor: getThemeColors().accent,
                color: getThemeColors().text
              }}
            >
              ⬅️ Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: getThemeColors().background }}>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: getThemeColors().accent }}>
            <span className="text-4xl">📝</span>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: getThemeColors().text }}>
            Không tìm thấy bài kiểm tra
          </h2>
          <p className="text-lg mb-8" style={{ color: getThemeColors().textMuted }}>
            Bài kiểm tra này có thể đã bị xóa hoặc không tồn tại.
          </p>
          <button
            onClick={() => navigate(getBackNavigation())}
            className="px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
            style={{ 
              backgroundColor: getThemeColors().primary,
              color: getThemeColors().text
            }}
          >
            ⬅️ Quay lại lịch sử
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: getThemeColors().background }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(getBackNavigation())}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300"
                style={{ backgroundColor: getThemeColors().accent }}
              >
                <span className="text-xl">⬅️</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: getThemeColors().text }}>
                  📊 Chi tiết bài kiểm tra
                </h1>
                <p className="text-lg" style={{ color: getThemeColors().textMuted }}>
                  {submission.quizTitle}
                </p>
                <div className="mt-2 px-3 py-1 rounded-full text-sm font-medium" style={{ 
                  backgroundColor: getThemeColors().primary + '20', 
                  color: getThemeColors().textSecondary 
                }}>
                  👨‍🏫 Giao diện giáo viên
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: getScoreColor(submission.scorePercent) }}>
                {getScoreIcon(submission.scorePercent)} {submission.scorePercent.toFixed(1)}%
              </div>
              <div className="text-sm" style={{ color: getThemeColors().textMuted }}>
                Điểm số
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Summary */}
        <div className="mb-8 p-6 rounded-3xl border-2" style={{ 
          borderColor: getThemeColors().border,
          backgroundColor: getThemeColors().surface,
          boxShadow: `0 4px 15px ${getThemeColors().shadowLight}`
        }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ backgroundColor: getThemeColors().primary }}>
                <span className="text-2xl">📝</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: getThemeColors().textSecondary }}>
                {submission.totalQuestions}
              </div>
              <div className="text-sm" style={{ color: getThemeColors().textMuted }}>
                Tổng câu hỏi
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ backgroundColor: getThemeColors().success }}>
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: getThemeColors().textSecondary }}>
                {submission.correctAnswers || 0}
              </div>
              <div className="text-sm" style={{ color: getThemeColors().textMuted }}>
                Câu đúng
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ backgroundColor: getThemeColors().accent }}>
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: getThemeColors().textSecondary }}>
                {formatDuration(submission.durationSeconds)}
              </div>
              <div className="text-sm" style={{ color: getThemeColors().textMuted }}>
                Thời gian
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ backgroundColor: getThemeColors().warning }}>
                <span className="text-2xl">📅</span>
              </div>
              <div className="text-sm font-bold" style={{ color: getThemeColors().textSecondary }}>
                {formatDate(submission.submittedAt)}
              </div>
              <div className="text-sm" style={{ color: getThemeColors().textMuted }}>
                Hoàn thành
              </div>
            </div>
          </div>
        </div>

        {/* Questions Results */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6" style={{ color: getThemeColors().text }}>
            📋 Kết quả từng câu hỏi
          </h2>
          
          {submission.questions.map((question, index) => (
            <div
              key={`question-${question.questionId}-${index}`}
              className="p-6 rounded-3xl border-2 transition-all duration-300"
              style={{ 
                borderColor: question.isCorrect === false ? getThemeColors().error : getThemeColors().border,
                backgroundColor: getThemeColors().surface,
                boxShadow: `0 4px 15px ${getThemeColors().shadowLight}`
              }}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: getThemeColors().primary }}>
                    <span className="text-lg">{index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getQuestionTypeIcon(question.type)}</span>
                    <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ 
                      backgroundColor: getThemeColors().accent + '40',
                      color: getThemeColors().textSecondary 
                    }}>
                      {question.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {question.isCorrect === true && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: getThemeColors().success }}>
                      <span className="text-sm">✅</span>
                    </div>
                  )}
                  {question.isCorrect === false && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: getThemeColors().error }}>
                      <span className="text-sm">❌</span>
                    </div>
                  )}
                  {question.aiScore && (
                    <div className="text-sm font-bold px-3 py-1 rounded-full" style={{ 
                      backgroundColor: getThemeColors().primary + '40',
                      color: getThemeColors().textSecondary 
                    }}>
                      AI: {question.aiScore}/10
                    </div>
                  )}
                </div>
              </div>

              {/* Question Content */}
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-3" style={{ color: getThemeColors().text }}>
                  {question.content}
                </h3>
              </div>

              {/* Answer Section */}
              <div className="space-y-4">
                {/* Student Answer */}
                {question.selectedAnswerText && (
                  <div className="p-4 rounded-2xl border-2" style={{ 
                    borderColor: getThemeColors().borderLight,
                    backgroundColor: getThemeColors().surfaceLight
                  }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">👤</span>
                      <span className="font-bold" style={{ color: getThemeColors().textSecondary }}>
                        Câu trả lời của bạn:
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: getThemeColors().text }}>
                      {question.selectedAnswerText}
                    </p>
                  </div>
                )}

                {/* Correct Answer (for MCQ) */}
                {question.type === 'MCQ' && question.correctAnswerText && (
                  <div className="p-4 rounded-2xl border-2" style={{ 
                    borderColor: getThemeColors().success,
                    backgroundColor: getThemeColors().success + '20'
                  }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">✅</span>
                      <span className="font-bold" style={{ color: getThemeColors().textSecondary }}>
                        Đáp án đúng:
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: getThemeColors().text }}>
                      {question.correctAnswerText}
                    </p>
                  </div>
                )}

                {/* AI Comment (for Essay/Short) */}
                {question.aiComment && (
                  <div className="p-4 rounded-2xl border-2" style={{ 
                    borderColor: getThemeColors().primary,
                    backgroundColor: getThemeColors().primary + '20'
                  }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">🤖</span>
                      <span className="font-bold" style={{ color: getThemeColors().textSecondary }}>
                        Nhận xét AI:
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: getThemeColors().text }}>
                      {question.aiComment}
                    </p>
                  </div>
                )}

                {/* Rubric (for Essay/Short) */}
                {question.rubric && question.rubric.length > 0 && (
                  <div className="p-4 rounded-2xl border-2" style={{ 
                    borderColor: getThemeColors().accent,
                    backgroundColor: getThemeColors().accent + '20'
                  }}>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg">📊</span>
                      <span className="font-bold" style={{ color: getThemeColors().textSecondary }}>
                        Đánh giá chi tiết:
                      </span>
                    </div>
                    <div className="space-y-3">
                      {question.rubric.map((criterion, idx) => (
                        <div key={`rubric-${idx}`} className="p-3 rounded-xl" style={{ backgroundColor: getThemeColors().surface }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold" style={{ color: getThemeColors().textSecondary }}>
                              {criterion.criterion}
                            </span>
                            <span className="text-sm font-bold" style={{ color: getThemeColors().primary }}>
                              {criterion.awarded}/{criterion.maxPoints} điểm
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: getThemeColors().textMuted }}>
                            {criterion.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate(getBackNavigation())}
            className="px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
            style={{ 
              backgroundColor: getThemeColors().accent,
              color: getThemeColors().text
            }}
          >
            ⬅️ Quay lại lịch sử
          </button>
          {submission.suggestReview && (
            <button
              onClick={() => {
                if (authUser?.roles?.includes('ROLE_STUDENT')) {
                  navigate(`/student/quiz-taking?quizId=${submission.reviewQuizId || submission.quizId}`)
                } else {
                  navigate(`/teacher/review-quizzes?quizId=${submission.quizId}`)
                }
              }}
              className="px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
              style={{ 
                backgroundColor: getThemeColors().primary,
                color: getThemeColors().text
              }}
            >
              🔄 Ôn tập lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizSubmissionDetail
