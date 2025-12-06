// Simple API test utility
export const testQuizAPI = async () => {
  try {
    console.log('🧪 Testing Quiz API...')
    
    const token = localStorage.getItem('access_token')
    if (!token) {
      console.error('❌ No access token found')
      return false
    }
    
    const response = await fetch('/api/v1/quiz/quizzes/subjects', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('📡 API Response Status:', response.status)
    console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Response Data:', data)
      return true
    } else {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      return false
    }
  } catch (error) {
    console.error('❌ API Test Error:', error)
    return false
  }
}