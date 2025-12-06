import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginApi } from '@/api/client'
import GoogleLoginButton from '@/components/GoogleLoginButton'
import FloatingAIAssistant from '@/components/FloatingAIAssistant'
import { transformApiUserProfile } from '@/utils/apiTransform'
import '../styles/animations.css'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('@yopmail.com')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [showOtpStep, setShowOtpStep] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showEmergencyUnlock, setShowEmergencyUnlock] = useState(false)

  // Helper function to fetch and store user profile data
  const fetchAndStoreUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.warn('No access token found for profile fetch')
        return
      }

      console.log('🔍 Fetching user profile data...')
      const response = await fetch('/api/v1/profile/users/my-profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        console.log('✅ User profile fetched:', userData)
        
        if (userData.code === 1000 && userData.result) {
          // Transform API response
          const transformedUser = transformApiUserProfile(userData.result)
          console.log('✅ Transformed user profile:', transformedUser)
          
          // Store user profile in localStorage for useAuth hook
          localStorage.setItem('user_profile', JSON.stringify(transformedUser))
          console.log('💾 User profile stored in localStorage')
        } else {
          console.warn('⚠️ Invalid user data response')
        }
      } else {
        console.warn('⚠️ Failed to fetch user profile')
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Clear console errors from dev-kit.js
    console.clear()
    
    if (!showOtpStep) {
      // Bước 1: Gửi thông tin đăng nhập với OTP = 0
      setMsg({ text: 'Đang xác thực thông tin...', type: 'info' })
      setLoading(true)
      try {
        console.log('🔍 Bước 1: Gửi thông tin đăng nhập với OTP = 0')
        
        // Thêm timeout để xử lý trường hợp network chậm
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), 10000) // 10 giây timeout
        })
        
        // Gửi thông tin đăng nhập với OTP = 0 (backend sẽ gửi OTP và throw OTP_SENT exception)
        try {
          const result = await Promise.race([
            loginApi(username.trim(), password, 0),
            timeoutPromise
          ])
           console.log('✅ Bước 1: Đăng nhập thành công (không cần OTP - admin)')
           console.log('🎉 Token received:', result)
           
           // Token đã được lưu trong loginApi
           console.log('💾 Token already saved to localStorage')
           
           // Fetch and store user profile data
           await fetchAndStoreUserProfile()
           
           setMsg({ text: 'Đăng nhập thành công!', type: 'success' })
           
           // Redirect admin to dashboard, regular users to quiz homepage
           if (username.trim().toLowerCase() === 'admin') {
             console.log('👑 Redirecting admin to dashboard...')
             // Đảm bảo token đã được lưu trước khi redirect
             setTimeout(() => {
               navigate('/admin')
             }, 100)
             return
           } else {
             console.log('👤 Redirecting user to quiz homepage...')
             setTimeout(() => {
               navigate('/quiz')
             }, 100)
             return
           }
        } catch (loginError: any) {
          console.log('🔍 Backend response:', loginError.message)
          console.log('🔍 Full error:', loginError)
          
          // Kiểm tra nếu là lỗi OTP_SENT (đây là trường hợp bình thường)
          if (loginError.message === 'OTP_SENT' || (
            loginError.message && (
              loginError.message.includes('OTP_SENT') || 
              loginError.message.includes('OTP đã được gửi') ||
              loginError.message.includes('OTP sent')
            )
          )) {
            console.log('✅ OTP đã được gửi thành công - chuyển sang giao diện 2FA')
            setShowOtpStep(true)
            setMsg({ text: 'Vui lòng nhập mã OTP 6 số đã được gửi đến email của bạn.', type: 'success' })
            return
          }
          
          // Kiểm tra nếu là admin account bị khóa
          if (username.trim().toLowerCase() === 'admin' && 
              loginError.message && loginError.message.includes('locked')) {
            console.log('🔒 Admin account is locked!')
            setMsg({ 
              text: 'Tài khoản admin đã bị khóa! Vui lòng liên hệ quản trị viên khác để mở khóa.', 
              type: 'error' 
            })
            setShowEmergencyUnlock(true)
            return
          }
          
          // Kiểm tra nếu là admin (không cần OTP) - chỉ khi không bị khóa
          if (username.trim().toLowerCase() === 'admin') {
            console.log('👑 Admin user - không cần OTP, đăng nhập trực tiếp')
            
            // Token đã được lưu trong loginApi
            console.log('💾 Admin token already saved to localStorage')
            
            // Fetch and store user profile data for admin
            await fetchAndStoreUserProfile()
            
            setMsg({ text: 'Đăng nhập thành công! (Admin)', type: 'success' })
            console.log('👑 Redirecting admin to dashboard from catch block...')
            // Đảm bảo token đã được lưu trước khi redirect
            setTimeout(() => {
              navigate('/admin')
            }, 100)
            return
          }
          
          // Xử lý timeout
          if (loginError.message === 'TIMEOUT') {
            console.log('⏰ Timeout - có thể OTP đã được gửi thành công')
            setShowOtpStep(true)
            setMsg({ 
              text: 'Timeout - có thể OTP đã được gửi. Vui lòng kiểm tra email và nhập mã OTP 6 số.', 
              type: 'info' 
            })
            return
          }
          
          // Fallback: Nếu là "Failed to fetch" nhưng có thể OTP đã được gửi
          if (loginError.message === 'Failed to fetch' || loginError.message.includes('Failed to fetch')) {
            console.log('⚠️ Network error - có thể OTP đã được gửi thành công')
            console.log('🔧 Chuyển sang giao diện 2FA để user có thể nhập OTP')
            setShowOtpStep(true)
            setMsg({ 
              text: 'Có thể OTP đã được gửi. Vui lòng kiểm tra email và nhập mã OTP 6 số.', 
              type: 'info' 
            })
            return
          }
          
          // Nếu không phải lỗi OTP_SENT hoặc Failed to fetch, throw lại lỗi
          throw loginError
        }
        
      } catch (err: any) {
        console.error('❌ Lỗi trong quá trình xác thực:', err)
        setMsg({ text: err?.message || 'Xác thực thất bại', type: 'error' })
      } finally {
        setLoading(false)
      }
    } else {
         // Bước 2: Gửi OTP để hoàn tất đăng nhập
         // Kiểm tra nếu là admin thì không cần OTP
         if (username.trim().toLowerCase() === 'admin') {
           console.log('👑 Admin user - đăng nhập trực tiếp không cần OTP')
           
           // Token đã được lưu trong loginApi
           console.log('💾 Admin token already saved to localStorage')
           
           // Fetch and store user profile data for admin
           await fetchAndStoreUserProfile()
           
           setMsg({ text: 'Đăng nhập thành công! (Admin)', type: 'success' })
           // Đảm bảo token đã được lưu trước khi redirect
           setTimeout(() => {
             navigate('/admin')
           }, 100)
           return
         }
      
      if (otp.length !== 6) {
        setMsg({ text: 'Vui lòng nhập đầy đủ mã OTP 6 số.', type: 'error' })
        return
      }
      
    setMsg({ text: 'Đang đăng nhập...', type: 'info' })
    setLoading(true)
    try {
        console.log('🔍 Bước 2: Gửi OTP để hoàn tất đăng nhập')
        console.log('📤 Request:', { username: username.trim(), password: '***', otp: Number(otp) })
        
        const result = await loginApi(username.trim(), password, Number(otp))
        console.log('✅ Bước 2: Đăng nhập thành công với OTP')
        
        // Token đã được lưu trong loginApi, chỉ cần log
        console.log('💾 Token already saved to localStorage')
        
        // Fetch and store user profile data
        await fetchAndStoreUserProfile()
        
      setMsg({ text: 'Đăng nhập thành công!', type: 'success' })
        console.log('Login result:', result)
      
      // Redirect to quiz homepage for regular users
      setTimeout(() => {
        navigate('/quiz')
      }, 1000)
    } catch (err: any) {
        console.error('❌ Lỗi đăng nhập với OTP:', err)
      setMsg({ text: err?.message || 'Đăng nhập thất bại', type: 'error' })
    } finally {
      setLoading(false)
      }
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  const goBackToCredentials = () => {
    setShowOtpStep(false)
    setOtp('')
    setMsg(null)
  }

  const handleEmergencyUnlock = async () => {
    setLoading(true)
    setMsg({ text: 'Đang mở khóa admin account...', type: 'info' })
    
    try {
      // Gọi API unlock admin (cần implement trong adminClient)
      const response = await fetch('/api/v1/admin/emergency-unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          adminUsername: 'admin',
          emergencyCode: 'ADMIN_EMERGENCY_2024' 
        })
      })
      
      if (response.ok) {
        setMsg({ text: 'Admin account đã được mở khóa! Vui lòng thử đăng nhập lại.', type: 'success' })
        setShowEmergencyUnlock(false)
      } else {
        setMsg({ text: 'Không thể mở khóa admin account. Vui lòng liên hệ quản trị viên.', type: 'error' })
      }
    } catch (error) {
      console.error('Emergency unlock error:', error)
      setMsg({ text: 'Lỗi khi mở khóa admin account.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async () => {
    setMsg({ text: 'Đăng nhập Google thành công!', type: 'success' })
    
    // Fetch and store user profile data for Google login
    await fetchAndStoreUserProfile()
    
    setTimeout(() => {
      navigate('/quiz')
    }, 1000)
  }

  const handleGoogleError = (error: string) => {
    setMsg({ text: `Google đăng nhập thất bại: ${error}`, type: 'error' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full -translate-x-16 -translate-y-16 opacity-60 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full translate-x-12 -translate-y-12 opacity-70 animate-bounce"></div>
        <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-green-200 rounded-full -translate-y-10 opacity-50 animate-ping"></div>
        <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-blue-200 rounded-full -translate-y-8 opacity-60 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 bg-red-200 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-purple-200 rounded-full opacity-50 animate-ping"></div>
      </div>
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
      {/* Form Card */}
        <div className="order-2 lg:order-1">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-black p-8 lg:p-10 relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white border-2 border-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6l7.794 4.5v3L12 18l-7.794-4.5v-3L12 6z"/></svg>
                </div>
                <div className="text-left">
                  <span className="text-xl font-rounded font-bold text-rainbow">Quiz Linkverse</span>
                  <span className="ml-2 text-xs font-rounded font-bold px-2 py-1 rounded-full bg-yellow-200 text-black border-2 border-black">Beta</span>
                </div>
              </div>
              <h1 className="text-3xl font-rounded font-bold text-gray-900 mb-2 animate-heartbeat">
                {showOtpStep ? '🔐 Xác thực OTP' : '🎉 Chào mừng trở lại'}
              </h1>
              <p className="text-gray-700 font-semibold">
                {showOtpStep 
                  ? (username.trim().toLowerCase() === 'admin' 
                      ? '👑 Admin không cần OTP - đăng nhập trực tiếp' 
                      : '📧 Nhập mã OTP 6 số để hoàn tất đăng nhập'
                    )
                  : username.trim().toLowerCase() === 'admin'
                    ? '👑 Admin đăng nhập bằng username/password'
                    : '✨ Đăng nhập để tiếp tục hành trình học tập của bạn'
                }
              </p>
            </div>
            <form className="space-y-6" onSubmit={onSubmit}>
              {!showOtpStep ? (
                // Bước 1: Nhập thông tin đăng nhập
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Thông tin đăng nhập</h3>
          </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="username">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                          Tên đăng nhập
                        </label>
                        <div className="relative">
                          <input 
                            id="username" 
                            className="w-full px-4 py-3 pl-12 rounded-xl border-4 border-black bg-yellow-50 focus:bg-yellow-100 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            required 
                            placeholder="👤 Nhập username hoặc email" 
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </div>
            </div>
          </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="password">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                          Mật khẩu
                        </label>
                        <div className="relative">
                          <input 
                            id="password" 
                            type={showPassword ? 'text' : 'password'} 
                            className="w-full px-4 py-3 pl-12 pr-12 rounded-xl border-4 border-black bg-green-50 focus:bg-green-100 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            placeholder="🔒 Nhập mật khẩu" 
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                          </div>
                          <button 
                            type="button" 
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" 
                            onClick={() => setShowPassword(v => !v)}
                          >
                {showPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M7.05 7.05C5.23 8.23 3.77 9.94 3 12c1.5 4 6 7 9 7 1.37 0 2.79-.41 4.1-1.13M14.12 14.12A3 3 0 019.88 9.88M12 5c3 0 7.5 3 9 7-.53 1.42-1.5 2.74-2.73 3.84"/></svg>
                ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.638 0 8.573 2.507 9.964 6.678.07.207.07.431 0 .639C20.577 16.49 16.64 19 12 19c-4.638 0-8.573-2.507-9.964-6.678z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                )}
              </button>
            </div>
          </div>
                    </div>
                  </div>
                </>
              ) : (
                // Bước 2: Nhập OTP
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Xác thực OTP</h3>
                    </div>
                    
                    <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-800">
                        {username.trim().toLowerCase() === 'admin' 
                          ? 'Admin không cần OTP - đăng nhập trực tiếp'
                          : `Mã OTP đã được gửi đến email: ${username}`
                        }
                      </p>
                    </div>
                      
                      {username.trim().toLowerCase() !== 'admin' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="otp">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            Mã OTP (6 số)
                          </label>
                          <div className="relative">
                            <input 
                              id="otp" 
                              type="text" 
                              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                              value={otp} 
                              onChange={handleOtpChange}
                              placeholder="000000"
                              maxLength={6}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Nhập mã OTP 6 số đã được gửi đến email</span>
                            <button 
                              type="button"
                              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                              onClick={async () => {
                                setOtp('')
                                setMsg({ text: 'Đang gửi lại mã OTP...', type: 'info' })
                                try {
                                  // Gửi lại request với OTP = 0 để backend gửi OTP mới
                                  await loginApi(username.trim(), password, 0)
                                  setMsg({ text: 'Mã OTP mới đã được gửi.', type: 'success' })
                                } catch (err: any) {
                                  // Kiểm tra nếu là OTP_SENT exception (thành công)
                                  if (err.message === 'OTP_SENT' || (
                                    err.message && (
                                      err.message.includes('OTP_SENT') || 
                                      err.message.includes('OTP đã được gửi') ||
                                      err.message.includes('OTP sent')
                                    )
                                  )) {
                                    setMsg({ text: 'Mã OTP mới đã được gửi.', type: 'success' })
                                  } else {
                                    setMsg({ text: err?.message || 'Gửi lại OTP thất bại. Vui lòng thử lại.', type: 'error' })
                                  }
                                }
                              }}
                            >
                              Gửi lại
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {username.trim().toLowerCase() === 'admin' && (
                        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                          <p className="text-sm text-green-800">
                            👑 Admin đăng nhập thành công - không cần OTP
                          </p>
                        </div>
                      )}
            </div>
          </div>
                </>
              )}
              {/* Options and Submit */}
              <div className="space-y-6 pt-4">
                {!showOtpStep && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="inline-flex items-center gap-2 select-none">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                        checked={remember} 
                        onChange={e => setRemember(e.target.checked)} 
                      />
              Ghi nhớ đăng nhập
            </label>
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                      Quên mật khẩu?
                    </a>
                  </div>
                )}

                {showOtpStep && (
                  <div className="flex justify-between items-center text-sm">
                    <button 
                      type="button"
                      onClick={goBackToCredentials}
                      className="text-gray-600 hover:text-gray-800 font-medium hover:underline"
                    >
                      ← Quay lại thay đổi thông tin đăng nhập
                    </button>
                    <button 
                      type="button"
                      onClick={async () => {
                        setMsg({ text: 'Đang gửi lại mã OTP...', type: 'info' })
                        try {
                          // Gửi lại request với OTP = 0 để backend gửi OTP mới
                          await loginApi(username.trim(), password, 0)
                          setMsg({ text: 'Mã OTP mới đã được gửi.', type: 'success' })
                        } catch (err: any) {
                          // Kiểm tra nếu là OTP_SENT exception (thành công)
                          if (err.message === 'OTP_SENT' || (
                            err.message && (
                              err.message.includes('OTP_SENT') || 
                              err.message.includes('OTP đã được gửi') ||
                              err.message.includes('OTP sent')
                            )
                          )) {
                            setMsg({ text: 'Mã OTP mới đã được gửi.', type: 'success' })
                          } else {
                            setMsg({ text: err?.message || 'Gửi lại OTP thất bại. Vui lòng thử lại.', type: 'error' })
                          }
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      Gửi lại OTP
                    </button>
          </div>
                )}

                <button 
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-rounded font-bold py-4 px-6 rounded-xl border-4 border-black shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 btn-magic" 
                  disabled={loading}
                >
            {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
                  {loading ? (
                    showOtpStep ? 'Đang đăng nhập...' : 'Đang xác thực...'
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showOtpStep ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                        )}
                      </svg>
                      {showOtpStep ? 'Đăng nhập' : 'Tiếp tục'}
                    </>
                  )}
          </button>

                {/* Chỉ hiển thị Google Login cho user thường, không cho admin */}
                {!showOtpStep && username.trim().toLowerCase() !== 'admin' && (
                  <>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-1 bg-black rounded-full"></div>
                      <span className="text-xs font-rounded font-bold text-gray-700 px-2">🔄 Hoặc tiếp tục với</span>
                      <div className="flex-1 h-1 bg-black rounded-full"></div>
                    </div>
                    
          <div className="grid grid-cols-2 gap-3">
                      <GoogleLoginButton
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        disabled={loading}
                        className="w-full px-4 py-3 rounded-xl border-4 border-black bg-red-50 hover:bg-red-100 text-gray-800 inline-flex items-center justify-center gap-2 font-rounded font-bold transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                      >
                        🔍 Google
                      </GoogleLoginButton>
                      <button type="button" className="w-full px-4 py-3 rounded-xl border-4 border-black bg-gray-50 hover:bg-gray-100 text-gray-800 inline-flex items-center justify-center gap-2 font-rounded font-bold transition-all duration-200 hover:shadow-lg transform hover:scale-105">
                        🐙
                        GitHub
                      </button>
          </div>
                  </>
                )}

                <div className="text-center space-y-3">
                  <p className="text-sm font-rounded font-semibold text-gray-700">
                    🤔 Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-pink-600 hover:text-pink-700 font-rounded font-bold hover:underline transition-colors">
                      ✨ Đăng ký ngay
                    </Link>
                  </p>
                </div>

        {msg && (
                  <div className={`p-4 rounded-xl text-sm font-medium ${
                    msg.type === 'info' 
                      ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                      : msg.type === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {msg.type === 'info' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                      {msg.type === 'success' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                      {msg.type === 'error' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                      {msg.text}
                    </div>
                  </div>
                )}

                {/* Emergency Unlock Button */}
                {showEmergencyUnlock && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"/>
                      </svg>
                      <span className="text-sm font-semibold text-red-800">Emergency Admin Unlock</span>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      Admin account đã bị khóa. Sử dụng emergency unlock để mở khóa tài khoản admin.
                    </p>
                    <button
                      type="button"
                      onClick={handleEmergencyUnlock}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang mở khóa...
                        </>
                      ) : (
                        <>
                          🔓 Emergency Unlock Admin
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="order-1 lg:order-2 hidden lg:flex">
          <div className="w-full h-[600px] bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-2xl shadow-2xl border-4 border-black relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 blur-2xl animate-pulse delay-500"></div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8">
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-rounded text-rainbow mb-4 animate-heartbeat">
                  📚 Quiz Linkverse
                </h1>
                <p className="text-xl lg:text-2xl font-animated text-glow mb-2 animate-fade-in">
                  ✨ Khám phá và tham gia các bài quiz thú vị ✨
                </p>
                <p className="text-lg font-semibold text-white/90 animate-slide-up">
                  🎯 Học tập thông minh, vui vẻ và hiệu quả
                </p>
              </div>
              
              <div className="space-y-4 w-full max-w-sm">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔐</span>
                  </div>
                  <span className="font-medium">Bảo mật 2 lớp với OTP</span>
                </div>
                
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <span className="font-medium">Đăng nhập nhanh chóng</span>
                </div>
                
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <span className="font-medium">Theo dõi tiến độ học tập</span>
                </div>

                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">👥</span>
                  </div>
                  <span className="font-medium">Kết nối với cộng đồng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  )
}
