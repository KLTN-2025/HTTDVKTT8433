import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { RoleGuard } from '@/components/RoleGuard'
import { UserProfile } from '@/types/auth'
import { isTeacher } from '@/utils/apiTransform'
import { TeacherNavigation } from '@/components/TeacherNavigation'
import DocumentImportQuiz from '@/components/DocumentImportQuiz'
import { 
  getAllQuizzes, 
  getMyQuizzes,
  getAllSubjects, 
  publishQuiz,
  unpublishQuiz,
  forkQuiz,
  archiveQuiz,
  QuizResponse, 
  SubjectResponse 
} from '@/api/quizClient'

interface Quiz {
  id: string
  title: string
  subject: string
  subjectId: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  questionCount: number
  submissions: number
  averageScore: number
  durationMinutes: number
  hasNoTimeLimit: boolean
  createdAt: string
  lastModified: string
  createdBy: string
  createdByFirstName: string
  createdByLastName: string
}

interface Subject {
  id: string
  name: string
  description?: string
}

export default function TeacherQuizManagement() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDocumentImport, setShowDocumentImport] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Mock data - sẽ thay thế bằng API calls (fallback)
  const mockQuizzes: Quiz[] = [
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      subject: 'Programming',
      subjectId: 'sub-1',
      status: 'PUBLISHED',
      questionCount: 15,
      submissions: 23,
      averageScore: 82.5,
      durationMinutes: 30,
      hasNoTimeLimit: false,
      createdAt: '2024-01-15',
      lastModified: '2024-01-20',
      createdBy: 'teacher-1',
      createdByFirstName: 'John',
      createdByLastName: 'Doe'
    },
    {
      id: '2',
      title: 'React Hooks Quiz',
      subject: 'Web Development',
      subjectId: 'sub-2',
      status: 'DRAFT',
      questionCount: 12,
      submissions: 0,
      averageScore: 0,
      durationMinutes: 25,
      hasNoTimeLimit: false,
      createdAt: '2024-01-18',
      lastModified: '2024-01-19',
      createdBy: 'teacher-1',
      createdByFirstName: 'John',
      createdByLastName: 'Doe'
    },
    {
      id: '3',
      title: 'Python Basics',
      subject: 'Programming',
      subjectId: 'sub-1',
      status: 'PUBLISHED',
      questionCount: 20,
      submissions: 45,
      averageScore: 75.2,
      durationMinutes: 45,
      hasNoTimeLimit: false,
      createdAt: '2024-01-10',
      lastModified: '2024-01-15',
      createdBy: 'teacher-1',
      createdByFirstName: 'John',
      createdByLastName: 'Doe'
    }
  ]

  const mockSubjects: Subject[] = [
    { id: 'sub-1', name: 'Programming', description: 'Programming languages and concepts' },
    { id: 'sub-2', name: 'Web Development', description: 'Frontend and backend development' },
    { id: 'sub-3', name: 'Database', description: 'Database design and management' }
  ]

  const loadData = async () => {
    setIsLoading(true)
    try {
      console.log('Loading quizzes and subjects from API...')
      
      // Load quizzes and subjects from API
      const [quizzesData, subjectsData] = await Promise.all([
        getMyQuizzes().catch(error => {
          console.error('Error loading my quizzes:', error)
          return mockQuizzes // Fallback to mock data
        }),
        getAllSubjects().catch(error => {
          console.error('Error loading subjects:', error)
          return mockSubjects // Fallback to mock data
        })
      ])
      
      console.log('Loaded quizzes:', quizzesData)
      console.log('Loaded subjects:', subjectsData)
      
      // Transform API data to match component interface
      const transformedQuizzes: Quiz[] = (quizzesData as QuizResponse[]).map((quiz: QuizResponse) => ({
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subjectName,
        subjectId: quiz.subjectName, // Using subjectName as ID for now
        status: quiz.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        questionCount: quiz.questionCount,
        submissions: 0, // Not available in API yet
        averageScore: 0, // Not available in API yet
        durationMinutes: quiz.durationMinutes,
        hasNoTimeLimit: quiz.hasNoTimeLimit,
        createdAt: quiz.createdAt || new Date().toISOString(),
        lastModified: quiz.updatedAt || new Date().toISOString(),
        createdBy: quiz.createdBy,
        createdByFirstName: quiz.createdByFirstName || '',
        createdByLastName: quiz.createdByLastName || ''
      }))
      
      setQuizzes(transformedQuizzes)
      setSubjects(subjectsData as Subject[])
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to mock data
      setQuizzes(mockQuizzes)
      setSubjects(mockSubjects)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePublishQuiz = async (quizId: string) => {
    setActionLoading(quizId)
    try {
      await publishQuiz(quizId)
      await loadData() // Reload data
    } catch (error) {
      console.error('Error publishing quiz:', error)
      alert('Không thể xuất bản quiz. Vui lòng thử lại.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnpublishQuiz = async (quizId: string) => {
    setActionLoading(quizId)
    try {
      await unpublishQuiz(quizId)
      await loadData() // Reload data
    } catch (error) {
      console.error('Error unpublishing quiz:', error)
      alert('Không thể hủy xuất bản quiz. Vui lòng thử lại.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleForkQuiz = async (quizId: string) => {
    setActionLoading(quizId)
    try {
      const forkedQuiz = await forkQuiz(quizId)
      await loadData() // Reload data
      alert(`Đã tạo bản sao quiz: ${forkedQuiz.title}`)
    } catch (error) {
      console.error('Error forking quiz:', error)
      alert('Không thể tạo bản sao quiz. Vui lòng thử lại.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleArchiveQuiz = async (quizId: string) => {
    if (!confirm('Bạn có chắc chắn muốn lưu trữ quiz này?')) return
    
    setActionLoading(quizId)
    try {
      await archiveQuiz(quizId)
      await loadData() // Reload data
    } catch (error) {
      console.error('Error archiving quiz:', error)
      alert('Không thể lưu trữ quiz. Vui lòng thử lại.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isTeacher(user)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
          <p className="text-gray-600">You need teacher permissions to access this page.</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-lg'
      case 'DRAFT':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300 shadow-lg'
      case 'ARCHIVED':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300 shadow-lg'
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300 shadow-lg'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return '🚀'
      case 'DRAFT':
        return '✏️'
      case 'ARCHIVED':
        return '📦'
      default:
        return '💭'
    }
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = !selectedSubject || quiz.subjectId === selectedSubject
    const matchesStatus = !selectedStatus || quiz.status === selectedStatus
    return matchesSearch && matchesSubject && matchesStatus
  })

  const handlePublish = async (quizId: string) => {
    try {
      // TODO: Implement publish API call
      console.log('Publishing quiz:', quizId)
      // Update local state
      setQuizzes(quizzes.map(quiz => 
        quiz.id === quizId ? { ...quiz, status: 'PUBLISHED' as const } : quiz
      ))
    } catch (error) {
      console.error('Error publishing quiz:', error)
    }
  }

  const handleUnpublish = async (quizId: string) => {
    try {
      // TODO: Implement unpublish API call
      console.log('Unpublishing quiz:', quizId)
      // Update local state
      setQuizzes(quizzes.map(quiz => 
        quiz.id === quizId ? { ...quiz, status: 'DRAFT' as const } : quiz
      ))
    } catch (error) {
      console.error('Error unpublishing quiz:', error)
    }
  }

  const handleFork = async (quizId: string) => {
    try {
      // TODO: Implement fork API call
      console.log('Forking quiz:', quizId)
      // Add new quiz to list
      const originalQuiz = quizzes.find(q => q.id === quizId)
      if (originalQuiz) {
        const forkedQuiz: Quiz = {
          ...originalQuiz,
          id: `forked-${Date.now()}`,
          title: `${originalQuiz.title} (Copy)`,
          status: 'DRAFT',
          submissions: 0,
          averageScore: 0,
          createdAt: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0]
        }
        setQuizzes([forkedQuiz, ...quizzes])
      }
    } catch (error) {
      console.error('Error forking quiz:', error)
    }
  }

  const handleArchive = async (quizId: string) => {
    try {
      // TODO: Implement archive API call
      console.log('Archiving quiz:', quizId)
      // Update local state
      setQuizzes(quizzes.map(quiz => 
        quiz.id === quizId ? { ...quiz, status: 'ARCHIVED' as const } : quiz
      ))
    } catch (error) {
      console.error('Error archiving quiz:', error)
    }
  }

  const handleDelete = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return
    }
    
    try {
      // TODO: Implement delete API call
      console.log('Deleting quiz:', quizId)
      // Remove from local state
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId))
    } catch (error) {
      console.error('Error deleting quiz:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-reverse-slow"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Navigation */}
      <TeacherNavigation />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b-2 border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                📖 Quiz Management
              </h1>
              <p className="text-gray-600 text-lg">Create, edit, and manage your quizzes with style</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="group relative bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 mr-4"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <span className="text-xl">🌟</span>
                </div>
                <span>Create Quiz</span>
              </button>
              <button
                onClick={() => setShowDocumentImport(true)}
                className="group relative bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <span className="text-xl">📄</span>
                </div>
                <span>Import Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border-2 border-pink-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">🔍</span>
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search quizzes..."
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 bg-white/50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">📖</span>
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 bg-white/50"
                title="Filter by subject"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">📈</span>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 bg-white/50"
                title="Filter by status"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedSubject('')
                  setSelectedStatus('')
                }}
                className="w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span className="text-lg">🧹</span>
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-pink-200">
          <div className="p-8 border-b-2 border-pink-200">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-3 text-white text-sm">📖</span>
              My Quizzes ({filteredQuizzes.length})
            </h3>
          </div>
          
          <div className="divide-y-2 divide-pink-100">
            {filteredQuizzes.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-8xl mb-6 animate-bounce">📖</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No quizzes found</h3>
                <p className="text-gray-600 mb-6 text-lg">Create your first quiz to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  🌟 Create Quiz
                </button>
              </div>
            ) : (
              filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-8 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <h4 className="text-2xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">{quiz.title}</h4>
                        <span className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 ${getStatusBadge(quiz.status)} transform hover:scale-105 transition-all duration-300`}>
                          {getStatusIcon(quiz.status)} {quiz.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-white text-xs">📖</span>
                          <div>
                            <span className="font-bold text-gray-700">Subject:</span>
                            <p className="text-gray-600">{quiz.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-white text-xs">💭</span>
                          <div>
                            <span className="font-bold text-gray-700">Questions:</span>
                            <p className="text-gray-600">{quiz.questionCount}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-white text-xs">⏰</span>
                          <div>
                            <span className="font-bold text-gray-700">Duration:</span>
                            <p className="text-gray-600">{quiz.hasNoTimeLimit ? 'No limit' : `${quiz.durationMinutes} min`}</p>
                          </div>
                        </div>
                        {quiz.status === 'PUBLISHED' && (
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-white text-xs">📈</span>
                            <div>
                              <span className="font-bold text-gray-700">Submissions:</span>
                              <p className="text-gray-600">{quiz.submissions}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {quiz.status === 'PUBLISHED' && quiz.submissions > 0 && (
                        <div className="mt-4 flex items-center space-x-2">
                          <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-white text-xs">🎯</span>
                          <span className="font-bold text-gray-700">Average Score:</span>
                          <span className="text-lg font-bold text-green-600">{quiz.averageScore}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-6">
                      <Link
                        to={`/teacher/quiz/${quiz.id}/edit`}
                        className="group/edit bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                      >
                        <span className="text-lg group-hover/edit:rotate-12 transition-transform duration-300">✏️</span>
                        <span>Edit</span>
                      </Link>
                      
                      {quiz.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublishQuiz(quiz.id)}
                          disabled={actionLoading === quiz.id}
                          className="group/publish bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:from-green-300 disabled:to-green-400 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                        >
                          <span className="text-lg group-hover/publish:rotate-12 transition-transform duration-300">
                            {actionLoading === quiz.id ? '⏳' : '🚀'}
                          </span>
                          <span>{actionLoading === quiz.id ? 'Publishing...' : 'Publish'}</span>
                        </button>
                      )}
                      
                      {quiz.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleUnpublishQuiz(quiz.id)}
                          disabled={actionLoading === quiz.id}
                          className="group/unpublish bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-yellow-300 disabled:to-yellow-400 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                        >
                          <span className="text-lg group-hover/unpublish:rotate-12 transition-transform duration-300">
                            {actionLoading === quiz.id ? '⏳' : '⏸️'}
                          </span>
                          <span>{actionLoading === quiz.id ? 'Unpublishing...' : 'Unpublish'}</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleForkQuiz(quiz.id)}
                        disabled={actionLoading === quiz.id}
                        className="group/fork bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 disabled:from-purple-300 disabled:to-purple-400 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                      >
                        <span className="text-lg group-hover/fork:rotate-12 transition-transform duration-300">
                          {actionLoading === quiz.id ? '⏳' : '🍴'}
                        </span>
                        <span>{actionLoading === quiz.id ? 'Forking...' : 'Fork'}</span>
                      </button>
                      
                      {quiz.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => handleArchiveQuiz(quiz.id)}
                          disabled={actionLoading === quiz.id}
                          className="group/archive bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                        >
                          <span className="text-lg group-hover/archive:rotate-12 transition-transform duration-300">
                            {actionLoading === quiz.id ? '⏳' : '📦'}
                          </span>
                          <span>{actionLoading === quiz.id ? 'Archiving...' : 'Archive'}</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="group/delete bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                      >
                        <span className="text-lg group-hover/delete:rotate-12 transition-transform duration-300">🗑️</span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-pink-200 max-w-2xl w-full">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Create New Quiz
                    </h2>
                    <p className="text-gray-600 font-medium">Choose how you want to create your quiz</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              {/* Options */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Manual Create */}
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      navigate('/teacher/quizzes/create')
                    }}
                    className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl">✏️</span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900 text-xl group-hover:text-blue-600 transition-colors duration-300">Manual Create</h3>
                        <p className="text-gray-600 font-medium">Create quiz step by step with full control</p>
                      </div>
                    </div>
                  </button>

                  {/* AI Generate */}
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      navigate('/teacher/quizzes/create')
                    }}
                    className="group p-8 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl">🤖</span>
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-900 text-xl group-hover:text-purple-600 transition-colors duration-300">AI Generate</h3>
                        <p className="text-gray-600 font-medium">Let AI create quiz automatically</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-gradient-to-br from-gray-300 to-blue-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">⚡</span>
                    Quick Actions
                  </h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShowCreateModal(false)
                        navigate('/teacher/analytics')
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <span>📈</span>
                      <span>Analytics</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateModal(false)
                        navigate('/teacher/dashboard')
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <span>🏠</span>
                      <span>Dashboard</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Import Modal */}
      {showDocumentImport && (
        <DocumentImportQuiz 
          onClose={() => setShowDocumentImport(false)}
          onSuccess={(quizId) => {
            setShowDocumentImport(false)
            navigate(`/teacher/quiz/${quizId}/edit`)
          }}
        />
      )}
    </div>
  )
}
