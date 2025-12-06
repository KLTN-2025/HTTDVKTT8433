import { useState, useEffect } from 'react'
import { RoleService, Role, Permission, User } from '../api/roleService'
import { ApiResponse } from '../api/types'

// Use UserResponse from types instead of custom interface

// Helper function to format user display name
const getUserDisplayName = (user: User): string => {
  if (user.fullName) return user.fullName
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
  return fullName || user.username
}

export default function AdminRolePermission() {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'users' | 'assign' | 'remove'>('roles')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Data states
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Form states
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] })
  const [newPermission, setNewPermission] = useState({ name: '', description: '' })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedPermission, setSelectedPermission] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [rolesRes, permissionsRes, usersRes] = await Promise.all([
        RoleService.getAllRoles(),
        RoleService.getAllPermissions(),
        RoleService.getAllUsers()
      ])

      if (rolesRes.result) setRoles(rolesRes.result)
      if (permissionsRes.result) setPermissions(permissionsRes.result)
      if (usersRes.result) setUsers(usersRes.result)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      setError('Role name is required')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await RoleService.createRole(newRole)
      if (response.result) {
        setRoles([...roles, response.result])
        setNewRole({ name: '', description: '', permissions: [] })
        setSuccess('Role created successfully!')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create role')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePermission = async () => {
    if (!newPermission.name.trim()) {
      setError('Permission name is required')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await RoleService.createPermission(newPermission)
      if (response.result) {
        setPermissions([...permissions, response.result])
        setNewPermission({ name: '', description: '' })
        setSuccess('Permission created successfully!')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create permission')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      setError('Please select user and role')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await RoleService.assignRoleToUser(selectedUser.userId, selectedRole)
      setSuccess(`✅ Role "${selectedRole}" assigned to ${getUserDisplayName(selectedUser)}`)
      // Auto dismiss success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
      loadData() // Reload to get updated user data
    } catch (err: any) {
      setError(`❌ Failed to assign role: ${err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveRole = async (userId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to remove role "${roleName}" from user?`)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      await RoleService.removeRoleFromUser(userId, roleName)
      setSuccess(`✅ Role "${roleName}" removed successfully`)
      // Auto dismiss success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
      loadData() // Reload to get updated user data
    } catch (err: any) {
      setError(`❌ Failed to remove role: ${err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePermission = async (userId: string, permissionName: string) => {
    if (!confirm(`Are you sure you want to remove permission "${permissionName}" from user?`)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      await RoleService.removePermissionFromUser(userId, permissionName)
      setSuccess(`✅ Permission "${permissionName}" removed successfully`)
      // Auto dismiss success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
      loadData() // Reload to get updated user data
    } catch (err: any) {
      setError(`❌ Failed to remove permission: ${err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPermission = async () => {
    if (!selectedUser || !selectedPermission) {
      setError('Please select user and permission')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await RoleService.assignPermissionToUser(selectedUser.userId, selectedPermission)
      setSuccess(`✅ Permission "${selectedPermission}" assigned to ${getUserDisplayName(selectedUser)}`)
      // Auto dismiss success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
      loadData() // Reload to get updated user data
    } catch (err: any) {
      setError(`❌ Failed to assign permission: ${err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (roleName: string) => {
    if (!confirm(`Are you sure you want to delete role ${roleName}?`)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      await RoleService.deleteRole(roleName)
      setRoles(roles.filter(role => role.name !== roleName))
      setSuccess(`Role ${roleName} deleted successfully`)
    } catch (err: any) {
      setError(err.message || 'Failed to delete role')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePermission = async (permissionName: string) => {
    if (!confirm(`Are you sure you want to delete permission ${permissionName}?`)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      await RoleService.deletePermission(permissionName)
      setPermissions(permissions.filter(permission => permission.name !== permissionName))
      setSuccess(`Permission ${permissionName} deleted successfully`)
    } catch (err: any) {
      setError(err.message || 'Failed to delete permission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-xl p-6 text-white shadow-2xl border-4 border-black relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                  <span className="text-2xl">🔐</span>
                </div>
                <div>
                  <h1 className="text-4xl font-rounded font-bold text-rainbow animate-heartbeat">
                    🔐 Role & Permission Management
                  </h1>
                  <p className="mt-2 text-white/90 font-semibold text-lg">✨ Manage user roles and permissions in the system ✨</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-md p-4 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 rounded-md p-4 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
                <button
                  onClick={() => setSuccess(null)}
                  className="mt-2 text-xs text-green-600 hover:text-green-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border-4 border-black overflow-hidden">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-b-4 border-black">
            <nav className="flex space-x-1 px-6 py-2">
              <button
                onClick={() => setActiveTab('roles')}
                className={`relative py-4 px-6 font-rounded font-bold text-sm rounded-xl border-4 transition-all duration-300 ${
                  activeTab === 'roles'
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg transform scale-105 border-black'
                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50 hover:scale-105 border-transparent hover:border-pink-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  Roles ({roles.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`relative py-4 px-6 font-rounded font-bold text-sm rounded-xl border-4 transition-all duration-300 ${
                  activeTab === 'permissions'
                    ? 'bg-gradient-to-r from-purple-400 to-blue-400 text-white shadow-lg transform scale-105 border-black'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 hover:scale-105 border-transparent hover:border-purple-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">🔐</span>
                  Permissions ({permissions.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`relative py-4 px-6 font-rounded font-bold text-sm rounded-xl border-4 transition-all duration-300 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-blue-400 to-green-400 text-white shadow-lg transform scale-105 border-black'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105 border-transparent hover:border-blue-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  Users ({users.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('assign')}
                className={`relative py-4 px-6 font-rounded font-bold text-sm rounded-xl border-4 transition-all duration-300 ${
                  activeTab === 'assign'
                    ? 'bg-gradient-to-r from-green-400 to-pink-400 text-white shadow-lg transform scale-105 border-black'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50 hover:scale-105 border-transparent hover:border-green-300'
                }`}
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-lg">➕</span>
                  Assign Roles & Permissions
                </span>
              </button>
              <button
                onClick={() => setActiveTab('remove')}
                className={`relative py-4 px-6 font-rounded font-bold text-sm rounded-xl border-4 transition-all duration-300 ${
                  activeTab === 'remove'
                    ? 'bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-lg transform scale-105 border-black'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50 hover:scale-105 border-transparent hover:border-red-300'
                }`}
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-lg">➖</span>
                  Remove Roles & Permissions
                </span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Roles Tab */}
            {activeTab === 'roles' && (
              <div className="space-y-8">
                {/* Create Role Form */}
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-8 shadow-lg border-4 border-black hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg flex items-center justify-center border-2 border-black">
                      <span className="text-lg">➕</span>
                    </div>
                    <h3 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat"> Create New Role</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name</label>
                      <input
                        type="text"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        className="w-full px-4 py-3 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                        placeholder="e.g., ROLE_STUDENT"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-rounded font-bold text-gray-700 mb-2">📝 Description</label>
                      <input
                        type="text"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        className="w-full px-4 py-3 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                        placeholder="Role description"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-rounded font-bold text-gray-700 mb-4">🔐 Permissions</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {permissions.map((permission) => (
                        <label key={permission.name} className="flex items-center p-3 bg-white/90 rounded-lg border-4 border-black hover:bg-pink-50 hover:border-pink-300 transition-all duration-200 cursor-pointer font-rounded font-semibold">
                          <input
                            type="checkbox"
                            checked={newRole.permissions.includes(permission.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRole({ ...newRole, permissions: [...newRole.permissions, permission.name] })
                              } else {
                                setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== permission.name) })
                              }
                            }}
                            className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleCreateRole}
                    disabled={loading}
                    className="mt-6 bg-gradient-to-r from-pink-400 to-purple-400 text-white px-8 py-3 rounded-xl border-4 border-black hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-rounded font-bold btn-magic"
                  >
                    {loading ? 'Creating...' : '✨ Create Role'}
                  </button>
                </div>

                {/* Roles List */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-black overflow-hidden">
                  <div className="px-8 py-6 bg-gradient-to-r from-pink-50 to-purple-50 border-b-4 border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg flex items-center justify-center border-2 border-black">
                        <span className="text-lg">📋</span>
                      </div>
                      <h3 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">Existing Roles</h3>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200/50">
                    {roles.map((role) => (
                      <div key={role.name} className="px-8 py-6 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-200 border-b-2 border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-rounded font-bold text-gray-900">{role.name}</h4>
                              <span className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 text-xs font-rounded font-bold rounded-full border-2 border-black">
                                {role.permissions?.length || 0} permissions
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 font-rounded">{role.description}</p>
                            {role.permissions && role.permissions.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {role.permissions.map((p, index) => (
                                  <span key={index} className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-xs font-rounded font-bold rounded-lg border-2 border-black">
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteRole(role.name)}
                            disabled={loading}
                            className="bg-gradient-to-r from-red-400 to-orange-400 text-white px-4 py-2 rounded-xl border-4 border-black text-sm hover:from-red-500 hover:to-orange-500 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-rounded font-bold btn-magic"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <div className="space-y-6">
                {/* Create Permission Form */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-lg border-4 border-black">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center border-2 border-black">
                      <span className="text-lg">🔐</span>
                    </div>
                    <h3 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">Create New Permission</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-rounded font-bold text-gray-700 mb-2">🔐 Permission Name</label>
                      <input
                        type="text"
                        value={newPermission.name}
                        onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                        className="w-full px-4 py-3 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                        placeholder="e.g., READ_QUIZ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-rounded font-bold text-gray-700 mb-2">📝 Description</label>
                      <input
                        type="text"
                        value={newPermission.description}
                        onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                        className="w-full px-4 py-3 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                        placeholder="Permission description"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreatePermission}
                    disabled={loading}
                    className="mt-6 bg-gradient-to-r from-purple-400 to-blue-400 text-white px-8 py-3 rounded-xl border-4 border-black hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-rounded font-bold btn-magic"
                  >
                    {loading ? 'Creating...' : '✨ Create Permission'}
                  </button>
                </div>

                {/* Permissions List */}
                <div className="bg-white rounded-2xl shadow-lg border-4 border-black">
                  <div className="px-8 py-6 border-b-4 border-black bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center border-2 border-black">
                        <span className="text-lg">📋</span>
                      </div>
                      <h3 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">Existing Permissions</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                    {permissions.map((permission) => (
                      <div key={permission.name} className="border-4 border-black rounded-xl p-6 bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-rounded font-bold text-gray-900 text-lg">{permission.name}</h4>
                            <p className="text-sm text-gray-600 font-rounded mt-1">{permission.description}</p>
                          </div>
                          <button
                            onClick={() => handleDeletePermission(permission.name)}
                            disabled={loading}
                            className="bg-gradient-to-r from-red-400 to-orange-400 text-white px-3 py-2 rounded-xl border-4 border-black text-xs hover:from-red-500 hover:to-orange-500 disabled:opacity-50 font-rounded font-bold btn-magic"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border-4 border-black">
                  <div className="px-8 py-6 border-b-4 border-black bg-gradient-to-r from-blue-50 to-green-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-lg flex items-center justify-center border-2 border-black">
                        <span className="text-lg">👤</span>
                      </div>
                      <h3 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">👤 System Users</h3>
                    </div>
                  </div>
                  <div className="divide-y-2 divide-gray-200">
                    {users.map((user) => (
                      <div key={user.userId} className="px-8 py-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-rounded font-bold text-sm border-2 border-black">
                                {getUserDisplayName(user).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-lg font-rounded font-bold text-gray-900">
                                  {getUserDisplayName(user)}
                                </h4>
                                <p className="text-sm text-gray-600 font-rounded">{user.email}</p>
                                <p className="text-xs text-gray-500 font-mono">ID: {user.userId}</p>
                              </div>
                            </div>
                            
                            {/* User Roles */}
                            {user.roles && user.roles.length > 0 && (
                              <div className="mt-3 ml-12">
                                <span className="text-sm font-rounded font-bold text-gray-700">🎭 Roles:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {user.roles.map((roleName: string) => (
                                    <span key={roleName} className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-rounded font-bold bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 border-2 border-black">
                                      {roleName}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* User Permissions */}
                            {user.permissions && user.permissions.length > 0 && (
                              <div className="mt-3 ml-12">
                                <span className="text-sm font-rounded font-bold text-gray-700">🔐 Direct Permissions:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {user.permissions.map((permissionName: string) => (
                                    <span key={permissionName} className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-rounded font-bold bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-2 border-black">
                                      {permissionName}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Assign Tab */}
            {activeTab === 'assign' && (
              <div className="space-y-6">
                {/* Assign Role */}
                <div className="bg-gradient-to-br from-green-50 to-pink-50 rounded-2xl p-8 shadow-lg border-4 border-black">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-pink-400 rounded-lg flex items-center justify-center border-2 border-black">
                      <span className="text-lg">➕</span>
                    </div>
                    <h3 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">Assign Role to User</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-rounded font-bold text-gray-700 mb-2">👤 Select User</label>
                      <select
                        value={selectedUser?.userId || ''}
                        onChange={(e) => {
                          const user = users.find(u => u.userId === e.target.value)
                          setSelectedUser(user || null)
                        }}
                        className="w-full px-4 py-3 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-green-400 focus:border-green-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                        aria-label="Select user"
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.userId} value={user.userId}>
                            {getUserDisplayName(user)} - {user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-rounded font-bold text-gray-700 mb-2">🎭 Select Role</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-4 py-3 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                        aria-label="Select role"
                      >
                        <option value="">Select a role</option>
                        {roles.map((role) => (
                          <option key={role.name} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAssignRole}
                    disabled={loading || !selectedUser || !selectedRole}
                    className="mt-6 bg-gradient-to-r from-green-400 to-pink-400 text-white px-8 py-3 rounded-xl border-4 border-black hover:from-green-500 hover:to-pink-500 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-rounded font-bold btn-magic"
                  >
                    {loading ? 'Assigning...' : '✨ Assign Role'}
                  </button>
                </div>

                {/* Assign Permission */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-lg border-4 border-black">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center border-2 border-black">
                      <span className="text-lg">🔐</span>
                    </div>
                    <h3 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">Assign Permission to User</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-rounded font-bold text-gray-700 mb-2">👤 Select User</label>
                      <select
                        value={selectedUser?.userId || ''}
                        onChange={(e) => {
                          const user = users.find(u => u.userId === e.target.value)
                          setSelectedUser(user || null)
                        }}
                        className="w-full px-4 py-3 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                        aria-label="Select user"
                      >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                          <option key={user.userId} value={user.userId}>
                            {getUserDisplayName(user)} - {user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-rounded font-bold text-gray-700 mb-2">🔐 Select Permission</label>
                      <select
                        value={selectedPermission}
                        onChange={(e) => setSelectedPermission(e.target.value)}
                        className="w-full px-4 py-3 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                        aria-label="Select permission"
                      >
                        <option value="">Select a permission</option>
                        {permissions.map((permission) => (
                          <option key={permission.name} value={permission.name}>
                            {permission.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAssignPermission}
                    disabled={loading || !selectedUser || !selectedPermission}
                    className="mt-6 bg-gradient-to-r from-purple-400 to-blue-400 text-white px-8 py-3 rounded-xl border-4 border-black hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-rounded font-bold btn-magic"
                  >
                    {loading ? 'Assigning...' : '✨ Assign Permission'}
                  </button>
                </div>


              </div>
            )}

            {/* Remove Tab */}
            {activeTab === 'remove' && (
              <div className="space-y-6">
                {/* Remove Roles & Permissions from Users */}
                <div className="bg-white rounded-2xl shadow-lg border-4 border-black">
                  <div className="px-8 py-6 border-b-4 border-black bg-gradient-to-r from-red-50 to-orange-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-400 rounded-lg flex items-center justify-center border-2 border-black">
                        <span className="text-lg">➖</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-rounded font-bold text-rainbow animate-heartbeat">➖ Remove Roles & Permissions from Users</h3>
                        <p className="text-sm text-gray-600 font-rounded">Click the × button next to any role or permission to remove it from the user</p>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y-2 divide-gray-200">
                    {users.map((user) => (
                      <div key={user.userId} className="px-8 py-6 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-rounded font-bold text-sm border-2 border-black">
                                {getUserDisplayName(user).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-lg font-rounded font-bold text-gray-900">
                                  {getUserDisplayName(user)}
                                </h4>
                                <p className="text-sm text-gray-600 font-rounded">{user.email}</p>
                              </div>
                            </div>
                            <div className="ml-12">
                              <p className="text-xs text-gray-500 font-mono">ID: {user.userId}</p>
                              
                              {user.roles && user.roles.length > 0 ? (
                              <div className="mt-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-rounded font-bold text-gray-700">🎭 Current Roles:</span>
                                  <span className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 px-3 py-1 rounded-full border-2 border-black font-rounded font-bold">
                                    {user.roles.length} role{user.roles.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {user.roles.map((roleName: string) => (
                                    <div key={roleName} className="group relative">
                                      <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-rounded font-bold bg-gradient-to-r from-pink-50 to-purple-50 text-pink-800 border-4 border-black hover:from-pink-100 hover:to-purple-100 transition-all duration-200">
                                        <span>{roleName}</span>
                                        <button
                                          onClick={() => handleRemoveRole(user.userId, roleName)}
                                          className="ml-1 w-5 h-5 rounded-full bg-gradient-to-r from-red-400 to-orange-400 text-white hover:from-red-500 hover:to-orange-500 flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 border-black"
                                          title={`Remove ${roleName} role`}
                                        >
                                          ×
                                        </button>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3">
                                <span className="text-sm text-gray-500 italic font-rounded">No roles assigned</span>
                              </div>
                            )}

                            {user.permissions && user.permissions.length > 0 ? (
                              <div className="mt-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-rounded font-bold text-gray-700">🔐 Current Permissions:</span>
                                  <span className="text-xs bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-3 py-1 rounded-full border-2 border-black font-rounded font-bold">
                                    {user.permissions.length} permission{user.permissions.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {user.permissions.map((permissionName: string) => (
                                    <div key={permissionName} className="group relative">
                                      <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-rounded font-bold bg-gradient-to-r from-green-50 to-blue-50 text-green-800 border-4 border-black hover:from-green-100 hover:to-blue-100 transition-all duration-200">
                                        <span>{permissionName}</span>
                                        <button
                                          onClick={() => handleRemovePermission(user.userId, permissionName)}
                                          className="ml-1 w-5 h-5 rounded-full bg-gradient-to-r from-red-400 to-orange-400 text-white hover:from-red-500 hover:to-orange-500 flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 border-black"
                                          title={`Remove ${permissionName} permission`}
                                        >
                                          ×
                                        </button>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3">
                                <span className="text-sm text-gray-500 italic font-rounded">No permissions assigned</span>
                              </div>
                            )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
