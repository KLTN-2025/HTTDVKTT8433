import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { transformApiUserProfile } from '@/utils/apiTransform'
import { getPrimaryRole, isTeacher, isAdmin, isStudent } from '@/utils/apiTransform'

export const AutoRedirectTest: React.FC = () => {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const [redirectLog, setRedirectLog] = useState<string[]>([])
  const [isTesting, setIsTesting] = useState(false)

  const addLog = (message: string) => {
    setRedirectLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const clearLog = () => {
    setRedirectLog([])
  }

  const testAutoRedirect = async () => {
    setIsTesting(true)
    clearLog()
    
    try {
      addLog('🚀 Starting auto-redirect test...')
      
      // Step 1: Simulate login with teacher role
      const mockUserData = {
        id: "af458dcf-d843-49a7-bcbf-c33e97d2479c",
        username: "ngocduong3",
        status: "ONLINE",
        email: "ngocduong3@yopmail.com",
        firstName: "duong",
        lastName: "Loi",
        imageUrl: null,
        gender: "female",
        phoneNumber: "1234567872",
        dateOfBirth: "0012-11-16T00:00:00.000+00:00",
        city: "DN",
        emailVerified: false,
        roles: [
          {
            name: 'ROLE_TEACHER',
            description: 'TEACHER',
            permissions: ['TEACHER']
          },
          {
            name: 'ROLE_USER',
            description: 'Users role',
            permissions: []
          }
        ],
        createdAt: "2025-10-13T17:03:14.607131",
        bio: null,
        blocked: false,
        profileId: "68ecce6253414248f4f10473",
        mssv: "311234424",
        fullName: null
      }
      
      addLog('📥 Mock user data prepared')
      addLog(`   - Username: ${mockUserData.username}`)
      addLog(`   - Roles: ${mockUserData.roles.map(r => r.name).join(', ')}`)
      
      // Step 2: Transform and login
      addLog('🔄 Transforming and logging in...')
      const transformedUser = transformApiUserProfile(mockUserData)
      login(transformedUser)
      addLog('✅ User logged in successfully')
      
      // Step 3: Check current path
      const currentPath = window.location.pathname
      addLog(`📍 Current path: ${currentPath}`)
      
      // Step 4: Check if redirect is needed
      const primaryRole = getPrimaryRole(transformedUser)
      addLog(`🎭 Primary role: ${primaryRole}`)
      
      let shouldRedirect = false
      let targetPath = ''
      
      switch (primaryRole) {
        case 'ROLE_TEACHER':
          if (!currentPath.startsWith('/teacher')) {
            shouldRedirect = true
            targetPath = '/teacher/dashboard'
          }
          break
        case 'ROLE_ADMIN':
          if (!currentPath.startsWith('/admin')) {
            shouldRedirect = true
            targetPath = '/admin/dashboard'
          }
          break
        case 'ROLE_STUDENT':
          if (!currentPath.startsWith('/student')) {
            shouldRedirect = true
            targetPath = '/student/dashboard'
          }
          break
        case 'ROLE_USER':
        default:
          if (!currentPath.startsWith('/dashboard') && 
              !currentPath.startsWith('/teacher') && 
              !currentPath.startsWith('/admin') && 
              !currentPath.startsWith('/student')) {
            shouldRedirect = true
            targetPath = '/dashboard'
          }
          break
      }
      
      if (shouldRedirect) {
        addLog(`🔄 Redirect needed: ${currentPath} → ${targetPath}`)
        addLog('⏳ Redirecting in 2 seconds...')
        
        setTimeout(() => {
          addLog(`🚀 Redirecting to ${targetPath}`)
          navigate(targetPath, { replace: true })
          addLog('✅ Redirect completed!')
        }, 2000)
      } else {
        addLog('✅ Already on correct page - no redirect needed')
      }
      
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTesting(false)
    }
  }

  const testCurrentUser = () => {
    setIsTesting(true)
    clearLog()
    
    addLog('🔍 Checking current user...')
    
    if (user) {
      addLog(`✅ User found: ${user.username}`)
      addLog(`   - Primary role: ${getPrimaryRole(user)}`)
      addLog(`   - Is teacher: ${isTeacher(user) ? 'Yes' : 'No'}`)
      addLog(`   - Current path: ${window.location.pathname}`)
      
      // Check if we should redirect
      const primaryRole = getPrimaryRole(user)
      const currentPath = window.location.pathname
      
      if (primaryRole === 'ROLE_TEACHER' && !currentPath.startsWith('/teacher')) {
        addLog('🔄 Should redirect to teacher dashboard...')
        navigate('/teacher/dashboard', { replace: true })
      } else if (primaryRole === 'ROLE_ADMIN' && !currentPath.startsWith('/admin')) {
        addLog('🔄 Should redirect to admin dashboard...')
        navigate('/admin/dashboard', { replace: true })
      } else if (primaryRole === 'ROLE_STUDENT' && !currentPath.startsWith('/student')) {
        addLog('🔄 Should redirect to student dashboard...')
        navigate('/student/dashboard', { replace: true })
      } else {
        addLog('✅ Already on correct page')
      }
    } else {
      addLog('❌ No user found - please login first')
    }
    
    setIsTesting(false)
  }

  const simulateDifferentRoles = () => {
    setIsTesting(true)
    clearLog()
    
    addLog('🎭 Testing different roles...')
    
    const roles = [
      { role: 'ROLE_TEACHER', path: '/teacher/dashboard', name: 'Teacher' },
      { role: 'ROLE_ADMIN', path: '/admin/dashboard', name: 'Admin' },
      { role: 'ROLE_STUDENT', path: '/student/dashboard', name: 'Student' },
      { role: 'ROLE_USER', path: '/dashboard', name: 'User' }
    ]
    
    roles.forEach((roleInfo, index) => {
      setTimeout(() => {
        addLog(`🧪 Testing ${roleInfo.name} role...`)
        addLog(`   - Expected redirect: ${roleInfo.path}`)
        addLog(`   - Current path: ${window.location.pathname}`)
        
        if (window.location.pathname !== roleInfo.path) {
          addLog(`🔄 Would redirect to ${roleInfo.path}`)
        } else {
          addLog('✅ Already on correct page')
        }
      }, index * 1000)
    })
    
    setTimeout(() => {
      addLog('🎉 Role testing completed!')
      setIsTesting(false)
    }, roles.length * 1000)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🔄 Auto-Redirect Test</h3>
      
      <div className="space-y-4">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testAutoRedirect}
            disabled={isTesting}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            {isTesting ? 'Testing...' : 'Test Auto-Redirect'}
          </button>
          
          <button
            onClick={testCurrentUser}
            disabled={isTesting}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Test Current User
          </button>
          
          <button
            onClick={simulateDifferentRoles}
            disabled={isTesting}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Test All Roles
          </button>
          
          <button
            onClick={clearLog}
            disabled={isTesting}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Clear Log
          </button>
        </div>

        {/* Redirect Log */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2">Redirect Log</h4>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {redirectLog.length === 0 ? (
              <div className="text-gray-500 text-sm">No redirect logs yet...</div>
            ) : (
              redirectLog.map((log, index) => (
                <div key={index} className="text-sm text-gray-700 font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Current Status</h4>
          <div className="space-y-1 text-blue-700 text-sm">
            <div><strong>User:</strong> {user ? user.username : 'Not logged in'}</div>
            <div><strong>Role:</strong> {user ? getPrimaryRole(user) : 'N/A'}</div>
            <div><strong>Is Teacher:</strong> {user ? (isTeacher(user) ? 'Yes' : 'No') : 'N/A'}</div>
            <div><strong>Current Path:</strong> {window.location.pathname}</div>
            <div><strong>Should Redirect:</strong> {
              user ? (
                (() => {
                  const primaryRole = getPrimaryRole(user)
                  const currentPath = window.location.pathname
                  
                  if (primaryRole === 'ROLE_TEACHER' && !currentPath.startsWith('/teacher')) return 'Yes → /teacher/dashboard'
                  if (primaryRole === 'ROLE_ADMIN' && !currentPath.startsWith('/admin')) return 'Yes → /admin/dashboard'
                  if (primaryRole === 'ROLE_STUDENT' && !currentPath.startsWith('/student')) return 'Yes → /student/dashboard'
                  if (primaryRole === 'ROLE_USER' && !currentPath.startsWith('/dashboard') && !currentPath.startsWith('/teacher') && !currentPath.startsWith('/admin') && !currentPath.startsWith('/student')) return 'Yes → /dashboard'
                  return 'No - Already on correct page'
                })()
              ) : 'N/A'
            }</div>
          </div>
        </div>

        {/* Expected Behavior */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Expected Behavior</h4>
          <div className="space-y-1 text-yellow-700 text-sm">
            <p><strong>ROLE_TEACHER:</strong> Should redirect to /teacher/dashboard</p>
            <p><strong>ROLE_ADMIN:</strong> Should redirect to /admin/dashboard</p>
            <p><strong>ROLE_STUDENT:</strong> Should redirect to /student/dashboard</p>
            <p><strong>ROLE_USER:</strong> Should redirect to /dashboard</p>
            <p><strong>Already on correct page:</strong> No redirect needed</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutoRedirectTest
