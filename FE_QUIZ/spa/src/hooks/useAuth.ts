import { useState, useEffect, useCallback } from 'react'
import { UserProfile, AuthResponse } from '@/types/auth'
import { getRoleBasedNavItems } from '@/utils/roleUtils'
import { transformApiUserProfile } from '@/utils/apiTransform'

interface UseAuthReturn {
  user: UserProfile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (userData: UserProfile) => void
  logout: () => void
  updateUser: (userData: Partial<UserProfile>) => void
  refreshUser: () => Promise<void>
  navigationItems: Array<{ name: string; path: string; roles: string[] }>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Get navigation items based on user role
  const navigationItems = getRoleBasedNavItems(user)

  // Login function
  const login = useCallback((userData: UserProfile) => {
    try {
      setUser(userData)
      localStorage.setItem('user_profile', JSON.stringify(userData))
      setError(null)
    } catch (err) {
      console.error('Error saving user to localStorage:', err)
      setError('Failed to save user data')
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('user_profile')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setError(null)
  }, [])

  // Refresh user data from API
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const response = await fetch('/api/v1/profile/users/my-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, logout user
          logout()
          throw new Error('Session expired')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: AuthResponse = await response.json()
      
      if (data.code === 1000 && data.result) {
        // Transform API response to match our UserProfile interface
        const transformedUser = transformApiUserProfile(data.result)
        login(transformedUser)
        // Also store in localStorage for persistence
        localStorage.setItem('user_profile', JSON.stringify(transformedUser))
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error refreshing user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh user data')
    } finally {
      setLoading(false)
    }
  }, [login, logout])

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user_profile')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        } else {
          // If no user data in localStorage but we have a token, try to fetch it
          const token = localStorage.getItem('access_token')
          if (token) {
            console.log('No user data in localStorage, but token exists. Fetching user profile...')
            await refreshUser()
          }
        }
      } catch (err) {
        console.error('Error loading user from localStorage:', err)
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [refreshUser])

  // Update user function
  const updateUser = useCallback((userData: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user_profile', JSON.stringify(updatedUser))
    }
  }, [user])

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser,
    navigationItems
  }
}

export default useAuth
