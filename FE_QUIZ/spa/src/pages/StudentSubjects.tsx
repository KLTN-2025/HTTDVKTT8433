import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { isStudent } from '@/utils/apiTransform'
import { StudentNavigation } from '@/components/StudentNavigation'
import { getAllSubjects, SubjectResponse } from '@/api/quizClient'
import { useNavigate } from 'react-router-dom'

// New Doodle Icons Component with flat pastel style
const DoodleIcons = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
  const iconStyle = {
    width: size,
    height: size,
    fill: 'none',
    stroke: '#2d3748',
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  const icons: { [key: string]: JSX.Element } = {
    'home': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
    'palette': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="13.5" cy="6.5" r=".5" fill="#ff6b9d"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="#4ecdc4"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="#45b7d1"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="#96ceb4"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    ),
    'globe': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    'temple': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4-6.5 4 2-7L2 9h7l3-7z"/>
      </svg>
    ),
    'chat': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <circle cx="9" cy="10" r="1"/>
        <circle cx="15" cy="10" r="1"/>
      </svg>
    ),
    'leaf': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
      </svg>
    ),
    'basketball': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
      </svg>
    ),
    'trivia': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    'atom': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="1"/>
        <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z"/>
        <path d="M8.2 8.2c-2.04-2.03-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5 4.52-4.54 6.54-9.87 4.5-11.9z"/>
      </svg>
    ),
    'dna': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15A2.5 2.5 0 0 1 9.5 22h-5A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2h5z"/>
        <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-5a2.5 2.5 0 0 1-2.5-2.5v-15A2.5 2.5 0 0 1 9.5 2h5z"/>
        <circle cx="12" cy="8" r="1"/>
        <circle cx="12" cy="16" r="1"/>
      </svg>
    ),
    'calculator': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <rect x="8" y="6" width="8" height="4" rx="1"/>
        <circle cx="6" cy="14" r="1"/>
        <circle cx="10" cy="14" r="1"/>
        <circle cx="14" cy="14" r="1"/>
        <circle cx="18" cy="14" r="1"/>
        <circle cx="6" cy="18" r="1"/>
        <circle cx="10" cy="18" r="1"/>
        <circle cx="14" cy="18" r="1"/>
        <circle cx="18" cy="18" r="1"/>
      </svg>
    ),
    'microscope': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M6 18h8"/>
        <path d="M3 22h18"/>
        <path d="M14 22a3 3 0 0 0 0-6h0a3 3 0 0 0 0 6z"/>
        <path d="M14 18h-4"/>
        <path d="M16 2l4 4-4 4"/>
        <path d="M20 6H9"/>
      </svg>
    ),
    'book': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    'compass': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"/>
      </svg>
    ),
    'flask': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M9 2v6l-2 2v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8l-2-2V2"/>
        <path d="M9 2h6"/>
        <path d="M12 10v4"/>
      </svg>
    ),
    'music': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
    'paintbrush': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7.5a2 2 0 0 0 0 2.82L9.59 12l-1.59 1.59a2 2 0 0 0 0 2.82L10 18.5a2 2 0 0 0 2.82 0L14.5 17l1.59 1.59a2 2 0 0 0 2.82 0L21 16.5a2 2 0 0 0 0-2.82L19.41 12L21 10.41a2 2 0 0 0 0-2.82L18.37 2.63z"/>
        <path d="M9 21c0 1.1.9 2 2 2s2-.9 2-2"/>
      </svg>
    ),
    'star': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
      </svg>
    )
  }

  return icons[name] || icons['star']
}

