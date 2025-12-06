import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isStudent, getUserDisplayName } from '@/utils/apiTransform'
import DoodleIcons from './DoodleIcons'

export const StudentNavigation: React.FC = () => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false)
      }
    }

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMoreMenu])

  if (loading || !user || !isStudent(user)) {
    return null
  }

  const displayName = getUserDisplayName(user)

  const navigationItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: '🏡', color: 'from-amber-200 to-orange-200 hover:from-amber-300 hover:to-orange-300' },
    { name: 'Take Quiz', path: '/student/quiz-taking', icon: '🎯', color: 'from-orange-200 to-red-200 hover:from-orange-300 hover:to-red-300' },
    { name: 'Subjects', path: '/student/subjects', icon: '📚', color: 'from-teal-200 to-cyan-200 hover:from-teal-300 hover:to-cyan-300' },
    { name: 'Review Quizzes', path: '/student/review-quizzes', icon: '🔄', color: 'from-purple-200 to-indigo-200 hover:from-purple-300 hover:to-indigo-300' },
    { name: 'My Results', path: '/student/results', icon: '📊', color: 'from-violet-200 to-purple-200 hover:from-violet-300 hover:to-purple-300' },
    { name: 'Quiz History', path: '/student/quiz-history', icon: '📖', color: 'from-emerald-200 to-teal-200 hover:from-emerald-300 hover:to-teal-300' }
  ]

  return (
    <nav className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 shadow-2xl border-b-4 border-pink-300 relative overflow-hidden font-['Inter']">
      {/* Beautiful floating shapes with enhanced animations */}
      <div className="absolute top-0 left-10 w-20 h-20 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-0 right-20 w-16 h-16 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
      <div className="absolute bottom-0 left-1/4 w-12 h-12 bg-amber-200/30 rounded-full blur-md animate-ping" />
      <div className="absolute bottom-0 right-1/3 w-14 h-14 bg-blue-200/30 rounded-full blur-lg animate-pulse" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand - Compact */}
          <div className="flex items-center">
            <Link to="/student/dashboard" className="group flex items-center space-x-3 transform hover:scale-105 transition-all duration-500">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-500 group-hover:rotate-6 border-4 border-amber-300 animate-heartbeat btn-magic">
                  <span className="text-xl group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">🎓</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500"></div>
              </div>
              <div>
                <span className="text-xl font-rounded font-bold text-rainbow tracking-tight animate-heartbeat">
                  🎓 Student Portal
                </span>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="text-xs font-rounded font-bold text-amber-700 animate-fade-in">✨</span>
                  <span className="text-xs font-rounded font-bold text-amber-700 animate-fade-in">🌟</span>
                  <span className="text-xs font-rounded font-bold text-amber-700 animate-fade-in">✨</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Compact */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item, index) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`group relative flex items-center space-x-2 px-3 py-2 rounded-lg font-rounded font-bold text-xs transition-all duration-500 transform hover:scale-105 border-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-300 to-orange-300 text-amber-800 border-amber-400 shadow-lg animate-heartbeat'
                      : `bg-gradient-to-r ${item.color} text-gray-700 hover:text-gray-900 border-transparent hover:border-amber-300 shadow-md hover:shadow-lg`
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-500 border-2 ${
                    isActive 
                      ? 'bg-amber-100 border-amber-500 animate-float' 
                      : 'bg-white/90 border-gray-300 group-hover:border-amber-400 group-hover:scale-110'
                  }`}>
                    <span className={`text-sm transition-transform duration-500 ${
                      isActive ? 'animate-bounce animate-wiggle' : 'group-hover:rotate-12 animate-wiggle'
                    }`}>{item.icon}</span>
                  </div>
                  <span className="tracking-wide font-bold text-xs">{item.name}</span>
                  {isActive && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg opacity-20 blur-lg animate-pulse"></div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Tablet Navigation - Compact */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            {navigationItems.slice(0, 3).map((item, index) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`group relative flex items-center space-x-2 px-3 py-2 rounded-lg font-rounded font-bold text-xs transition-all duration-500 transform hover:scale-105 border-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-300 to-orange-300 text-amber-800 border-amber-400 shadow-lg animate-heartbeat'
                      : `bg-gradient-to-r ${item.color} text-gray-700 hover:text-gray-900 border-transparent hover:border-amber-300 shadow-md hover:shadow-lg`
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-500 border-2 ${
                    isActive 
                      ? 'bg-amber-100 border-amber-500 animate-float' 
                      : 'bg-white/90 border-gray-300 group-hover:border-amber-400 group-hover:scale-110'
                  }`}>
                    <span className={`text-sm transition-transform duration-500 ${
                      isActive ? 'animate-bounce animate-wiggle' : 'group-hover:rotate-12 animate-wiggle'
                    }`}>{item.icon}</span>
                  </div>
                  <span className="tracking-wide font-bold text-xs">{item.name}</span>
                  {isActive && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg opacity-20 blur-lg animate-pulse"></div>
                  )}
                </Link>
              )
            })}
            {/* More button for additional items */}
            <div className="relative group" ref={dropdownRef}>
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="group relative flex items-center space-x-2 px-3 py-2 rounded-lg font-rounded font-bold text-xs bg-gradient-to-r from-violet-200 to-purple-200 hover:from-violet-300 hover:to-purple-300 text-gray-700 hover:text-gray-900 border-2 border-transparent hover:border-violet-300 shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-105"
              >
                <div className="w-5 h-5 rounded-md flex items-center justify-center bg-white/90 border-2 border-gray-300 group-hover:border-violet-400 group-hover:scale-110 transition-all duration-500">
                  <span className="text-sm group-hover:rotate-12 animate-wiggle">⋯</span>
                </div>
                <span className="tracking-wide font-bold text-xs">More</span>
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-300 to-purple-300 rounded-lg opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
              </button>
              
              {/* Dropdown Menu */}
              {showMoreMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border-2 border-violet-200 z-50 animate-fade-in">
                  <div className="py-2">
                    {navigationItems.slice(3).map((item, index) => {
                      const isActive = location.pathname === item.path
                      return (
                        <Link
                          key={index + 3}
                          to={item.path}
                          onClick={() => setShowMoreMenu(false)}
                          className={`group relative flex items-center space-x-2 px-3 py-2 mx-2 rounded-lg font-rounded font-bold text-xs transition-all duration-500 transform hover:scale-105 border-2 ${
                            isActive
                              ? 'bg-gradient-to-r from-amber-300 to-orange-300 text-amber-800 border-amber-400 shadow-lg animate-heartbeat'
                              : `bg-gradient-to-r ${item.color} text-gray-700 hover:text-gray-900 border-transparent hover:border-amber-300 shadow-md hover:shadow-lg`
                          }`}
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'both'
                          }}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-500 border-2 ${
                            isActive 
                              ? 'bg-amber-100 border-amber-500 animate-float' 
                              : 'bg-white/90 border-gray-300 group-hover:border-amber-400 group-hover:scale-110'
                          }`}>
                            <span className={`text-sm transition-transform duration-500 ${
                              isActive ? 'animate-bounce animate-wiggle' : 'group-hover:rotate-12 animate-wiggle'
                            }`}>{item.icon}</span>
                          </div>
                          <span className="tracking-wide font-bold text-xs">{item.name}</span>
                          {isActive && (
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg opacity-20 blur-lg animate-pulse"></div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Menu - Compact */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:block text-right">
              <div className="text-sm font-rounded font-bold text-rainbow tracking-wide animate-heartbeat">{displayName}</div>
              <div className="text-xs font-rounded font-bold text-amber-700 animate-fade-in">✨ Student ✨</div>
            </div>
            <div className="group relative">
              {user.imageUrl ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border-3 border-amber-400 group-hover:scale-110 transition-transform duration-500">
                  <img
                    src={user.imageUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl flex items-center justify-center shadow-lg border-3 border-amber-400 group-hover:scale-110 transition-transform duration-500 animate-heartbeat btn-magic">
                  <span className="text-lg group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">👨‍🎓</span>
                </div>
              )}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500"></div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white animate-pulse ${
                user.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-gray-400'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Compact */}
        <div className="md:hidden gradient-pastel-blue border-2 border-blue-300 backdrop-blur-sm rounded-xl mx-4 mb-4 shadow-lg animate-fade-in">
          <div className="px-3 pt-3 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {navigationItems.map((item, index) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`group relative flex items-center space-x-2 px-3 py-2 rounded-lg font-rounded font-bold text-xs transition-all duration-500 transform hover:scale-105 border-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-300 to-orange-300 text-amber-800 border-amber-400 shadow-lg animate-heartbeat'
                        : `bg-gradient-to-r ${item.color} text-gray-700 hover:text-gray-900 border-transparent hover:border-amber-300 shadow-md hover:shadow-lg`
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-500 border-2 ${
                      isActive 
                        ? 'bg-amber-100 border-amber-500 animate-float' 
                        : 'bg-white/90 border-gray-300 group-hover:border-amber-400 group-hover:scale-110'
                    }`}>
                      <span className={`text-sm transition-transform duration-500 ${
                        isActive ? 'animate-bounce animate-wiggle' : 'group-hover:rotate-12 animate-wiggle'
                      }`}>{item.icon}</span>
                    </div>
                    <span className="tracking-wide font-bold text-xs">{item.name}</span>
                    {isActive && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg opacity-20 blur-lg animate-pulse"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default StudentNavigation
