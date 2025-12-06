import { UserProfile, UserRole, Permission } from '@/types/auth'

// Transform API response to match our UserProfile interface
export const transformApiUserProfile = (apiResponse: any): UserProfile => {
  // Extract roles from the API response structure
  const roles: UserRole[] = []
  const permissions: Permission[] = []
  
  if (apiResponse.roles && Array.isArray(apiResponse.roles)) {
    apiResponse.roles.forEach((role: any) => {
      // Handle both string roles and object roles
      if (typeof role === 'string') {
        roles.push(role as UserRole)
      } else if (role && role.name) {
        roles.push(role.name as UserRole)
        // Extract permissions from role object
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach((perm: any) => {
            if (perm && !permissions.includes(perm as Permission)) {
              permissions.push(perm as Permission)
            }
          })
        }
      }
    })
  }

  // Also handle permissions array directly
  if (apiResponse.permissions && Array.isArray(apiResponse.permissions)) {
    apiResponse.permissions.forEach((perm: any) => {
      if (perm && !permissions.includes(perm as Permission)) {
        permissions.push(perm as Permission)
      }
    })
  }

  return {
    id: apiResponse.id || apiResponse.userId || '',
    userId: apiResponse.userId || apiResponse.id || '',
    username: apiResponse.username || '',
    status: apiResponse.status || 'OFFLINE',
    email: apiResponse.email || '',
    firstName: apiResponse.firstName || '',
    lastName: apiResponse.lastName || '',
    imageUrl: apiResponse.imageUrl || null,
    gender: apiResponse.gender || '',
    phoneNumber: apiResponse.phoneNumber || '',
    dateOfBirth: apiResponse.dateOfBirth || '',
    city: apiResponse.city || '',
    emailVerified: apiResponse.emailVerified || false,
    roles,
    permissions,
    createdAt: apiResponse.createdAt || null,
    bio: apiResponse.bio || null,
    quote: apiResponse.quote || null,
    jobTitle: apiResponse.jobTitle || null,
    company: apiResponse.company || null,
    themeColor: apiResponse.themeColor || null,
    coverImageUrl: apiResponse.coverImageUrl || null,
    privateProfile: apiResponse.privateProfile || false,
    // Additional fields
    profileId: apiResponse.profileId,
    mssv: apiResponse.mssv,
    fullName: apiResponse.fullName,
    blocked: apiResponse.blocked
  }
}

// Helper function to check if user has specific role
export const hasRole = (user: UserProfile | null, role: UserRole): boolean => {
  if (!user || !user.roles) return false
  return user.roles.includes(role)
}

// Helper function to check if user is teacher
export const isTeacher = (user: UserProfile | null): boolean => {
  return hasRole(user, 'ROLE_TEACHER')
}

// Helper function to check if user is admin
export const isAdmin = (user: UserProfile | null): boolean => {
  return hasRole(user, 'ROLE_ADMIN')
}

// Helper function to check if user is student
export const isStudent = (user: UserProfile | null): boolean => {
  return hasRole(user, 'ROLE_STUDENT')
}

// Get user display name
export const getUserDisplayName = (user: UserProfile | null): string => {
  if (!user) return 'Unknown User'
  return `${user.firstName} ${user.lastName}`.trim() || user.username
}

// Get primary role (highest priority)
export const getPrimaryRole = (user: UserProfile | null): UserRole | null => {
  if (!user || !user.roles || user.roles.length === 0) return null
  
  // Priority order: ADMIN > TEACHER > STUDENT > USER
  const rolePriority: Record<UserRole, number> = {
    'ROLE_ADMIN': 4,
    'ROLE_TEACHER': 3,
    'ROLE_STUDENT': 2,
    'ROLE_USER': 1
  }
  
  return user.roles.reduce((highest, current) => {
    return rolePriority[current] > rolePriority[highest] ? current : highest
  })
}

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    'ROLE_USER': 'User',
    'ROLE_STUDENT': 'Student',
    'ROLE_TEACHER': 'Teacher',
    'ROLE_ADMIN': 'Administrator'
  }
  return roleNames[role] || role
}
