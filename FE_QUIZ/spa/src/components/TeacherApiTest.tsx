import React, { useState } from 'react'
import { getAllSubjects, getAllQuizzes, createQuiz, getQuizStatistics, QuizStatistics } from '@/api/quizClient'

export const TeacherApiTest: React.FC = () => {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<string | null>(null)

  const testApi = async (apiName: string, apiCall: () => Promise<any>) => {
    setLoading(apiName)
    try {
      console.log(`Testing ${apiName}...`)
      const result = await apiCall()
      console.log(`${apiName} result:`, result)
      setResults(prev => ({ ...prev, [apiName]: { success: true, data: result } }))
    } catch (error) {
      console.error(`${apiName} error:`, error)
      setResults(prev => ({ ...prev, [apiName]: { success: false, error: error instanceof Error ? error.message : 'Unknown error' } }))
    } finally {
      setLoading(null)
    }
  }

  const testAllApis = async () => {
    setResults({})
    
    // Test subjects API
    await testApi('getAllSubjects', getAllSubjects)
    
    // Test quizzes API
    await testApi('getAllQuizzes', getAllQuizzes)
    
    // Test statistics API
    await testApi('getQuizStatistics', getQuizStatistics)
    
    // Test create quiz API (with sample data)
    await testApi('createQuiz', () => createQuiz({
      title: 'Test Quiz from API Test',
      subjectId: 'test-subject',
      description: 'This is a test quiz created from API test component',
      durationMinutes: 30,
      hasNoTimeLimit: false
    }))
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">🧪 Teacher API Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={testAllApis}
          disabled={loading !== null}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          {loading ? `Testing ${loading}...` : 'Test All APIs'}
        </button>

        <div className="space-y-2">
          <button
            onClick={() => testApi('getAllSubjects', getAllSubjects)}
            disabled={loading !== null}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-1 rounded text-sm mr-2"
          >
            Test Subjects
          </button>
          
          <button
            onClick={() => testApi('getAllQuizzes', getAllQuizzes)}
            disabled={loading !== null}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-3 py-1 rounded text-sm mr-2"
          >
            Test Quizzes
          </button>
          
          <button
            onClick={() => testApi('getQuizStatistics', getQuizStatistics)}
            disabled={loading !== null}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-3 py-1 rounded text-sm"
          >
            Test Statistics
          </button>
        </div>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Results:</h3>
          <div className="space-y-3">
            {Object.entries(results).map(([apiName, result]) => (
              <div key={apiName} className={`p-3 rounded-lg border-2 ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{apiName}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? '✅ Success' : '❌ Error'}
                  </span>
                </div>
                
                {result.success ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Data received:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-red-600">Error: {result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
