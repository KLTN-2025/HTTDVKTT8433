export type ApiResponse<T> = {
  code?: number
  message?: string
  result?: T
}

const DEFAULT_BASE = 'https://api.duongtech.me/api/v1/identity'
export const IDENTITY_BASE_URL = (import.meta as any).env?.VITE_IDENTITY_BASE_URL || DEFAULT_BASE

export async function loginApi(username: string, password: string, otp?: number) {
  try {
    console.log('Login API call:', { username, otp, url: `${IDENTITY_BASE_URL}/auth/token` })
    
    const resp = await fetch(`${IDENTITY_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, otp: otp ?? 0 })
    })
    
    console.log('Login response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<{ token: string; expiryTime?: string }>
    
    console.log('Login response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) {
      // Kiểm tra nếu là OTP_SENT exception (đây là trường hợp bình thường)
      if (data.message && (
        data.message.includes('OTP_SENT') || 
        data.message.includes('OTP đã được gửi') ||
        data.message.includes('OTP sent')
      )) {
        throw new Error('OTP_SENT') // Throw exception đặc biệt để frontend xử lý
      }
      throw new Error(data.message || 'Đăng nhập thất bại')
    }
    const token = data.result?.token
    if (!token) throw new Error('Không nhận được token')
    
    console.log('💾 Saving token to localStorage:', token.substring(0, 20) + '...')
    localStorage.setItem('access_token', token)
    if (data.result?.expiryTime) localStorage.setItem('token_expiry', String(data.result.expiryTime))
    
    console.log('✅ Token saved successfully')
    return { token, expiryTime: data.result?.expiryTime }
  } catch (error) {
    console.error('Login API error:', error)
    throw error
  }
}

// Google Login API
export async function googleLoginApi(accessToken: string) {
  try {
    console.log('Google Login API call:', { accessToken: '***', url: `${IDENTITY_BASE_URL}/auth/google` })
    
    const resp = await fetch(`${IDENTITY_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken })
    })
    
    console.log('Google Login response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<{ token: string; expiryTime?: string }>
    
    console.log('Google Login response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Google đăng nhập thất bại')
    
    const token = data.result?.token
    if (!token) throw new Error('Không nhận được token từ Google')
    
    console.log('💾 Saving Google token to localStorage:', token.substring(0, 20) + '...')
    localStorage.setItem('access_token', token)
    if (data.result?.expiryTime) localStorage.setItem('token_expiry', String(data.result.expiryTime))
    
    console.log('✅ Google token saved successfully')
    return { token, expiryTime: data.result?.expiryTime }
  } catch (error) {
    console.error('Google Login API error:', error)
    throw error
  }
}

export type RegisterPayload = {
  username: string
  password: string
  email: string
  mssv: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  city?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | null
}

export async function registerApi(payload: RegisterPayload) {
  try {
    console.log('Register API call:', { payload, url: `${IDENTITY_BASE_URL}/users/registration` })
    
    const resp = await fetch(`${IDENTITY_BASE_URL}/users/registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    console.log('Register response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<any>
    
    console.log('Register response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Đăng ký thất bại')
    return data.result
  } catch (error) {
    console.error('Register API error:', error)
    throw error
  }
}

// Generate OTP API
export async function generateOtpApi(email: string) {
  try {
    console.log('Generate OTP API call:', { email, url: `${IDENTITY_BASE_URL}/2fa/generate` })
    
    const resp = await fetch(`${IDENTITY_BASE_URL}/2fa/generate?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    console.log('Generate OTP response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<any>
    
    console.log('Generate OTP response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Gửi OTP thất bại')
    return data.result
  } catch (error) {
    console.error('Generate OTP API error:', error)
    throw error
  }
}
