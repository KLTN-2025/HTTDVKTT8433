// Test AI API directly
export const testAIConnection = async () => {
  try {
    const response = await fetch('https://api.duongtech.me/api/v1/Ai/gemini/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        userQuestion: "lỗi đăng nhập"
      })
    })
    
    console.log('Test API Response Status:', response.status)
    console.log('Test API Response Headers:', response.headers)
    
    // Kiểm tra content-type
    const contentType = response.headers.get('content-type')
    console.log('Content-Type:', contentType)
    
    let data: any
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
      console.log('Test API Response Data (JSON):', data)
    } else {
      data = await response.text()
      console.log('Test API Response Data (Text):', data)
    }
    
    return {
      status: response.status,
      contentType,
      data
    }
  } catch (error) {
    console.error('Test API Error:', error)
    throw error
  }
}
