import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { transformApiUserProfile } from '@/utils/apiTransform'
import { getPrimaryRole, isTeacher, isAdmin, isStudent } from '@/utils/apiTransform'

interface LoginFlowProps {
  onLoginSuccess?: (user: any) => void
  onLoginError?: (error: string) => void
  autoRedirect?: boolean
}

export const LoginFlow: React.FC<LoginFlowProps> = ({ 
  onLoginSuccess, 
  onLoginError,
  autoRedirect = true
}) => {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [loginStep, setLoginStep] = useState<'idle' | 'logging' | 'redirecting' | 'success' | 'error'>('idle')

  // Function to handle login with auto-redirect
  const handleLogin = async (userData: any) => {
    try {
      setIsProcessing(true)
      setLoginStep('logging')
      
      // Transform API response
      const transformedUser = transformApiUserProfile(userData)
      
      // Login user
      login(transformedUser)
      
      // Get primary role
      const primaryRole = getPrimaryRole(transformedUser)
      
      console.log('Login successful:', {
        username: transformedUser.username,
        primaryRole,
        roles: transformedUser.roles
      })

      setLoginStep('redirecting')

      // Auto-redirect based on role
      if (autoRedirect) {
        setTimeout(() => {
          switch (primaryRole) {
            case 'ROLE_TEACHER':
              console.log('Redirecting teacher to dashboard')
              navigate('/teacher/dashboard', { replace: true })
              break
            case 'ROLE_ADMIN':
              console.log('Redirecting admin to dashboard')
              navigate('/admin/dashboard', { replace: true })
              break
            case 'ROLE_STUDENT':
              console.log('Redirecting student to dashboard')
              navigate('/student/dashboard', { replace: true })
              break
            case 'ROLE_USER':
            default:
              console.log('Redirecting user to dashboard')
              navigate('/dashboard', { replace: true })
              break
          }
          setLoginStep('success')
        }, 1000) // 1 second delay to show redirect message
      } else {
        setLoginStep('success')
      }

      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(transformedUser)
      }

    } catch (error) {
      console.error('Login error:', error)
      setLoginStep('error')
      if (onLoginError) {
        onLoginError(error instanceof Error ? error.message : 'Login failed')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Function to simulate login with mock data (for testing)
  const simulateLogin = () => {
    const mockUserData = {
      id: "af458dcf-d843-49a7-bcbf-c33e97d2479c",
      username: "ngocduong3",
      status: "ONLINE",
      email: "ngocduong3@yopmail.com",
      firstName: "duong",
      lastName: "Loi",
      imageUrl: null,
      gender: "female",
      phoneNumber: "1234567872",
      dateOfBirth: "0012-11-16T00:00:00.000+00:00",
      city: "DN",
      emailVerified: false,
      roles: [
        {
          name: 'ROLE_TEACHER',
          description: 'TEACHER',
          permissions: ['TEACHER']
        },
        {
          name: 'ROLE_USER',
          description: 'Users role',
          permissions: []
        }
      ],
      createdAt: "2025-10-13T17:03:14.607131",
      bio: null,
      blocked: false,
      profileId: "68ecce6253414248f4f10473",
      mssv: "311234424",
      fullName: null
    }

    handleLogin(mockUserData)
  }

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (!loading && user && autoRedirect) {
      const primaryRole = getPrimaryRole(user)
      
      // Check if we're already on the correct page
      const currentPath = window.location.pathname
      let shouldRedirect = false
      let targetPath = ''

      switch (primaryRole) {
        case 'ROLE_TEACHER':
          if (!currentPath.startsWith('/teacher')) {
            shouldRedirect = true
            targetPath = '/teacher/dashboard'
          }
          break
        case 'ROLE_ADMIN':
          if (!currentPath.startsWith('/admin')) {
            shouldRedirect = true
            targetPath = '/admin/dashboard'
          }
          break
        case 'ROLE_STUDENT':
          if (!currentPath.startsWith('/student')) {
            shouldRedirect = true
            targetPath = '/student/dashboard'
          }
          break
        case 'ROLE_USER':
        default:
          if (!currentPath.startsWith('/dashboard') && 
              !currentPath.startsWith('/teacher') && 
              !currentPath.startsWith('/admin') && 
              !currentPath.startsWith('/student')) {
            shouldRedirect = true
            targetPath = '/dashboard'
          }
          break
      }

      if (shouldRedirect) {
        console.log(`Auto-redirecting ${primaryRole} to ${targetPath}`)
        navigate(targetPath, { replace: true })
      }
    }
  }, [user, loading, navigate, autoRedirect])

  const getStepMessage = () => {
    switch (loginStep) {
      case 'logging':
        return 'Đang đăng nhập...'
      case 'redirecting':
        return 'Đang chuyển hướng đến giao diện phù hợp...'
      case 'success':
        return 'Đăng nhập thành công!'
      case 'error':
        return 'Có lỗi xảy ra khi đăng nhập'
      default:
        return 'Sẵn sàng đăng nhập'
    }
  }

  const getStepIcon = () => {
    switch (loginStep) {
      case 'logging':
        return '⏳'
      case 'redirecting':
        return '🔄'
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '🔐'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🔐 Login Flow Test</h3>
      
      <div className="space-y-4">
        {/* Current Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2">Current Status</h4>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-gray-600">Loading...</span>
            </div>
          ) : user ? (
            <div className="space-y-1 text-sm">
              <div><strong>User:</strong> {user.username}</div>
              <div><strong>Role:</strong> {getPrimaryRole(user)}</div>
              <div><strong>Is Teacher:</strong> {isTeacher(user) ? '✅ Yes' : '❌ No'}</div>
            </div>
          ) : (
            <div className="text-gray-600">Not logged in</div>
          )}
        </div>

        {/* Login Step Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getStepIcon()}</span>
            <span className="font-medium text-blue-800">{getStepMessage()}</span>
          </div>
        </div>

        {/* Login Actions */}
        <div className="space-y-2">
          <button
            onClick={simulateLogin}
            disabled={isProcessing}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {isProcessing ? 'Processing...' : 'Simulate Teacher Login'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Refresh Page
          </button>
        </div>

        {/* Flow Explanation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">📋 Login Flow</h4>
          <div className="space-y-2 text-green-700 text-sm">
            <p><strong>1.</strong> User login → API returns user data with roles</p>
            <p><strong>2.</strong> Transform API response → Extract roles properly</p>
            <p><strong>3.</strong> Check primary role → ROLE_TEACHER detected</p>
            <p><strong>4.</strong> Auto-redirect → Navigate to /teacher/dashboard</p>
            <p><strong>5.</strong> Show teacher interface → Navigation + dashboard</p>
          </div>
        </div>

        {/* Expected Results */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">🎯 Expected Results</h4>
          <div className="space-y-1 text-yellow-700 text-sm">
            <p>✅ User data loaded with ROLE_TEACHER</p>
            <p>✅ Auto-redirect to /teacher/dashboard</p>
            <p>✅ Teacher navigation appears</p>
            <p>✅ Teacher dashboard accessible</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginFlow
