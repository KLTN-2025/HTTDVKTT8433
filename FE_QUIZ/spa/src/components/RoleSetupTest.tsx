import { useState } from 'react'
import { RoleService } from '../api/roleService'

export default function RoleSetupTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createDefaultRoles = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🧪 Creating default roles...')

      // Create ROLE_STUDENT
      const studentRole = await RoleService.createRole({
        name: 'ROLE_STUDENT',
        description: 'Student role for quiz participants',
        permissions: []
      })
      console.log('✅ Created ROLE_STUDENT:', studentRole)

      // Create ROLE_TEACHER
      const teacherRole = await RoleService.createRole({
        name: 'ROLE_TEACHER',
        description: 'Teacher role for quiz creators',
        permissions: []
      })
      console.log('✅ Created ROLE_TEACHER:', teacherRole)

      // Create ROLE_ADMIN
      const adminRole = await RoleService.createRole({
        name: 'ROLE_ADMIN',
        description: 'Admin role for system management',
        permissions: []
      })
      console.log('✅ Created ROLE_ADMIN:', adminRole)

      setResult('✅ All default roles created successfully!')
    } catch (err: any) {
      console.error('❌ Create roles error:', err)
      setError(err.message || 'Failed to create roles')
    } finally {
      setLoading(false)
    }
  }

  const createDefaultPermissions = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🧪 Creating default permissions...')

      const permissions = [
        { name: 'READ_QUIZ', description: 'Read quiz content' },
        { name: 'CREATE_QUIZ', description: 'Create new quiz' },
        { name: 'UPDATE_QUIZ', description: 'Update quiz content' },
        { name: 'DELETE_QUIZ', description: 'Delete quiz' },
        { name: 'ADMIN_ACCESS', description: 'Admin system access' },
        { name: 'USER_MANAGEMENT', description: 'Manage users' },
        { name: 'ROLE_MANAGEMENT', description: 'Manage roles and permissions' }
      ]

      for (const permission of permissions) {
        try {
          await RoleService.createPermission(permission)
          console.log(`✅ Created permission: ${permission.name}`)
        } catch (err) {
          console.log(`⚠️ Permission ${permission.name} might already exist`)
        }
      }

      setResult('✅ All default permissions created successfully!')
    } catch (err: any) {
      console.error('❌ Create permissions error:', err)
      setError(err.message || 'Failed to create permissions')
    } finally {
      setLoading(false)
    }
  }

  const testGetRoles = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🧪 Testing get roles...')
      const response = await RoleService.getAllRoles()
      
      console.log('✅ Get roles response:', response)
      setResult(JSON.stringify(response, null, 2))
    } catch (err: any) {
      console.error('❌ Get roles error:', err)
      setError(err.message || 'Failed to get roles')
    } finally {
      setLoading(false)
    }
  }

  const testGetPermissions = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🧪 Testing get permissions...')
      const response = await RoleService.getAllPermissions()
      
      console.log('✅ Get permissions response:', response)
      setResult(JSON.stringify(response, null, 2))
    } catch (err: any) {
      console.error('❌ Get permissions error:', err)
      setError(err.message || 'Failed to get permissions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Role & Permission Setup Test</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={createDefaultRoles}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Default Roles'}
          </button>

          <button
            onClick={createDefaultPermissions}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Default Permissions'}
          </button>

          <button
            onClick={testGetRoles}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Roles'}
          </button>

          <button
            onClick={testGetPermissions}
            disabled={loading}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Permissions'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Response</h3>
            <pre className="text-xs text-gray-700 overflow-auto max-h-60">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