export default function StudentSubjects() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<SubjectResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isReloading, setIsReloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const subjectsData = await getAllSubjects()
        console.log('📚 Subjects data received:', subjectsData)
        console.log('📚 First subject sample:', subjectsData[0])
        setSubjects(subjectsData)
      } catch (error) {
        console.error('Error loading subjects:', error)
        setError('Không thể tải danh sách môn học')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSubjects()
  }, [])

  const handleReload = async () => {
    setIsReloading(true)
    try {
      const subjectsData = await getAllSubjects()
      setSubjects(subjectsData)
    } catch (error) {
      console.error('Error reloading subjects:', error)
      setError('Không thể tải lại danh sách môn học')
    } finally {
      setIsReloading(false)
    }
  }

  const handleSubjectClick = (subject: SubjectResponse) => {
    // Navigate to quizzes for this subject
    navigate(`/student/quiz-taking?subject=${subject.id}`)
  }

  // Helper function to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      // Try different date formats
      let date: Date
      
      // Check if it's already a valid date string
      if (dateString.includes('T') || dateString.includes('-')) {
        date = new Date(dateString)
      } else {
        // Try parsing as timestamp
        const timestamp = parseInt(dateString)
        if (!isNaN(timestamp)) {
          date = new Date(timestamp)
        } else {
          date = new Date(dateString)
        }
      }
      
      if (isNaN(date.getTime())) {
        return 'N/A'
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      console.warn('Date parsing error:', error, 'for date:', dateString)
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-300 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-reverse-slow"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user || !isStudent(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
          <p className="text-gray-600">You need student permissions to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 relative overflow-hidden">
      {/* 🌈 Enhanced floating shapes with rainbow effects */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200/40 to-rose-200/40 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-200/40 to-indigo-200/40 rounded-full blur-lg animate-bounce"></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-br from-amber-200/40 to-yellow-200/40 rounded-full blur-xl animate-bounce"></div>
      
      {/* ✨ Sparkle decorations */}
      <div className="absolute top-10 left-1/3 w-6 h-6 bg-gradient-to-br from-yellow-300 to-amber-300 rounded-full animate-float opacity-60 shadow-lg"></div>
      <div className="absolute top-20 right-1/3 w-4 h-4 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full animate-float-delayed opacity-70 shadow-lg"></div>
      <div className="absolute bottom-10 left-20 w-8 h-8 bg-gradient-to-br from-green-300 to-emerald-300 rounded-full animate-float-slow opacity-50 shadow-lg"></div>
      <div className="absolute bottom-20 right-10 w-5 h-5 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full animate-float-delayed-2 opacity-60 shadow-lg"></div>
      
      {/* 🎨 Additional decorative dots */}
      <div className="absolute top-32 left-1/2 w-3 h-3 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full animate-float opacity-40"></div>
      <div className="absolute top-60 right-1/4 w-2 h-2 bg-gradient-to-br from-cyan-300 to-blue-300 rounded-full animate-float-delayed opacity-50"></div>
      <div className="absolute bottom-32 left-1/3 w-4 h-4 bg-gradient-to-br from-orange-300 to-red-300 rounded-full animate-float-slow opacity-45"></div>
      <div className="absolute bottom-60 right-1/2 w-3 h-3 bg-gradient-to-br from-lime-300 to-green-300 rounded-full animate-float-delayed-2 opacity-55"></div>
      
      <StudentNavigation />
      
      {/* 🌈 Beautiful Header with rainbow effects */}
      <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 shadow-2xl border-b-4 border-pink-300 relative overflow-hidden">
        {/* 🎨 Enhanced Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-20 h-20 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-md animate-ping"></div>
          <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full blur-lg animate-pulse"></div>
          
          {/* ✨ Sparkle effects */}
          <div className="absolute top-16 left-1/4 w-4 h-4 bg-gradient-to-br from-yellow-300 to-amber-300 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-24 right-1/4 w-3 h-3 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full animate-float-delayed opacity-70"></div>
          <div className="absolute bottom-16 left-1/2 w-5 h-5 bg-gradient-to-br from-green-300 to-emerald-300 rounded-full animate-float-slow opacity-50"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500 animate-heartbeat btn-magic">
                <span className="text-3xl animate-wiggle">📚</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-rounded font-bold text-rainbow mb-4 animate-fade-in">
              🎓 Student Subjects
            </h1>
            <p className="text-xl text-gray-700 font-rounded font-semibold animate-slide-up">
              ✨ Khám phá các môn học và bắt đầu học tập ✨
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* 🎪 Enhanced Action Bar with magic effects */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReload}
              disabled={isReloading}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed btn-magic"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg group-hover:animate-spin">
                  {isReloading ? '⏳' : '🔄'}
                </span>
                <span>{isReloading ? 'Đang tải...' : 'Tải lại'}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* ✨ Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            
            <div className="text-sm text-gray-600 font-rounded font-semibold">
              📊 Tổng cộng: <span className="font-bold text-blue-600">{subjects.length}</span> môn học
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border-2 border-red-300 rounded-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚠️</span>
              <span className="text-red-700 font-bold">{error}</span>
            </div>
          </div>
        )}

        {/* 🎯 Enhanced Loading State with multiple spinning rings */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 w-32 h-32 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animate-reverse-slow"></div>
              <div className="absolute inset-4 w-24 h-24 border-4 border-transparent border-t-rose-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl animate-bounce filter drop-shadow-lg animate-wiggle">🎯</span>
              </div>
            </div>
            <h3 className="text-2xl font-rounded font-bold text-amber-700 mb-2 tracking-wide animate-heartbeat">🔄 Loading Subjects...</h3>
            <p className="text-lg text-amber-600 font-rounded font-bold animate-fade-in">✨ Preparing your subject collection... ✨</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-amber-300 animate-pulse">
                <span className="text-6xl filter drop-shadow-lg animate-wiggle">📚</span>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
            </div>
            <h3 className="text-4xl font-rounded font-bold text-amber-700 mb-4 tracking-wide animate-heartbeat">🌟 No Subjects Yet</h3>
            <p className="text-xl text-amber-600 mb-8 font-rounded font-bold max-w-2xl mx-auto leading-relaxed animate-fade-in">
              ✨ Contact your teacher to get assigned subjects! ✨
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map((subject, index) => {
              // 🎨 Flat doodle icons array - no repeats
              const doodleIcons = ['home', 'palette', 'globe', 'temple', 'chat', 'leaf', 'basketball', 'trivia', 'atom', 'dna', 'calculator', 'microscope', 'book', 'compass', 'flask', 'music', 'paintbrush', 'star']
              const iconName = doodleIcons[index % doodleIcons.length]
              
              // 🎨 Pastel color combinations
              const colorCombinations = [
                'from-pink-200 to-rose-200 border-pink-300 hover:border-pink-400',
                'from-rose-200 to-pink-200 border-rose-300 hover:border-rose-400', 
                'from-purple-200 to-indigo-200 border-purple-300 hover:border-purple-400',
                'from-indigo-200 to-blue-200 border-indigo-300 hover:border-indigo-400',
                'from-blue-200 to-cyan-200 border-blue-300 hover:border-blue-400',
                'from-cyan-200 to-teal-200 border-cyan-300 hover:border-cyan-400',
                'from-teal-200 to-emerald-200 border-teal-300 hover:border-teal-400',
                'from-emerald-200 to-green-200 border-emerald-300 hover:border-emerald-400',
                'from-green-200 to-lime-200 border-green-300 hover:border-green-400',
                'from-lime-200 to-yellow-200 border-lime-300 hover:border-lime-400',
                'from-yellow-200 to-amber-200 border-yellow-300 hover:border-yellow-400',
                'from-amber-200 to-orange-200 border-amber-300 hover:border-amber-400',
                'from-orange-200 to-red-200 border-orange-300 hover:border-orange-400',
                'from-red-200 to-pink-200 border-red-300 hover:border-red-400',
                'from-pink-200 to-purple-200 border-pink-300 hover:border-pink-400',
                'from-purple-200 to-violet-200 border-purple-300 hover:border-purple-400'
              ]
              const colorClass = colorCombinations[index % colorCombinations.length]
              
              return (
                <div
                  key={subject.id}
                  onClick={() => handleSubjectClick(subject)}
                  className={`group relative overflow-hidden bg-gradient-to-br ${colorClass} backdrop-blur-sm rounded-2xl shadow-lg p-6 border-4 transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:-rotate-1 hover-lift animate-fade-in-up cursor-pointer`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                  <div className="relative">
                    {/* 🎨 Enhanced Subject Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 btn-magic animate-float`}>
                        <DoodleIcons name={iconName} size={20} className="text-gray-700 group-hover:animate-bounce filter drop-shadow-lg animate-wiggle" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-rounded font-bold text-gray-900 group-hover:text-rainbow transition-all duration-300 tracking-wide truncate animate-fade-in">
                          {subject.name}
                        </h3>
                      </div>
                    </div>

                    {/* 🎨 Enhanced Subject Description */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 font-rounded font-semibold group-hover:text-glow transition-all duration-300 animate-fade-in">
                        {subject.description || 'Không có mô tả'}
                      </p>
                    </div>

                    {/* 🎨 Enhanced Subject Stats */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-rounded font-bold text-gray-700 flex items-center space-x-2 animate-fade-in">
                        <span className="animate-wiggle">📚</span>
                        <span>Môn học</span>
                      </div>
                      <div className="text-sm font-rounded font-bold text-gray-700 flex items-center space-x-2 animate-fade-in">
                        <span className="animate-wiggle">🎯</span>
                        <span>Sẵn sàng</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 🎨 Enhanced Additional Info */}
        <div className="mt-12 text-center">
          <div className="gradient-pastel-blue border-4 border-blue-300 rounded-3xl p-8 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
                <span className="text-2xl animate-wiggle">💡</span>
              </div>
            </div>
            <h3 className="text-2xl font-rounded font-bold text-rainbow mb-4 tracking-wide animate-heartbeat">💡 Gợi ý</h3>
            <p className="text-lg text-gray-700 font-rounded font-semibold animate-slide-up">
              ✨ Nhấp vào môn học để xem danh sách quiz và bắt đầu học tập! ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
