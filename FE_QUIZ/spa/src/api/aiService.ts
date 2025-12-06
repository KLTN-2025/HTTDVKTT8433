// AI Service for Quiz Explanation and Chat Support
export interface ExplainRequest {
  questionContent: string
  options: string[]
  correctAnswerLabel: string
}

export interface ExplainResponse {
  explanation: string
  reasoning?: string
  additionalInfo?: string
}

export interface ChatRequest {
  userQuestion: string
}

export interface ChatResponse {
  answer: string
  suggestions?: string[]
}

const AI_BASE_URL = (import.meta as any).env?.VITE_AI_BASE_URL || 'https://api.duongtech.me/api/v1'

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// Explain correct answer API
export const explainAnswer = async (request: ExplainRequest): Promise<ExplainResponse> => {
  try {
    console.log('Explaining answer:', request)
    
    const response = await fetch(`${AI_BASE_URL}/quiz/Ai/quiz/explain`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('API Response:', data)
    
    // Xử lý format dữ liệu trả về từ API
    if (data.code === 1000 && data.result) {
      return {
        explanation: data.result,
        reasoning: data.message || '',
        additionalInfo: ''
      }
    }
    
    // Fallback nếu format khác
    return {
      explanation: data.result || data.explanation || 'Không thể giải thích câu trả lời',
      reasoning: data.message || '',
      additionalInfo: ''
    }
  } catch (error) {
    console.error('Error explaining answer:', error)
    throw error
  }
}

// AI Chat Support API
export const askAI = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    console.log('Asking AI:', request)
    console.log('API URL:', `${AI_BASE_URL}/Ai/gemini/ask`)
    
    const response = await fetch(`${AI_BASE_URL}/Ai/gemini/ask`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
    }
    
    // Kiểm tra content-type để xử lý đúng
    const contentType = response.headers.get('content-type')
    console.log('Response Content-Type:', contentType)
    
    let data: any
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
      console.log('AI Response (JSON):', data)
    } else {
      // API trả về plain text
      data = await response.text()
      console.log('AI Response (Text):', data)
    }
    
    // Xử lý format dữ liệu trả về từ API
    if (typeof data === 'string') {
      return {
        answer: data,
        suggestions: []
      }
    }
    
    if (data.result) {
      return {
        answer: data.result,
        suggestions: []
      }
    }
    
    return {
      answer: JSON.stringify(data),
      suggestions: []
    }
  } catch (error) {
    console.error('Error asking AI:', error)
    // Trả về response lỗi thân thiện thay vì throw error
    return {
      answer: "Xin lỗi, tôi không thể kết nối đến AI Assistant lúc này. Vui lòng thử lại sau.",
      suggestions: []
    }
  }
}

// Get AI suggestions for common questions
export const getAISuggestions = (): string[] => {
  return [
    "Làm thế nào để tạo quiz hiệu quả?",
    "Cách thiết kế câu hỏi trắc nghiệm tốt?",
    "Làm sao để đánh giá kết quả học tập?",
    "Cách sử dụng AI để tạo câu hỏi?",
    "Làm thế nào để tối ưu hóa quiz?",
    "Cách quản lý học sinh trong quiz?",
    "Làm sao để tạo quiz tương tác?",
    "Cách sử dụng analytics trong quiz?"
  ]
}
