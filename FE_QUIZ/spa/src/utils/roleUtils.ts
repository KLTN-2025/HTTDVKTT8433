import { UserRole, Permission, ROLE_HIERARCHY, ROLE_PERMISSIONS, UserProfile } from '@/types/auth'

/**
 * Check if user has a specific role
 */
export const hasRole = (user: UserProfile | null, role: UserRole): boolean => {
  if (!user) return false
  return user.roles.includes(role)
}

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user: UserProfile | null, roles: UserRole[]): boolean => {
  if (!user) return false
  return roles.some(role => user.roles.includes(role))
}

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (user: UserProfile | null, roles: UserRole[]): boolean => {
  if (!user) return false
  return roles.every(role => user.roles.includes(role))
}

/**
 * Check if user has a specific permission
 */
export const hasPermission = (user: UserProfile | null, permission: Permission): boolean => {
  if (!user) return false
  return user.permissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (user: UserProfile | null, permissions: Permission[]): boolean => {
  if (!user) return false
  return permissions.some(permission => user.permissions.includes(permission))
}

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (user: UserProfile | null, permissions: Permission[]): boolean => {
  if (!user) return false
  return permissions.every(permission => user.permissions.includes(permission))
}

/**
 * Get the highest role level for a user
 */
export const getHighestRole = (user: UserProfile | null): UserRole | null => {
  if (!user || user.roles.length === 0) return null
  
  return user.roles.reduce((highest, current) => {
    return ROLE_HIERARCHY[current] > ROLE_HIERARCHY[highest] ? current : highest
  })
}

/**
 * Check if user role level is higher than or equal to required role
 */
export const hasRoleLevel = (user: UserProfile | null, requiredRole: UserRole): boolean => {
  if (!user) return false
  
  const userHighestRole = getHighestRole(user)
  if (!userHighestRole) return false
  
  return ROLE_HIERARCHY[userHighestRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Get user display name
 */
export const getUserDisplayName = (user: UserProfile | null): string => {
  if (!user) return 'Unknown User'
  return `${user.firstName} ${user.lastName}`.trim() || user.username
}

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    'ROLE_USER': 'User',
    'ROLE_STUDENT': 'Student',
    'ROLE_TEACHER': 'Teacher',
    'ROLE_ADMIN': 'Administrator'
  }
  return roleNames[role] || role
}

/**
 * Get user's primary role (highest role)
 */
export const getPrimaryRole = (user: UserProfile | null): UserRole | null => {
  return getHighestRole(user)
}

/**
 * Check if user is admin
 */
export const isAdmin = (user: UserProfile | null): boolean => {
  return hasRole(user, 'ROLE_ADMIN')
}

/**
 * Check if user is teacher
 */
export const isTeacher = (user: UserProfile | null): boolean => {
  return hasRole(user, 'ROLE_TEACHER')
}

/**
 * Check if user is student
 */
export const isStudent = (user: UserProfile | null): boolean => {
  return hasRole(user, 'ROLE_STUDENT')
}

/**
 * Check if user can access admin features
 */
export const canAccessAdmin = (user: UserProfile | null): boolean => {
  return hasRoleLevel(user, 'ROLE_ADMIN')
}

/**
 * Check if user can create content (teacher or admin)
 */
export const canCreateContent = (user: UserProfile | null): boolean => {
  return hasAnyRole(user, ['ROLE_TEACHER', 'ROLE_ADMIN'])
}

/**
 * Check if user can manage users (admin only)
 */
export const canManageUsers = (user: UserProfile | null): boolean => {
  return hasRole(user, 'ROLE_ADMIN')
}

/**
 * Get role-based navigation items
 */
export const getRoleBasedNavItems = (user: UserProfile | null) => {
  const baseItems = [
    { name: 'Dashboard', path: '/dashboard', roles: ['ROLE_USER', 'ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN'] },
    { name: 'Profile', path: '/profile', roles: ['ROLE_USER', 'ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN'] }
  ]

  const studentItems = [
    { name: 'Quizzes', path: '/quizzes', roles: ['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN'] },
    { name: 'My Results', path: '/results', roles: ['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN'] }
  ]

  const teacherItems = [
    { name: 'Create Quiz', path: '/create-quiz', roles: ['ROLE_TEACHER', 'ROLE_ADMIN'] },
    { name: 'Manage Quizzes', path: '/manage-quizzes', roles: ['ROLE_TEACHER', 'ROLE_ADMIN'] },
    { name: 'Analytics', path: '/analytics', roles: ['ROLE_TEACHER', 'ROLE_ADMIN'] }
  ]

  const adminItems = [
    { name: 'User Management', path: '/admin/users', roles: ['ROLE_ADMIN'] },
    { name: 'System Settings', path: '/admin/settings', roles: ['ROLE_ADMIN'] },
    { name: 'Reports', path: '/admin/reports', roles: ['ROLE_ADMIN'] }
  ]

  const allItems = [...baseItems, ...studentItems, ...teacherItems, ...adminItems]
  
  if (!user) return baseItems
  
  return allItems.filter(item => 
    item.roles.some(role => hasRole(user, role as UserRole))
  )
}
