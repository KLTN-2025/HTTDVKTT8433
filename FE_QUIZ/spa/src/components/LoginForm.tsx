import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { transformApiUserProfile } from '@/utils/apiTransform'

export const LoginForm: React.FC = () => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Call login API
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.code === 1000 && data.result) {
        // Store tokens
        if (data.result.accessToken) {
          localStorage.setItem('access_token', data.result.accessToken)
        }
        if (data.result.refreshToken) {
          localStorage.setItem('refresh_token', data.result.refreshToken)
        }

        // Get user profile
        const profileResponse = await fetch('/api/v1/profile/users/my-profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.result.accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (!profileResponse.ok) {
          throw new Error(`Profile fetch failed: ${profileResponse.status}`)
        }

        const profileData = await profileResponse.json()
        
        if (profileData.code === 1000 && profileData.result) {
          // Transform and login user
          const transformedUser = transformApiUserProfile(profileData.result)
          login(transformedUser)
          
          setSuccess('Login successful! Redirecting...')
          
          // Auto-redirect based on role
          setTimeout(() => {
            const primaryRole = transformedUser.roles[0] // Get first role
            switch (primaryRole) {
              case 'ROLE_TEACHER':
                window.location.href = '/teacher/dashboard'
                break
              case 'ROLE_ADMIN':
                window.location.href = '/admin/dashboard'
                break
              case 'ROLE_STUDENT':
                window.location.href = '/student/dashboard'
                break
              default:
                window.location.href = '/dashboard'
                break
            }
          }, 2000)
        } else {
          throw new Error('Invalid profile response')
        }
      } else {
        throw new Error('Invalid login response')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleMockLogin = () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Mock login with teacher role
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

    try {
      // Transform and login user
      const transformedUser = transformApiUserProfile(mockUserData)
      login(transformedUser)
      
      setSuccess('Mock login successful! Redirecting...')
      
      // Auto-redirect to teacher dashboard
      setTimeout(() => {
        window.location.href = '/teacher/dashboard'
      }, 2000)
    } catch (err) {
      setError('Mock login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">🔐 Login</h2>
            <p className="text-gray-600 mt-2">Enter your credentials to access the system</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <button
              onClick={handleMockLogin}
              disabled={loading}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              {loading ? 'Logging in...' : 'Mock Teacher Login'}
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">❌</span>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Debug Link */}
          <div className="mt-6 text-center">
            <a
              href="/debug"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Go to Debug Page →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
