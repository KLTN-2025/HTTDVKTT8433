import { useState, useEffect } from 'react'
import { RoleService, Role, Permission } from '../api/roleService'
import { ApiResponse } from '../api/types'

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        RoleService.getAllRoles(),
        RoleService.getAllPermissions()
      ])

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

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      setError('Role name is required')
      return
    }

    setLoading(true)
    try {
      const response = await RoleService.createRole(newRole)
      if (response.result) {
        setRoles([...roles, response.result])
        setNewRole({ name: '', description: '', permissions: [] })
        setShowCreateRole(false)
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create role')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRole = async (roleName: string) => {
    if (!confirm(`Are you sure you want to delete role "${roleName}"?`)) {
      return
    }

    setLoading(true)
    try {
      await RoleService.deleteRole(roleName)
      setRoles(roles.filter(role => role.name !== roleName))
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete role')
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (permissionName: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter(p => p !== permissionName)
        : [...prev.permissions, permissionName]
    }))
  }

  if (loading && roles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roles and permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="mt-2 text-gray-600">Manage user roles and permissions</p>
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

        {/* Create Role Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateRole(!showCreateRole)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateRole ? 'Cancel' : 'Create New Role'}
          </button>
        </div>

        {/* Create Role Form */}
        {showCreateRole && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Role</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter role description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {permissions.map((permission) => (
                    <label key={permission.name} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newRole.permissions.includes(permission.name)}
                        onChange={() => togglePermission(permission.name)}
                        className="mr-2"
                      />
                      <span className="text-sm">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateRole}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Role'}
                </button>
                <button
                  onClick={() => setShowCreateRole(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Roles List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Roles ({roles.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {roles.map((role) => (
              <div key={role.name} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Permissions: </span>
                        <span className="text-sm text-blue-600">
                          {role.permissions.map(p => p.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteRole(role.name)}
                      disabled={loading}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions List */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Available Permissions ({permissions.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {permissions.map((permission) => (
              <div key={permission.name} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{permission.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
