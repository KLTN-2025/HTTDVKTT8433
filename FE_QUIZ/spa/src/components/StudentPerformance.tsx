import React, { useState, useMemo } from 'react'
import { StudentPerformance as StudentPerformanceType, formatScore, getPerformanceLevelColor } from '@/api/quizStatisticsClient'

interface StudentPerformanceProps {
  students: StudentPerformanceType[]
  groupSummary: { [level: string]: number }
  loading: boolean
}

const StudentPerformance: React.FC<StudentPerformanceProps> = ({ students, groupSummary, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'attempts' | 'level'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = student.userIdOrName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLevel = selectedLevel === 'all' || student.level === selectedLevel
      return matchesSearch && matchesLevel
    })

    return filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'score':
          comparison = a.bestAttemptScore - b.bestAttemptScore
          break
        case 'attempts':
          comparison = a.attemptCountPerUser - b.attemptCountPerUser
          break
        case 'level':
          const levelOrder: { [key: string]: number } = { 'Xuất sắc': 5, 'Giỏi': 4, 'Khá': 3, 'Trung bình': 2, 'Yếu': 1 }
          comparison = (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [students, searchTerm, selectedLevel, sortBy, sortOrder])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    if (score >= 60) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

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
        <h2 className="text-2xl font-bold text-gray-900">👥 Hiệu Suất Học Sinh</h2>
        <div className="text-sm text-gray-600">
          Tổng: {students.length} học sinh
        </div>
      </div>

      {/* Group Summary */}
      {Object.keys(groupSummary).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Phân Loại Học Sinh</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(groupSummary).map(([level, count]) => (
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

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Lọc theo mức độ"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="Xuất sắc">Xuất sắc</option>
            <option value="Giỏi">Giỏi</option>
            <option value="Khá">Khá</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Yếu">Yếu</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Sắp xếp theo"
          >
            <option value="score">Điểm số</option>
            <option value="attempts">Số lần thử</option>
            <option value="level">Mức độ</option>
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

      {/* Students List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {filteredAndSortedStudents.length > 0 ? (
          filteredAndSortedStudents.map((student, index) => (
            <div key={`${student.userIdOrName}-${student.quizId}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {student.userIdOrName}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Quiz: {student.quizId.slice(-8)}</span>
                    <span>Lần thử: {student.attemptCountPerUser}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPerformanceLevelColor(student.level)}`}>
                  {student.level}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{formatScore(student.firstAttemptScore)}</p>
                  <p className="text-xs text-gray-600">Lần đầu</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{formatScore(student.bestAttemptScore)}</p>
                  <p className="text-xs text-gray-600">Tốt nhất</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">{formatScore(student.lastAttemptScore)}</p>
                  <p className="text-xs text-gray-600">Gần nhất</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-600">
                    {student.lastDurationSeconds ? `${Math.round(student.lastDurationSeconds / 60)}m` : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">Thời gian</p>
                </div>
              </div>
              
              {/* Score Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Điểm tốt nhất</span>
                  <span>{formatScore(student.bestAttemptScore)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      student.bestAttemptScore >= 90 ? 'bg-green-500' :
                      student.bestAttemptScore >= 80 ? 'bg-blue-500' :
                      student.bestAttemptScore >= 70 ? 'bg-yellow-500' :
                      student.bestAttemptScore >= 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${student.bestAttemptScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Last Submission */}
              <div className="text-xs text-gray-500">
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Nộp lần cuối: {formatDate(student.lastSubmittedAt)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Không tìm thấy học sinh nào phù hợp với bộ lọc.</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredAndSortedStudents.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatScore(
                  filteredAndSortedStudents.reduce((sum, s) => sum + s.bestAttemptScore, 0) / filteredAndSortedStudents.length
                )}
              </p>
              <p className="text-sm text-gray-600">Điểm TB tốt nhất</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {filteredAndSortedStudents.reduce((sum, s) => sum + s.attemptCountPerUser, 0)}
              </p>
              <p className="text-sm text-gray-600">Tổng lần thử</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {formatScore(
                  filteredAndSortedStudents.reduce((sum, s) => sum + s.firstAttemptScore, 0) / filteredAndSortedStudents.length
                )}
              </p>
              <p className="text-sm text-gray-600">Điểm TB lần đầu</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {formatScore(
                  filteredAndSortedStudents.reduce((sum, s) => sum + s.lastAttemptScore, 0) / filteredAndSortedStudents.length
                )}
              </p>
              <p className="text-sm text-gray-600">Điểm TB gần nhất</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentPerformance
