import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import '../styles/teacher-settings.css'

interface UserProfile {
  id: string
  userId: string
  username: string
  email: string
  firstName: string
  lastName: string
  imageUrl: string | null
  gender: string
  phoneNumber: string
  dateOfBirth: string
  city: string
  emailVerified: boolean
  roles: string[]
  permissions: string[]
  bio: string | null
  quote: string | null
  jobTitle: string | null
  company: string | null
  themeColor: string | null
  coverImageUrl: string | null
  privateProfile: boolean
}

interface ProfileUpdateRequest {
  userId: string
  username: string
  imageUrl?: string
  firstName: string
  lastName: string
  gender: string
  phoneNumber: string
  email: string
  dateOfBirth: string
  city: string
}

interface PasswordChangeRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

interface DeviceInfo {
  deviceId: string
  deviceType: string
  ipAddress: string
}

interface LoginHistoryItem {
  id: number
  loginTime: string
  deviceInfo: DeviceInfo
}

interface LoginHistoryResponse {
  code: number
  message: string
  result: {
    currentPage: number
    pageSize: number
    totalPage: number
    totalElement: number
    data: LoginHistoryItem[]
  }
}

interface AccountDeletionRequest {
  password: string
  reason?: string
}

export default function StudentSettings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'history' | 'account'>('profile')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileForm, setProfileForm] = useState<ProfileUpdateRequest>({
    userId: '',
    username: '',
    firstName: '',
    lastName: '',
    gender: 'MALE',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    city: ''
  })
  const [passwordForm, setPasswordForm] = useState<PasswordChangeRequest>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [userStatus, setUserStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [deletionForm, setDeletionForm] = useState<AccountDeletionRequest>({
    password: '',
    reason: ''
  })
  const [showDeletionModal, setShowDeletionModal] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')
  const [language, setLanguage] = useState<'vi' | 'en'>('vi')

  // Helper function for input classes
  const getInputClasses = () => "form-input"
  
  // Helper function for label classes
  const getLabelClasses = () => "form-label"
  
  // Helper function for select classes
  const getSelectClasses = () => "form-select"
  
  // Helper function for textarea classes
  const getTextareaClasses = () => "form-textarea"

  // Load user profile
  useEffect(() => {
    if (user) {
      setProfile(user)
      setUserStatus(user.status || 'ONLINE')
      // Chuyển đổi định dạng ngày từ backend (dd/MM/yyyy) thành yyyy-MM-dd cho input
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return ''
        // Nếu đã là định dạng yyyy-MM-dd thì giữ nguyên
        if (dateString.includes('-') && dateString.length === 10) {
          return dateString
        }
        // Nếu là định dạng dd/MM/yyyy thì chuyển đổi
        if (dateString.includes('/')) {
          const [day, month, year] = dateString.split('/')
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }
        // Nếu là ISO string thì chuyển đổi
        try {
          return new Date(dateString).toISOString().split('T')[0]
        } catch {
          return ''
        }
      }

      // Chuyển đổi gender từ backend (lowercase) sang frontend format (uppercase)
      const convertGenderForFrontend = (gender: string) => {
        switch (gender?.toLowerCase()) {
          case 'male': return 'MALE'
          case 'female': return 'FEMALE'
          case 'other': return 'OTHER'
          default: return 'MALE'
        }
      }

      setProfileForm({
        userId: user.userId || '',
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: convertGenderForFrontend(user.gender) || 'MALE',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        dateOfBirth: formatDateForInput(user.dateOfBirth || ''),
        city: user.city || ''
      })
      
      // Load avatar image if available
      loadUserAvatar()
    }
  }, [user])

  // Refresh user data
  const refreshUserData = async () => {
    try {
      // Thêm timestamp và random để tránh cache hoàn toàn
      const timestamp = new Date().getTime()
      const random = Math.random().toString(36).substring(7)
      const url = `https://api.duongtech.me/api/v1/profile/users/my-profile?t=${timestamp}&r=${random}`
      
      console.log('Fetching fresh user data from:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'If-None-Match': '*',
          'If-Modified-Since': '0'
        }
      })

      if (response.ok) {
        const apiResponse = await response.json()
        const userData = apiResponse.result // Lấy data từ result field
        
        console.log('Raw API response:', apiResponse)
        console.log('User data from server:', userData)
        
        if (userData) {
          // Log dữ liệu cũ để so sánh
          console.log('Previous profile data:', profile)
          
          // Cập nhật profile state trước
          setProfile(userData)
          
          // Chuyển đổi định dạng ngày từ backend (dd/MM/yyyy) thành yyyy-MM-dd cho input
          const formatDateForInput = (dateString: string) => {
            if (!dateString) return ''
            // Nếu đã là định dạng yyyy-MM-dd thì giữ nguyên
            if (dateString.includes('-') && dateString.length === 10) {
              return dateString
            }
            // Nếu là định dạng dd/MM/yyyy thì chuyển đổi
            if (dateString.includes('/')) {
              const [day, month, year] = dateString.split('/')
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            }
            // Nếu là ISO string thì chuyển đổi
            try {
              return new Date(dateString).toISOString().split('T')[0]
            } catch {
              return ''
            }
          }
          
          // Chuyển đổi gender từ backend (lowercase) sang frontend format (uppercase)
          const convertGenderForFrontend = (gender: string) => {
            switch (gender?.toLowerCase()) {
              case 'male': return 'MALE'
              case 'female': return 'FEMALE'
              case 'other': return 'OTHER'
              default: return 'MALE'
            }
          }

          // Cập nhật form với dữ liệu mới từ server
          const newProfileForm = {
            userId: userData.userId || '',
            username: userData.username || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            gender: convertGenderForFrontend(userData.gender) || 'MALE',
            phoneNumber: userData.phoneNumber || '',
            email: userData.email || '',
            dateOfBirth: formatDateForInput(userData.dateOfBirth || ''),
            city: userData.city || ''
          }
          
          setProfileForm(newProfileForm)
          console.log('✅ User data refreshed successfully:', userData)
          console.log('✅ Form updated with:', newProfileForm)
          
          // So sánh dữ liệu cũ và mới
          if (profile) {
            console.log('📊 Data comparison:')
            console.log('  Username:', profile.username, '→', userData.username)
            console.log('  FirstName:', profile.firstName, '→', userData.firstName)
            console.log('  LastName:', profile.lastName, '→', userData.lastName)
          }
        } else {
          console.warn('⚠️ No user data received from server')
        }
      } else {
        console.error('❌ Failed to refresh user data:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response body:', errorText)
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  // Load user avatar
  const loadUserAvatar = async () => {
    try {
      // Thử endpoint profile service trước
      const response = await fetch('https://api.duongtech.me/api/v1/profile/users/my-profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const apiResponse = await response.json()
        const userData = apiResponse.result
        
        if (userData && userData.imageUrl) {
          setProfile(prev => prev ? { ...prev, imageUrl: userData.imageUrl } : null)
          console.log('Avatar loaded from profile service:', userData.imageUrl)
        }
      } else {
        // Fallback: thử identity service với method khác
        try {
          const identityResponse = await fetch('https://api.duongtech.me/api/v1/identity/users/my-info', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          })
          
          if (identityResponse.ok) {
            const identityApiResponse = await identityResponse.json()
            const identityData = identityApiResponse.result
            
            if (identityData && identityData.imageUrl) {
              setProfile(prev => prev ? { ...prev, imageUrl: identityData.imageUrl } : null)
              console.log('Avatar loaded from identity service:', identityData.imageUrl)
            }
          }
        } catch (identityError) {
          console.log('Identity service fallback failed:', identityError)
        }
      }
    } catch (error) {
      console.log('No avatar image found or error loading:', error)
    }
  }

  // Load preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('student-theme') as 'light' | 'dark' | 'auto' || 'light'
    const savedLanguage = localStorage.getItem('student-language') as 'vi' | 'en' || 'vi'
    
    setTheme(savedTheme)
    setLanguage(savedLanguage)
    
    // Apply theme immediately
    applyTheme(savedTheme)
  }, [])

  // Listen for system theme changes when auto theme is selected
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('auto')
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  // Apply theme to document
  const applyTheme = (themeValue: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement
    
    if (themeValue === 'dark') {
      root.classList.add('dark')
    } else if (themeValue === 'light') {
      root.classList.remove('dark')
    } else if (themeValue === 'auto') {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme)
    localStorage.setItem('student-theme', newTheme)
    applyTheme(newTheme)
    setMessage({ type: 'success', text: `Đã chuyển sang chủ đề ${newTheme === 'light' ? 'sáng' : newTheme === 'dark' ? 'tối' : 'tự động'}` })
  }

  // Handle language change
  const handleLanguageChange = (newLanguage: 'vi' | 'en') => {
    setLanguage(newLanguage)
    localStorage.setItem('student-language', newLanguage)
    setMessage({ type: 'success', text: `Đã chuyển sang ngôn ngữ ${newLanguage === 'vi' ? 'Tiếng Việt' : 'English'}` })
    
    // Reload page to apply language changes
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Chuyển đổi định dạng ngày từ yyyy-MM-dd thành dd/MM/yyyy
      const formatDateForBackend = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      }

      // Chuyển đổi gender từ uppercase sang lowercase để match backend enum
      const convertGenderForBackend = (gender: string) => {
        switch (gender?.toUpperCase()) {
          case 'MALE': return 'male'
          case 'FEMALE': return 'female'
          case 'OTHER': return 'other'
          default: return gender?.toLowerCase() || 'male'
        }
      }

      // Sử dụng user ID từ profile hiện tại thay vì từ form
      const formattedProfileForm = {
        ...profileForm,
        userId: profile?.userId || user?.userId || profileForm.userId, // Ưu tiên user ID từ server
        gender: convertGenderForBackend(profileForm.gender), // Chuyển đổi gender case
        dateOfBirth: formatDateForBackend(profileForm.dateOfBirth)
      }

      console.log('Sending profile data:', formattedProfileForm)

      const response = await fetch('https://api.duongtech.me/api/v1/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(formattedProfileForm)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '✨ Cập nhật thông tin thành công!' })
        // Refresh user data với delay dài hơn để đảm bảo database commit
        setTimeout(async () => {
          console.log('Refreshing user data after update...')
          // Thử refresh nhiều lần để đảm bảo lấy được dữ liệu mới
          let attempts = 0
          const maxAttempts = 3
          
          while (attempts < maxAttempts) {
            console.log(`Refresh attempt ${attempts + 1}/${maxAttempts}`)
            await refreshUserData()
            await loadUserAvatar()
            
            // Kiểm tra xem dữ liệu đã được cập nhật chưa
            const currentProfile = profile
            if (currentProfile?.username === formattedProfileForm.username && 
                currentProfile?.firstName === formattedProfileForm.firstName) {
              console.log('✅ Data successfully refreshed and matches!')
              break
            } else {
              console.log('⚠️ Data still not updated, retrying...')
              console.log('Expected username:', formattedProfileForm.username, 'Got:', currentProfile?.username)
              console.log('Expected firstName:', formattedProfileForm.firstName, 'Got:', currentProfile?.firstName)
            }
            
            attempts++
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s before retry
            }
          }
          
          // Nếu sau 3 lần thử vẫn không được, force reload trang
          if (attempts >= maxAttempts) {
            console.warn('⚠️ Data still not updated after 3 attempts, forcing page reload...')
            setMessage({ type: 'success', text: '✨ Cập nhật thành công! Đang tải lại trang...' })
            setTimeout(() => {
              window.location.reload()
            }, 1000)
          } else {
            setMessage(null)
          }
        }, 2000) // Tăng delay lên 2s
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Profile update error:', errorData)
        setMessage({ type: 'error', text: errorData.message || 'Cập nhật thất bại. Vui lòng thử lại.' })
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận không khớp.' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://api.duongtech.me/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(passwordForm)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' })
        setTimeout(() => {
          logout()
          navigate('/login')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: 'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'ONLINE' | 'OFFLINE') => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`https://api.duongtech.me/api/v1/identity/users/my-profile/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        setUserStatus(newStatus)
        setMessage({ type: 'success', text: `Đã chuyển trạng thái thành ${newStatus === 'ONLINE' ? 'Trực tuyến' : 'Ngoại tuyến'}` })
      } else {
        setMessage({ type: 'error', text: 'Thay đổi trạng thái thất bại. Vui lòng thử lại.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file ảnh hợp lệ.' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Kích thước file không được vượt quá 5MB.' })
      return
    }

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
      setShowCropModal(true) // Hiển thị modal crop
    }
    reader.readAsDataURL(file)
  }

  // Hàm crop ảnh đơn giản
  const cropImage = (imageSrc: string, cropSize: number = 200): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Tính toán kích thước crop để ảnh vuông
        const size = Math.min(img.width, img.height)
        const x = (img.width - size) / 2
        const y = (img.height - size) / 2
        
        canvas.width = cropSize
        canvas.height = cropSize
        
        if (ctx) {
          ctx.drawImage(img, x, y, size, size, 0, 0, cropSize, cropSize)
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.src = imageSrc
    })
  }

  const handleCropImage = async () => {
    if (!avatarPreview) return
    
    try {
      const cropped = await cropImage(avatarPreview, 200)
      setCroppedImage(cropped)
      setShowCropModal(false)
      setMessage({ type: 'success', text: 'Ảnh đã được crop thành công!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi crop ảnh. Vui lòng thử lại.' })
    }
  }

  const handleAvatarSubmit = async () => {
    if (!avatarFile && !croppedImage) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ảnh trước khi cập nhật.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      
      // Sử dụng ảnh đã crop nếu có, nếu không thì dùng file gốc
      if (croppedImage) {
        // Chuyển đổi base64 thành blob
        const response = await fetch(croppedImage)
        const blob = await response.blob()
        formData.append('imageFile', blob, 'avatar.jpg')
      } else if (avatarFile) {
        formData.append('imageFile', avatarFile)
      }

      const response = await fetch('https://api.duongtech.me/api/v1/identity/users/me/image', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Avatar upload response:', data)
        
        // Cập nhật avatar URL trong state
        if (data.imageUrl) {
          setProfile(prev => prev ? { ...prev, imageUrl: data.imageUrl } : null)
          setAvatarPreview(null) // Clear preview
          setAvatarFile(null) // Clear file
          setCroppedImage(null) // Clear cropped image
        }
        
        setMessage({ type: 'success', text: '✨ Cập nhật ảnh đại diện thành công!' })
        
        // Refresh toàn bộ dữ liệu user để đảm bảo đồng bộ
        setTimeout(async () => {
          await refreshUserData()
          setMessage(null)
        }, 2000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setMessage({ type: 'error', text: errorData.message || 'Cập nhật ảnh thất bại. Vui lòng thử lại.' })
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' })
    } finally {
      setLoading(false)
    }
  }

  const loadLoginHistory = async () => {
    try {
      console.log('Loading login history...')
      const response = await fetch('https://api.duongtech.me/api/v1/identity/login-history/me?page=1&size=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const apiResponse: LoginHistoryResponse = await response.json()
        console.log('Login history API response:', apiResponse)
        
        if (apiResponse.code === 200 && apiResponse.result?.data) {
          setLoginHistory(apiResponse.result.data)
          console.log('Login history loaded:', apiResponse.result.data.length, 'items')
        } else {
          console.warn('No login history data found')
          setLoginHistory([])
        }
      } else {
        console.error('Failed to load login history:', response.status, response.statusText)
        setLoginHistory([])
      }
    } catch (error) {
      console.error('Error loading login history:', error)
      setLoginHistory([])
    }
  }

  const handleAccountDeletion = async (permanent: boolean = false) => {
    if (!deletionForm.password) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu để xác nhận.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const endpoint = permanent 
        ? 'https://api.duongtech.me/api/v1/identity/users/delete-permanently'
        : 'https://api.duongtech.me/api/v1/identity/users/delete'

      const response = await fetch(`${endpoint}?password=${encodeURIComponent(deletionForm.password)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const message = permanent 
          ? 'Tài khoản đã bị xóa vĩnh viễn.'
          : 'Tài khoản đã bị xóa tạm thời. Bạn có 30 ngày để đăng nhập lại.'
        
        setMessage({ type: 'success', text: message })
        setTimeout(() => {
          logout()
          navigate('/login')
        }, 3000)
      } else {
        setMessage({ type: 'error', text: 'Xóa tài khoản thất bại. Vui lòng kiểm tra mật khẩu.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('https://api.duongtech.me/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ token: localStorage.getItem('access_token') })
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
      navigate('/login')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white hover:scale-110"
        title="Cài đặt tài khoản"
      >
        <span className="text-2xl">⚙️</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[60] teacher-settings-container">
      <div className="teacher-settings-modal w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="teacher-settings-header">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="teacher-settings-title">🎨 Cài đặt tài khoản</h2>
              <p className="teacher-settings-subtitle">✨ Quản lý thông tin và bảo mật ✨</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200 transition-all duration-300 transform hover:scale-110 w-12 h-12 bg-black bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-40 shadow-lg"
            >
              <span className="text-2xl font-bold">×</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 teacher-settings-sidebar flex-shrink-0">
            <nav className="p-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <span className="text-2xl">🎭</span>
                <span>Thông tin cá nhân</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
              >
                <span className="text-2xl">🛡️</span>
                <span>Bảo mật</span>
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
              >
                <span className="text-2xl">🎨</span>
                <span>Tùy chỉnh</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('history')
                  loadLoginHistory()
                }}
                className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              >
                <span className="text-2xl">📈</span>
                <span>Lịch sử</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
              >
                <span className="text-2xl">⚙️</span>
                <span>Tài khoản</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 teacher-settings-content overflow-y-auto">
            {message && (
              <div className={message.type === 'success' ? 'message-success' : 'message-error'}>
                {message.text}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="form-section">
                <h3 className="section-title">🎭 Thông tin cá nhân</h3>
                
                {/* Avatar Upload */}
                <div className="avatar-upload-section">
                  <h4 className="text-xl font-semibold mb-6 text-center">📸 Ảnh đại diện</h4>
                  
                  <div className="flex flex-col items-center space-y-6">
                    {/* Avatar Preview */}
                    <div className="relative">
                    <div className="avatar-preview">
                      {croppedImage ? (
                        <img src={croppedImage} alt="Cropped Preview" className="w-full h-full object-cover" />
                      ) : avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : profile?.imageUrl ? (
                        <img 
                          src={profile.imageUrl} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback nếu ảnh không load được
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      {!croppedImage && !avatarPreview && !profile?.imageUrl && (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🎭
                        </div>
                      )}
                    </div>
                      {(avatarFile || croppedImage) && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm animate-bounce">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="text-center space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="btn-primary cursor-pointer inline-block"
                      >
                        📁 Chọn ảnh mới
                      </label>
                      
                      {(avatarFile || croppedImage) && (
                        <div className="space-y-3">
                          <div className="bg-white bg-opacity-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-700">
                              📄 {avatarFile?.name || 'Ảnh đã crop'}
                            </p>
                            {avatarFile && (
                              <p className="text-xs text-gray-500">
                                {(avatarFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                            {croppedImage && (
                              <p className="text-xs text-green-600">
                                ✨ Ảnh đã được tối ưu
                              </p>
                            )}
                          </div>
                          <button
                            onClick={handleAvatarSubmit}
                            disabled={loading}
                            className="btn-success disabled:opacity-50 w-full"
                          >
                            {loading ? '⏳ Đang tải...' : '✨ Cập nhật ảnh'}
                          </button>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        💡 Định dạng: JPG, PNG, GIF • Kích thước tối đa: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={getLabelClasses()}>Tên đăng nhập</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                      className={getInputClasses()}
                      placeholder="Nhập tên đăng nhập"
                      required
                    />
                  </div>
                  <div>
                    <label className={getLabelClasses()}>Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className={getInputClasses()}
                      placeholder="Nhập email"
                      required
                    />
                  </div>
                  <div>
                    <label className={getLabelClasses()}>Họ</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                      className={getInputClasses()}
                      placeholder="Nhập họ"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập tên"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Chọn giới tính"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0123456789"
                      title="Số điện thoại"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Ngày sinh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập thành phố"
                      title="Thành phố"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pb-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? '⏳ Đang cập nhật...' : '✨ Cập nhật thông tin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn-secondary"
                  >
                    ❌ Hủy
                  </button>
                </div>
              </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Bảo mật tài khoản</h3>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập mật khẩu mới"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Xác nhận mật khẩu mới"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </form>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái tài khoản</h4>
                  <div className="mb-4">
                    <p className="text-gray-600 mb-3">Thay đổi trạng thái hiển thị của bạn</p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleStatusChange('ONLINE')}
                        disabled={loading || userStatus === 'ONLINE'}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          userStatus === 'ONLINE'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                        } disabled:opacity-50`}
                      >
                        🟢 Trực tuyến
                      </button>
                      <button
                        onClick={() => handleStatusChange('OFFLINE')}
                        disabled={loading || userStatus === 'OFFLINE'}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          userStatus === 'OFFLINE'
                            ? 'bg-gray-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-100'
                        } disabled:opacity-50`}
                      >
                        ⚫ Ngoại tuyến
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Trạng thái hiện tại: <span className="font-medium">{userStatus === 'ONLINE' ? 'Trực tuyến' : 'Ngoại tuyến'}</span>
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Đăng xuất</h4>
                  <p className="text-gray-600 mb-4">Đăng xuất khỏi tài khoản hiện tại</p>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Tùy chỉnh giao diện</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề</label>
                    <select 
                      value={theme}
                      onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      title="Chọn chủ đề"
                    >
                      <option value="light">☀️ Sáng</option>
                      <option value="dark">🌙 Tối</option>
                      <option value="auto">🔄 Tự động</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {theme === 'auto' ? 'Tự động theo hệ thống' : theme === 'dark' ? 'Chủ đề tối' : 'Chủ đề sáng'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
                    <select 
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value as 'vi' | 'en')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      title="Chọn ngôn ngữ"
                    >
                      <option value="vi">🇻🇳 Tiếng Việt</option>
                      <option value="en">🇺🇸 English</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'vi' ? 'Giao diện tiếng Việt' : 'English interface'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Lịch sử đăng nhập</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-4">Lịch sử đăng nhập gần đây của bạn</p>
                  
                  {loginHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-gray-500">Đang tải lịch sử đăng nhập...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {loginHistory.map((item, index) => (
                        <div key={item.id || index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600">🔐</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {new Date(item.loginTime).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </p>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>📍 IP: {item.deviceInfo.ipAddress}</p>
                                  <p>💻 {item.deviceInfo.deviceType}</p>
                                  <p>🆔 Device ID: {item.deviceInfo.deviceId}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Thành công
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                #{item.id}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quản lý tài khoản</h3>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-800 mb-4">⚠️ Xóa tài khoản</h4>
                  <p className="text-red-700 mb-4">
                    Thao tác này không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu xác nhận</label>
                      <input
                        type="password"
                        value={deletionForm.password}
                        onChange={(e) => setDeletionForm({...deletionForm, password: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Nhập mật khẩu để xác nhận"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lý do (tùy chọn)</label>
                      <textarea
                        value={deletionForm.reason}
                        onChange={(e) => setDeletionForm({...deletionForm, reason: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Chia sẻ lý do bạn muốn xóa tài khoản..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleAccountDeletion(false)}
                        disabled={loading || !deletionForm.password}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Đang xử lý...' : 'Xóa tạm thời (30 ngày)'}
                      </button>
                      <button
                        onClick={() => handleAccountDeletion(true)}
                        disabled={loading || !deletionForm.password}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Đang xử lý...' : 'Xóa vĩnh viễn'}
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p><strong>Xóa tạm thời:</strong> Tài khoản sẽ bị xóa trong 30 ngày. Bạn có thể đăng nhập lại để khôi phục.</p>
                      <p><strong>Xóa vĩnh viễn:</strong> Tài khoản và tất cả dữ liệu sẽ bị xóa ngay lập tức và không thể khôi phục.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-center">✂️ Crop ảnh</h3>
            
            {avatarPreview && (
              <div className="mb-4">
                <img 
                  src={avatarPreview} 
                  alt="Preview" 
                  className="w-full max-h-64 object-contain rounded-lg border"
                />
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Ảnh sẽ được crop thành hình vuông để vừa khung avatar
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleCropImage}
                className="btn-success flex-1"
              >
                ✂️ Crop ảnh
              </button>
              <button
                onClick={() => {
                  setShowCropModal(false)
                  setAvatarPreview(null)
                  setAvatarFile(null)
                }}
                className="btn-secondary flex-1"
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
