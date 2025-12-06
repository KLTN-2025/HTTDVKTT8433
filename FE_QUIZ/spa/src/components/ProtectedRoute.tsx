import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { UserRole, Permission, UserProfile } from '@/types/auth'
import { 
  hasRole, 
  hasAnyRole, 
  hasAllRoles, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  hasRoleLevel 
} from '@/utils/roleUtils'

interface ProtectedRouteProps {
  user: UserProfile | null
  children: React.ReactNode
  redirectTo?: string
  requireRole?: UserRole
  requireRoles?: UserRole[]
  requireAllRoles?: UserRole[]
  requirePermission?: Permission
  requirePermissions?: Permission[]
  requireAllPermissions?: Permission[]
  requireRoleLevel?: UserRole
  mode?: 'any' | 'all'
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  user,
  children,
  redirectTo = '/login',
  requireRole,
  requireRoles,
  requireAllRoles,
  requirePermission,
  requirePermissions,
  requireAllPermissions,
  requireRoleLevel,
  mode = 'any',
  fallback
}) => {
  const location = useLocation()

  // If no user, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  const conditions: boolean[] = []

  // Check role conditions
  if (requireRole) {
    conditions.push(hasRole(user, requireRole))
  }
  
  if (requireRoles && requireRoles.length > 0) {
    conditions.push(hasAnyRole(user, requireRoles))
  }
  
  if (requireAllRoles && requireAllRoles.length > 0) {
    conditions.push(hasAllRoles(user, requireAllRoles))
  }

  // Check permission conditions
  if (requirePermission) {
    conditions.push(hasPermission(user, requirePermission))
  }
  
  if (requirePermissions && requirePermissions.length > 0) {
    conditions.push(hasAnyPermission(user, requirePermissions))
  }
  
  if (requireAllPermissions && requireAllPermissions.length > 0) {
    conditions.push(hasAllPermissions(user, requireAllPermissions))
  }

  // Check role level
  if (requireRoleLevel) {
    conditions.push(hasRoleLevel(user, requireRoleLevel))
  }

  // If no conditions specified, allow access
  if (conditions.length === 0) {
    return <>{children}</>
  }

  // Check conditions based on mode
  const hasAccess = mode === 'all' 
    ? conditions.every(condition => condition)
    : conditions.some(condition => condition)

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

// Convenience components for common route protection
export const AdminRoute: React.FC<{ 
  user: UserProfile | null; 
  children: React.ReactNode; 
  redirectTo?: string;
  fallback?: React.ReactNode;
}> = ({ user, children, redirectTo, fallback }) => (
  <ProtectedRoute 
    user={user} 
    requireRole="ROLE_ADMIN" 
    redirectTo={redirectTo}
    fallback={fallback}
  >
    {children}
  </ProtectedRoute>
)

export const TeacherRoute: React.FC<{ 
  user: UserProfile | null; 
  children: React.ReactNode; 
  redirectTo?: string;
  fallback?: React.ReactNode;
}> = ({ user, children, redirectTo, fallback }) => (
  <ProtectedRoute 
    user={user} 
    requireRoles={['ROLE_TEACHER', 'ROLE_ADMIN']} 
    redirectTo={redirectTo}
    fallback={fallback}
  >
    {children}
  </ProtectedRoute>
)

export const StudentRoute: React.FC<{ 
  user: UserProfile | null; 
  children: React.ReactNode; 
  redirectTo?: string;
  fallback?: React.ReactNode;
}> = ({ user, children, redirectTo, fallback }) => (
  <ProtectedRoute 
    user={user} 
    requireRoles={['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN']} 
    redirectTo={redirectTo}
    fallback={fallback}
  >
    {children}
  </ProtectedRoute>
)

export const TeacherOrAdminRoute: React.FC<{ 
  user: UserProfile | null; 
  children: React.ReactNode; 
  redirectTo?: string;
  fallback?: React.ReactNode;
}> = ({ user, children, redirectTo, fallback }) => (
  <ProtectedRoute 
    user={user} 
    requireRoles={['ROLE_TEACHER', 'ROLE_ADMIN']} 
    redirectTo={redirectTo}
    fallback={fallback}
  >
    {children}
  </ProtectedRoute>
)

export default ProtectedRoute
