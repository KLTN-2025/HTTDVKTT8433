// import { ApiResponse } from './types'

export interface ApiResponse<T> {
  code?: number
  message?: string
  result?: T
  error?: string
}

export interface Role {
  name: string
  description: string
  permissions?: Permission[]
}

export interface RoleRequest {
  name: string
  description: string
  permissions: string[]
}

export interface Permission {
  name: string
  description: string
}

export interface User {
  id: string
  userId: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  status: string
  roles?: string[]  // Changed from Role[] to string[]
  permissions?: string[]  // Changed from Permission[] to string[]
  phoneNumber?: string
  imageUrl?: string
  gender?: string
  dateOfBirth?: string
  city?: string
  emailVerified?: boolean
}

export interface PermissionRequest {
  name: string
  description: string
}

const API_BASE = '/api/v1/identity'

export class RoleService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('access_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Role Management
  static async createRole(roleData: RoleRequest): Promise<ApiResponse<Role>> {
    const response = await fetch(`${API_BASE}/roles`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(roleData)
    })
    return response.json()
  }

  static async getAllRoles(): Promise<ApiResponse<Role[]>> {
    const response = await fetch(`${API_BASE}/roles`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async deleteRole(roleName: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/roles/${roleName}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async assignRoleToUser(userId: string, roleName: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/roles/assign-to-user?userId=${userId}&role=${roleName}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async removeRoleFromUser(userId: string, roleName: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/roles/users/${userId}/roles/${roleName}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  // Permission Management
  static async createPermission(permissionData: PermissionRequest): Promise<ApiResponse<Permission>> {
    const response = await fetch(`${API_BASE}/permissions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(permissionData)
    })
    return response.json()
  }

  static async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    const response = await fetch(`${API_BASE}/permissions`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async deletePermission(permissionName: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/permissions/${permissionName}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async assignPermissionToUser(userId: string, permissionName: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/permissions/assign-to-user?userId=${userId}&permissionName=${permissionName}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async removePermissionFromUser(userId: string, permissionName: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/permissions/users/${userId}/permissions/${permissionName}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }

  static async getAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch('/api/v1/profile/users', {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    return response.json()
  }
}
