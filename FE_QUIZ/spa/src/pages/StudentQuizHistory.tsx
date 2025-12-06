import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getMyQuizHistory, QuizSubmissionSummary } from '@/api/quizClient'
import { StudentNavigation } from '@/components/StudentNavigation'

export default function StudentQuizHistory() {
  const { user: authUser, loading } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [quizHistory, setQuizHistory] = useState<QuizSubmissionSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    if (!loading && authUser) {
      setUser({
        name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || authUser.email,
        email: authUser.email,
        role: 'ROLE_STUDENT'
      })
      loadQuizHistory()
    }
  }, [authUser, loading])

  const loadQuizHistory = async (page: number = 0) => {
    setIsLoading(true)
    try {
      const data = await getMyQuizHistory(undefined, page, 10)
      setQuizHistory(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error loading quiz history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    loadQuizHistory(page)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number | undefined | null) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number, total: number) => {
    if (!score || !total || total === 0) return 'text-gray-600'
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
      
      <StudentNavigation />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">

        {/* Quiz History */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-rounded font-bold text-rainbow animate-heartbeat">
              🎯 Lịch sử làm bài
            </h2>
            <div className="text-sm text-gray-600 font-rounded font-semibold">
              Tổng cộng: <span className="font-bold text-blue-600">{totalElements}</span> bài
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-16 h-16 border-4 border-pink-200 rounded-full animate-spin"></div>
                  <div className="w-16 h-16 border-4 border-purple-300 rounded-full animate-spin absolute top-0 left-0 animate-reverse-slow"></div>
                </div>
                <p className="text-xl text-gray-600 font-rounded font-bold animate-fade-in">🔄 Đang tải lịch sử...</p>
              </div>
            </div>
          ) : (
            <>
              {quizHistory.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center max-w-md gradient-pastel-yellow border-4 border-yellow-300 rounded-2xl p-8">
                    <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
                      <span className="text-4xl animate-wiggle">📚</span>
                    </div>
                    <h3 className="text-xl font-rounded font-bold text-yellow-600 mb-2 animate-heartbeat">Chưa có bài kiểm tra nào</h3>
                    <p className="text-gray-600 mb-6 font-rounded font-semibold">Hãy bắt đầu làm bài kiểm tra để xem lịch sử ở đây!</p>
                    <button
                      onClick={() => navigate('/student/quiz-taking')}
                      className="group relative px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-rounded font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 btn-magic border-2 border-yellow-400"
                    >
                      <span className="mr-2 animate-wiggle">🚀</span>
                      <span>Bắt đầu làm bài</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {quizHistory.map((submission, index) => (
                    <div
                      key={submission.submissionId}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border-4 border-blue-300 animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-3xl">📝</span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{submission.quizTitle}</h3>
                            <p className="text-gray-600">{submission.subjectName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getScoreColor(submission.correctAnswers || 0, submission.totalQuestions || 1)}`}>
                            {submission.correctAnswers || 0}/{submission.totalQuestions || 0}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.round(((submission.correctAnswers || 0) / (submission.totalQuestions || 1)) * 100)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
                          <div className="text-sm text-gray-600 font-rounded font-semibold mb-1">📊 Điểm số</div>
                          <div className="text-xl font-bold text-blue-600">{submission.score || 0}</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
                          <div className="text-sm text-gray-600 font-rounded font-semibold mb-1">✅ Đúng</div>
                          <div className="text-xl font-bold text-green-600">{submission.correctAnswers || 0}</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
                          <div className="text-sm text-gray-600 font-rounded font-semibold mb-1">⏱️ Thời gian</div>
                          <div className="text-xl font-bold text-purple-600">{formatDuration(submission.duration)}</div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-yellow-200">
                          <div className="text-sm text-gray-600 font-rounded font-semibold mb-1">📅 Nộp bài</div>
                          <div className="text-sm font-bold text-yellow-600">{formatDate(submission.submittedAt)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            submission.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {submission.status === 'COMPLETED' ? '✅ Hoàn thành' : '⏳ Đang chấm'}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/quiz-submission/${submission.submissionId}`)}
                          className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-rounded font-bold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          <span className="mr-2 animate-wiggle">👁️</span>
                          <span>Xem chi tiết</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-12">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-rounded font-bold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Trước
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-xl font-rounded font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                              page === currentPage
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400'
                            }`}
                          >
                            {page + 1}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-rounded font-bold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
