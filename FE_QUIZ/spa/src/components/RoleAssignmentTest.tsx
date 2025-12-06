import { useState } from 'react'
import { RoleService } from '../api/roleService'
import RoleSetupTest from './RoleSetupTest'

export default function RoleAssignmentTest() {
  const [userId, setUserId] = useState('329ba3ab-9810-4d5b-a308-b5e6985e68b3')
  const [roleName, setRoleName] = useState('ROLE_STUDENT')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testAssignRole = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🧪 Testing role assignment...')
      console.log('User ID:', userId)
      console.log('Role:', roleName)

      const response = await RoleService.assignRoleToUser(userId, roleName)
      
      console.log('✅ Role assignment response:', response)
      setResult(JSON.stringify(response, null, 2))
    } catch (err: any) {
      console.error('❌ Role assignment error:', err)
      setError(err.message || 'Failed to assign role')
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

  const testGetUsers = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🧪 Testing get users...')
      const response = await fetch('/api/v1/identity/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      console.log('✅ Get users response:', data)
      setResult(JSON.stringify(data, null, 2))
    } catch (err: any) {
      console.error('❌ Get users error:', err)
      setError(err.message || 'Failed to get users')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <RoleSetupTest />
      
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Role Assignment Test</h2>
        
        <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter user ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role Name
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter role name"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={testAssignRole}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Assign Role'}
          </button>

          <button
            onClick={testGetRoles}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Roles'}
          </button>

          <button
            onClick={testGetUsers}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Users'}
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
    </div>
  )
}
