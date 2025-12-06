import { useState, useEffect } from 'react'
import { 
  getUsers, 
  getUserById, 
  lockUser, 
  unlockUser, 
  deleteUser, 
  changeUserPassword,
  askAI,
  handleAdminAction,
  getAllProfiles,
  type UserResponse,
  type UserListResponse,
  type AdminPasswordChangeRequest,
  type GeminiRequest,
  type ProfileResponse
} from '@/api/adminClient'
import '../styles/animations.css'
import {
  getAllSubjects,
  createSubject,
  deleteSubject,
  getAllQuizzes,
  getAllQuestions,
  getAllAnswers,
  type SubjectResponse,
  type CreateSubjectRequest,
  type QuizResponse,
  type QuestionResponse,
  type AnswerResponse,
  type QuizStatistics
} from '@/api/quizClient'
import AdminApiTest from '@/components/AdminApiTest'
import RolePermissionManager from '@/components/RolePermissionManager'
import RoleAssignmentTest from '@/components/RoleAssignmentTest'
import AdminRolePermission from '@/pages/AdminRolePermission'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import FloatingAIAssistant from '@/components/FloatingAIAssistant'
import { getSystemInfo, getHealthStatus, getMetrics, getEnvironmentInfo, getLoggersInfo, HealthStatus, LoggerInfo } from '@/api/actuatorClient'
import QuizStatisticsOverview from '@/components/QuizStatisticsOverview'
import PerQuestionAnalysis from '@/components/PerQuestionAnalysis'
import PerQuizAnalysis from '@/components/PerQuizAnalysis'
import StudentPerformance from '@/components/StudentPerformance'
import { getQuizStatistics, QuizStatisticsResponse } from '@/api/quizStatisticsClient'

