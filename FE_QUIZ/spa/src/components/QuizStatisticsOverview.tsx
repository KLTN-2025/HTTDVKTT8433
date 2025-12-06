import React from 'react'
import { QuizStatisticsResponse, formatAccuracy, formatScore } from '@/api/quizStatisticsClient'

interface QuizStatisticsOverviewProps {
  data: QuizStatisticsResponse | null
  loading: boolean
  onRefresh: () => void
}

const QuizStatisticsOverview: React.FC<QuizStatisticsOverviewProps> = ({ data, loading, onRefresh }) => {
  if (loading && !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500 py-8">
          <p>Không có dữ liệu thống kê. Nhấn "Refresh" để tải dữ liệu.</p>
        </div>
      </div>
    )
  }

  const { scope, global, students } = data.result

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📊 Tổng Quan Thống Kê Quiz</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{loading ? 'Đang tải...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Scope Overview */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Phạm Vi Dữ Liệu</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📚</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quiz</p>
                <p className="text-xl font-bold text-blue-700">{scope.quizzes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">❓</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Câu Hỏi</p>
                <p className="text-xl font-bold text-green-700">{scope.questions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📝</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bài Nộp</p>
                <p className="text-xl font-bold text-purple-700">{scope.submissions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🎯</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Độ Chính Xác</p>
                <p className="text-xl font-bold text-orange-700">{formatAccuracy(global.accuracy)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Performance */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Hiệu Suất Tổng Thể</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-blue-800">Tổng Lần Thử</h4>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🔄</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-700">{global.attempts}</p>
            <p className="text-sm text-blue-600 mt-2">Tổng số lần làm bài</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-green-800">Câu Đúng</h4>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-700">{global.correct}</p>
            <p className="text-sm text-green-600 mt-2">Tổng số câu trả lời đúng</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-purple-800">Tỷ Lệ Chính Xác</h4>
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-700">{formatAccuracy(global.accuracy)}</p>
            <p className="text-sm text-purple-600 mt-2">Tỷ lệ trả lời đúng trung bình</p>
          </div>
        </div>
      </div>

      {/* Student Performance Summary */}
      {students.groupSummary && Object.keys(students.groupSummary).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Phân Loại Học Sinh</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(students.groupSummary).map(([level, count]) => (
              <div key={level} className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                <div className="text-center">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-sm font-bold">
                      {level === 'Xuất sắc' ? '🌟' : 
                       level === 'Giỏi' ? '⭐' : 
                       level === 'Khá' ? '👍' : 
                       level === 'Trung bình' ? '👌' : '📚'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{level}</p>
                  <p className="text-xl font-bold text-indigo-700">{count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizStatisticsOverview
