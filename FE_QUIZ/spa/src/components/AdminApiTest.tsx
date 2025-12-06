import { useState } from 'react'
import { 
  getUsers, 
  lockUser, 
  unlockUser, 
  deleteUser, 
  changeUserPassword,
  askAI,
  handleAdminAction,
  getAllProfiles,
  type AdminPasswordChangeRequest,
  type GeminiRequest
} from '@/api/adminClient'
import {
  getAllSubjects,
  createSubject,
  deleteSubject,
  getAllQuizzes,
  getAllQuestions,
  getAllAnswers,
  getQuizStatistics,
  type CreateSubjectRequest
} from '@/api/quizClient'

export default function AdminApiTest() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [testUserId, setTestUserId] = useState('2c82fcf0-237e-4454-8d59-9a0e358ce173')
  const [testPassword, setTestPassword] = useState('newpassword123')
  const [testQuestion, setTestQuestion] = useState('Khóa tài khoản 2c82fcf0-237e-4454-8d59-9a0e358ce173')
  const [testSubjectName, setTestSubjectName] = useState('Test Subject')
  const [testSubjectDescription, setTestSubjectDescription] = useState('Test Description')
  const [testSubjectId, setTestSubjectId] = useState('')

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testGetUsers = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing getUsers...')
      const users = await getUsers(0, 5)
      addResult(`✅ getUsers success: ${users.content.length} users found`)
      if (users.content.length > 0) {
        setTestUserId(users.content[0].id)
        addResult(`📝 Set test user ID: ${users.content[0].id}`)
      }
    } catch (error: any) {
      addResult(`❌ getUsers failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testLockUser = async () => {
    if (!testUserId) {
      addResult('❌ No test user ID provided')
      return
    }
    
    setLoading(true)
    try {
      addResult(`🔄 Testing lockUser for ${testUserId}...`)
      const result = await lockUser(testUserId)
      addResult(`✅ lockUser success: ${result}`)
    } catch (error: any) {
      addResult(`❌ lockUser failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testUnlockUser = async () => {
    if (!testUserId) {
      addResult('❌ No test user ID provided')
      return
    }
    
    setLoading(true)
    try {
      addResult(`🔄 Testing unlockUser for ${testUserId}...`)
      const result = await unlockUser(testUserId)
      addResult(`✅ unlockUser success: ${result}`)
    } catch (error: any) {
      addResult(`❌ unlockUser failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testChangePassword = async () => {
    if (!testUserId) {
      addResult('❌ No test user ID provided')
      return
    }
    
    setLoading(true)
    try {
      addResult(`🔄 Testing changeUserPassword for ${testUserId}...`)
      const request: AdminPasswordChangeRequest = {
        userId: testUserId,
        newPassword: testPassword,
        confirmPassword: testPassword
      }
      const result = await changeUserPassword(request)
      addResult(`✅ changeUserPassword success: ${result}`)
    } catch (error: any) {
      addResult(`❌ changeUserPassword failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAskAI = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing askAI...')
      const request: GeminiRequest = {
        userQuestion: 'Xin chào, bạn có thể giúp gì cho tôi?',
        systemPrompt: 'Bạn là trợ lý quản trị viên của hệ thống Quiz.'
      }
      const result = await askAI(request)
      addResult(`✅ askAI success: ${result.substring(0, 100)}...`)
    } catch (error: any) {
      addResult(`❌ askAI failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAdminAction = async () => {
    setLoading(true)
    try {
      addResult(`🔄 Testing handleAdminAction: "${testQuestion}"...`)
      const request: GeminiRequest = {
        userQuestion: testQuestion
      }
      const result = await handleAdminAction(request)
      addResult(`✅ handleAdminAction success: ${result}`)
    } catch (error: any) {
      addResult(`❌ handleAdminAction failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testDeleteUser = async () => {
    if (!testUserId) {
      addResult('❌ No test user ID provided')
      return
    }
    
    if (!confirm(`Bạn có chắc chắn muốn xóa user ${testUserId}?`)) {
      addResult('❌ Delete cancelled by user')
      return
    }
    
    setLoading(true)
    try {
      addResult(`🔄 Testing deleteUser for ${testUserId}...`)
      const result = await deleteUser(testUserId)
      addResult(`✅ deleteUser success: ${result}`)
    } catch (error: any) {
      addResult(`❌ deleteUser failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Profile Tests
  const testGetProfiles = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing getAllProfiles...')
      const profiles = await getAllProfiles()
      addResult(`✅ getAllProfiles success: ${profiles.length} profiles found`)
    } catch (error: any) {
      addResult(`❌ getAllProfiles failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Quiz Service Tests
  const testGetSubjects = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing getAllSubjects...')
      const subjects = await getAllSubjects()
      addResult(`✅ getAllSubjects success: ${subjects.length} subjects found`)
      if (subjects.length > 0) {
        setTestSubjectId(subjects[0].id)
        addResult(`📝 Set test subject ID: ${subjects[0].id}`)
      }
    } catch (error: any) {
      addResult(`❌ getAllSubjects failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testCreateSubject = async () => {
    setLoading(true)
    try {
      addResult(`🔄 Testing createSubject: "${testSubjectName}"...`)
      const request: CreateSubjectRequest = {
        name: testSubjectName,
        description: testSubjectDescription
      }
      const result = await createSubject(request)
      addResult(`✅ createSubject success: ${result}`)
    } catch (error: any) {
      addResult(`❌ createSubject failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testDeleteSubject = async () => {
    if (!testSubjectId) {
      addResult('❌ No test subject ID provided')
      return
    }
    
    if (!confirm(`Bạn có chắc chắn muốn xóa subject ${testSubjectId}?`)) {
      addResult('❌ Delete subject cancelled by user')
      return
    }
    
    setLoading(true)
    try {
      addResult(`🔄 Testing deleteSubject for ${testSubjectId}...`)
      const result = await deleteSubject(testSubjectId)
      addResult(`✅ deleteSubject success: ${result}`)
    } catch (error: any) {
      addResult(`❌ deleteSubject failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetQuizzes = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing getAllQuizzes...')
      const quizzes = await getAllQuizzes()
      addResult(`✅ getAllQuizzes success: ${quizzes.length} quizzes found`)
    } catch (error: any) {
      addResult(`❌ getAllQuizzes failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetQuestions = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing getAllQuestions...')
      const questions = await getAllQuestions()
      addResult(`✅ getAllQuestions success: ${questions.length} questions found`)
    } catch (error: any) {
      addResult(`❌ getAllQuestions failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetAnswers = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing getAllAnswers...')
      const answers = await getAllAnswers()
      addResult(`✅ getAllAnswers success: ${answers.length} answers found`)
    } catch (error: any) {
      addResult(`❌ getAllAnswers failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetStatistics = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing getQuizStatistics...')
      const stats = await getQuizStatistics()
      addResult(`✅ getQuizStatistics success: ${JSON.stringify(stats).substring(0, 100)}...`)
    } catch (error: any) {
      addResult(`❌ getQuizStatistics failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // AI Service Tests
  const testAISuggestContent = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing AI suggest content...')
      const response = await fetch('/api/v1/Ai/gemini/suggest-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify('Tạo câu hỏi trắc nghiệm về lập trình')
      })
      
      if (response.ok) {
        const result = await response.json()
        addResult(`✅ AI suggest content success: ${JSON.stringify(result).substring(0, 100)}...`)
      } else {
        addResult(`❌ AI suggest content failed: HTTP ${response.status}`)
      }
    } catch (error: any) {
      addResult(`❌ AI suggest content failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAIGenerateContent = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing AI generate content...')
      const response = await fetch('/api/v1/Ai/gemini/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify('Lập trình web với React')
      })
      
      if (response.ok) {
        const result = await response.text()
        addResult(`✅ AI generate content success: ${result.substring(0, 100)}...`)
      } else {
        addResult(`❌ AI generate content failed: HTTP ${response.status}`)
      }
    } catch (error: any) {
      addResult(`❌ AI generate content failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAIExtractIntent = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing AI extract intent...')
      const request: GeminiRequest = {
        userQuestion: 'Tôi muốn tạo một bài quiz về toán học'
      }
      const response = await fetch('/api/v1/Ai/gemini/extract-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(request)
      })
      
      if (response.ok) {
        const result = await response.text()
        addResult(`✅ AI extract intent success: ${result.substring(0, 100)}...`)
      } else {
        addResult(`❌ AI extract intent failed: HTTP ${response.status}`)
      }
    } catch (error: any) {
      addResult(`❌ AI extract intent failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Notification Service Tests
  const testSendEmail = async () => {
    setLoading(true)
    try {
      addResult('🔄 Testing send email...')
      const response = await fetch('/api/v1/notification/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test Email from Admin',
          content: 'This is a test email from admin dashboard'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        addResult(`✅ Send email success: ${JSON.stringify(result).substring(0, 100)}...`)
      } else {
        addResult(`❌ Send email failed: HTTP ${response.status}`)
      }
    } catch (error: any) {
      addResult(`❌ Send email failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetUserEmail = async () => {
    if (!testUserId) {
      addResult('❌ No test user ID provided')
      return
    }
    
    setLoading(true)
    try {
      addResult(`🔄 Testing getUserEmailById for ${testUserId}...`)
      const response = await fetch(`/api/v1/notification/email/user/id?id=${testUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      
      if (response.ok) {
        const result = await response.text()
        addResult(`✅ Get user email success: ${result}`)
      } else {
        addResult(`❌ Get user email failed: HTTP ${response.status}`)
      }
    } catch (error: any) {
      addResult(`❌ Get user email failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                <span className="text-2xl">🔧</span>
              </div>
              <div>
                <h1 className="text-2xl font-rounded font-bold text-rainbow animate-heartbeat">🔧 Admin API Test</h1>
                <p className="text-white/90 font-semibold">✨ Test và debug các API endpoints ✨</p>
              </div>
            </div>
            <button
              onClick={clearResults}
              className="px-6 py-3 bg-white/20 text-white rounded-xl border-2 border-white/30 hover:bg-white/30 transition-all duration-200 font-rounded font-bold backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🗑️</span>
                <span>Clear Results</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-black overflow-hidden">

        {/* Test Controls */}
        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User & Auth Tests */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border-4 border-pink-200">
                <h3 className="text-lg font-rounded font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  <span>User & Auth</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-rounded font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">🆔</span>
                      <span>Test User ID</span>
                    </label>
                    <input
                      type="text"
                      value={testUserId}
                      onChange={(e) => setTestUserId(e.target.value)}
                      placeholder="Enter user ID to test..."
                      className="w-full px-4 py-3 border-4 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-rounded font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">🔑</span>
                      <span>Test Password</span>
                    </label>
                    <input
                      type="text"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      placeholder="Enter new password..."
                      className="w-full px-4 py-3 border-4 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-rounded font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">❓</span>
                      <span>Test Question</span>
                    </label>
                    <input
                      type="text"
                      value={testQuestion}
                      onChange={(e) => setTestQuestion(e.target.value)}
                      placeholder="Enter AI question..."
                      className="w-full px-4 py-3 border-4 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                    />
                  </div>
                </div>
              </div>
        </div>

            {/* Quiz Service Tests */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-4 border-blue-200">
                <h3 className="text-lg font-rounded font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  <span>Quiz Service</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-rounded font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">📖</span>
                      <span>Subject Name</span>
                    </label>
                    <input
                      type="text"
                      value={testSubjectName}
                      onChange={(e) => setTestSubjectName(e.target.value)}
                      placeholder="Enter subject name..."
                      className="w-full px-4 py-3 border-4 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-rounded font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">📝</span>
                      <span>Subject Description</span>
                    </label>
                    <input
                      type="text"
                      value={testSubjectDescription}
                      onChange={(e) => setTestSubjectDescription(e.target.value)}
                      placeholder="Enter subject description..."
                      className="w-full px-4 py-3 border-4 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-green-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-rounded font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">🆔</span>
                      <span>Test Subject ID</span>
                    </label>
                    <input
                      type="text"
                      value={testSubjectId}
                      onChange={(e) => setTestSubjectId(e.target.value)}
                      placeholder="Enter subject ID to test..."
                      className="w-full px-4 py-3 border-4 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-4 border-yellow-200">
                <h3 className="text-lg font-rounded font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🧪</span>
                  <span>Test Buttons</span>
                </h3>

                {/* User Management Tests */}
                <div className="space-y-4">
                  <h4 className="text-sm font-rounded font-bold text-gray-600 flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    <span>User Management</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={testGetUsers}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl border-4 border-blue-500 hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">👥</span>
                        <span>{loading ? 'Testing...' : 'Get Users'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testGetProfiles}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-xl border-4 border-purple-500 hover:from-purple-500 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">👤</span>
                        <span>{loading ? 'Testing...' : 'Get Profiles'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testLockUser}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-600 text-white rounded-xl border-4 border-yellow-500 hover:from-yellow-500 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🔒</span>
                        <span>{loading ? 'Testing...' : 'Lock User'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testUnlockUser}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl border-4 border-green-500 hover:from-green-500 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🔓</span>
                        <span>{loading ? 'Testing...' : 'Unlock User'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testChangePassword}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-400 to-pink-600 text-white rounded-xl border-4 border-purple-500 hover:from-purple-500 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🔑</span>
                        <span>{loading ? 'Testing...' : 'Change Password'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testDeleteUser}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-xl border-4 border-red-500 hover:from-red-500 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🗑️</span>
                        <span>{loading ? 'Testing...' : 'Delete User'}</span>
                      </div>
                    </button>
                  </div>
                </div>
            </div>

            {/* Quiz Service Tests */}
            <div className="space-y-6">
                  <h4 className="text-sm font-rounded font-bold text-gray-600 flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    <span>Quiz Service</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={testGetSubjects}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white rounded-xl border-4 border-indigo-500 hover:from-indigo-500 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">📚</span>
                        <span>{loading ? 'Testing...' : 'Get Subjects'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testCreateSubject}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl border-4 border-green-500 hover:from-green-500 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">➕</span>
                        <span>{loading ? 'Testing...' : 'Create Subject'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testDeleteSubject}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-xl border-4 border-red-500 hover:from-red-500 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🗑️</span>
                        <span>{loading ? 'Testing...' : 'Delete Subject'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testGetQuizzes}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-xl border-4 border-teal-500 hover:from-teal-500 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🎯</span>
                        <span>{loading ? 'Testing...' : 'Get Quizzes'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testGetQuestions}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white rounded-xl border-4 border-cyan-500 hover:from-cyan-500 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">❓</span>
                        <span>{loading ? 'Testing...' : 'Get Questions'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testGetAnswers}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl border-4 border-blue-500 hover:from-blue-500 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">💡</span>
                        <span>{loading ? 'Testing...' : 'Get Answers'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testGetStatistics}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-xl border-4 border-emerald-500 hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">📊</span>
                        <span>{loading ? 'Testing...' : 'Get Statistics'}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* AI Service Tests */}
                <div className="space-y-4">
                  <h4 className="text-sm font-rounded font-bold text-gray-600 flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <span>AI Service</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={testAskAI}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-xl border-4 border-pink-500 hover:from-pink-500 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🤖</span>
                        <span>{loading ? 'Testing...' : 'Ask AI'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testAdminAction}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-xl border-4 border-purple-500 hover:from-purple-500 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span>{loading ? 'Testing...' : 'Admin Action'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testAISuggestContent}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-rose-400 to-rose-600 text-white rounded-xl border-4 border-rose-500 hover:from-rose-500 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">💡</span>
                        <span>{loading ? 'Testing...' : 'AI Suggest'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testAIGenerateContent}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-violet-400 to-violet-600 text-white rounded-xl border-4 border-violet-500 hover:from-violet-500 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">✨</span>
                        <span>{loading ? 'Testing...' : 'AI Generate'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testAIExtractIntent}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-fuchsia-400 to-fuchsia-600 text-white rounded-xl border-4 border-fuchsia-500 hover:from-fuchsia-500 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">🎯</span>
                        <span>{loading ? 'Testing...' : 'AI Extract Intent'}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Notification Service Tests */}
                <div className="space-y-4">
                  <h4 className="text-sm font-rounded font-bold text-gray-600 flex items-center gap-2">
                    <span className="text-lg">📧</span>
                    <span>Notification</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={testSendEmail}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-xl border-4 border-orange-500 hover:from-orange-500 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">📧</span>
                        <span>{loading ? 'Testing...' : 'Send Email'}</span>
                      </div>
                    </button>
                    <button
                      onClick={testGetUserEmail}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl border-4 border-amber-500 hover:from-amber-500 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">📬</span>
                        <span>{loading ? 'Testing...' : 'Get User Email'}</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-4 border-gray-200">
          <h3 className="text-lg font-rounded font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span>Test Results</span>
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto bg-white rounded-xl p-4 border-2 border-gray-200">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-sm font-rounded text-center py-4">No test results yet. Click a test button to start.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono text-gray-800 bg-gray-50 rounded-lg p-2 border border-gray-200">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  )
}
