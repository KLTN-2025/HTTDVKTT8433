// Auth and Role Types
export type UserRole = 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_USER' | 'ROLE_ADMIN'
export type Permission = 'STUDENT' | 'TEACHER' | 'USER' | 'ADMIN'

export interface UserProfile {
  id: string
  userId: string
  username: string
  status: 'ONLINE' | 'OFFLINE'
  email: string
  firstName: string
  lastName: string
  imageUrl: string | null
  gender: string
  phoneNumber: string
  dateOfBirth: string
  city: string
  emailVerified: boolean
  roles: UserRole[]
  permissions: Permission[]
  createdAt: string | null
  bio: string | null
  quote: string | null
  jobTitle: string | null
  company: string | null
  themeColor: string | null
  coverImageUrl: string | null
  privateProfile: boolean
  // Additional fields from API
  profileId?: string
  mssv?: string
  fullName?: string | null
  blocked?: boolean
}

export interface AuthResponse {
  code: number
  result: UserProfile
}

// Role hierarchy - higher roles include lower permissions
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'ROLE_USER': 1,
  'ROLE_STUDENT': 2,
  'ROLE_TEACHER': 3,
  'ROLE_ADMIN': 4
}

// Permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'ROLE_USER': ['USER'],
  'ROLE_STUDENT': ['USER', 'STUDENT'],
  'ROLE_TEACHER': ['USER', 'STUDENT', 'TEACHER'],
  'ROLE_ADMIN': ['USER', 'STUDENT', 'TEACHER', 'ADMIN']
}
