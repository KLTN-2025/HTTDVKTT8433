import React, { useState, useMemo } from 'react'
import { QuizAnalysis, formatAccuracy, getDifficultyColor } from '@/api/quizStatisticsClient'

interface PerQuizAnalysisProps {
  quizzes: QuizAnalysis[]
  loading: boolean
}

const PerQuizAnalysis: React.FC<PerQuizAnalysisProps> = ({ quizzes, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'accuracy' | 'attempts' | 'questions'>('accuracy')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null)

  const filteredAndSortedQuizzes = useMemo(() => {
    let filtered = quizzes.filter(quiz => 
      quiz.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'accuracy':
          comparison = a.accuracy - b.accuracy
          break
        case 'attempts':
          comparison = a.attempts - b.attempts
          break
        case 'questions':
          comparison = a.questions - b.questions
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [quizzes, searchTerm, sortBy, sortOrder])

  const toggleQuizExpansion = (quizId: string) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📚 Phân Tích Từng Quiz</h2>
        <div className="text-sm text-gray-600">
          Tổng: {quizzes.length} quiz
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Tìm kiếm quiz..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Sắp xếp theo"
          >
            <option value="accuracy">Độ chính xác</option>
            <option value="attempts">Số lần thử</option>
            <option value="questions">Số câu hỏi</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title={`Sắp xếp ${sortOrder === 'asc' ? 'tăng dần' : 'giảm dần'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        {filteredAndSortedQuizzes.length > 0 ? (
          filteredAndSortedQuizzes.map((quiz) => (
            <div key={quiz.quizId} className="bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              {/* Quiz Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {quiz.quizTitle}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>ID: {quiz.quizId.slice(-8)}</span>
                      <span>Subject: {quiz.subjectId.slice(-8)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleQuizExpansion(quiz.quizId)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title={expandedQuiz === quiz.quizId ? 'Thu gọn' : 'Mở rộng'}
                  >
                    <svg 
                      className={`w-5 h-5 transform transition-transform ${expandedQuiz === quiz.quizId ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {/* Quiz Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-600">{quiz.questions}</p>
                    <p className="text-xs text-gray-600">Câu hỏi</p>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">{quiz.attempts}</p>
                    <p className="text-xs text-gray-600">Lần thử</p>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-purple-600">{quiz.correct}</p>
                    <p className="text-xs text-gray-600">Đúng</p>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <p className="text-2xl font-bold text-orange-600">{formatAccuracy(quiz.accuracy)}</p>
                    <p className="text-xs text-gray-600">Chính xác</p>
                  </div>
                </div>

                {/* Difficulty Distribution */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Phân bố độ khó:</h4>
                  <div className="flex space-x-2">
                    {Object.entries(quiz.difficultyDistribution).map(([difficulty, count]) => (
                      <div key={difficulty} className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                        {difficulty}: {count}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Độ chính xác</span>
                    <span>{formatAccuracy(quiz.accuracy)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        quiz.accuracy >= 0.8 ? 'bg-green-500' :
                        quiz.accuracy >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${quiz.accuracy * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedQuiz === quiz.quizId && (
                <div className="border-t border-gray-200 p-4 bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Hardest Questions */}
                    <div>
                      <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center">
                        <span className="mr-2">🔥</span>
                        Câu hỏi khó nhất ({quiz.hardestQuestions.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {quiz.hardestQuestions.slice(0, 5).map((question, index) => (
                          <div key={question.questionId} className="bg-red-50 rounded-lg p-3 border border-red-200">
                            <p className="text-sm font-medium text-red-800 line-clamp-2 mb-1">
                              {question.contentPreview}
                            </p>
                            <div className="flex justify-between text-xs text-red-600">
                              <span>Thử: {question.attempts}</span>
                              <span>Đúng: {question.correct}</span>
                              <span>Chính xác: {formatAccuracy(question.accuracy)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Easiest Questions */}
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
                        <span className="mr-2">⭐</span>
                        Câu hỏi dễ nhất ({quiz.easiestQuestions.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {quiz.easiestQuestions.slice(0, 5).map((question, index) => (
                          <div key={question.questionId} className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <p className="text-sm font-medium text-green-800 line-clamp-2 mb-1">
                              {question.contentPreview}
                            </p>
                            <div className="flex justify-between text-xs text-green-600">
                              <span>Thử: {question.attempts}</span>
                              <span>Đúng: {question.correct}</span>
                              <span>Chính xác: {formatAccuracy(question.accuracy)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Không tìm thấy quiz nào phù hợp với bộ lọc.</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredAndSortedQuizzes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {filteredAndSortedQuizzes.reduce((sum, q) => sum + q.questions, 0)}
              </p>
              <p className="text-sm text-gray-600">Tổng câu hỏi</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {filteredAndSortedQuizzes.reduce((sum, q) => sum + q.attempts, 0)}
              </p>
              <p className="text-sm text-gray-600">Tổng lần thử</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {filteredAndSortedQuizzes.reduce((sum, q) => sum + q.correct, 0)}
              </p>
              <p className="text-sm text-gray-600">Tổng câu đúng</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {formatAccuracy(
                  filteredAndSortedQuizzes.reduce((sum, q) => sum + q.accuracy, 0) / filteredAndSortedQuizzes.length
                )}
              </p>
              <p className="text-sm text-gray-600">Độ chính xác TB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerQuizAnalysis
