import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { transformApiUserProfile } from '@/utils/apiTransform'
import { getPrimaryRole, isTeacher, isAdmin, isStudent } from '@/utils/apiTransform'
import RoleBasedRedirect from '@/components/RoleBasedRedirect'
import { getAllSubjects, SubjectResponse } from '@/api/types'
import { getAllQuizzes, QuizResponse } from '@/api/quizClient'
import SubjectCard from '@/components/SubjectCard'
import QuizCard from '@/components/QuizCard'

export default function QuizHome() {
  const { user: authUser, loading } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [subjects, setSubjects] = useState<SubjectResponse[]>([])
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false)
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([])
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false)
  const [quizzesError, setQuizzesError] = useState<string | null>(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!authUser) {
        console.log('❌ QuizHome: No user found, redirecting to login')
        navigate('/login')
        return
      }

      console.log('✅ QuizHome: User found:', authUser)
      
      // Set user info for display
      let displayFullName = 'Người dùng'
      if (authUser.firstName || authUser.lastName) {
        displayFullName = `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim()
      } else if (authUser.email) {
        displayFullName = authUser.email
      }
        
      setUser({
        name: displayFullName,
        email: authUser.email || 'user@example.com',
        role: getPrimaryRole(authUser)
      })

      // Redirect ROLE_STUDENT to student dashboard
      if (getPrimaryRole(authUser) === 'ROLE_STUDENT') {
        console.log('🎓 ROLE_STUDENT detected, redirecting to student dashboard')
        navigate('/student/dashboard')
        return
      }

      // Fetch subjects and quizzes for ROLE_USER
      if (getPrimaryRole(authUser) === 'ROLE_USER') {
        fetchSubjects()
        fetchQuizzes()
      }
    }
  }, [authUser, loading, navigate])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_expiry')
    navigate('/login')
  }

  const handleStartQuiz = () => {
    // TODO: Navigate to quiz selection or start quiz
    console.log('Starting quiz...')
  }

  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true)
      setSubjectsError(null)
      console.log('🔄 Fetching subjects for user...')
      
      // Check if user has valid token before making API call
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token found. Please login first.')
      }
      
      const subjectsData = await getAllSubjects()
      console.log('✅ Subjects fetched:', subjectsData)
      setSubjects(subjectsData)
    } catch (err) {
      console.error('❌ Error fetching subjects:', err)
      setSubjectsError(err instanceof Error ? err.message : 'Không thể tải danh sách môn học')
    } finally {
      setIsLoadingSubjects(false)
    }
  }

  const fetchQuizzes = async () => {
    try {
      setIsLoadingQuizzes(true)
      setQuizzesError(null)
      console.log('🔄 Fetching published quizzes for user...')
      
      // Check if user has valid token before making API call
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token found. Please login first.')
      }
      
      const quizzesData = await getAllQuizzes()
      console.log('✅ Quizzes fetched:', quizzesData)
      
      // Filter only PUBLISHED quizzes
      const publishedQuizzes = quizzesData.filter(quiz => quiz.status === 'PUBLISHED')
      setQuizzes(publishedQuizzes)
    } catch (err) {
      console.error('❌ Error fetching quizzes:', err)
      setQuizzesError(err instanceof Error ? err.message : 'Không thể tải danh sách đề thi')
    } finally {
      setIsLoadingQuizzes(false)
    }
  }

  const handleSubjectClick = (subject: SubjectResponse) => {
    console.log('🎯 Subject clicked:', subject)
    
    // Check if user is ROLE_USER and show permission modal
    if (user?.role === 'ROLE_USER') {
      setShowPermissionModal(true)
      return
    }
    
    // Navigate to quizzes for this subject for other roles
    navigate(`/quiz/subjects/${subject.id}`)
  }

  const handleQuizClick = (quiz: QuizResponse) => {
    console.log('🎯 Quiz clicked:', quiz)
    
    // Check if user is ROLE_USER and show permission modal
    if (user?.role === 'ROLE_USER') {
      setShowPermissionModal(true)
      return
    }
    
    // Navigate to quiz for other roles
    navigate(`/student/quiz-taking?quizId=${quiz.id}`)
  }

  const handleViewAllSubjects = () => {
    navigate('/quiz/subjects')
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
    <RoleBasedRedirect>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Beautiful floating shapes with enhanced animations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-amber-200/30 rounded-full blur-xl animate-bounce" />
        
        {/* Additional floating elements */}
        <div className="absolute top-10 left-1/3 w-6 h-6 bg-yellow-300 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-20 right-1/3 w-4 h-4 bg-pink-300 rounded-full animate-float-delayed opacity-70"></div>
        <div className="absolute bottom-10 left-20 w-8 h-8 bg-green-300 rounded-full animate-float-slow opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-blue-300 rounded-full animate-float-delayed-2 opacity-60"></div>
      {/* Beautiful Header with enhanced styling */}
      <header className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 shadow-2xl border-b-4 border-pink-300 sticky top-0 z-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full -translate-x-16 -translate-y-16 opacity-60 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full translate-x-12 -translate-y-12 opacity-70 animate-bounce"></div>
          <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-green-200 rounded-full -translate-y-10 opacity-50 animate-ping"></div>
          <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-blue-200 rounded-full -translate-y-8 opacity-60 animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg animate-heartbeat"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B9D, #C44569)',
                    boxShadow: '0 8px 32px rgba(255, 107, 157, 0.3)'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-rounded font-bold text-rainbow animate-heartbeat">
                  📚 Quiz Linkverse
                </h1>
                <p className="text-sm text-gray-600 font-rounded font-semibold animate-fade-in">✨ Khám phá kiến thức ✨</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700 font-rounded font-semibold">
                Xin chào, <span className="font-bold text-rainbow">{user?.name || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="group relative px-6 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl font-rounded font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden btn-magic border-4 border-red-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <span className="mr-2 text-xl animate-wiggle">🚪</span>
                  <span className="font-bold">Đăng xuất</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Beautiful Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block">
            <h1 className="text-5xl md:text-6xl font-rounded font-bold mb-6 tracking-tight animate-fade-in">
              <span className="text-rainbow animate-heartbeat">
                🎓 Chào mừng đến với
              </span>
              <br />
              <span className="text-rainbow animate-heartbeat">
                📚 Quiz Linkverse! ✨
              </span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 font-rounded font-semibold leading-relaxed max-w-3xl mx-auto animate-slide-up">
            🚀 Hãy bắt đầu hành trình học tập và khám phá kiến thức của bạn với những bài quiz thú vị 🚀
          </p>
          
          {/* Beautiful decorative elements */}
          <div className="flex justify-center space-x-4 mb-8">
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse" />
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-100" />
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse delay-200" />
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse delay-300" />
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-500" />
          </div>
        </div>
          
          {/* Beautiful Subjects Section for ROLE_USER */}
          {(user?.role === 'ROLE_USER' || user?.role === 'ROLE_STUDENT') && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-rounded font-bold text-rainbow mb-2 animate-heartbeat">
                    🎓 Môn học có sẵn
                  </h2>
                  <p className="text-gray-600 font-rounded font-semibold animate-fade-in">✨ Chọn môn học yêu thích để bắt đầu ✨</p>
                </div>
                <button
                  onClick={handleViewAllSubjects}
                  className="group relative flex items-center space-x-3 gradient-pastel-blue text-gray-700 px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-500 transform hover:scale-105 border-4 border-blue-300 btn-magic"
                >
                  <span className="font-rounded font-bold">📚 Xem tất cả</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Beautiful Loading State */}
              {isLoadingSubjects && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="relative mb-8">
                      <div className="w-16 h-16 border-4 border-pink-200 rounded-full animate-spin"></div>
                      <div className="w-16 h-16 border-4 border-purple-300 rounded-full animate-spin absolute top-0 left-0 animate-reverse-slow"></div>
                      <div className="w-16 h-16 border-4 border-indigo-400 rounded-full animate-spin absolute top-0 left-0 animate-pulse"></div>
                    </div>
                    <p className="text-xl text-gray-600 font-rounded font-bold animate-fade-in">🔄 Đang tải môn học...</p>
                    <div className="flex justify-center space-x-2 mt-4">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error loading subjects */}
              {subjectsError && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center max-w-md gradient-pastel-pink border-4 border-red-300 rounded-2xl p-8">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 animate-wiggle">
                      <span className="text-4xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-rounded font-bold text-red-600 mb-2 animate-heartbeat">Không thể tải môn học</h3>
                    <p className="text-gray-600 mb-4 font-rounded font-semibold">{subjectsError}</p>
                    <button
                      onClick={fetchSubjects}
                      className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-rounded font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 btn-magic border-2 border-red-400"
                    >
                      <span className="mr-2 animate-wiggle">🔄</span>
                      <span>Thử lại</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Subjects grid */}
              {!isLoadingSubjects && !subjectsError && (
                <>
                  {subjects.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center max-w-md gradient-pastel-yellow border-4 border-yellow-300 rounded-2xl p-8">
                        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
                          <span className="text-4xl animate-wiggle">📚</span>
                        </div>
                        <h3 className="text-xl font-rounded font-bold text-yellow-600 mb-2 animate-heartbeat">Chưa có môn học nào</h3>
                        <p className="text-gray-600 mb-6 font-rounded font-semibold">Hiện tại chưa có môn học nào được tạo. Vui lòng quay lại sau.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {subjects.slice(0, 8).map((subject, index) => (
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
            </div>
          )}

          {/* Published Quizzes Section for ROLE_USER */}
          {user?.role === 'ROLE_USER' && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-rounded font-bold text-rainbow mb-2 animate-heartbeat">
                    📝 Đề thi có sẵn
                  </h2>
                  <p className="text-gray-600 font-rounded font-semibold animate-fade-in">✨ Xem các đề thi đã được xuất bản ✨</p>
                </div>
              </div>

              {/* Beautiful Loading State */}
              {isLoadingQuizzes && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="relative mb-8">
                      <div className="w-16 h-16 border-4 border-pink-200 rounded-full animate-spin"></div>
                      <div className="w-16 h-16 border-4 border-purple-300 rounded-full animate-spin absolute top-0 left-0 animate-reverse-slow"></div>
                      <div className="w-16 h-16 border-4 border-indigo-400 rounded-full animate-spin absolute top-0 left-0 animate-pulse"></div>
                    </div>
                    <p className="text-xl text-gray-600 font-rounded font-bold animate-fade-in">🔄 Đang tải đề thi...</p>
                    <div className="flex justify-center space-x-2 mt-4">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error loading quizzes */}
              {quizzesError && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center max-w-md gradient-pastel-pink border-4 border-red-300 rounded-2xl p-8">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 animate-wiggle">
                      <span className="text-4xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-rounded font-bold text-red-600 mb-2 animate-heartbeat">Không thể tải đề thi</h3>
                    <p className="text-gray-600 mb-4 font-rounded font-semibold">{quizzesError}</p>
                    <button
                      onClick={fetchQuizzes}
                      className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-rounded font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 btn-magic border-2 border-red-400"
                    >
                      <span className="mr-2 animate-wiggle">🔄</span>
                      <span>Thử lại</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quizzes grid */}
              {!isLoadingQuizzes && !quizzesError && (
                <>
                  {quizzes.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center max-w-md gradient-pastel-yellow border-4 border-yellow-300 rounded-2xl p-8">
                        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
                          <span className="text-4xl animate-wiggle">📝</span>
                        </div>
                        <h3 className="text-xl font-rounded font-bold text-yellow-600 mb-2 animate-heartbeat">Chưa có đề thi nào</h3>
                        <p className="text-gray-600 mb-6 font-rounded font-semibold">Hiện tại chưa có đề thi nào được xuất bản. Vui lòng quay lại sau.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {quizzes.slice(0, 8).map((quiz, index) => (
                        <QuizCard
                          key={quiz.id}
                          quiz={quiz}
                          onClick={handleQuizClick}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Default categories for other roles */}
          {(user?.role !== 'ROLE_USER' && user?.role !== 'ROLE_STUDENT') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {/* Quiz Categories */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🧮</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Toán học</h3>
                <p className="text-gray-600 mb-6 text-center">Kiểm tra kiến thức toán học của bạn</p>
                <button
                  onClick={handleStartQuiz}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-6 rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                >
                  Bắt đầu
                </button>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📜</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Lịch sử</h3>
                <p className="text-gray-600 mb-6 text-center">Khám phá lịch sử thế giới</p>
                <button
                  onClick={handleStartQuiz}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                >
                  Bắt đầu
                </button>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🔬</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Khoa học</h3>
                <p className="text-gray-600 mb-6 text-center">Tìm hiểu về khoa học tự nhiên</p>
                <button
                  onClick={handleStartQuiz}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 px-6 rounded-full hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
                >
                  Bắt đầu
                </button>
              </div>
            </div>
          )}

        </main>
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
    </RoleBasedRedirect>
  )
}
