import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isStudent } from '@/utils/apiTransform'
import { StudentNavigation } from '@/components/StudentNavigation'
import { 
  getAllQuizzes, 
  getMyQuizzes,
  getPublishedQuizzes,
  publishQuiz, 
  unpublishQuiz, 
  forkQuiz, 
  archiveQuiz, 
  QuizResponse 
} from '@/api/quizClient'

// Interface for the new API response
interface MyQuizResponse {
  id: string
  title: string
  subjectName: string
  durationMinutes: number
  hasNoTimeLimit: boolean
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  createdBy: string
  createdByFirstName: string
  createdByLastName: string
  questionCount: number
  numQuestionsHint: number
}

export default function StudentQuizManagement() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<MyQuizResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'status'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    setIsLoading(true)
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        console.error('No token found in localStorage')
        setQuizzes([])
        return
      }
      
      console.log('Using token:', token.substring(0, 20) + '...') // Log first 20 chars for debugging
      
      // Use the new API endpoint for my quizzes
      const response = await fetch('https://api.duongtech.me/api/v1/quiz/quizzes/my-quizzes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`Failed to fetch quizzes: ${response.status} ${errorText}`)
      }
      
      const data = await response.json()
      console.log('API Response data:', data)
      
      if (data.code === 1000 && data.result) {
        setQuizzes(data.result)
      } else {
        console.error('API returned error:', data)
        setQuizzes([])
      }
    } catch (error) {
      console.error('Error loading quizzes:', error)
      setQuizzes([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuizAction = async (action: string, quizId: string) => {
    try {
      switch (action) {
        case 'publish':
          await publishQuiz(quizId)
          break
        case 'unpublish':
          await unpublishQuiz(quizId)
          break
        case 'fork':
          const forkedQuiz = await forkQuiz(quizId)
          await loadQuizzes() // Reload danh sách quiz để cập nhật trạng thái
          alert(`Đã tạo bản sao quiz thành công: ${forkedQuiz.title}`)
          // Không navigate tự động để tránh lỗi 403
          return
        case 'archive':
          await archiveQuiz(quizId)
          break
        case 'delete':
          alert('Delete functionality not available yet')
          return
      }
      await loadQuizzes()
    } catch (error) {
      console.error(`Error ${action} quiz:`, error)
      alert(`Failed to ${action} quiz. Please try again.`)
    }
  }

  const filteredQuizzes = quizzes
    .filter(quiz => {
      if (filter !== 'all' && quiz.status !== filter.toUpperCase()) return false
      if (searchTerm && !quiz.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'createdAt':
          // Since we don't have createdAt in the new API, sort by title as fallback
          comparison = a.title.localeCompare(b.title)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        {/* Beautiful floating shapes with enhanced animations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-amber-200/30 rounded-full blur-xl animate-bounce" />
        
        <div className="text-center relative z-10">
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 w-32 h-32 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animate-reverse-slow"></div>
            <div className="absolute inset-4 w-24 h-24 border-4 border-transparent border-t-rose-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-bounce filter drop-shadow-lg animate-wiggle">📚</span>
            </div>
          </div>
          <h3 className="text-2xl font-rounded font-bold text-amber-700 mb-2 tracking-wide animate-heartbeat">🔄 Loading Your Quiz Universe</h3>
          <p className="text-lg text-amber-600 font-rounded font-bold animate-fade-in">✨ Preparing magical quizzes... ✨</p>
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300" />
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isStudent(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        {/* Beautiful floating shapes with enhanced animations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-amber-200/30 rounded-full blur-xl animate-bounce" />
        
        <div className="text-center relative z-10">
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-rose-300 animate-pulse">
              <span className="text-6xl filter drop-shadow-lg animate-wiggle">🚫</span>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-rounded font-bold text-rose-700 mb-4 tracking-wide animate-heartbeat">🚫 Access Denied</h1>
          <p className="text-xl text-rose-600 mb-8 font-rounded font-bold max-w-2xl mx-auto leading-relaxed animate-fade-in">
            ✨ You need student permissions to access this page ✨
          </p>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return '📝'
      case 'PUBLISHED': return '✅'
      case 'ARCHIVED': return '📦'
      default: return '❓'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'from-blue-400 to-cyan-400'
      case 'PUBLISHED': return 'from-emerald-400 to-green-400'
      case 'ARCHIVED': return 'from-gray-400 to-gray-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'from-blue-50 to-cyan-50'
      case 'PUBLISHED': return 'from-emerald-50 to-green-50'
      case 'ARCHIVED': return 'from-gray-50 to-gray-100'
      default: return 'from-gray-50 to-gray-100'
    }
  }

  return (
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
      
      <StudentNavigation />
      
      {/* Beautiful Header with enhanced styling */}
      <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 shadow-2xl border-b-4 border-pink-300 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full -translate-x-16 -translate-y-16 opacity-60 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full translate-x-12 -translate-y-12 opacity-70 animate-bounce"></div>
          <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-green-200 rounded-full -translate-y-10 opacity-50 animate-ping"></div>
          <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-blue-200 rounded-full -translate-y-8 opacity-60 animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="group relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-500 group-hover:rotate-6 border-4 border-amber-300 animate-heartbeat btn-magic">
                  <span className="text-2xl group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">📚</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500"></div>
              </div>
              <div>
                <h1 className="text-3xl font-rounded font-bold text-rainbow tracking-tight animate-heartbeat">
                  🎓 Manage Quizzes
                </h1>
                <p className="text-lg text-amber-700 font-rounded font-bold flex items-center space-x-2 animate-fade-in">
                  <span className="text-xl animate-bounce filter drop-shadow-md">✨</span>
                  <span className="tracking-wide">🌟 Create, edit, and manage your quiz collection 🌟</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/student/create-quiz')}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white px-8 py-4 rounded-xl font-rounded font-bold text-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl border-4 border-emerald-300 hover:border-emerald-400 btn-magic"
            >
              <span className="relative z-10 flex items-center space-x-3">
                <span className="text-2xl group-hover:rotate-180 transition-transform duration-500 animate-wiggle">🎯</span>
                <span className="tracking-wide">Create New Quiz</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">✨</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="gradient-pastel-blue border-4 border-blue-300 rounded-3xl shadow-2xl p-8 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="🔍 Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-8 py-5 pl-16 border-4 border-blue-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 transition-all duration-500 text-lg font-rounded font-bold bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                />
                <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl animate-wiggle">🔍</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-0 group-focus-within:opacity-10 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'all', label: 'All', icon: '📚', color: 'from-amber-400 to-orange-400' },
                { value: 'draft', label: 'Drafts', icon: '📝', color: 'from-blue-400 to-cyan-400' },
                { value: 'published', label: 'Published', icon: '✅', color: 'from-emerald-400 to-green-400' },
                { value: 'archived', label: 'Archived', icon: '📦', color: 'from-gray-400 to-gray-500' }
              ].map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value as any)}
                  className={`group relative overflow-hidden px-6 py-4 rounded-2xl font-rounded font-bold transition-all duration-500 transform hover:scale-105 flex items-center space-x-3 border-4 ${
                    filter === filterOption.value
                      ? `bg-gradient-to-r ${filterOption.color} text-white shadow-xl border-transparent`
                      : 'bg-white/90 border-blue-300 text-gray-700 hover:border-blue-400 hover:shadow-lg'
                  }`}
                >
                  <span className="text-lg group-hover:animate-bounce animate-wiggle">{filterOption.icon}</span>
                  <span className="tracking-wide">{filterOption.label}</span>
                  {filter === filterOption.value && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-6 py-4 border-4 border-blue-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 transition-all duration-500 font-rounded font-bold bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Sort quizzes by"
                aria-label="Sort quizzes by"
              >
                <option value="title">📝 Sort by Title</option>
                <option value="createdAt">📅 Sort by Date</option>
                <option value="status">🏷️ Sort by Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-rounded font-bold transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl border-4 border-purple-300 hover:border-purple-400 btn-magic flex items-center space-x-3"
              >
                <span className="text-lg group-hover:rotate-180 transition-transform duration-500 animate-wiggle">
                  {sortOrder === 'asc' ? '⬆️' : '⬇️'}
                </span>
                <span className="tracking-wide">{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
                <span className="text-base group-hover:translate-x-1 transition-transform duration-300">✨</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 w-32 h-32 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animate-reverse-slow"></div>
              <div className="absolute inset-4 w-24 h-24 border-4 border-transparent border-t-rose-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl animate-bounce filter drop-shadow-lg animate-wiggle">📚</span>
              </div>
            </div>
            <h3 className="text-2xl font-rounded font-bold text-amber-700 mb-2 tracking-wide animate-heartbeat">🔄 Loading Quizzes...</h3>
            <p className="text-lg text-amber-600 font-rounded font-bold animate-fade-in">✨ Preparing your quiz collection... ✨</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-amber-300 animate-pulse">
                <span className="text-6xl filter drop-shadow-lg animate-wiggle">📚</span>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
            </div>
            <h3 className="text-4xl font-rounded font-bold text-amber-700 mb-4 tracking-wide animate-heartbeat">🌟 No Quizzes Found</h3>
            <p className="text-xl text-amber-600 mb-8 font-rounded font-bold max-w-2xl mx-auto leading-relaxed animate-fade-in">
              ✨ {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first quiz to get started'
              } ✨
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => navigate('/student/create-quiz')}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white px-10 py-5 rounded-full font-rounded font-bold text-xl transition-all duration-700 transform hover:scale-110 shadow-2xl hover:shadow-3xl border-4 border-emerald-300 hover:border-emerald-400 btn-magic"
              >
                <span className="relative z-10 flex items-center space-x-4">
                  <span className="text-3xl group-hover:rotate-180 transition-transform duration-700 animate-wiggle">🎯</span>
                  <span className="tracking-wide">Create Your First Quiz</span>
                  <span className="text-2xl group-hover:translate-x-2 transition-transform duration-500">✨</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-40 blur-2xl transition-all duration-700"></div>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => {
              const quizIcons = ['🧮', '🔬', '📚', '🎨', '🌍', '💻', '🧪', '📐', '🎵', '🏛️', '⚗️', '📊']
              const icon = quizIcons[index % quizIcons.length]
              const colors = [
                'from-amber-200 to-orange-200 border-amber-300 hover:border-amber-400',
                'from-rose-200 to-pink-200 border-rose-300 hover:border-rose-400', 
                'from-emerald-200 to-teal-200 border-emerald-300 hover:border-emerald-400',
                'from-violet-200 to-purple-200 border-violet-300 hover:border-violet-400',
                'from-cyan-200 to-blue-200 border-cyan-300 hover:border-cyan-400',
                'from-lime-200 to-green-200 border-lime-300 hover:border-lime-400'
              ]
              const colorClass = colors[index % colors.length]
              
              return (
                <div
                  key={quiz.id}
                  className={`group relative bg-gradient-to-br ${colorClass} backdrop-blur-sm rounded-2xl shadow-lg p-6 border-4 transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:-rotate-1 hover-lift animate-fade-in-up overflow-hidden`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                  <div className="relative">
                    <div className={`h-4 bg-gradient-to-r ${getStatusColor(quiz.status)} rounded-t-2xl mb-4`}></div>
                    {/* Quiz Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 btn-magic animate-float`}>
                        <span className="text-lg group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-rounded font-bold text-gray-900 group-hover:text-rainbow transition-all duration-300 tracking-wide truncate animate-fade-in">
                          {quiz.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br ${getStatusColor(quiz.status)}`}>
                            <span className="text-xs">{getStatusIcon(quiz.status)}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-rounded font-bold rounded-full bg-gradient-to-r ${getStatusBgColor(quiz.status)} text-gray-700 animate-fade-in`}>
                            {quiz.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quiz Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full flex items-center justify-center animate-float">
                          <span className="text-white text-xs animate-wiggle">📖</span>
                        </span>
                        <span className="text-sm font-rounded font-bold text-gray-700 animate-fade-in">{quiz.subjectName || 'General'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full flex items-center justify-center animate-float-delayed">
                          <span className="text-white text-xs animate-wiggle">💭</span>
                        </span>
                        <span className="text-sm font-rounded font-bold text-gray-700 animate-fade-in">{quiz.questionCount} questions</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center animate-float-slow">
                          <span className="text-white text-xs animate-wiggle">⏰</span>
                        </span>
                        <span className="text-sm font-rounded font-bold text-gray-700 animate-fade-in">
                          {quiz.durationMinutes ? `${quiz.durationMinutes} min` : 'No time limit'}
                        </span>
                      </div>

                      {/* Note: submissions property not available in current QuizResponse type */}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate(`/student/quiz/${quiz.id}/edit`)}
                        className="group relative bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded-xl font-rounded font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-blue-300 hover:border-blue-400 flex items-center justify-center space-x-2 min-h-[48px]"
                      >
                        <span className="text-lg group-hover:rotate-12 transition-transform duration-300">✏️</span>
                        <span className="text-sm font-bold">Edit</span>
                      </button>
                      
                      {quiz.status === 'DRAFT' && (
                        <button
                          onClick={() => handleQuizAction('publish', quiz.id)}
                          className="group relative bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-500 hover:to-green-500 text-white px-4 py-3 rounded-xl font-rounded font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-emerald-300 hover:border-emerald-400 flex items-center justify-center space-x-2 min-h-[48px]"
                        >
                          <span className="text-lg group-hover:rotate-12 transition-transform duration-300">📢</span>
                          <span className="text-sm font-bold">Publish</span>
                        </button>
                      )}
                      
                      {quiz.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleQuizAction('unpublish', quiz.id)}
                          className="group relative bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white px-4 py-3 rounded-xl font-rounded font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-yellow-300 hover:border-yellow-400 flex items-center justify-center space-x-2 min-h-[48px]"
                        >
                          <span className="text-lg group-hover:rotate-12 transition-transform duration-300">✏️</span>
                          <span className="text-sm font-bold">Unpublish</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleQuizAction('fork', quiz.id)}
                        className="group relative bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-3 rounded-xl font-rounded font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-purple-300 hover:border-purple-400 flex items-center justify-center space-x-2 min-h-[48px]"
                      >
                        <span className="text-lg group-hover:rotate-12 transition-transform duration-300">🔄</span>
                        <span className="text-sm font-bold">Fork</span>
                      </button>
                      
                      <button
                        onClick={() => handleQuizAction('archive', quiz.id)}
                        className="group relative bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-3 rounded-xl font-rounded font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center space-x-2 min-h-[48px]"
                      >
                        <span className="text-lg group-hover:rotate-12 transition-transform duration-300">📦</span>
                        <span className="text-sm font-bold">Archive</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
