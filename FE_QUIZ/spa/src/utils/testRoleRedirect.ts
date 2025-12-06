// Test script to verify role-based redirect functionality
export const testRoleRedirect = () => {
  console.log('🧪 Testing Role-Based Redirect Functionality')
  
  // Test 1: Check if user profile is stored in localStorage after login
  const checkUserProfileStorage = () => {
    const userProfile = localStorage.getItem('user_profile')
    const accessToken = localStorage.getItem('access_token')
    
    console.log('📊 Storage Check:')
    console.log('  - Access Token:', !!accessToken)
    console.log('  - User Profile:', !!userProfile)
    
    if (userProfile) {
      try {
        const user = JSON.parse(userProfile)
        console.log('  - User Roles:', user.roles)
        console.log('  - User Permissions:', user.permissions)
        console.log('  - User Name:', user.firstName, user.lastName)
        return user
      } catch (error) {
        console.error('  - Error parsing user profile:', error)
        return null
      }
    }
    return null
  }
  
  // Test 2: Check role detection functions
  const testRoleDetection = (user: any) => {
    if (!user) {
      console.log('❌ No user data to test role detection')
      return
    }
    
    console.log('🎭 Role Detection Test:')
    console.log('  - Has ROLE_TEACHER:', user.roles?.includes('ROLE_TEACHER'))
    console.log('  - Has ROLE_ADMIN:', user.roles?.includes('ROLE_ADMIN'))
    console.log('  - Has ROLE_STUDENT:', user.roles?.includes('ROLE_STUDENT'))
    console.log('  - Has ROLE_USER:', user.roles?.includes('ROLE_USER'))
    
    // Test role checking functions
    const { isTeacher, isAdmin, isStudent } = require('@/utils/apiTransform')
    console.log('  - isTeacher():', isTeacher(user))
    console.log('  - isAdmin():', isAdmin(user))
    console.log('  - isStudent():', isStudent(user))
  }
  
  // Test 3: Check redirect logic
  const testRedirectLogic = (user: any) => {
    if (!user) {
      console.log('❌ No user data to test redirect logic')
      return
    }
    
    console.log('🔄 Redirect Logic Test:')
    
    if (user.roles?.includes('ROLE_TEACHER')) {
      console.log('  - Should redirect to: /teacher/dashboard')
    } else if (user.roles?.includes('ROLE_ADMIN')) {
      console.log('  - Should redirect to: /admin')
    } else if (user.roles?.includes('ROLE_STUDENT')) {
      console.log('  - Should stay on: /quiz (student page)')
    } else {
      console.log('  - Should stay on: /quiz (regular user)')
    }
  }
  
  // Run all tests
  const user = checkUserProfileStorage()
  testRoleDetection(user)
  testRedirectLogic(user)
  
  console.log('✅ Role-Based Redirect Test Complete')
  
  return {
    hasUserProfile: !!user,
    user,
    shouldRedirectToTeacher: user?.roles?.includes('ROLE_TEACHER'),
    shouldRedirectToAdmin: user?.roles?.includes('ROLE_ADMIN')
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testRoleRedirect = testRoleRedirect
}
