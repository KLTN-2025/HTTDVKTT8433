import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyReviewQuizzes, ReviewQuizResponse } from '@/api/quizClient'
import { useAuth } from '@/hooks/useAuth'

interface ReviewQuizListProps {
  className?: string
}

export default function ReviewQuizList({ className = '' }: ReviewQuizListProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reviewQuizzes, setReviewQuizzes] = useState<ReviewQuizResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReviewQuizzes()
  }, [])

  const loadReviewQuizzes = async () => {
    try {
      setLoading(true)
      setError(null)
      const quizzes = await getMyReviewQuizzes()
      setReviewQuizzes(quizzes)
    } catch (err) {
      console.error('Error loading review quizzes:', err)
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách đề ôn tập')
    } finally {
      setLoading(false)
    }
  }

  const handleStartReviewQuiz = (quizId: string) => {
    // Navigate to quiz taking page with review quiz ID
    navigate(`/quiz-taking?quizId=${quizId}&type=review`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách đề ôn tập...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Không thể tải danh sách đề ôn tập</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadReviewQuizzes}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (reviewQuizzes.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có đề ôn tập nào</h3>
          <p className="text-gray-600 mb-4">
            Bạn chưa có đề ôn tập nào được tạo. Hãy làm bài thi để hệ thống tự động tạo đề ôn tập cá nhân hóa cho bạn.
          </p>
          <button
            onClick={() => navigate('/quizzes')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem danh sách đề thi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đề ôn tập của tôi</h2>
        <p className="text-gray-600">
          Các đề ôn tập được tạo tự động dựa trên kết quả làm bài của bạn
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviewQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {quiz.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(quiz.createdAt)}
                </div>
              </div>
              {quiz.aiToppedUp && (
                <div className="flex-shrink-0 ml-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    AI
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{quiz.targetCount} câu hỏi</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Đề ôn tập cá nhân hóa</span>
              </div>
            </div>

            <button
              onClick={() => handleStartReviewQuiz(quiz.id)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Bắt đầu ôn tập
            </button>
          </div>
        ))}
      </div>

      {reviewQuizzes.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Đề ôn tập được tạo tự động dựa trên các câu hỏi bạn đã trả lời sai hoặc cần cải thiện
          </p>
        </div>
      )}
    </div>
  )
}
