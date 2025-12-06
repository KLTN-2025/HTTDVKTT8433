import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerApi, generateOtpApi, type RegisterPayload } from '@/api/client'
import GoogleLoginButton from '@/components/GoogleLoginButton'
import FloatingAIAssistant from '@/components/FloatingAIAssistant'
import '../styles/animations.css'

export default function Register() {
  const nav = useNavigate()
  const [form, setForm] = useState<RegisterPayload>({
    username: '', password: '', email: '', mssv: '',
    firstName: '', lastName: '', phoneNumber: '', city: '', dateOfBirth: '', gender: null
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpField, setShowOtpField] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [skipOtp, setSkipOtp] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = form.password === confirmPassword

  const passwordStrength = (() => {
    const p = form.password || ''
    let score = 0
    if (p.length >= 6) score++
    if (/[0-9]/.test(p) && /[a-zA-Z]/.test(p)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(p) || p.length >= 10) score++
    return Math.min(3, Math.max(1, score)) as 1 | 2 | 3
  })()

  const update = (k: keyof RegisterPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [k]: e.target.value }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) {
      setMsg({ text: 'Mật khẩu không khớp. Vui lòng nhập lại.', type: 'error' })
      return
    }
    
    // Nếu chưa gửi OTP và không bỏ qua OTP, gửi OTP trước
    if (!otpSent && !skipOtp) {
      setMsg({ text: 'Đang gửi mã OTP...', type: 'info' })
      setLoading(true)
      try {
        // Gọi API thực để gửi OTP
        await generateOtpApi(form.email)
        setOtpSent(true)
        setShowOtpField(true)
        setMsg({ text: 'Mã OTP đã được gửi đến email của bạn. Vui lòng nhập mã OTP 6 số.', type: 'success' })
      } catch (err: any) {
        setMsg({ text: err?.message || 'Gửi OTP thất bại. Vui lòng thử lại.', type: 'error' })
      } finally {
        setLoading(false)
      }
      return
    }
    
    // Kiểm tra OTP nếu đã gửi và không bỏ qua OTP
    if (otpSent && !skipOtp && otp.length !== 6) {
      setMsg({ text: 'Vui lòng nhập đầy đủ mã OTP 6 số.', type: 'error' })
      return
    }
    
    // Thực hiện đăng ký
    setMsg({ text: 'Đang đăng ký...', type: 'info' })
    setLoading(true)
    try {
      await registerApi(form)
      setMsg({ text: 'Đăng ký thành công! Chuyển đến trang đăng nhập...', type: 'success' })
      setTimeout(() => nav('/login'), 900)
    } catch (err: any) {
      setMsg({ text: err?.message || 'Đăng ký thất bại', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  const handleGoogleSuccess = () => {
    setMsg({ text: 'Đăng nhập Google thành công!', type: 'success' })
    setTimeout(() => {
      nav('/admin')
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
                🎉 Tạo tài khoản mới
              </h1>
              <p className="text-gray-700 font-semibold">
                ✨ Tham gia cộng đồng Quiz và khám phá thế giới tri thức
              </p>
            </div>
            <form className="space-y-6" onSubmit={onSubmit}>
              {/* Account Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800">Thông tin tài khoản</h3>
                </div>
                
          <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="username">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      Tên đăng nhập
                    </label>
                    <div className="relative">
                      <input 
                        id="username" 
                        className="w-full px-4 py-3 pl-12 rounded-xl border-4 border-black bg-yellow-50 focus:bg-yellow-100 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                        value={form.username} 
                        onChange={update('username')} 
                        required 
                        minLength={4} 
                        placeholder="👤 Nhập tên đăng nhập" 
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
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
                        type="password" 
                        className="w-full px-4 py-3 pl-12 rounded-xl border-4 border-black bg-green-50 focus:bg-green-100 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                        value={form.password} 
                        onChange={update('password')} 
                        required 
                        minLength={6} 
                        placeholder="🔒 Nhập mật khẩu" 
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      </div>
                    </div>
                    <div className={`flex gap-1 mt-2 ${passwordStrength === 1 ? 'justify-start' : passwordStrength === 2 ? 'justify-center' : 'justify-end'}`}>
                      <div className={`h-2 rounded-full transition-all duration-300 ${passwordStrength >= 1 ? 'bg-red-400' : 'bg-gray-200'} ${passwordStrength === 1 ? 'w-8' : 'w-4'}`}></div>
                      <div className={`h-2 rounded-full transition-all duration-300 ${passwordStrength >= 2 ? 'bg-yellow-400' : 'bg-gray-200'} ${passwordStrength === 2 ? 'w-8' : 'w-4'}`}></div>
                      <div className={`h-2 rounded-full transition-all duration-300 ${passwordStrength >= 3 ? 'bg-green-500' : 'bg-gray-200'} ${passwordStrength === 3 ? 'w-8' : 'w-4'}`}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">💡 Sử dụng chữ hoa, số và ký tự đặc biệt để tăng độ mạnh</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="confirmPassword">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input 
                      id="confirmPassword" 
                      type="password" 
                      className={`w-full px-4 py-3 pl-12 rounded-xl border-4 transition-all duration-200 font-rounded font-semibold focus:outline-none focus:ring-4 focus:border-transparent ${confirmPassword && !passwordsMatch ? 'border-red-500 bg-red-50 focus:bg-red-100 focus:ring-red-400' : 'border-black bg-blue-50 focus:bg-blue-100 focus:ring-blue-400'}`} 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      required 
                      minLength={6} 
                      placeholder="🔒 Nhập lại mật khẩu" 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                  </div>
                {!passwordsMatch && confirmPassword.length > 0 && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      Mật khẩu không khớp
                    </p>
                )}
              </div>
            </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800">Thông tin liên hệ</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="email">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      Email
                    </label>
                    <div className="relative">
                      <input 
                        id="email" 
                        type="email" 
                        className="w-full px-4 py-3 pl-12 rounded-xl border-4 border-black bg-pink-50 focus:bg-pink-100 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                        value={form.email} 
                        onChange={update('email')} 
                        required 
                        placeholder="📧 email@domain.com" 
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="mssv">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      MSSV
                    </label>
                    <div className="relative">
                      <input 
                        id="mssv" 
                        className="w-full px-4 py-3 pl-12 rounded-xl border-4 border-black bg-purple-50 focus:bg-purple-100 focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                        value={form.mssv} 
                        onChange={update('mssv')} 
                        required 
                        minLength={6} 
                        placeholder="🎓 MSSV của bạn" 
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      </div>
                    </div>
              </div>
            </div>
          </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h3>
                </div>
                
          <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="firstName">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      Họ
                    </label>
                    <input 
                      id="firstName" 
                      className="w-full px-4 py-3 rounded-xl border-4 border-black bg-orange-50 focus:bg-orange-100 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                      value={form.firstName} 
                      onChange={update('firstName')} 
                      placeholder="👤 Nhập họ của bạn" 
                    />
            </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="lastName">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      Tên
                    </label>
                    <input 
                      id="lastName" 
                      className="w-full px-4 py-3 rounded-xl border-4 border-black bg-cyan-50 focus:bg-cyan-100 focus:outline-none focus:ring-4 focus:ring-teal-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                      value={form.lastName} 
                      onChange={update('lastName')} 
                      placeholder="👤 Nhập tên của bạn" 
                    />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="phoneNumber">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      Số điện thoại
                    </label>
                    <input 
                      id="phoneNumber" 
                      className="w-full px-4 py-3 rounded-xl border-4 border-black bg-emerald-50 focus:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                      value={form.phoneNumber || ''} 
                      onChange={update('phoneNumber')} 
                      placeholder="📱 SĐT (tùy chọn)" 
                    />
            </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="city">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      Thành phố
                    </label>
                    <input 
                      id="city" 
                      className="w-full px-4 py-3 rounded-xl border-4 border-black bg-rose-50 focus:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                      value={form.city || ''} 
                      onChange={update('city')} 
                      placeholder="🏙️ Thành phố (tùy chọn)" 
                    />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="dateOfBirth">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      Ngày sinh
                    </label>
                    <input 
                      id="dateOfBirth" 
                      className="w-full px-4 py-3 rounded-xl border-4 border-black bg-violet-50 focus:bg-violet-100 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                      value={form.dateOfBirth || ''} 
                      onChange={update('dateOfBirth')} 
                      placeholder="📅 dd/MM/yyyy" 
                    />
            </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="gender">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      Giới tính
                    </label>
                    <select 
                      id="gender" 
                      className="w-full px-4 py-3 rounded-xl border-4 border-black bg-sky-50 focus:bg-sky-100 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-black transition-all duration-200 font-rounded font-semibold" 
                      value={form.gender ?? ''} 
                      onChange={update('gender')}
                    >
                      <option value="">-- Chọn giới tính --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
              </div>

              {/* OTP Section */}
              {showOtpField && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Xác thực OTP</h3>
                  </div>
                  
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
                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-xl border-4 border-black bg-lime-50 focus:bg-lime-100 focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-black transition-all duration-200" 
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
                            // Gọi API thực để gửi lại OTP
                            await generateOtpApi(form.email)
                            setMsg({ text: 'Mã OTP mới đã được gửi.', type: 'success' })
                          } catch (err: any) {
                            setMsg({ text: err?.message || 'Gửi lại OTP thất bại. Vui lòng thử lại.', type: 'error' })
                          }
                        }}
                      >
                        Gửi lại
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms and Submit */}
              <div className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                      required 
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                      Tôi đồng ý với{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">Điều khoản sử dụng</a>{' '}
                      và{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">Chính sách bảo mật</a>
                    </label>
          </div>

                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="skipOtp" 
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                      checked={skipOtp}
                      onChange={(e) => setSkipOtp(e.target.checked)}
                    />
                    <label htmlFor="skipOtp" className="text-sm text-gray-600 leading-relaxed">
                      Bỏ qua xác thực OTP (không khuyến khích)
                      <span className="block text-xs text-gray-500 mt-1">
                        Tài khoản sẽ được tạo mà không cần xác thực email
                      </span>
            </label>
          </div>
                </div>

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
                    skipOtp ? 'Đang tạo tài khoản...' : 
                    otpSent ? 'Đang xác thực OTP...' : 'Đang gửi mã OTP...'
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {skipOtp ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                        ) : otpSent ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        )}
                      </svg>
                      {skipOtp ? 'Tạo tài khoản (không OTP)' : 
                       otpSent ? 'Xác thực OTP & Tạo tài khoản' : 'Gửi mã OTP'}
                    </>
                  )}
          </button>

                {/* Google Login Section - Chỉ cho user thường */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400">Hoặc đăng nhập với</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  
                  <GoogleLoginButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border-4 border-black bg-red-50 hover:bg-red-100 text-gray-800 inline-flex items-center justify-center gap-2 font-rounded font-bold transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                  >
                    🔍 Google
                  </GoogleLoginButton>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                      Đăng nhập ngay
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