// Helper function to format AI text
function formatAIText(text: string) {
  return text
    // Format bold text **text** -> <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    // Format italic text *text* -> <em>text</em>
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
    // Format bullet points * -> •
    .replace(/^\* /gm, '<div class="flex items-start mb-2"><span class="text-blue-600 font-bold text-lg mr-2">•</span><span class="font-semibold text-gray-900">')
    // Format numbered lists
    .replace(/^(\d+)\. /gm, '<div class="flex items-start mb-2"><span class="text-blue-600 font-bold mr-2">$1.</span><span class="font-semibold text-gray-900">')
    // Format code blocks
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border border-gray-300">$1</code>')
    // Format code blocks with ```
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto my-4"><code>$1</code></pre>')
    // Format headers ### -> <h3>
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-blue-800 mt-4 mb-2">$1</h3>')
    // Format headers ## -> <h2>
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-blue-900 mt-6 mb-3">$1</h2>')
    // Format headers # -> <h1>
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-blue-900 mt-6 mb-4">$1</h1>')
    // Format examples with quotes
    .replace(/"([^"]+)"/g, '<span class="text-blue-600 italic bg-blue-50 px-2 py-1 rounded">"$1"</span>')
    // Format links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline font-semibold">$1</a>')
    // Format success messages
    .replace(/✅ (.*)/g, '<div class="flex items-center text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 mb-2"><span class="text-lg mr-2">✅</span><span class="font-semibold">$1</span></div>')
    // Format error messages
    .replace(/❌ (.*)/g, '<div class="flex items-center text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 mb-2"><span class="text-lg mr-2">❌</span><span class="font-semibold">$1</span></div>')
    // Format warning messages
    .replace(/⚠️ (.*)/g, '<div class="flex items-center text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-2"><span class="text-lg mr-2">⚠️</span><span class="font-semibold">$1</span></div>')
    // Format info messages
    .replace(/ℹ️ (.*)/g, '<div class="flex items-center text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200 mb-2"><span class="text-lg mr-2">ℹ️</span><span class="font-semibold">$1</span></div>')
    // Format tips
    .replace(/💡 (.*)/g, '<div class="flex items-center text-purple-700 bg-purple-50 p-3 rounded-lg border border-purple-200 mb-2"><span class="text-lg mr-2">💡</span><span class="font-semibold">$1</span></div>')
    // Format commands
    .replace(/`([^`]+)`/g, '<code class="bg-gray-900 text-green-400 px-2 py-1 rounded text-sm font-mono">$1</code>')
    // Format line breaks
    .replace(/\n/g, '<br/>')
    // Close any open divs from bullet points and numbered lists
    .replace(/(<span class="font-semibold text-gray-900">[^<]*)(<br\/>)/g, '$1</span></div>$2')
}

// Helper function for sidebar button styles
function getSidebarButtonClass(isActive: boolean, sidebarOpen: boolean) {
  return `w-full flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'} px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ${
    isActive
      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl border border-white/20'
      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 border border-transparent hover:border-white/20'
  }`
}

// Loading Spinner Component
function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }
  
  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}></div>
  )
}

// Loading Card Component
function LoadingCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'subjects' | 'quizzes' | 'statistics' | 'profiles' | 'ai' | 'test' | 'role-test' | 'role-permission' | 'analytics'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null)
  
  // Quiz states
  const [subjects, setSubjects] = useState<SubjectResponse[]>([])
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([])
  const [questions, setQuestions] = useState<QuestionResponse[]>([])
  const [answers, setAnswers] = useState<AnswerResponse[]>([])
  const [statistics, setStatistics] = useState<QuizStatistics | null>(null)
  
  // Profile states
  const [profiles, setProfiles] = useState<ProfileResponse[]>([])
  
  // AI Chat states
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai', message: string}>>([])
  
  // Analytics states
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [metrics, setMetrics] = useState<string[]>([])
  const [environment, setEnvironment] = useState<any>(null)
  const [loggers, setLoggers] = useState<LoggerInfo | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  
  // Quiz Statistics state
  const [quizStatistics, setQuizStatistics] = useState<QuizStatisticsResponse | null>(null)
  const [quizStatisticsLoading, setQuizStatisticsLoading] = useState(false)

  const loadUsers = async (pageNum: number = 0) => {
    setLoading(true)
    try {
      const response = await getUsers(pageNum, 10)
      setUsers(response.content || [])
      setTotalPages(response.totalPages || 0)
      setPage(pageNum)
      
      // Debug: Log user status
      console.log('Users loaded:', response.content?.map(u => ({
        id: u.id,
        username: u.username,
        blocked: u.blocked
      })))
      
      setMsg({ text: `Đã tải ${response.content?.length || 0} users`, type: 'success' })
    } catch (error: any) {
      if (error.message.includes('Session expired')) {
        setMsg({ text: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', type: 'error' })
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        setMsg({ text: error?.message || 'Lỗi tải danh sách users', type: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (action: string, userId: string) => {
    setLoading(true)
    try {
      // Tìm user để hiển thị tên trong thông báo
      const user = users.find(u => u.id === userId)
      const userName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'User'
      
      // Debug: Log current user status
      console.log(`Performing ${action} on user:`, {
        userId,
        userName,
        currentStatus: user?.blocked ? 'BLOCKED' : 'ACTIVE'
      })
      
      let message = ''
      let successMessage = ''
      
      switch (action) {
        case 'lock':
          message = await lockUser(userId)
          successMessage = `🔒 Đã khóa tài khoản ${userName} thành công!`
          break
        case 'unlock':
          message = await unlockUser(userId)
          successMessage = `🔓 Đã mở khóa tài khoản ${userName} thành công!`
          break
        case 'delete':
          message = await deleteUser(userId)
          successMessage = `🗑️ Đã xóa tài khoản ${userName} thành công!`
          break
        default:
          throw new Error('Invalid action')
      }
      
      setMsg({ text: successMessage, type: 'success' })
      
      // Delay nhỏ để đảm bảo backend đã cập nhật xong
      setTimeout(async () => {
        await loadUsers(page) // Reload current page
      }, 500)
    } catch (error: any) {
      const user = users.find(u => u.id === userId)
      const userName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'User'
      
      let errorMessage = ''
      switch (action) {
        case 'lock':
          errorMessage = `❌ Lỗi khóa tài khoản ${userName}: ${error?.message || 'Không thể khóa tài khoản'}`
          break
        case 'unlock':
          errorMessage = `❌ Lỗi mở khóa tài khoản ${userName}: ${error?.message || 'Không thể mở khóa tài khoản'}`
          break
        case 'delete':
          errorMessage = `❌ Lỗi xóa tài khoản ${userName}: ${error?.message || 'Không thể xóa tài khoản'}`
          break
        default:
          errorMessage = `❌ Lỗi thực hiện hành động: ${error?.message || 'Có lỗi xảy ra'}`
      }
      
      setMsg({ text: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (userId: string, newPassword: string) => {
    setLoading(true)
    try {
      const request: AdminPasswordChangeRequest = { 
        userId, 
        newPassword, 
        confirmPassword: newPassword 
      }
      const message = await changeUserPassword(request)
      
      // Tìm user để hiển thị tên trong thông báo
      const user = users.find(u => u.id === userId)
      const userName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'User'
      
      setMsg({ 
        text: `✅ Thay đổi mật khẩu thành công cho ${userName}!`, 
        type: 'success' 
      })
    } catch (error: any) {
      setMsg({ 
        text: `❌ Lỗi thay đổi mật khẩu: ${error?.message || 'Không thể thay đổi mật khẩu'}`, 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAIChat = async () => {
    if (!aiMessage.trim()) return
    
    setAiLoading(true)
    try {
      const request: GeminiRequest = { userQuestion: aiMessage }
      const response = await askAI(request)
      setAiResponse(response)
      setChatHistory(prev => [
        ...prev,
        { role: 'user', message: aiMessage },
        { role: 'ai', message: response }
      ])
      setAiMessage('')
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi AI chat', type: 'error' })
    } finally {
      setAiLoading(false)
    }
  }

  const handleAdminCommand = async () => {
    if (!aiMessage.trim()) return
    
    setAiLoading(true)
    try {
      const request: GeminiRequest = { userQuestion: aiMessage }
      const response = await handleAdminAction(request)
      setAiResponse(response)
      setChatHistory(prev => [
        ...prev,
        { role: 'user', message: aiMessage },
        { role: 'ai', message: response }
      ])
      setAiMessage('')
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi admin command', type: 'error' })
    } finally {
      setAiLoading(false)
    }
  }

  // Quiz data loading functions
  const loadSubjects = async () => {
    setLoading(true)
    try {
      const response = await getAllSubjects()
      setSubjects(response)
      setMsg({ text: `Đã tải ${response.length} môn học`, type: 'success' })
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi tải danh sách môn học', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const loadQuizzes = async () => {
    setLoading(true)
    try {
      const response = await getAllQuizzes()
      setQuizzes(response)
      setMsg({ text: `Đã tải ${response.length} quiz`, type: 'success' })
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi tải danh sách quiz', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const response = await getAllQuestions()
      setQuestions(response)
      setMsg({ text: `Đã tải ${response.length} câu hỏi`, type: 'success' })
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi tải danh sách câu hỏi', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const loadAnswers = async () => {
    setLoading(true)
    try {
      const response = await getAllAnswers()
      setAnswers(response)
      setMsg({ text: `Đã tải ${response.length} đáp án`, type: 'success' })
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi tải danh sách đáp án', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const loadProfiles = async () => {
    setLoading(true)
    try {
      const response = await getAllProfiles()
      setProfiles(response)
      setMsg({ text: `Đã tải ${response.length} profiles`, type: 'success' })
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi tải danh sách profiles', type: 'error' })
    } finally {
      setLoading(false)
    }
  }


  // Analytics loading functions
  const loadHealthStatus = async () => {
    setAnalyticsLoading(true)
    try {
      const response = await getHealthStatus()
      setHealthStatus(response)
      setMsg({ text: 'Đã tải health status thành công', type: 'success' })
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi tải health status', type: 'error' })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const loadMetrics = async () => {
    setAnalyticsLoading(true)
    try {
      const response = await getMetrics()
      setMetrics(response)
      setMsg({ text: 'Đã tải metrics thành công', type: 'success' })
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi tải metrics', type: 'error' })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const loadEnvironment = async () => {
    setAnalyticsLoading(true)
    try {
      const response = await getEnvironmentInfo()
      setEnvironment(response)
      setMsg({ text: 'Đã tải environment info thành công', type: 'success' })
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi tải environment info', type: 'error' })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const loadLoggers = async () => {
    setAnalyticsLoading(true)
    try {
      const response = await getLoggersInfo()
      setLoggers(response)
      setMsg({ text: 'Đã tải loggers thành công', type: 'success' })
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi tải loggers', type: 'error' })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const loadAllAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      console.log('🚀 Loading all analytics data...')
      
      const [health, metricsData, env, loggersData] = await Promise.allSettled([
        getHealthStatus(),
        getMetrics(),
        getEnvironmentInfo(),
        getLoggersInfo()
      ])
      
      if (health.status === 'fulfilled') setHealthStatus(health.value)
      if (metricsData.status === 'fulfilled') setMetrics(metricsData.value)
      if (env.status === 'fulfilled') setEnvironment(env.value)
      if (loggersData.status === 'fulfilled') setLoggers(loggersData.value)
      
      console.log('✅ All analytics data loaded successfully')
      setMsg({ text: '🔄 Đã tải tất cả analytics data', type: 'success' })
    } catch (error: any) {
      console.error('❌ Error loading analytics data:', error)
      setMsg({ text: '⚠️ Một số analytics data có thể chưa được tải đầy đủ', type: 'error' })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  // Quiz Statistics functions
  const loadQuizStatistics = async () => {
    setQuizStatisticsLoading(true)
    try {
      console.log('📊 Loading quiz statistics...')
      const data = await getQuizStatistics()
      setQuizStatistics(data)
      console.log('✅ Quiz statistics loaded successfully')
    } catch (error: any) {
      console.error('❌ Error loading quiz statistics:', error)
      setMsg({ text: '⚠️ Không thể tải thống kê quiz', type: 'error' })
    } finally {
      setQuizStatisticsLoading(false)
    }
  }

  const handleCreateSubject = async (name: string, description: string) => {
    setLoading(true)
    try {
      const request: CreateSubjectRequest = { name, description }
      const message = await createSubject(request)
      setMsg({ text: message, type: 'success' })
      await loadSubjects() // Reload subjects
    } catch (error: any) {
      // Hiển thị message từ backend với emoji
      const errorMessage = error?.message || 'Lỗi tạo môn học'
      if (errorMessage.includes('already existed') || errorMessage.includes('đã tồn tại')) {
        setMsg({ text: `⚠️ ${errorMessage}`, type: 'error' })
      } else {
        setMsg({ text: `❌ ${errorMessage}`, type: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }


  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa môn học này?')) return
    
    setLoading(true)
    try {
      const message = await deleteSubject(subjectId)
      setMsg({ text: message, type: 'success' })
      await loadSubjects() // Reload subjects
    } catch (error: any) {
      setMsg({ text: error?.message || 'Lỗi xóa môn học', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Hàm load tất cả dữ liệu tự động
  const loadAllData = async () => {
    setLoading(true)
    try {
      console.log('🚀 Auto-loading all data for admin dashboard...')
      
      // Load tất cả dữ liệu song song để tăng tốc độ
      const promises = [
        loadUsers(0),
        loadSubjects(),
        loadQuizzes(),
        loadQuestions(),
        loadAnswers(),
        loadProfiles(),
        loadQuizStatistics()
      ]
      
      await Promise.allSettled(promises)
      
      console.log('✅ All data loaded successfully')
      setMsg({ text: '🔄 Đã tự động tải tất cả dữ liệu dashboard', type: 'success' })
    } catch (error: any) {
      console.error('❌ Error loading all data:', error)
      setMsg({ text: '⚠️ Một số dữ liệu có thể chưa được tải đầy đủ', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setMsg({ text: 'Đã đăng xuất thành công', type: 'success' })
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  }

  useEffect(() => {
    // Kiểm tra token trước khi load data với delay để đảm bảo token đã được lưu
    const checkTokenAndLoad = () => {
      const token = localStorage.getItem('access_token')
      console.log('🔍 Checking token in AdminDashboard:', token ? 'Token exists' : 'No token found')
      
      if (!token) {
        setMsg({ text: 'Vui lòng đăng nhập để truy cập admin dashboard', type: 'error' })
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
        return
      }
      
      console.log('✅ Token found, auto-loading all data...')
      loadAllData()
    }
    
    // Delay 100ms để đảm bảo token đã được lưu từ login
    setTimeout(checkTokenAndLoad, 100)
  }, [])

  // Auto-refresh khi chuyển đổi tab
  useEffect(() => {
    const loadDataForTab = async () => {
      switch (activeTab) {
        case 'dashboard':
          // Dashboard đã có dữ liệu từ loadAllData
          break
        case 'users':
          if (users.length === 0) {
            await loadUsers(0)
          }
          break
        case 'subjects':
          if (subjects.length === 0) {
            await loadSubjects()
          }
          break
        case 'quizzes':
          if (quizzes.length === 0) {
            await loadQuizzes()
            await loadQuestions()
            await loadAnswers()
          }
          break
        case 'statistics':
          if (!quizStatistics) {
            await loadQuizStatistics()
          }
          break
        case 'profiles':
          if (profiles.length === 0) {
            await loadProfiles()
          }
          break
        case 'analytics':
          if (!healthStatus && !metrics.length && !environment && !loggers) {
            await loadAllAnalytics()
          }
          break
        default:
          break
      }
    }

    // Chỉ load nếu đã có token và chưa có dữ liệu
    const token = localStorage.getItem('access_token')
    if (token) {
      loadDataForTab()
    }
  }, [activeTab])

  // Auto-refresh dữ liệu định kỳ mỗi 5 phút
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing data...')
      loadAllData()
    }, 5 * 60 * 1000) // 5 phút

    return () => clearInterval(interval)
  }, [])

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg(null)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [msg])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full -translate-x-16 -translate-y-16 opacity-60 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full translate-x-12 -translate-y-12 opacity-70 animate-bounce"></div>
        <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-green-200 rounded-full -translate-y-10 opacity-50 animate-ping"></div>
        <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-blue-200 rounded-full -translate-y-8 opacity-60 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-red-200 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-purple-200 rounded-full opacity-50 animate-ping"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Top Navigation Bar */}
      <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl border-4 border-black">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg border border-white/20"
              title="Toggle sidebar"
            >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg border-2 border-black">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <h1 className="text-3xl font-rounded font-bold text-rainbow animate-heartbeat">
                    👑 Admin Dashboard
                  </h1>
                  <p className="text-sm text-gray-700 font-semibold mt-1">✨ Quản lý hệ thống với công cụ mạnh mẽ ✨</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white font-rounded font-bold rounded-xl border-4 border-black shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 btn-magic"
                title="Đăng xuất"
              >
                <span className="text-lg mr-2">🚪</span>
                <span>Đăng xuất</span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex relative">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-500 ease-in-out bg-white/90 backdrop-blur-xl shadow-2xl border-4 border-black relative z-10`}>
          <div className="p-6">
            <nav className={`space-y-2 ${!sidebarOpen ? 'flex flex-col items-center' : ''}`}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={getSidebarButtonClass(activeTab === 'dashboard', sidebarOpen)}
              >
                <span className="text-xl">📊</span>
                {sidebarOpen && <span>Dashboard</span>}
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={getSidebarButtonClass(activeTab === 'analytics', sidebarOpen)}
              >
                <span className="text-xl">🔍</span>
                {sidebarOpen && <span>System Analytics</span>}
              </button>
              
              <button
                onClick={() => setActiveTab('users')}
                className={getSidebarButtonClass(activeTab === 'users', sidebarOpen)}
              >
                <span className="text-xl">👥</span>
                {sidebarOpen && <span>User Management</span>}
              </button>
              
              <button
                onClick={() => setActiveTab('subjects')}
                className={getSidebarButtonClass(activeTab === 'subjects', sidebarOpen)}
              >
                <span className="text-xl">📚</span>
                {sidebarOpen && <span>Subjects</span>}
              </button>
              
              <button
                onClick={() => setActiveTab('quizzes')}
                className={getSidebarButtonClass(activeTab === 'quizzes', sidebarOpen)}
              >
                <span className="text-xl">🎯</span>
                {sidebarOpen && <span>Quizzes</span>}
              </button>
              
              <button
                onClick={() => setActiveTab('statistics')}
                className={getSidebarButtonClass(activeTab === 'statistics', sidebarOpen)}
              >
                <span className="text-xl">📈</span>
                {sidebarOpen && <span>Statistics</span>}
              </button>
              
              <button
                onClick={() => setActiveTab('profiles')}
                className={getSidebarButtonClass(activeTab === 'profiles', sidebarOpen)}
              >
                <span className="text-xl">👤</span>
                {sidebarOpen && <span>Profiles</span>}
              </button>
              
              <button
                onClick={() => setActiveTab('ai')}
                className={getSidebarButtonClass(activeTab === 'ai', sidebarOpen)}
              >
                <span className="text-xl">🤖</span>
                {sidebarOpen && <span>AI Assistant</span>}
              </button>
              
              <button
                onClick={() => setActiveTab('role-permission')}
                className={getSidebarButtonClass(activeTab === 'role-permission', sidebarOpen)}
              >
                <span className="text-xl">🔐</span>
                {sidebarOpen && <span>Role & Permission Management</span>}
              </button>
              
              <button
                onClick={() => window.location.href = '/api-test'}
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
              >
                <span className="text-xl">🔧</span>
                {sidebarOpen && <span>API Test</span>}
              </button>

              <button
                onClick={() => setActiveTab('role-test')}
                className={getSidebarButtonClass(activeTab === 'role-test', sidebarOpen)}
              >
                <span className="text-xl">🧪</span>
                {sidebarOpen && <span>Role Test</span>}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative z-10">
          {/* Standardized Content Container */}
          <div className="min-h-screen p-6 lg:p-8 xl:p-10 max-w-none">
            <div className="w-full max-w-7xl mx-auto">
              {activeTab === 'dashboard' ? (
                <DashboardOverview 
                  users={users}
                  loading={loading}
                  onLoadUsers={loadUsers}
                  onLoadAllData={loadAllData}
                />
              ) : activeTab === 'users' ? (
                <UserManagement 
                  users={users}
                  loading={loading}
                  onUserAction={handleUserAction}
                  onChangePassword={handleChangePassword}
                  onLoadUsers={loadUsers}
                  page={page}
                  totalPages={totalPages}
                />
              ) : activeTab === 'subjects' ? (
                <SubjectManagement 
                  subjects={subjects}
                  loading={loading}
                  onLoadSubjects={loadSubjects}
                  onCreateSubject={handleCreateSubject}
                  onDeleteSubject={handleDeleteSubject}
                />
              ) : activeTab === 'quizzes' ? (
                <QuizManagement 
                  quizzes={quizzes}
                  questions={questions}
                  answers={answers}
                  loading={loading}
                  onLoadQuizzes={loadQuizzes}
                  onLoadQuestions={loadQuestions}
                  onLoadAnswers={loadAnswers}
                />
              ) : activeTab === 'statistics' ? (
                <div className="space-y-8">
                  {/* Quiz Statistics Overview */}
                  <QuizStatisticsOverview 
                    data={quizStatistics}
                    loading={quizStatisticsLoading}
                    onRefresh={loadQuizStatistics}
                  />
                  
                  {/* Per Question Analysis */}
                  {quizStatistics && (
                    <PerQuestionAnalysis 
                      questions={quizStatistics.result.perQuestion}
                      loading={quizStatisticsLoading}
                    />
                  )}
                  
                  {/* Per Quiz Analysis */}
                  {quizStatistics && (
                    <PerQuizAnalysis 
                      quizzes={quizStatistics.result.perQuiz}
                      loading={quizStatisticsLoading}
                    />
                  )}
                  
                  {/* Student Performance */}
                  {quizStatistics && (
                    <StudentPerformance 
                      students={quizStatistics.result.students.perQuiz}
                      groupSummary={quizStatistics.result.students.groupSummary}
                      loading={quizStatisticsLoading}
                    />
                  )}
                </div>
              ) : activeTab === 'profiles' ? (
                <ProfileManagement 
                  profiles={profiles}
                  loading={loading}
                  onLoadProfiles={loadProfiles}
                />
              ) : activeTab === 'ai' ? (
                <AIAssistant 
                  aiMessage={aiMessage}
                  setAiMessage={setAiMessage}
                  aiResponse={aiResponse}
                  aiLoading={aiLoading}
                  chatHistory={chatHistory}
                  onAIChat={handleAIChat}
                  onAdminCommand={handleAdminCommand}
                />
              ) : activeTab === 'role-test' ? (
                <div className="w-full">
                  <RoleAssignmentTest />
                </div>
              ) : activeTab === 'role-permission' ? (
                <div className="w-full">
                  <AdminRolePermission />
                </div>
              ) : activeTab === 'analytics' ? (
                <AnalyticsDashboard 
                  healthStatus={healthStatus}
                  metrics={metrics}
                  environment={environment}
                  loggers={loggers}
                  loading={analyticsLoading}
                  onLoadHealth={loadHealthStatus}
                  onLoadMetrics={loadMetrics}
                  onLoadEnvironment={loadEnvironment}
                  onLoadLoggers={loadLoggers}
                  onLoadAllAnalytics={loadAllAnalytics}
                />
              ) : (
                <div className="w-full">
                  <AdminApiTest />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl text-sm font-medium z-50 shadow-lg border-l-4 animate-slide-in ${
          msg.type === 'success' ? 'bg-green-50 text-green-800 border-green-400' :
          msg.type === 'error' ? 'bg-red-50 text-red-800 border-red-400' :
          'bg-blue-50 text-blue-800 border-blue-400'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {msg.type === 'success' && (
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {msg.type === 'error' && (
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {msg.type === 'info' && (
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{msg.text}</p>
            </div>
            <button
              onClick={() => setMsg(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              title="Đóng thông báo"
              aria-label="Đóng thông báo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  )
}

// Dashboard Overview Component
function DashboardOverview({ 
  users, 
  loading, 
  onLoadUsers,
  onLoadAllData
}: {
  users: UserResponse[]
  loading: boolean
  onLoadUsers: (page: number) => void
  onLoadAllData: () => void
}) {
  const totalUsers = users.length
  const activeUsers = users.filter(user => !user.blocked).length
  const blockedUsers = users.filter(user => user.blocked).length

  return (
    <div className="space-y-8 w-full">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-2xl p-6 lg:p-8 text-white shadow-2xl border-4 border-black relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-rounded font-bold text-rainbow animate-heartbeat">📊 Analytics Dashboard</h1>
              <p className="text-white/90 font-semibold">✨ Tổng quan hệ thống Quiz - Quản lý người dùng và phân tích dữ liệu ✨</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 border-4 border-black relative overflow-hidden group">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-rounded font-bold text-gray-700 mb-2">👥 Tổng Users</p>
                  <p className="text-4xl font-rounded font-bold text-rainbow animate-pulse">{totalUsers}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg border-2 border-black group-hover:shadow-xl transition-all duration-300">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 border-4 border-black relative overflow-hidden group">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-rounded font-bold text-gray-700 mb-2">✅ Active Users</p>
                  <p className="text-4xl font-rounded font-bold text-rainbow animate-pulse">{activeUsers}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg border-2 border-black group-hover:shadow-xl transition-all duration-300">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 border-4 border-black relative overflow-hidden group">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-rounded font-bold text-gray-700 mb-2">🚫 Blocked Users</p>
                  <p className="text-4xl font-rounded font-bold text-rainbow animate-pulse">{blockedUsers}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg border-2 border-black group-hover:shadow-xl transition-all duration-300">
                  <span className="text-2xl">🚫</span>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-black hover:shadow-2xl transition-all duration-300 ease-in-out">
        <div className="p-8 border-b-4 border-black">
          <h2 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">⚡ Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => onLoadUsers(0)}
              disabled={loading}
              className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-4 border-black hover:from-blue-100 hover:to-blue-200 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg disabled:opacity-50 btn-magic"
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300">
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <span className="text-lg">🔄</span>
                  )}
                </div>
                <p className="text-sm font-rounded font-bold text-gray-900">{loading ? 'Loading...' : '🔄 Refresh Users'}</p>
              </div>
            </button>
            
            <button
              onClick={onLoadAllData}
              disabled={loading}
              className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-4 border-black hover:from-green-100 hover:to-green-200 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg disabled:opacity-50 btn-magic"
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300">
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <span className="text-lg">🔄</span>
                  )}
                </div>
                <p className="text-sm font-rounded font-bold text-gray-900">{loading ? 'Loading...' : '🔄 Auto Refresh All'}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// User Management Component
function UserManagement({ 
  users, 
  loading, 
  onUserAction, 
  onChangePassword, 
  onLoadUsers, 
  page, 
  totalPages 
}: {
  users: UserResponse[]
  loading: boolean
  onUserAction: (action: string, userId: string) => void
  onChangePassword: (userId: string, newPassword: string) => void
  onLoadUsers: (page: number) => void
  page: number
  totalPages: number
}) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleChangePassword = (userId: string) => {
    setSelectedUserId(userId)
    setNewPassword('')
    setShowPasswordModal(true)
  }

  const handleSubmitPassword = () => {
    if (!newPassword.trim()) return
    onChangePassword(selectedUserId, newPassword)
    setShowPasswordModal(false)
    setNewPassword('')
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-2xl p-6 lg:p-8 text-white shadow-2xl border-4 border-black relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h1 className="text-2xl font-rounded font-bold text-rainbow animate-heartbeat">👥 User Management</h1>
              <p className="text-white/90 font-semibold">✨ Quản lý người dùng trong hệ thống ✨</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border-4 border-black">
        <div className="p-6 border-b-4 border-black">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-rounded font-bold text-rainbow animate-heartbeat">👥 Danh sách Users</h2>
            <button
              onClick={() => onLoadUsers(0)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl border-4 border-black hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed btn-magic font-rounded font-bold"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                 Refresh
                </>
              )}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto shadow-xl rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-500 to-purple-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">👤 Username</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">📧 Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">📊 Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">⚡ Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-lg">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                        <div className="text-xs text-gray-500">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : 'Chưa có tên'
                          }
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                      user.blocked 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200' 
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-green-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        user.blocked ? 'bg-red-200' : 'bg-green-200'
                      }`}></div>
                      {user.blocked ? '🔒 Blocked' : '✅ Active'}
                    </span>
                    <div className="text-xs text-gray-500">
                      {user.blocked ? 'Tài khoản bị khóa' : 'Tài khoản hoạt động'}
                    </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onUserAction(user.blocked ? 'unlock' : 'lock', user.id)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                          user.blocked 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                        }`}
                        title={user.blocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                      >
                        {user.blocked ? '🔓 Unlock' : '🔒 Lock'}
                      </button>
                      <button
                        onClick={() => handleChangePassword(user.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Thay đổi mật khẩu"
                      >
                        🔑 Password
                      </button>
                      <button
                        onClick={() => onUserAction('delete', user.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg text-xs font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Xóa tài khoản"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPassword}
                disabled={!newPassword.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// AI Assistant Component
function AIAssistant({ 
  aiMessage, 
  setAiMessage, 
  aiResponse, 
  aiLoading, 
  chatHistory, 
  onAIChat, 
  onAdminCommand 
}: {
  aiMessage: string
  setAiMessage: (message: string) => void
  aiResponse: string
  aiLoading: boolean
  chatHistory: Array<{role: 'user' | 'ai', message: string}>
  onAIChat: () => void
  onAdminCommand: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-xl p-6 text-white shadow-2xl border-4 border-black relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-rounded font-bold text-rainbow animate-heartbeat">🤖 AI Assistant</h1>
              <p className="text-white/90 font-semibold">✨ Trợ lý thông minh cho quản trị viên ✨</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="bg-white rounded-xl shadow-lg border-4 border-black h-96 overflow-y-auto">
        <div className="p-6 border-b-4 border-black">
          <h2 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">💬 AI Chat</h2>
        </div>
        <div className="p-6 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center border-4 border-black">
                <span className="text-2xl">🤖</span>
              </div>
              <p className="font-rounded font-bold text-lg">🎉 Chào mừng đến với AI Assistant!</p>
              <p className="text-sm font-semibold mb-4">✨ Hãy đặt câu hỏi hoặc ra lệnh quản trị ✨</p>
              
              {/* Demo formatted text */}
              <div className="max-w-2xl mx-auto text-left bg-white p-4 rounded-xl border-4 border-black shadow-lg">
                <h3 className="font-rounded font-bold text-blue-900 mb-3">💡 Ví dụ câu trả lời AI:</h3>
                <div 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: formatAIText(`## Hướng dẫn sử dụng AI Assistant

### Các lệnh cơ bản:
* **lock_user user123** - Khóa tài khoản user
* **unlock_user user123** - Mở khóa tài khoản user  
* **delete_user user123** - Xóa tài khoản user

### Ví dụ sử dụng:
"Tạo đề 20 câu trắc nghiệm Toán 11, thời gian 30 phút, mức độ trung bình."

✅ **Thành công**: Lệnh đã được thực hiện
❌ **Lỗi**: Không tìm thấy user với ID user123
⚠️ **Cảnh báo**: Bạn có chắc muốn xóa user này?
💡 **Gợi ý**: Sử dụng \`show user statistics\` để xem thống kê

### Code example:
\`\`\`
lock_user user123
unlock_user user123
\`\`\``)
                  }}
                />
              </div>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-xl shadow-lg ${
                  chat.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-blue-400' 
                    : 'bg-white text-gray-900 border-4 border-black'
                }`}>
                  {chat.role === 'ai' ? (
                    <div 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatAIText(chat.message) }}
                    />
                  ) : (
                    <p className="text-sm font-semibold">{chat.message}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Command Suggestions */}
      <div className="bg-white rounded-xl shadow-lg border-4 border-black">
        <div className="p-6 border-b-4 border-black">
          <h3 className="text-lg font-rounded font-bold text-rainbow animate-heartbeat">💡 Gợi ý lệnh Admin</h3>
          <p className="text-sm text-gray-600 font-semibold">✨ Click vào lệnh để sử dụng ngay ✨</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Management Commands */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border-4 border-black">
              <h4 className="font-rounded font-bold text-blue-800 mb-3 flex items-center">
                <span className="text-xl mr-2">👥</span>
                Quản lý User
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => setAiMessage("lock_user user123")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-sm font-semibold"
                >
                  🔒 lock_user user123
                </button>
                <button
                  onClick={() => setAiMessage("unlock_user user123")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-sm font-semibold"
                >
                  🔓 unlock_user user123
                </button>
                <button
                  onClick={() => setAiMessage("delete_user user123")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-sm font-semibold"
                >
                  🗑️ delete_user user123
                </button>
                <button
                  onClick={() => setAiMessage("change_password user123 newpass123 confirmpass123")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-sm font-semibold"
                >
                  🔑 change_password user123
                </button>
              </div>
            </div>

            {/* System Commands */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border-4 border-black">
              <h4 className="font-rounded font-bold text-green-800 mb-3 flex items-center">
                <span className="text-xl mr-2">⚙️</span>
                Hệ thống
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => setAiMessage("show system status")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-sm font-semibold"
                >
                  📊 Trạng thái hệ thống
                </button>
                <button
                  onClick={() => setAiMessage("show user statistics")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-sm font-semibold"
                >
                  📈 Thống kê người dùng
                </button>
                <button
                  onClick={() => setAiMessage("show quiz statistics")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-sm font-semibold"
                >
                  🎯 Thống kê quiz
                </button>
                <button
                  onClick={() => setAiMessage("show recent activities")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-sm font-semibold"
                >
                  📋 Hoạt động gần đây
                </button>
              </div>
            </div>

            {/* Help Commands */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border-4 border-black">
              <h4 className="font-rounded font-bold text-purple-800 mb-3 flex items-center">
                <span className="text-xl mr-2">❓</span>
                Trợ giúp
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => setAiMessage("help")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-sm font-semibold"
                >
                  ❓ Trợ giúp
                </button>
                <button
                  onClick={() => setAiMessage("show example response")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-sm font-semibold"
                >
                  📝 Xem ví dụ định dạng
                </button>
                <button
                  onClick={() => setAiMessage("show available commands")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-sm font-semibold"
                >
                  📝 Danh sách lệnh
                </button>
                <button
                  onClick={() => setAiMessage("how to manage users")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-sm font-semibold"
                >
                  👥 Hướng dẫn quản lý user
                </button>
                <button
                  onClick={() => setAiMessage("how to analyze data")}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-sm font-semibold"
                >
                  📊 Hướng dẫn phân tích
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-white rounded-xl shadow-lg border-4 border-black">
        <div className="p-6">
          <div className="flex space-x-3">
            <input
              type="text"
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              placeholder="Nhập câu hỏi hoặc lệnh quản trị..."
              className="flex-1 px-4 py-2 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-green-400 font-rounded font-semibold"
              onKeyPress={(e) => e.key === 'Enter' && onAIChat()}
            />
            <button
              onClick={onAIChat}
              disabled={aiLoading || !aiMessage.trim()}
              className="px-6 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl border-4 border-black hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 btn-magic font-rounded font-bold"
            >
              {aiLoading && <LoadingSpinner size="sm" />}
              <span>{aiLoading ? 'Loading...' : '💬 Chat'}</span>
            </button>
            <button
              onClick={onAdminCommand}
              disabled={aiLoading || !aiMessage.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl border-4 border-black hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 btn-magic font-rounded font-bold"
            >
              {aiLoading && <LoadingSpinner size="sm" />}
              <span>{aiLoading ? 'Loading...' : '⚡ Admin Command'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Subject Management Component
function SubjectManagement({ 
  subjects, 
  loading, 
  onLoadSubjects, 
  onCreateSubject, 
  onDeleteSubject,
}: {
  subjects: SubjectResponse[]
  loading: boolean
  onLoadSubjects: () => void
  onCreateSubject: (name: string, description: string) => void
  onDeleteSubject: (subjectId: string) => void
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [subjectDescription, setSubjectDescription] = useState('')

  const handleCreate = () => {
    if (!subjectName.trim()) return
    onCreateSubject(subjectName.trim(), subjectDescription.trim())
    setShowCreateModal(false)
    setSubjectName('')
    setSubjectDescription('')
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-2xl p-6 lg:p-8 text-white shadow-2xl border-4 border-black relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-2xl font-rounded font-bold text-rainbow animate-heartbeat">📚 Subject Management</h1>
              <p className="text-white/90 font-semibold">✨ Quản lý môn học trong hệ thống Quiz ✨</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className="bg-white rounded-xl shadow-lg border-4 border-black">
        <div className="p-6 border-b-4 border-black">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">📋 Danh sách Môn học</h2>
            <div className="flex space-x-3">
              <button
                onClick={onLoadSubjects}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl border-4 border-black hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed btn-magic font-rounded font-bold"
              >
                {loading ? 'Loading...' : '🔄 Refresh'}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-xl border-4 border-black hover:from-purple-500 hover:to-blue-500 btn-magic font-rounded font-bold"
              >
                ➕ Tạo môn học
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-b-4 border-black">
                <th className="px-6 py-4 text-left text-sm font-rounded font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">#</span>
                    <span>STT</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-rounded font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    <span>Tên môn học</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-rounded font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <span>Mô tả</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-rounded font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <span>Ngày tạo</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-rounded font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚙️</span>
                    <span>Thao tác</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-gray-200">
              {subjects.map((subject, index) => {
                const getSubjectIcon = (name: string) => {
                  const iconMap: { [key: string]: string } = {
                    'Công dân': '📖',
                    'Công nghệ': '🚀',
                    'Hóa học': '🧪',
                    'Sinh học': '🧬',
                    'Vật lý': '⚛️',
                    'Toán học': '📐',
                    'Lịch sử': '🏛️',
                    'Địa lý': '🌍',
                    'Văn học': '📚',
                    'Tiếng Anh': '🇬🇧',
                    'Tin học': '💻'
                  }
                  return iconMap[name] || '📖'
                }

                const getSubjectColor = (index: number) => {
                  const colors = ['blue', 'green', 'purple', 'pink', 'yellow', 'orange', 'teal', 'red']
                  return colors[index % colors.length]
                }

                const formatDate = (dateString: string) => {
                  try {
                    const date = new Date(dateString)
                    if (isNaN(date.getTime())) return 'Chưa xác định'
                    return date.toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  } catch {
                    return 'Chưa xác định'
                  }
                }

                return (
                  <tr key={subject.id} className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-r from-${getSubjectColor(index)}-400 to-${getSubjectColor(index)}-600 rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
                          {getSubjectIcon(subject.name)}
                        </div>
                        <div>
                          <div className="text-sm font-rounded font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {subject.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {subject.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border-2 border-gray-200 group-hover:border-purple-200 transition-colors">
                          {subject.description ? (
                            <div className="flex items-start gap-2">
                              <span className="text-lg">📝</span>
                              <span className="line-clamp-2">{subject.description}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400 italic">
                              <span className="text-lg">❌</span>
                              <span>Không có mô tả</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center text-white text-sm">
                          📅
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(subject.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Tạo mới
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDeleteSubject(subject.id)}
                          className="group/btn relative px-4 py-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-xl border-2 border-red-500 hover:from-red-500 hover:to-pink-500 hover:scale-105 transition-all duration-200 font-rounded font-bold text-sm shadow-lg hover:shadow-xl"
                          title="Xóa môn học này"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🗑️</span>
                            <span>Xóa</span>
                          </div>
                          <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></div>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Subject Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-96 max-w-md shadow-2xl border-4 border-black relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-50"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-200 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4 shadow-lg">
                  📚
                </div>
                <h3 className="text-2xl font-rounded font-bold text-rainbow animate-heartbeat">Tạo môn học mới</h3>
                <p className="text-gray-600 font-semibold">✨ Thêm môn học vào hệ thống ✨</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-rounded font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    <span>Tên môn học *</span>
                  </label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="Nhập tên môn học..."
                    className="w-full px-4 py-3 border-4 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-rounded font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <span>Mô tả</span>
                  </label>
                  <textarea
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    placeholder="Nhập mô tả môn học..."
                    rows={3}
                    className="w-full px-4 py-3 border-4 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 bg-white/90 font-rounded font-semibold resize-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-rounded font-bold border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-all duration-200"
                >
                  ❌ Hủy
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!subjectName.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl border-4 border-purple-500 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold btn-magic transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <span>Tạo môn học</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Quiz Management Component
function QuizManagement({ 
  quizzes, 
  questions, 
  answers, 
  loading, 
  onLoadQuizzes, 
  onLoadQuestions, 
  onLoadAnswers 
}: {
  quizzes: QuizResponse[]
  questions: QuestionResponse[]
  answers: AnswerResponse[]
  loading: boolean
  onLoadQuizzes: () => void
  onLoadQuestions: () => void
  onLoadAnswers: () => void
}) {
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-2xl p-6 lg:p-8 text-white shadow-2xl border-4 border-black relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h1 className="text-2xl font-rounded font-bold text-rainbow animate-heartbeat">🎯 Quiz Management</h1>
              <p className="text-white/90 font-semibold">✨ Quản lý quiz, câu hỏi và đáp án ✨</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-rounded font-bold text-gray-700">🎯 Tổng Quiz</p>
              <p className="text-3xl font-rounded font-bold text-rainbow animate-pulse">{quizzes.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg flex items-center justify-center border-2 border-black">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
          <button
            onClick={onLoadQuizzes}
            disabled={loading}
            className="mt-4 w-full px-3 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl border-4 border-black hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm btn-magic font-rounded font-bold"
          >
            {loading ? 'Loading...' : '🔄 Load Quizzes'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-rounded font-bold text-gray-700">❓ Tổng Câu hỏi</p>
              <p className="text-3xl font-rounded font-bold text-rainbow animate-pulse">{questions.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center border-2 border-black">
              <span className="text-2xl">❓</span>
            </div>
          </div>
          <button
            onClick={onLoadQuestions}
            disabled={loading}
            className="mt-4 w-full px-3 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-xl border-4 border-black hover:from-green-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm btn-magic font-rounded font-bold"
          >
            {loading ? 'Loading...' : '🔄 Load Questions'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-rounded font-bold text-gray-700">💡 Tổng Đáp án</p>
              <p className="text-3xl font-rounded font-bold text-rainbow animate-pulse">{answers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center border-2 border-black">
              <span className="text-2xl">💡</span>
            </div>
          </div>
          <button
            onClick={onLoadAnswers}
            disabled={loading}
            className="mt-4 w-full px-3 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl border-4 border-black hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm btn-magic font-rounded font-bold"
          >
            {loading ? 'Loading...' : '🔄 Load Answers'}
          </button>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Danh sách Quiz</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quizzes.slice(0, 10).map((quiz, index) => (
                <tr key={quiz.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quiz.subjectName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quiz.hasNoTimeLimit ? 'Không giới hạn' : `${quiz.durationMinutes} phút`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quiz.questionCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      quiz.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quiz.createdByFirstName} {quiz.createdByLastName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Statistics Overview Component
function StatisticsOverview({ 
  statistics, 
  loading, 
  onLoadStatistics 
}: {
  statistics: QuizStatistics
  loading: boolean
  onLoadStatistics: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quiz Statistics</h1>
            <p className="text-green-100">Thống kê và phân tích dữ liệu quiz</p>
          </div>
        </div>
      </div>

      {/* Statistics Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Thống kê AI</h2>
            <button
              onClick={onLoadStatistics}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Load Statistics'}
            </button>
          </div>
        </div>
        <div className="p-6">
          {Object.keys(statistics).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p>Chưa có dữ liệu thống kê</p>
              <p className="text-sm">Click "Load Statistics" để tải dữ liệu</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                return (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Tổng câu hỏi</p>
                            <p className="text-2xl font-bold text-blue-900">{statistics.scope.questions}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-green-600 font-medium">Tổng học sinh</p>
                            <p className="text-2xl font-bold text-green-900">{statistics.students.perQuiz.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Độ chính xác TB</p>
                            <p className="text-2xl font-bold text-purple-900">{(statistics.global.accuracy * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Question Accuracy */}
                    {statistics.perQuestion.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Độ chính xác câu hỏi</h3>
                        <div className="space-y-3">
                          {statistics.perQuestion.map((question, index) => (
                            <div key={question.questionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">{question.contentPreview}</p>
                                <p className="text-xs text-gray-500">ID: {question.questionId}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(question.accuracy * 100, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                                  {(question.accuracy * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Student Groups */}
                    {statistics.students.perQuiz.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân nhóm học sinh</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {statistics.students.perQuiz.map((student, index) => (
                            <div key={`${student.userIdOrName}-${student.quizId}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-gray-700">{student.userIdOrName}</p>
                                <p className="text-xs text-gray-500">Quiz: {student.quizId}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                student.level === 'Giỏi' ? 'bg-green-100 text-green-800' :
                                student.level === 'Khá' ? 'bg-blue-100 text-blue-800' :
                                student.level === 'Trung bình' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {student.level}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Raw Data (for debugging) */}
                    <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        Xem dữ liệu thô (Raw Data)
                      </summary>
                      <pre className="mt-3 bg-white p-4 rounded border text-xs overflow-x-auto">
                        {JSON.stringify(statistics, null, 2)}
                      </pre>
                    </details>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Profile Management Component
function ProfileManagement({ 
  profiles, 
  loading, 
  onLoadProfiles 
}: {
  profiles: ProfileResponse[]
  loading: boolean
  onLoadProfiles: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-xl p-6 text-white shadow-2xl border-4 border-black relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-rounded font-bold text-rainbow animate-heartbeat">👤 Profile Management</h1>
              <p className="text-white/90 font-semibold">✨ Quản lý thông tin profile người dùng ✨</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profiles List */}
      <div className="bg-white rounded-xl shadow-lg border-4 border-black">
        <div className="p-6 border-b-4 border-black">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">📋 Danh sách Profiles</h2>
            <button
              onClick={onLoadProfiles}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl border-4 border-black hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 btn-magic font-rounded font-bold"
            >
              {loading && <LoadingSpinner size="sm" />}
              <span>{loading ? 'Loading...' : '🔄 Load Profiles'}</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-pink-50 to-purple-50 border-4 border-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-rounded font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300">#</th>
                <th className="px-6 py-3 text-left text-xs font-rounded font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300">🆔 Profile ID</th>
                <th className="px-6 py-3 text-left text-xs font-rounded font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300">👤 User ID</th>
                <th className="px-6 py-3 text-left text-xs font-rounded font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300">👥 User Info</th>
                <th className="px-6 py-3 text-left text-xs font-rounded font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300">📊 Status</th>
                <th className="px-6 py-3 text-left text-xs font-rounded font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300">📞 Contact</th>
                <th className="px-6 py-3 text-left text-xs font-rounded font-bold text-gray-700 uppercase tracking-wider border-r-2 border-gray-300">📝 Profile</th>
                <th className="px-6 py-3 text-left text-xs font-rounded font-bold text-gray-700 uppercase tracking-wider">✅ Verified</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profiles.map((profile, index) => (
                <tr key={profile.id} className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-lg border-b-2 border-gray-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-rounded font-bold text-gray-700 border-r-2 border-gray-200">#{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap border-r-2 border-gray-200">
                    <div className="text-sm font-mono text-gray-800 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-2 rounded-lg border-2 border-black font-bold">
                      {profile.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r-2 border-gray-200">
                    <div className="text-sm font-mono text-gray-800 bg-gradient-to-r from-green-100 to-blue-100 px-3 py-2 rounded-lg border-2 border-black font-bold">
                      {profile.userId || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r-2 border-gray-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {profile.imageUrl ? (
                          <img className="h-10 w-10 rounded-full border-2 border-black" src={profile.imageUrl} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center border-2 border-black">
                            <span className="text-sm font-bold text-white">
                              {profile.firstName?.charAt(0) || profile.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-rounded font-bold text-gray-900">
                          {profile.firstName && profile.lastName 
                            ? `${profile.firstName} ${profile.lastName}` 
                            : profile.username
                          }
                        </div>
                        <div className="text-sm font-semibold text-gray-600">@{profile.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r-2 border-gray-200">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-rounded font-bold border-2 ${
                      profile.status === 'ONLINE' 
                        ? 'bg-green-100 text-green-800 border-green-400' 
                        : 'bg-gray-100 text-gray-800 border-gray-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        profile.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-500'
                      }`}></div>
                      {profile.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm border-r-2 border-gray-200">
                    <div className="font-semibold text-gray-900">{profile.email}</div>
                    {profile.phoneNumber && (
                      <div className="text-gray-600 font-medium">{profile.phoneNumber}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm border-r-2 border-gray-200">
                    <div className="space-y-1">
                      {profile.gender && (
                        <div className="text-gray-700 font-semibold">Giới tính: {profile.gender}</div>
                      )}
                      {profile.city && (
                        <div className="text-gray-700 font-semibold">Thành phố: {profile.city}</div>
                      )}
                      {profile.jobTitle && (
                        <div className="text-gray-700 font-semibold">Nghề nghiệp: {profile.jobTitle}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-rounded font-bold border-2 ${
                      profile.emailVerified 
                        ? 'bg-green-100 text-green-800 border-green-400' 
                        : 'bg-yellow-100 text-yellow-800 border-yellow-400'
                    }`}>
                      {profile.emailVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}