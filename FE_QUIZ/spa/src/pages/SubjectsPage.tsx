import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getAllSubjects, SubjectResponse } from '@/api/types'
import SubjectCard from '@/components/SubjectCard'
import { RoleGuard } from '@/components/RoleGuard'
import { getPrimaryRole } from '@/utils/apiTransform'

const SubjectsPage: React.FC = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<SubjectResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('🔄 Fetching subjects...')
        
        const subjectsData = await getAllSubjects()
        console.log('✅ Subjects fetched:', subjectsData)
        setSubjects(subjectsData)
      } catch (err) {
        console.error('❌ Error fetching subjects:', err)
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách môn học')
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading) {
      fetchSubjects()
    }
  }, [loading])

  const handleSubjectClick = (subject: SubjectResponse) => {
    console.log('🎯 Subject clicked:', subject)
    const userRole = getPrimaryRole(user)
    console.log('👤 User role:', userRole)
    
    // Check if user is ROLE_USER and show permission modal
    if (userRole === 'ROLE_USER') {
      console.log('🔒 Showing permission modal for ROLE_USER')
      setShowPermissionModal(true)
      return
    }
    
    // Navigate to quizzes for this subject for other roles
    console.log('✅ Navigating to subject quizzes for role:', userRole)
    navigate(`/quiz/subjects/${subject.id}`)
  }

  const handleBackToHome = () => {
    navigate('/quiz')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-300 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-reverse-slow"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard user={user} requireRoles={['ROLE_USER', 'ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN']}>
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFF9F3 0%, #FFF6ED 50%, #FEF3E7 100%)'
        }}
      >
        {/* Beautiful floating shapes */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-pink-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-rose-200/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-1/3 w-36 h-36 bg-amber-200/20 rounded-full blur-2xl animate-bounce" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-indigo-200/20 rounded-full blur-xl animate-ping" />
        {/* Beautiful Header */}
        <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleBackToHome}
                  className="group flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-all duration-300"
                >
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <span className="font-medium font-['Inter']">Trở về</span>
                </button>
                
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #FF6B9D, #C44569)',
                      boxShadow: '0 8px 32px rgba(255, 107, 157, 0.3)'
                    }}
                  >
                    <span className="text-white text-xl">📚</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-['Inter']">
                      Môn học
                    </h1>
                    <p className="text-sm text-gray-600 font-['Inter']">Chọn môn học để bắt đầu</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Xin chào, <span className="font-medium text-gray-900">{user?.firstName || 'User'}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Beautiful Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          {/* Beautiful Title Section */}
          <div className="text-center mb-16">
            <div className="inline-block">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 font-['Inter'] tracking-tight">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Khám phá môn học
                </span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-['Inter'] mb-8">
              Chọn môn học yêu thích và bắt đầu hành trình học tập đầy thú vị
            </p>
            
            {/* Beautiful decorative elements */}
            <div className="flex justify-center space-x-4 mb-8">
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-100" />
              <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse delay-200" />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 mx-auto mb-4"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-300 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-reverse-slow"></div>
                </div>
                <p className="text-gray-600 text-lg font-medium">Đang tải môn học...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải môn học</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Subjects Grid */}
          {!isLoading && !error && (
            <>
              {subjects.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">📚</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có môn học nào</h3>
                    <p className="text-gray-600 mb-6">Hiện tại chưa có môn học nào được tạo. Vui lòng quay lại sau.</p>
                    <button
                      onClick={handleBackToHome}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Trở về trang chủ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {subjects.map((subject, index) => (
                    <div
                      key={subject.id}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <SubjectCard
                        subject={subject}
                        onClick={handleSubjectClick}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Stats Section */}
          {!isLoading && !error && subjects.length > 0 && (
            <div className="mt-16 text-center">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">
                  {subjects.length} môn học có sẵn
                </span>
              </div>
            </div>
          )}
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-20">
          <button
            onClick={handleBackToHome}
            title="Trở về trang chủ"
            className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          >
            <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Permission Modal for ROLE_USER */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-amber-300 p-8 max-w-md mx-4 animate-slide-up">
            {/* Beautiful Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-heartbeat">
                <span className="text-4xl animate-wiggle">🔒</span>
              </div>
              <h3 className="text-2xl font-rounded font-bold text-rainbow mb-2 animate-heartbeat">
                🚫 Cần nâng quyền hạn
              </h3>
              <p className="text-gray-600 font-rounded font-semibold animate-fade-in">
                Để truy cập các môn học, bạn cần nâng cấp tài khoản
              </p>
            </div>

            {/* Beautiful Content */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6 border-2 border-amber-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <h4 className="font-rounded font-bold text-amber-800">Liên hệ Admin</h4>
                  <p className="text-sm text-gray-600 font-rounded">Để được nâng cấp tài khoản</p>
                </div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border-2 border-amber-300">
                <p className="font-rounded font-bold text-gray-800 text-center">
                  📧 Email: <span className="text-amber-600">admin@yopmail.com</span>
                </p>
              </div>
            </div>

            {/* Beautiful Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="flex-1 group relative px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-rounded font-bold hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105 btn-magic border-2 border-gray-300"
              >
                <span className="mr-2 animate-wiggle">❌</span>
                <span>Đóng</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('admin@yopmail.com')
                  setShowPermissionModal(false)
                }}
                className="flex-1 group relative px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-rounded font-bold hover:from-amber-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 btn-magic border-2 border-amber-300"
              >
                <span className="mr-2 animate-wiggle">📋</span>
                <span>Sao chép Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleGuard>
  )
}

export default SubjectsPage
