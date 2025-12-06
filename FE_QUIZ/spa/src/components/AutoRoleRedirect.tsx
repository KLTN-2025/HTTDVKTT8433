import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getPrimaryRole, isTeacher, isAdmin, isStudent } from '@/utils/apiTransform'

export const AutoRoleRedirect: React.FC = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Chỉ redirect khi user đã load xong và không đang ở trang login
    if (!loading && user && location.pathname !== '/login') {
      const primaryRole = getPrimaryRole(user)
      
      console.log('Auto redirect check:', {
        user: user.username,
        primaryRole,
        currentPath: location.pathname
      })

      // Redirect based on primary role
      switch (primaryRole) {
        case 'ROLE_TEACHER':
          if (!location.pathname.startsWith('/teacher')) {
            console.log('Redirecting teacher to dashboard')
            navigate('/teacher/dashboard', { replace: true })
          }
          break
        case 'ROLE_ADMIN':
          if (!location.pathname.startsWith('/admin')) {
            console.log('Redirecting admin to dashboard')
            navigate('/admin/dashboard', { replace: true })
          }
          break
        case 'ROLE_STUDENT':
          if (!location.pathname.startsWith('/student')) {
            console.log('Redirecting student to dashboard')
            navigate('/student/dashboard', { replace: true })
          }
          break
        case 'ROLE_USER':
        default:
          if (!location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/teacher') && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/student')) {
            console.log('Redirecting user to dashboard')
            navigate('/dashboard', { replace: true })
          }
          break
      }
    }
  }, [user, loading, navigate, location.pathname])

  // Không render gì, chỉ handle redirect
  return null
}

export default AutoRoleRedirect
