import { useState, useEffect } from 'react'
import { RoleService, Role, Permission } from '../api/roleService'
import { ApiResponse } from '../api/types'

interface User {
  id: string
  username: string
  email: string
  fullName?: string
  roles?: Role[]
  permissions?: Permission[]
}

export default function UserRoleManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAssignRole, setShowAssignRole] = useState(false)
  const [showAssignPermission, setShowAssignPermission] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load users, roles, and permissions
      const [usersResponse, rolesResponse, permissionsResponse] = await Promise.all([
        fetch('/api/v1/identity/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json()),
        RoleService.getAllRoles(),
        RoleService.getAllPermissions()
      ])

      if (usersResponse.result) {
        setUsers(usersResponse.result)
      }
      if (rolesResponse.result) {
        setRoles(rolesResponse.result)
      }
      if (permissionsResponse.result) {
        setPermissions(permissionsResponse.result)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async (userId: string, roleName: string) => {
    setLoading(true)
    try {
      await RoleService.assignRoleToUser(userId, roleName)
      setError(null)
      // Reload data to get updated user roles
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to assign role')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveRole = async (userId: string, roleName: string) => {
    setLoading(true)
    try {
      await RoleService.removeRoleFromUser(userId, roleName)
      setError(null)
      // Reload data to get updated user roles
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to remove role')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPermission = async (userId: string, permissionName: string) => {
    setLoading(true)
    try {
      await RoleService.assignPermissionToUser(userId, permissionName)
      setError(null)
      // Reload data to get updated user permissions
      loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to assign permission')
    } finally {
      setLoading(false)
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users and permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Role & Permission Management</h1>
          <p className="mt-2 text-gray-600">Assign roles and permissions to users</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Users ({users.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {user.fullName || user.username}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    
                    {/* User Roles */}
                    {user.roles && user.roles.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Roles: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.roles.map((role) => (
                            <span key={role.name} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {role.name}
                              <button
                                onClick={() => handleRemoveRole(user.id, role.name)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User Permissions */}
                    {user.permissions && user.permissions.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Direct Permissions: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.permissions.map((permission) => (
                            <span key={permission.name} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {permission.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowAssignRole(true)
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Assign Role
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowAssignPermission(true)
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Assign Permission
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assign Role Modal */}
        {showAssignRole && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Assign Role to {selectedUser.fullName || selectedUser.username}
                </h3>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role.name} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{role.name}</span>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleAssignRole(selectedUser.id, role.name)
                          setShowAssignRole(false)
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowAssignRole(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Permission Modal */}
        {showAssignPermission && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Assign Permission to {selectedUser.fullName || selectedUser.username}
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {permissions.map((permission) => (
                    <div key={permission.name} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{permission.name}</span>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleAssignPermission(selectedUser.id, permission.name)
                          setShowAssignPermission(false)
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowAssignPermission(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
