import { useState } from 'react'
import { googleLoginApi } from '@/api/client'
import { initializeGoogleAuth, createGoogleLoginButton } from '@/config/google'

interface GoogleLoginButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export default function GoogleLoginButton({ 
  onSuccess, 
  onError, 
  disabled = false,
  className = "w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-700 inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
  children = "Tiếp tục với Google"
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    if (disabled || loading) return
    
    setLoading(true)
    
    try {
      // Redirect to backend OAuth2 authorization endpoint
      const authUrl = '/api/v1/identity/oauth2/authorization/google'
      console.log('🔍 Redirecting to Google OAuth2:', authUrl)
      
      // Redirect to backend OAuth2 flow
      window.location.href = authUrl
      
    } catch (error: any) {
      console.error('❌ Google login error:', error)
      onError?.(error.message || 'Google đăng nhập thất bại')
      setLoading(false)
    }
  }

  return (
    <button 
      type="button" 
      onClick={handleGoogleLogin}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? 'Đang xử lý...' : children}
    </button>
  )
}
