import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isTeacher, isAdmin, isStudent } from '@/utils/apiTransform'

interface RoleBasedRedirectProps {
  children: React.ReactNode
  fallbackPath?: string
}

export default function RoleBasedRedirect({ children, fallbackPath = '/quiz' }: RoleBasedRedirectProps) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      console.log('🔍 RoleBasedRedirect: Checking user role...', { user })
      
      // Auto-redirect based on role
      if (isTeacher(user)) {
        console.log('👨‍🏫 Teacher detected - redirecting to teacher dashboard')
        navigate('/teacher/dashboard', { replace: true })
        return
      } else if (isAdmin(user)) {
        console.log('👑 Admin detected - redirecting to admin dashboard')
        navigate('/admin', { replace: true })
        return
      } else if (isStudent(user)) {
        console.log('🎓 Student detected - staying on current page')
        // Student can stay on current page
        return
      } else {
        console.log('👤 Regular user - staying on current page')
        // Regular user can stay on current page
        return
      }
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-300 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-reverse-slow"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}