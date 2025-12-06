export type ApiResponse<T> = {
  code?: number
  message?: string
  result?: T
}

const QUIZ_BASE_URL = '/api/v1/quiz'
const QUIZ_BASE_URL_DIRECT = 'https://api.duongtech.me/api/v1/quiz'

// Helper function to get authenticated headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token')
  if (!token) {
    console.warn('No access token found, redirecting to login')
    // Don't throw error here, let the API call handle it
    return {
      'Content-Type': 'application/json'
    }
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

// Helper function to get authenticated headers for file upload
function getAuthHeadersForFileUpload(): HeadersInit {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('No access token found. Please login first.')
  }
  
  return {
    'Authorization': `Bearer ${token}`
  }
}

// Quiz Types
export type SubjectResponse = {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type CreateSubjectRequest = {
  name: string
  description?: string
}

export type CreateQuizRequest = {
  title: string
  subjectId: string
  durationMinutes: number
  hasNoTimeLimit: boolean
  expirationTime?: string
  numQuestions?: number
  answersPerQuestion?: number
}

export type QuizResponse = {
  id: string
  title: string
  subjectName: string
  durationMinutes: number
  hasNoTimeLimit: boolean
  status: string
  createdBy: string
  createdByLastName?: string
  createdByFirstName?: string
  questionCount: number
  numQuestionsHint: number
  createdAt?: string
  updatedAt?: string
}

export type QuestionResponse = {
  id: string
  content: string
  quizId: string
  questionType: string
  difficulty: string
  points: number
  createdAt: string
  updatedAt: string
}

export type AnswerResponse = {
  id: string
  content: string
  questionId: string
  isCorrect: boolean
  createdAt: string
  updatedAt: string
}

export type CreateQuestionRequest = {
  quizId: string
  content: string
  type: 'MCQ' | 'SHORT' | 'ESSAY'
  maxScore?: number
  answers?: AnswerCreate[]
  essayRubric?: any[]
}

export type QuestionCreate = {
  content: string
  type: 'MCQ' | 'SHORT' | 'ESSAY'
  maxScore: number
  answers: AnswerCreate[]
  essayRubric?: any[]
  topicTags?: string[]
  difficulty?: number
}

export type QuestionUpdate = {
  content: string
  maxScore: number
  topicTags?: string[]
  difficulty?: number
  essayRubric?: any[]
}

export type CreateAnswerRequest = {
  questionId: string
  content: string
  isCorrect: boolean
}

export type AnswerCreate = {
  content: string
  isCorrect: boolean
}

export type UpdateQuestionRequest = {
  questionId: string
  content?: string
  type?: 'MCQ' | 'SHORT' | 'ESSAY'
  maxScore?: number
}

export type UpdateAnswerRequest = {
  answerId: string
  content?: string
  isCorrect?: boolean
}

export type AnswerUpdate = {
  content: string
  isCorrect: boolean
}

export type QuizStatistics = {
  scope: {
    quizId: string | null
    subjectId: string | null
    quizzes: number
    questions: number
    submissions: number
  }
  global: {
    attempts: number
    correct: number
    accuracy: number
  }
  perQuestion: Array<{
    questionId: string
    quizId: string
    subjectId: string
    contentPreview: string
    attempts: number
    correct: number
    accuracy: number
    difficultyBucket: string
  }>
  perQuiz: Array<{
    quizId: string
    quizTitle: string
    subjectId: string
    questions: number
    attempts: number
    correct: number
    accuracy: number
    difficultyDistribution: Record<string, number>
    hardestQuestions: Array<{
      questionId: string
      quizId: string
      subjectId: string
      contentPreview: string
      attempts: number
      correct: number
      accuracy: number
      difficultyBucket: string
    }>
    easiestQuestions: Array<{
      questionId: string
      quizId: string
      subjectId: string
      contentPreview: string
      attempts: number
      correct: number
      accuracy: number
      difficultyBucket: string
    }>
  }>
  perSubject: Array<{
    subjectId: string
    quizzes: number
    attempts: number
    correct: number
    accuracy: number
    difficultyDistribution: Record<string, number>
  }>
  students: {
    perQuiz: Array<{
      userIdOrName: string
      quizId: string
      attemptCountPerUser: number
      firstAttemptScore: number
      bestAttemptScore: number
      lastAttemptScore: number
      lastSubmittedAt: string
      lastDurationSeconds: number | null
      level: string
    }>
    groupSummary: Record<string, number>
  }
}

// Subject Management APIs
export async function getAllSubjects(): Promise<SubjectResponse[]> {
  try {
    console.log('Getting all subjects:', { url: `${QUIZ_BASE_URL_DIRECT}/admin/quiz/subjects` })
    
    const resp = await fetch(`${QUIZ_BASE_URL_DIRECT}/admin/quiz/subjects`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get subjects response status:', resp.status)
    
    // Kiểm tra nếu response là HTML (404 page)
    const contentType = resp.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      console.warn('Received HTML response, quiz service might not be running')
      return [] // Return empty array as fallback
    }
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<SubjectResponse[]>
    
    console.log('Get subjects response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy danh sách môn học thất bại')
    return data.result || []
  } catch (error) {
    console.error('Get subjects API error:', error)
    // Return empty array as fallback instead of throwing
    console.warn('Quiz service not available, returning empty subjects list')
    return []
  }
}

export async function createSubject(request: CreateSubjectRequest): Promise<SubjectResponse> {
  try {
    console.log('Creating subject:', { request, url: `${QUIZ_BASE_URL}/admin/quiz/subjects` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/admin/quiz/subjects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    })
    
    console.log('Create subject response status:', resp.status)
    
    // Kiểm tra nếu response là HTML (404 page)
    const contentType = resp.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      console.warn('Received HTML response, quiz service might not be running')
      throw new Error('Quiz service không khả dụng. Vui lòng kiểm tra lại sau.')
    }
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<SubjectResponse>
    
    console.log('Create subject response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    
    // Kiểm tra response code và message
    if (data.code && data.code !== 1000) {
      // Hiển thị message từ backend cho user
      throw new Error(data.message || 'Tạo môn học thất bại')
    }
    
    if (!data.result) throw new Error('Không nhận được dữ liệu subject từ server')
    return data.result
  } catch (error) {
    console.error('Create subject API error:', error)
    throw error
  }
}

export async function deleteSubject(subjectId: string): Promise<string> {
  try {
    console.log('Deleting subject:', { subjectId, url: `${QUIZ_BASE_URL}/admin/quiz/subjects/${subjectId}` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/admin/quiz/subjects/${subjectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    console.log('Delete subject response status:', resp.status)
    
    // Kiểm tra nếu response là HTML (404 page)
    const contentType = resp.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      console.warn('Received HTML response, quiz service might not be running')
      throw new Error('Quiz service không khả dụng. Vui lòng kiểm tra lại sau.')
    }
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<string>
    
    console.log('Delete subject response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Xóa môn học thất bại')
    return data.message || 'Xóa môn học thành công'
  } catch (error) {
    console.error('Delete subject API error:', error)
    throw error
  }
}

// Question Management APIs
export async function createQuestion(request: CreateQuestionRequest): Promise<string> {
  try {
    console.log('Creating question:', { request, url: `${QUIZ_BASE_URL}/quizzes/questions` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    })
    
    console.log('Create question response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<string>
    
    console.log('Create question response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Tạo câu hỏi thất bại')
    
    return data.result || 'Tạo câu hỏi thành công'
  } catch (error) {
    console.error('Create question API error:', error)
    throw error
  }
}

// Add question to specific quiz (using correct endpoint)
export async function addQuestionToQuiz(quizId: string, data: QuestionCreate): Promise<QuestionResponse> {
  try {
    console.log('Adding question to quiz:', { quizId, data, url: `${QUIZ_BASE_URL}/quizzes/${quizId}/questions` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/${quizId}/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    
    console.log('Add question to quiz response status:', resp.status)
    
    const responseData = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as QuestionResponse
    
    console.log('Add question to quiz response data:', responseData)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    return responseData
  } catch (error) {
    console.error('Add question to quiz API error:', error)
    throw error
  }
}

export async function updateQuestion(questionId: string, data: QuestionUpdate): Promise<QuestionResponse> {
  try {
    console.log('Updating question:', { questionId, data, url: `${QUIZ_BASE_URL}/quizzes/questions/${questionId}` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/questions/${questionId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    
    console.log('Update question response status:', resp.status)
    
    const responseData = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as QuestionResponse
    
    console.log('Update question response data:', responseData)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    return responseData
  } catch (error) {
    console.error('Update question API error:', error)
    throw error
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    console.log('Deleting question:', { questionId, url: `${QUIZ_BASE_URL}/quizzes/questions/${questionId}` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/questions/${questionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    console.log('Delete question response status:', resp.status)
    
    if (!resp.ok) {
      const data = (await resp.json().catch(() => ({}))) as ApiResponse<string>
      throw new Error(data?.message || `HTTP ${resp.status}`)
    }
  } catch (error) {
    console.error('Delete question API error:', error)
    throw error
  }
}

// Answer Management APIs
export async function createAnswer(request: CreateAnswerRequest): Promise<string> {
  try {
    console.log('Creating answer:', { request, url: `${QUIZ_BASE_URL}/quizzes/answers` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/answers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    })
    
    console.log('Create answer response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<string>
    
    console.log('Create answer response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Tạo đáp án thất bại')
    
    return data.result || 'Tạo đáp án thành công'
  } catch (error) {
    console.error('Create answer API error:', error)
    throw error
  }
}

// Add answer to specific question (using correct endpoint)
export async function addAnswerToQuestion(questionId: string, data: AnswerCreate): Promise<AnswerResponse> {
  try {
    console.log('Adding answer to question:', { questionId, data, url: `${QUIZ_BASE_URL}/quizzes/questions/${questionId}/answers` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/questions/${questionId}/answers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    
    console.log('Add answer to question response status:', resp.status)
    
    const responseData = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as AnswerResponse
    
    console.log('Add answer to question response data:', responseData)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    return responseData
  } catch (error) {
    console.error('Add answer to question API error:', error)
    throw error
  }
}

export async function updateAnswer(answerId: string, data: AnswerUpdate): Promise<AnswerResponse> {
  try {
    console.log('Updating answer:', { answerId, data, url: `${QUIZ_BASE_URL}/quizzes/answers/${answerId}` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/answers/${answerId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    
    console.log('Update answer response status:', resp.status)
    
    const responseData = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as AnswerResponse
    
    console.log('Update answer response data:', responseData)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    return responseData
  } catch (error) {
    console.error('Update answer API error:', error)
    throw error
  }
}

export async function deleteAnswer(answerId: string): Promise<void> {
  try {
    console.log('Deleting answer:', { answerId, url: `${QUIZ_BASE_URL}/quizzes/answers/${answerId}` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/answers/${answerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    console.log('Delete answer response status:', resp.status)
    
    if (!resp.ok) {
      const data = (await resp.json().catch(() => ({}))) as ApiResponse<string>
      throw new Error(data?.message || `HTTP ${resp.status}`)
    }
  } catch (error) {
    console.error('Delete answer API error:', error)
    throw error
  }
}

// Quiz Lifecycle APIs
export async function publishQuiz(quizId: string, expiresAt?: string): Promise<QuizResponse> {
  try {
    console.log('Publishing quiz:', { quizId, expiresAt, url: `${QUIZ_BASE_URL}/quizzes/${quizId}/publish` })
    
    const url = expiresAt 
      ? `${QUIZ_BASE_URL}/quizzes/${quizId}/publish?expiresAt=${encodeURIComponent(expiresAt)}`
      : `${QUIZ_BASE_URL}/quizzes/${quizId}/publish`
    
    const resp = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    console.log('Publish quiz response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as QuizResponse
    
    console.log('Publish quiz response data:', data)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    return data
  } catch (error) {
    console.error('Publish quiz API error:', error)
    throw error
  }
}

export async function unpublishQuiz(quizId: string): Promise<QuizResponse> {
  try {
    console.log('Unpublishing quiz:', { quizId, url: `${QUIZ_BASE_URL}/quizzes/${quizId}/unpublish` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/${quizId}/unpublish`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    console.log('Unpublish quiz response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as QuizResponse
    
    console.log('Unpublish quiz response data:', data)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    return data
  } catch (error) {
    console.error('Unpublish quiz API error:', error)
    throw error
  }
}

export async function forkQuiz(quizId: string): Promise<QuizResponse> {
  try {
    console.log('Forking quiz:', { quizId, url: `${QUIZ_BASE_URL}/quizzes/${quizId}/fork` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/${quizId}/fork`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    console.log('Fork quiz response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as QuizResponse
    
    console.log('Fork quiz response data:', data)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    return data
  } catch (error) {
    console.error('Fork quiz API error:', error)
    throw error
  }
}

export async function archiveQuiz(quizId: string): Promise<QuizResponse> {
  try {
    console.log('Archiving quiz:', { quizId, url: `${QUIZ_BASE_URL}/quizzes/${quizId}/archive` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/${quizId}/archive`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    console.log('Archive quiz response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as QuizResponse
    
    console.log('Archive quiz response data:', data)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    return data
  } catch (error) {
    console.error('Archive quiz API error:', error)
    throw error
  }
}

// Quiz Management APIs
export async function createQuiz(request: CreateQuizRequest): Promise<QuizResponse> {
  try {
    console.log('Creating quiz:', { request, url: `${QUIZ_BASE_URL}/quizzes` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request)
    })
    
    console.log('Create quiz response status:', resp.status)
    
    // Kiểm tra nếu response là HTML (404 page)
    const contentType = resp.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
      console.warn('Received HTML response, quiz service might not be running')
      throw new Error('Quiz service không khả dụng. Vui lòng kiểm tra lại sau.')
    }
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<QuizResponse>
    
    console.log('Create quiz response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Tạo quiz thất bại')
    
    if (!data.result) throw new Error('Không nhận được dữ liệu quiz từ server')
    return data.result
  } catch (error) {
    console.error('Create quiz API error:', error)
    throw error
  }
}

export async function getAllQuizzes(): Promise<QuizResponse[]> {
  try {
    console.log('Getting all quizzes:', { url: `${QUIZ_BASE_URL}/admin/quiz/quizzes` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/admin/quiz/quizzes`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get quizzes response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<QuizResponse[]>
    
    console.log('Get quizzes response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy danh sách quiz thất bại')
    return data.result || []
  } catch (error) {
    console.error('Get quizzes API error:', error)
    throw error
  }
}

export async function getMyQuizzes(): Promise<QuizResponse[]> {
  try {
    console.log('Getting my quizzes:', { url: `${QUIZ_BASE_URL}/quizzes/my-quizzes` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/my-quizzes`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get my quizzes response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<QuizResponse[]>
    
    console.log('Get my quizzes response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy danh sách quiz thất bại')
    return data.result || []
  } catch (error) {
    console.error('Get my quizzes API error:', error)
    throw error
  }
}

export async function getPublishedQuizzes(): Promise<QuizResponse[]> {
  try {
    console.log('Getting published quizzes:', { url: `${QUIZ_BASE_URL}/quizzes/quizzes` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/quizzes`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get published quizzes response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<QuizResponse[]>
    
    console.log('Get published quizzes response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy danh sách quiz published thất bại')
    return data.result || []
  } catch (error) {
    console.error('Get published quizzes API error:', error)
    throw error
  }
}

// Quiz Edit View Types
export interface QuizEditViewResponse {
  id: string
  title: string
  subjectName: string
  durationMinutes: number
  hasNoTimeLimit: boolean
  status: string
  createdBy: string
  createdByFirstName: string
  createdByLastName: string
  questions: QuestionResponse[]
}

export async function getQuizEditView(quizId: string): Promise<QuizEditViewResponse> {
  try {
    console.log('Getting quiz edit view:', { url: `${QUIZ_BASE_URL}/quizzes/${quizId}/edit-view` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/${quizId}/edit-view`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get quiz edit view response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<QuizEditViewResponse>
    
    console.log('Get quiz edit view response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy chi tiết đề thi thất bại')
    if (!data.result) throw new Error('Không nhận được dữ liệu quiz từ server')
    return data.result
  } catch (error) {
    console.error('Get quiz edit view API error:', error)
    throw error
  }
}

export async function getAllQuestions(): Promise<QuestionResponse[]> {
  try {
    console.log('Getting all questions:', { url: `${QUIZ_BASE_URL}/quizzes/questions` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/questions`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get questions response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<QuestionResponse[]>
    
    console.log('Get questions response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy danh sách câu hỏi thất bại')
    return data.result || []
  } catch (error) {
    console.error('Get questions API error:', error)
    throw error
  }
}

export async function getAllAnswers(): Promise<AnswerResponse[]> {
  try {
    console.log('Getting all answers:', { url: `${QUIZ_BASE_URL}/admin/quiz/answers` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/admin/quiz/answers`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get answers response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<AnswerResponse[]>
    
    console.log('Get answers response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy danh sách đáp án thất bại')
    return data.result || []
  } catch (error) {
    console.error('Get answers API error:', error)
    throw error
  }
}

// Statistics API
export async function getQuizStatistics(): Promise<QuizStatistics> {
  try {
    console.log('Getting quiz statistics:', { url: `${QUIZ_BASE_URL}/Ai/quiz/statistics` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/Ai/quiz/statistics`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get statistics response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<QuizStatistics>
    
    console.log('Get statistics response data:', data)
    
    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy thống kê thất bại')
    
    // Trả về dữ liệu thống kê đầy đủ
    if (!data.result) throw new Error('Không nhận được dữ liệu thống kê từ server')
    return data.result
  } catch (error) {
    console.error('Get statistics API error:', error)
    throw error
  }
}

// AI Auto-Generate Types
export interface AutoQuizRequest {
  subjectId: string
  quizTitle: string
  topic: string
  numQuestions: number
  shuffleAnswers?: boolean
  mix?: {
    mcq: number
    short: number
    essay: number
  }
  defaults?: {
    shortMax: number
    essayMax: number
  }
}

export interface AutoQuizResponse {
  quizId: string
  result?: string
}

// AI Auto-Generate Functions
export async function generateAutoQuiz(data: AutoQuizRequest): Promise<AutoQuizResponse> {
  try {
    console.log('Generating auto quiz:', { url: '/api/v1/quiz/Ai/quiz/auto-generate' })
    
    const resp = await fetch('/api/v1/quiz/Ai/quiz/auto-generate', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    console.log('Generate auto quiz response status:', resp.status)

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`)
    }

    const responseData = await resp.json()
    console.log('Generate auto quiz response data:', responseData)
    
    return responseData.result
  } catch (error) {
    console.error('Generate auto quiz API error:', error)
    throw error
  }
}

export async function generateMixedQuiz(data: AutoQuizRequest): Promise<AutoQuizResponse> {
  try {
    console.log('Generating mixed quiz:', { url: '/api/v1/quiz/Ai/quiz/auto-generate/mixed' })
    
    const resp = await fetch('/api/v1/quiz/Ai/quiz/auto-generate/mixed', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    console.log('Generate mixed quiz response status:', resp.status)

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`)
    }

    const responseData = await resp.json()
    console.log('Generate mixed quiz response data:', responseData)
    
    return responseData.result
  } catch (error) {
    console.error('Generate mixed quiz API error:', error)
    throw error
  }
}

// Document Import Types
export type DocumentImportRequest = {
  subjectId: string
  title: string
  totalQuestions: number
  perChunk: number
  shuffle: boolean
  file: File
}

export type DocumentImportMixedRequest = {
  subjectId: string
  title: string
  mcqCount: number
  shortCount: number
  essayCount: number
  shortMax?: number
  essayMax?: number
  shuffle: boolean
  file: File
}

export type DocumentImportResponse = {
  quizId: string
  title: string
}

// Import quiz from document
export async function importQuizFromDocument(data: DocumentImportRequest): Promise<DocumentImportResponse> {
  try {
    console.log('Importing quiz from document:', {
      subjectId: data.subjectId,
      title: data.title,
      totalQuestions: data.totalQuestions,
      perChunk: data.perChunk,
      shuffle: data.shuffle,
      fileName: data.file.name,
      fileSize: data.file.size
    })

    const formData = new FormData()
    formData.append('subjectId', data.subjectId)
    formData.append('title', data.title)
    formData.append('totalQuestions', data.totalQuestions.toString())
    formData.append('perChunk', data.perChunk.toString())
    formData.append('shuffle', data.shuffle.toString())
    formData.append('file', data.file)

    const resp = await fetch(`${QUIZ_BASE_URL_DIRECT}/Ai/document/quizzes/import`, {
      method: 'POST',
      headers: getAuthHeadersForFileUpload(),
      body: formData
    })

    console.log('Document import response status:', resp.status)

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${resp.status}`)
    }

    const responseData = await resp.json()
    console.log('Document import successful:', responseData)
    
    return responseData
  } catch (error) {
    console.error('Error importing quiz from document:', error)
    throw error
  }
}

// Import mixed quiz from document
export async function importMixedQuizFromDocument(data: DocumentImportMixedRequest): Promise<DocumentImportResponse> {
  try {
    console.log('Importing mixed quiz from document:', {
      subjectId: data.subjectId,
      title: data.title,
      mcqCount: data.mcqCount,
      shortCount: data.shortCount,
      essayCount: data.essayCount,
      shortMax: data.shortMax,
      essayMax: data.essayMax,
      shuffle: data.shuffle,
      fileName: data.file.name,
      fileSize: data.file.size
    })

    const formData = new FormData()
    formData.append('subjectId', data.subjectId)
    formData.append('title', data.title)
    formData.append('mcqCount', data.mcqCount.toString())
    formData.append('shortCount', data.shortCount.toString())
    formData.append('essayCount', data.essayCount.toString())
    if (data.shortMax !== undefined) {
      formData.append('shortMax', data.shortMax.toString())
    }
    if (data.essayMax !== undefined) {
      formData.append('essayMax', data.essayMax.toString())
    }
    formData.append('shuffle', data.shuffle.toString())
    formData.append('file', data.file)

    const resp = await fetch(`${QUIZ_BASE_URL_DIRECT}/Ai/document/quizzes/import-mixed`, {
      method: 'POST',
      headers: getAuthHeadersForFileUpload(),
      body: formData
    })

    console.log('Mixed document import response status:', resp.status)

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${resp.status}`)
    }

    const responseData = await resp.json()
    console.log('Mixed document import successful:', responseData)
    
    return responseData
  } catch (error) {
    console.error('Error importing mixed quiz from document:', error)
    throw error
  }
}

// Review Quiz Types
export type ReviewQuizResponse = {
  id: string
  profileId: string
  baseQuizId: string
  title: string
  createdAt: string
  questionIds: string[]
  fromSubmissionId: string
  targetCount: number
  aiToppedUp: boolean
}

// Review Quiz APIs
export async function getMyReviewQuizzes(): Promise<ReviewQuizResponse[]> {
  try {
    console.log('Getting my review quizzes:', { url: `${QUIZ_BASE_URL}/quizzes/review-quizzes/my` })

    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/review-quizzes/my`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    console.log('Get my review quizzes response status:', resp.status)

    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<ReviewQuizResponse[]>

    console.log('Get my review quizzes response data:', data)

    if (!resp.ok) throw new Error(data?.message || `HTTP ${resp.status}`)
    if (data.code && data.code !== 1000) throw new Error(data.message || 'Lấy danh sách đề ôn tập thất bại')
    return data.result || []
  } catch (error) {
    console.error('Get my review quizzes API error:', error)
    throw error
  }
}

// Quiz Taking APIs
export interface StartQuizRequest {
  quizId: string
}

export interface StartQuizResponse {
  profileId: string
  submissionId: string
  quizId: string
  quizTitle: string
  startedAt: string
  questions: Array<{
    id: string
    content: string
    answers: Array<{
      id: string
      content: string
      questionId: string | null
      isCorrect: boolean | null
    }>
    type: string | null
    maxScore: number | null
    topicTags: string[] | null
    difficulty: string | null
    essayRubric: any | null
  }>
  quizOwnerId: string
  quizOwnerFirstName: string | null
  quizOwnerLastName: string | null
}

export async function startQuiz(request: StartQuizRequest): Promise<StartQuizResponse> {
  try {
    console.log('Starting quiz:', { request, url: `${QUIZ_BASE_URL}/quizzes/start` })
    
    const headers = getAuthHeaders()
    console.log('🔍 Request headers:', headers)
    console.log('🔍 Request body:', JSON.stringify(request))

    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/start`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(request)
    })

    console.log('Start quiz response status:', resp.status)

    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<StartQuizResponse>

    console.log('Start quiz response data:', data)

    if (!resp.ok) {
      console.error('❌ HTTP Error:', resp.status, resp.statusText)
      console.error('❌ Error response data:', data)
      
      // Handle authentication errors
      if (resp.status === 401 || resp.status === 403) {
        console.warn('Authentication error, clearing tokens and redirecting to login')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_profile')
        window.location.href = '/login'
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      }
      
      throw new Error(data?.message || `HTTP ${resp.status}`)
    }
    
    if (data.code && data.code !== 1000) {
      console.error('❌ API Error:', data.code, data.message)
      throw new Error(data.message || 'Bắt đầu quiz thất bại')
    }
    
    if (!data.result) {
      console.error('❌ No result data:', data)
      throw new Error('Không nhận được dữ liệu quiz từ server')
    }
    
    return data.result
  } catch (error) {
    console.error('Start quiz API error:', error)
    throw error
  }
}

// Quiz Submission Types
export interface QuizSubmitRequest {
  submissionId: string
  answers: Array<{
    questionId: string
    answer: string
  }>
  textAnswers?: Array<{
    questionId: string
    answerText: string
  }>
}

export interface QuizResultResponse {
  submissionId: string
  quizId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  submittedAt: string
  duration: number
  results: Array<{
    questionId: string
    questionContent: string
    selectedAnswer: string
    isCorrect: boolean
    correctAnswer: string
    aiScore?: number
    aiComment?: string
  }>
}

export async function submitQuiz(request: QuizSubmitRequest): Promise<QuizResultResponse> {
  try {
    console.log('Submitting quiz:', { request, url: `${QUIZ_BASE_URL}/quizzes/submit` })
    
    const headers = getAuthHeaders()
    console.log('🔍 Submit quiz headers:', headers)
    console.log('🔍 Submit quiz body:', JSON.stringify(request))

    const resp = await fetch(`${QUIZ_BASE_URL}/quizzes/submit`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(request)
    })

    console.log('Submit quiz response status:', resp.status)

    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as ApiResponse<QuizResultResponse>

    console.log('Submit quiz response data:', data)

    if (!resp.ok) {
      console.error('❌ HTTP Error:', resp.status, resp.statusText)
      console.error('❌ Error response data:', data)
      
      // Handle authentication errors
      if (resp.status === 401 || resp.status === 403) {
        console.warn('Authentication error, clearing tokens and redirecting to login')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_profile')
        window.location.href = '/login'
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      }
      
      throw new Error(data?.message || `HTTP ${resp.status}`)
    }
    
    if (data.code && data.code !== 1000) {
      console.error('❌ API Error:', data.code, data.message)
      throw new Error(data.message || 'Nộp bài quiz thất bại')
    }
    
    if (!data.result) {
      console.error('❌ No result data:', data)
      throw new Error('Không nhận được kết quả từ server')
    }
    
    return data.result
  } catch (error) {
    console.error('Submit quiz API error:', error)
    throw error
  }
}

// Quiz History Types
export interface QuizSubmissionSummary {
  submissionId: string
  quizId: string
  quizTitle: string
  subjectName: string
  score: number
  totalQuestions: number
  correctAnswers: number
  submittedAt: string
  duration: number
  status: string
}

export interface QuizSubmissionDetail {
  submissionId: string
  quizId: string
  quizTitle: string
  subjectName: string
  score: number
  totalQuestions: number
  correctAnswers: number
  submittedAt: string
  duration: number
  status: string
  results: Array<{
    questionId: string
    questionContent: string
    selectedAnswer: string
    isCorrect: boolean
    correctAnswer: string
    aiScore?: number
    aiComment?: string
  }>
}

// Quiz History APIs
export async function getMyQuizHistory(quizId?: string, page: number = 0, size: number = 10): Promise<{
  content: QuizSubmissionSummary[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}> {
  try {
    console.log('Getting my quiz history:', { quizId, page, size, url: `${QUIZ_BASE_URL}/submissions/me` })
    
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    })
    if (quizId) {
      params.append('quizId', quizId)
    }
    
    const resp = await fetch(`${QUIZ_BASE_URL}/submissions/me?${params}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get quiz history response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as {
      content: QuizSubmissionSummary[]
      totalElements: number
      totalPages: number
      size: number
      number: number
    }
    
    console.log('Get quiz history response data:', data)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    return data
  } catch (error) {
    console.error('Get quiz history API error:', error)
    throw error
  }
}

export async function getQuizSubmissionDetail(submissionId: string): Promise<QuizSubmissionDetail> {
  try {
    console.log('Getting quiz submission detail:', { submissionId, url: `${QUIZ_BASE_URL}/submissions/${submissionId}` })
    
    const resp = await fetch(`${QUIZ_BASE_URL}/submissions/${submissionId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    console.log('Get submission detail response status:', resp.status)
    
    const data = (await resp.json().catch((error) => {
      console.error('Failed to parse JSON:', error)
      return {}
    })) as QuizSubmissionDetail
    
    console.log('Get submission detail response data:', data)
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    
    return data
  } catch (error) {
    console.error('Get submission detail API error:', error)
    throw error
  }
}

