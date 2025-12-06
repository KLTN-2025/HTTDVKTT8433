import React, { useState, useEffect } from 'react'
import { getPublicQuizzes, PublicQuiz, getPublicSubjects } from '@/api/publicQuizClient'
import SubjectGrid from './SubjectGrid'
import LoginPromptModal from './LoginPromptModal'
import '../styles/animations.css'

const PublicQuizHome: React.FC = () => {
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [totalSubjects, setTotalSubjects] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    loadPublicQuizzes()
    loadSubjects()
  }, [])

  const loadPublicQuizzes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getPublicQuizzes()
      if (response.code === 1000) {
        // Chỉ hiển thị quiz có status PUBLISHED
        const publishedQuizzes = response.result.filter(quiz => quiz.status === 'PUBLISHED')
        setQuizzes(publishedQuizzes)
      } else {
        setError('Không thể tải danh sách quiz')
      }
    } catch (err: any) {
      console.error('Error loading public quizzes:', err)
      setError('Không thể kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  const loadSubjects = async () => {
    try {
      const response = await getPublicSubjects()
      if (response.code === 1000) {
        setTotalSubjects(response.result.length)
        console.log('Total subjects loaded:', response.result.length)
      }
    } catch (err: any) {
      console.error('Error loading subjects in PublicQuizHome:', err)
    }
  }

  const handleQuizClick = () => {
    setShowLoginModal(true)
  }

  const handleSubjectClick = () => {
    setShowLoginModal(true)
  }

  // Get unique subjects from quizzes
  const subjects = [...new Set(quizzes.map(quiz => quiz.subjectName))]

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || quiz.subjectName === selectedSubject
    return matchesSearch && matchesSubject
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 shadow-2xl relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full -translate-x-16 -translate-y-16 opacity-60 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full translate-x-12 -translate-y-12 opacity-70 animate-bounce"></div>
          <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-green-200 rounded-full -translate-y-10 opacity-50 animate-ping"></div>
          <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-blue-200 rounded-full -translate-y-8 opacity-60 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-red-200 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-purple-200 rounded-full opacity-50 animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-rounded text-rainbow mb-4 animate-heartbeat">
                📚 Quiz Linkverse
              </h1>
              <p className="text-xl lg:text-2xl font-animated text-glow mb-2 animate-fade-in">
                ✨ Khám phá và tham gia các bài quiz thú vị ✨
              </p>
              <p className="text-lg font-semibold text-gray-700 animate-slide-up">
                🎯 Học tập thông minh, vui vẻ và hiệu quả
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.href = '/login'}
                className="group relative px-8 py-4 gradient-pastel-pink text-white rounded-2xl font-rounded text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden btn-magic border-4 border-pink-300"
              >
                <div className="absolute inset-0 gradient-pastel-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <span className="mr-2 text-2xl animate-wiggle">🔐</span>
                  <span className="font-bold">Đăng nhập</span>
                  <span className="ml-2 text-xl group-hover:animate-bounce">→</span>
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
              
              <button
                onClick={() => window.location.href = '/register'}
                className="group relative px-8 py-4 gradient-pastel-blue text-white rounded-2xl font-rounded text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden btn-magic border-4 border-blue-300"
              >
                <div className="absolute inset-0 gradient-pastel-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <span className="mr-2 text-2xl animate-wiggle">✨</span>
                  <span className="font-bold">Đăng ký</span>
                  <span className="ml-2 text-xl group-hover:animate-bounce">🚀</span>
                </div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-6 h-6 bg-yellow-300 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-20 right-20 w-4 h-4 bg-pink-300 rounded-full animate-float-delayed opacity-70"></div>
        <div className="absolute bottom-10 left-20 w-8 h-8 bg-green-300 rounded-full animate-float-slow opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-blue-300 rounded-full animate-float-delayed-2 opacity-60"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject Grid */}
        <div className="mb-12">
          <SubjectGrid onSubjectClick={handleSubjectClick} />
        </div>
        {error ? (
          <div className="gradient-pastel-pink border-4 border-red-300 rounded-2xl p-6 text-center">
            <div className="text-red-600 text-lg font-rounded font-bold mb-2 animate-wiggle">⚠️ Lỗi tải dữ liệu</div>
            <p className="text-red-500 mb-4 font-semibold">{error}</p>
            <button
              onClick={loadPublicQuizzes}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-rounded font-bold hover:bg-red-600 transition-all duration-300 transform hover:scale-105 btn-magic border-2 border-red-400"
            >
              🔄 Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="gradient-pastel-blue rounded-2xl shadow-xl p-6 mb-8 border-4 border-blue-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Tìm kiếm quiz hoặc môn học..."
                    className="w-full px-4 py-3 border-4 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 font-rounded font-semibold text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="md:w-64">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-3 border-4 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 font-rounded font-semibold text-gray-700"
                    title="Lọc theo môn học"
                  >
                    <option value="all">📚 Tất cả môn học</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quiz Grid */}
            {filteredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <div 
                    key={quiz.id} 
                    onClick={handleQuizClick}
                    className="gradient-pastel-green rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-green-200 transform hover:scale-105 cursor-pointer"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-rounded font-bold text-gray-900 mb-2 line-clamp-2 animate-fade-in">
                            {quiz.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-rounded font-bold border-2 border-blue-300 animate-bounce">
                              {quiz.subjectName}
                            </span>
                            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-rounded font-bold border-2 border-green-300 animate-pulse">
                              {quiz.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-sm">Quiz ID: {quiz.id.slice(-8)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">
                            {quiz.hasNoTimeLimit ? 'Không giới hạn thời gian' : `${quiz.durationMinutes} phút`}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">
                            {quiz.questionCount > 0 ? `${quiz.questionCount} câu hỏi` : 'Chưa có câu hỏi'}
                          </span>
                        </div>
                        
                        {quiz.createdByFirstName && (
                          <div className="flex items-center text-gray-600">
                            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-sm">
                              Tạo bởi: {quiz.createdByFirstName} {quiz.createdByLastName || ''}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Trạng thái</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            quiz.status === 'PUBLISHED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {quiz.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy quiz nào</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedSubject !== 'all' 
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' 
                    : 'Hiện tại chưa có quiz nào được xuất bản'
                  }
                </p>
              </div>
            )}

            {/* Stats */}
            {quizzes.length > 0 && (
              <div className="mt-8 gradient-pastel-yellow rounded-2xl shadow-xl p-6 border-4 border-yellow-200">
                <h3 className="text-lg font-rounded font-bold text-gray-800 mb-4">📊 Thống kê</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center gradient-pastel-blue rounded-xl p-4 transform hover:scale-102 transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-600 font-rounded">{quizzes.length}</div>
                    <div className="text-sm text-gray-600 font-semibold">📚 Tổng số quiz</div>
                  </div>
                  <div className="text-center gradient-pastel-green rounded-xl p-4 transform hover:scale-102 transition-all duration-300">
                    <div className="text-2xl font-bold text-green-600 font-rounded">
                      {quizzes.filter(q => q.status === 'PUBLISHED').length}
                    </div>
                    <div className="text-sm text-gray-600 font-semibold">✅ Quiz đã xuất bản</div>
                  </div>
                  <div className="text-center gradient-pastel-purple rounded-xl p-4 transform hover:scale-102 transition-all duration-300">
                    <div className="text-2xl font-bold text-purple-600 font-rounded">{totalSubjects}</div>
                    <div className="text-sm text-gray-600 font-semibold">🎓 Môn học</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="gradient-pastel-purple text-white py-8 mt-12 border-t-4 border-purple-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-purple-100 font-rounded font-semibold animate-fade-in">© 2024 Quiz Linkverse. Đăng nhập để tham gia quiz và xem kết quả chi tiết.</p>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  )
}

export default PublicQuizHome
