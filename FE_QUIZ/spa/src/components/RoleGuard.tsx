import React from 'react'
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

interface RoleGuardProps {
  user: UserProfile | null
  children: React.ReactNode
  fallback?: React.ReactNode
  requireRole?: UserRole
  requireRoles?: UserRole[]
  requireAllRoles?: UserRole[]
  requirePermission?: Permission
  requirePermissions?: Permission[]
  requireAllPermissions?: Permission[]
  requireRoleLevel?: UserRole
  mode?: 'any' | 'all' // 'any' means any of the conditions, 'all' means all conditions
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  user,
  children,
  fallback = null,
  requireRole,
  requireRoles,
  requireAllRoles,
  requirePermission,
  requirePermissions,
  requireAllPermissions,
  requireRoleLevel,
  mode = 'any'
}) => {
  // If no user, show fallback
  if (!user) {
    return <>{fallback}</>
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

  // If no conditions specified, show children
  if (conditions.length === 0) {
    return <>{children}</>
  }

  // Check conditions based on mode
  const hasAccess = mode === 'all' 
    ? conditions.every(condition => condition)
    : conditions.some(condition => condition)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Convenience components for common use cases
export const AdminOnly: React.FC<{ user: UserProfile | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <RoleGuard user={user} requireRole="ROLE_ADMIN" fallback={fallback}>
    {children}
  </RoleGuard>
)

export const TeacherOnly: React.FC<{ user: UserProfile | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <RoleGuard user={user} requireRoles={['ROLE_TEACHER', 'ROLE_ADMIN']} fallback={fallback}>
    {children}
  </RoleGuard>
)

export const StudentOnly: React.FC<{ user: UserProfile | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <RoleGuard user={user} requireRoles={['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN']} fallback={fallback}>
    {children}
  </RoleGuard>
)

export const TeacherOrAdmin: React.FC<{ user: UserProfile | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <RoleGuard user={user} requireRoles={['ROLE_TEACHER', 'ROLE_ADMIN']} fallback={fallback}>
    {children}
  </RoleGuard>
)

export const StudentOrTeacher: React.FC<{ user: UserProfile | null; children: React.ReactNode; fallback?: React.ReactNode }> = ({ user, children, fallback }) => (
  <RoleGuard user={user} requireRoles={['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN']} fallback={fallback}>
    {children}
  </RoleGuard>
)

export default RoleGuard
