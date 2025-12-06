export type ApiResponse<T> = {
  code?: number
  message?: string
  result?: T
}

const API_V1_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.duongtech.me/api/v1'
const ADMIN_BASE_URL = `${API_V1_BASE}/admin`
const IDENTITY_BASE_URL = `${API_V1_BASE}/identity`
const AI_SUPPORT = `${API_V1_BASE}/Ai`
const PROFILE_BASE_URL = `${API_V1_BASE}/profile`

// Helper function to get authenticated headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// Helper function to handle API errors
function handleApiError(error: any, resp?: Response) {
  if (resp?.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_expiry')
    throw new Error('Session expired. Please login again.')
  }
  throw error
}

// User Management Types
export type UserResponse = {
  id: string
  username: string
  email: string
  phoneNumber?: string
  firstName?: string
  lastName?: string
  mssv?: string
  city?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  blocked: boolean
  createdAt: string
  updatedAt: string
}

export type UserListResponse = {
  content: UserResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export type AdminPasswordChangeRequest = {
  userId: string
  newPassword: string
  confirmPassword: string
}

export type GeminiRequest = {
  userQuestion: string
  systemPrompt?: string
}

export type ProfileResponse = {
  id: string
  userId: string
  username: string
  status: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  gender?: string
  phoneNumber?: string
  dateOfBirth?: string
  city?: string
  emailVerified: boolean
  roles: any[]
  permissions: any[]
  createdAt?: string
  bio?: string
  quote?: string
  jobTitle?: string
  company?: string
  themeColor?: string
  coverImageUrl?: string
  privateProfile: boolean
}

// User Management APIs
export async function getUsers(page: number = 0, size: number = 10): Promise<UserListResponse> {
  try {
    console.log('Getting users:', { page, size, url: `${IDENTITY_BASE_URL}/users?page=${page}&size=${size}` })
    
    const resp = await fetch(`${IDENTITY_BASE_URL}/users?page=${page}&size=${size}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get users response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<UserListResponse>
    
    console.log('Get users response data:', data)
    
    if (!resp.ok) {
      if (resp.status === 401) {
        localStorage.removeItem('access_token')
        throw new Error('Session expired. Please login again.')
      }
      throw new Error(data?.message || `HTTP ${resp.status}`)
    }
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy danh sách user thất bại')
    return data.result!
  } catch (error) {
    console.error('Get users API error:', error)
    throw error
  }
}

export async function getUserById(userId: string): Promise<UserResponse> {
  try {
    console.log('Getting user by ID:', { userId, url: `${IDENTITY_BASE_URL}/users/${userId}` })
    
    const resp = await fetch(`${IDENTITY_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get user response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<UserResponse>
    
    console.log('Get user response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy thông tin user thất bại')
    return data.result!
  } catch (error) {
    console.error('Get user API error:', error)
    throw error
  }
}

export async function lockUser(userId: string): Promise<string> {
  try {
    console.log('Locking user:', { userId, url: `${ADMIN_BASE_URL}/${userId}/lock` })
    
    const resp = await fetch(`${ADMIN_BASE_URL}/${userId}/lock`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    console.log('Lock user response status:', resp.status)
    
    // Backend returns plain text, not JSON
    const responseText = await resp.text()
    console.log('Lock user response text:', responseText)
    
    if (!resp.ok) {
      throw new Error(responseText || `HTTP ${resp.status}`)
    }
    
    return responseText || 'User locked successfully'
  } catch (error) {
    console.error('Lock user API error:', error)
    throw error
  }
}

export async function unlockUser(userId: string): Promise<string> {
  try {
    console.log('Unlocking user:', { userId, url: `${ADMIN_BASE_URL}/${userId}/unlock` })
    
    const resp = await fetch(`${ADMIN_BASE_URL}/${userId}/unlock`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    console.log('Unlock user response status:', resp.status)
    
    // Backend returns plain text, not JSON
    const responseText = await resp.text()
    console.log('Unlock user response text:', responseText)
    
    if (!resp.ok) {
      throw new Error(responseText || `HTTP ${resp.status}`)
    }
    
    return responseText || 'User unlocked successfully'
  } catch (error) {
    console.error('Unlock user API error:', error)
    throw error
  }
}

export async function deleteUser(userId: string): Promise<string> {
  try {
    console.log('Deleting user:', { userId, url: `${IDENTITY_BASE_URL}/admin/delete/${userId}` })
    
    // Gọi trực tiếp identity-service thay vì admin-service
    const resp = await fetch(`${IDENTITY_BASE_URL}/admin/delete/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    console.log('Delete user response status:', resp.status)
    
    // Identity-service returns JSON, not plain text
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<void>
    
    console.log('Delete user response data:', data)
    
    if (!resp.ok) {
      throw new Error(data?.message || `HTTP ${resp.status}`)
    }
    
    if (data.code && data.code !== 200) {
      throw new Error(data.message || 'Xóa user thất bại')
    }
    
    return data.message || 'User deleted successfully'
  } catch (error) {
    console.error('Delete user API error:', error)
    throw error
  }
}

export async function changeUserPassword(request: AdminPasswordChangeRequest): Promise<string> {
  try {
    console.log('Changing user password:', { request, url: `${ADMIN_BASE_URL}/change-password` })
    
    const resp = await fetch(`${ADMIN_BASE_URL}/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    })
    
    console.log('Change password response status:', resp.status)
    
    // Backend returns plain text, not JSON
    const responseText = await resp.text()
    console.log('Change password response text:', responseText)
    
    if (!resp.ok) {
      throw new Error(responseText || `HTTP ${resp.status}`)
    }
    
    return responseText || 'Password changed successfully'
  } catch (error) {
    console.error('Change password API error:', error)
    throw error
  }
}

// AI Chat APIs
export async function askAI(request: GeminiRequest): Promise<string> {
  try {
    console.log('Asking AI:', { request, url: `${AI_SUPPORT}/gemini/ask` })
    
    const resp = await fetch(`${AI_SUPPORT}/gemini/ask`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    })
    
    console.log('AI response status:', resp.status)
    
    if (!resp.ok) {
      const errorText = await resp.text().catch(() => '')
      throw new Error(`HTTP ${resp.status}: ${errorText}`)
    }
    
    const response = await resp.text()
    console.log('AI response:', response)
    
    return response
  } catch (error) {
    console.error('AI API error:', error)
    throw error
  }
}

export async function handleAdminAction(request: GeminiRequest): Promise<string> {
  try {
    console.log('Handling admin action:', { request, url: `${ADMIN_BASE_URL}/ai/handle` })
    
    const resp = await fetch(`${ADMIN_BASE_URL}/ai/handle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    })
    
    console.log('Admin action response status:', resp.status)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    const response = await resp.text()
    console.log('Admin action response:', response)
    
    return response
  } catch (error) {
    console.error('Admin action API error:', error)
    throw error
  }
}

// Profile Management APIs
export async function getAllProfiles(): Promise<ProfileResponse[]> {
  try {
    console.log('Getting all profiles:', { url: `${PROFILE_BASE_URL}/users` })
    
    const resp = await fetch(`${PROFILE_BASE_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get profiles response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<ProfileResponse[]>
    
    console.log('Get profiles response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy danh sách profiles thất bại')
    return data.result || []
  } catch (error) {
    console.error('Get profiles API error:', error)
    throw error
  }
}
