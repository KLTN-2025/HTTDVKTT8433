import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GoogleCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Đang xử lý đăng nhập Google...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔍 GoogleCallback: Starting callback handling...')
        console.log('🔍 Current URL:', window.location.href)
        console.log('🔍 Search params:', window.location.search)
        
        // Check if we have token in URL params
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        
        console.log('🔍 Token from URL:', token ? token.substring(0, 20) + '...' : 'null')
        
        if (token) {
          console.log('✅ Google OAuth2 callback successful, token received:', token.substring(0, 20) + '...')
          
          // Save token to localStorage
          localStorage.setItem('access_token', token)
          console.log('💾 Token saved to localStorage')
          
          setStatus('success')
          setMessage('Đăng nhập Google thành công!')
          
          // Small delay to ensure token is saved before redirect
          console.log('🔄 Redirecting to quiz homepage...')
          setTimeout(() => {
            navigate('/quiz', { replace: true })
          }, 100)
        } else {
          // Check if token already exists in localStorage
          const existingToken = localStorage.getItem('access_token')
          console.log('🔍 Existing token in localStorage:', existingToken ? existingToken.substring(0, 20) + '...' : 'null')
          
          if (existingToken) {
            console.log('✅ Token already exists in localStorage')
            setStatus('success')
            setMessage('Đăng nhập Google thành công!')
            navigate('/quiz', { replace: true })
          } else {
            throw new Error('Không nhận được token từ Google OAuth2')
          }
        }
      } catch (error: any) {
        console.error('❌ Google OAuth2 callback error:', error)
        setStatus('error')
        setMessage(`Lỗi đăng nhập Google: ${error.message}`)
        
        // Redirect back to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-10 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
            {status === 'loading' && (
              <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
            {status === 'success' && (
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            )}
            {status === 'error' && (
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && 'Đang xử lý...'}
            {status === 'success' && 'Đăng nhập thành công!'}
            {status === 'error' && 'Đăng nhập thất bại'}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span className="text-sm">Vui lòng chờ...</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800">
                  Sẽ chuyển về trang đăng nhập trong vài giây...
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Quay về trang đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
