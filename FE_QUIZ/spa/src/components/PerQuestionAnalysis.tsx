import React, { useState, useMemo } from 'react'
import { QuestionAnalysis, formatAccuracy, getDifficultyColor } from '@/api/quizStatisticsClient'

interface PerQuestionAnalysisProps {
  questions: QuestionAnalysis[]
  loading: boolean
}

const PerQuestionAnalysis: React.FC<PerQuestionAnalysisProps> = ({ questions, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'accuracy' | 'attempts' | 'difficulty'>('accuracy')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions.filter(question => {
      const matchesSearch = question.contentPreview.toLowerCase().includes(searchTerm.toLowerCase())
    })

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficultyBucket === selectedDifficulty)
    }

    return filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'accuracy':
          comparison = a.accuracy - b.accuracy
          break
        case 'attempts':
          comparison = a.attempts - b.attempts
          break
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 }
          comparison = difficultyOrder[a.difficultyBucket] - difficultyOrder[b.difficultyBucket]
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [questions, searchTerm, selectedDifficulty, sortBy, sortOrder])

  const difficultyStats = useMemo(() => {
    const stats = { Easy: 0, Medium: 0, Hard: 0 }
    questions.forEach(q => {
      stats[q.difficultyBucket]++
    })
    return stats
  }, [questions])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
        <h2 className="text-2xl font-bold text-gray-900">❓ Phân Tích Từng Câu Hỏi</h2>
        <div className="text-sm text-gray-600">
          Tổng: {questions.length} câu hỏi
        </div>
      </div>

      {/* Difficulty Distribution */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Phân Bố Độ Khó</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(difficultyStats).map(([difficulty, count]) => (
            <div key={difficulty} className={`rounded-lg p-4 ${getDifficultyColor(difficulty)}`}>
              <div className="text-center">
                <p className="text-sm font-medium">{difficulty}</p>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs opacity-75">
                  {((count / questions.length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Lọc theo độ khó"
          >
            <option value="all">Tất cả độ khó</option>
            <option value="Easy">Dễ</option>
            <option value="Medium">Trung bình</option>
            <option value="Hard">Khó</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Sắp xếp theo"
          >
            <option value="accuracy">Độ chính xác</option>
            <option value="attempts">Số lần thử</option>
            <option value="difficulty">Độ khó</option>
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

      {/* Questions List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {filteredAndSortedQuestions.length > 0 ? (
          filteredAndSortedQuestions.map((question, index) => (
            <div key={question.questionId} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {question.contentPreview}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>ID: {question.questionId.slice(-8)}</span>
                    <span>Quiz: {question.quizId.slice(-8)}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficultyBucket)}`}>
                  {question.difficultyBucket}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{question.attempts}</p>
                  <p className="text-xs text-gray-600">Lần thử</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{question.correct}</p>
                  <p className="text-xs text-gray-600">Đúng</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{formatAccuracy(question.accuracy)}</p>
                  <p className="text-xs text-gray-600">Chính xác</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Độ chính xác</span>
                  <span>{formatAccuracy(question.accuracy)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      question.accuracy >= 0.8 ? 'bg-green-500' :
                      question.accuracy >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${question.accuracy * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Không tìm thấy câu hỏi nào phù hợp với bộ lọc.</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredAndSortedQuestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {filteredAndSortedQuestions.reduce((sum, q) => sum + q.attempts, 0)}
              </p>
              <p className="text-sm text-gray-600">Tổng lần thử</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {filteredAndSortedQuestions.reduce((sum, q) => sum + q.correct, 0)}
              </p>
              <p className="text-sm text-gray-600">Tổng câu đúng</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {formatAccuracy(
                  filteredAndSortedQuestions.reduce((sum, q) => sum + q.accuracy, 0) / filteredAndSortedQuestions.length
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

export default PerQuestionAnalysis
