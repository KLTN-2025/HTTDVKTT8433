// Teacher API Client Functions
// Based on backend analysis, these functions correspond to ROLE_TEACHER permissions

export interface CreateQuizRequest {
  title: string
  subjectId: string
  description?: string
  durationMinutes: number
  hasNoTimeLimit: boolean
  expirationTime?: string
}

export interface UpdateQuizRequest {
  id: string
  title?: string
  description?: string
  durationMinutes?: number
  hasNoTimeLimit?: boolean
  expirationTime?: string
}

export interface QuizResponse {
  id: string
  title: string
  subject: string
  subjectId: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  questionCount: number
  durationMinutes: number
  hasNoTimeLimit: boolean
  submissions: number
  averageScore: number
  createdAt: string
  lastModified: string
  createdBy: string
  createdByFirstName: string
  createdByLastName: string
}

export interface CreateQuestionRequest {
  quizId: string
  content: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  maxScore: number
  topicTags: string[]
}

export interface UpdateQuestionRequest {
  id: string
  content?: string
  type?: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY'
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  maxScore?: number
  topicTags?: string[]
}

export interface QuestionResponse {
  id: string
  quizId: string
  content: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  maxScore: number
  topicTags: string[]
  answers: AnswerResponse[]
}

export interface CreateAnswerRequest {
  questionId: string
  content: string
  isCorrect: boolean
}

export interface UpdateAnswerRequest {
  id: string
  content?: string
  isCorrect?: boolean
}

export interface AnswerResponse {
  id: string
  questionId: string
  content: string
  isCorrect: boolean
}

export interface SubjectResponse {
  id: string
  name: string
  description: string
}

export interface QuizAnalytics {
  quizId: string
  title: string
  totalSubmissions: number
  averageScore: number
  completionRate: number
  difficultyDistribution: {
    easy: number
    medium: number
    hard: number
  }
  topPerformers: Array<{
    studentName: string
    score: number
    completionTime: number
  }>
  strugglingStudents: Array<{
    studentName: string
    score: number
    attempts: number
  }>
}

export interface QuestionAnalytics {
  questionId: string
  content: string
  attempts: number
  correct: number
  accuracy: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  commonWrongAnswers: Array<{
    answer: string
    count: number
  }>
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.duongtech.me/api/v1'

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// Quiz Management Functions
export const createQuiz = async (request: CreateQuizRequest): Promise<QuizResponse> => {
  const response = await fetch(`${API_BASE_URL}/quizzes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const updateQuiz = async (request: UpdateQuizRequest): Promise<QuizResponse> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${request.id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const getAllQuizzes = async (): Promise<QuizResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/quizzes`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const getQuizById = async (quizId: string): Promise<QuizResponse> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const deleteQuiz = async (quizId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
}

// Quiz Lifecycle Functions
export const publishQuiz = async (quizId: string, expirationTime?: string): Promise<QuizResponse> => {
  const url = new URL(`${API_BASE_URL}/quizzes/${quizId}/publish`)
  if (expirationTime) {
    url.searchParams.append('expiresAt', expirationTime)
  }
  
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const unpublishQuiz = async (quizId: string): Promise<QuizResponse> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/unpublish`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const forkQuiz = async (quizId: string): Promise<QuizResponse> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/fork`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const archiveQuiz = async (quizId: string): Promise<QuizResponse> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/archive`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

// Question Management Functions
export const createQuestion = async (request: CreateQuestionRequest): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const updateQuestion = async (request: UpdateQuestionRequest): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/questions`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const deleteQuestion = async (questionId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/questions/${questionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
}

export const getAllQuestions = async (): Promise<QuestionResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/questions`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const getQuestionsByQuiz = async (quizId: string): Promise<QuestionResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/questions`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

// Answer Management Functions
export const createAnswer = async (request: CreateAnswerRequest): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/answers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const updateAnswer = async (request: UpdateAnswerRequest): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/answers`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(request)
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const deleteAnswer = async (answerId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/answers/${answerId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
}

export const getAllAnswers = async (): Promise<AnswerResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/answers`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const getAnswersByQuiz = async (quizId: string): Promise<Record<string, AnswerResponse[]>> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/answers`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

// Subject Management Functions
export const getAllSubjects = async (): Promise<SubjectResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/subjects`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const getQuizzesBySubject = async (subjectId: string): Promise<QuizResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/by-subject/${subjectId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

// Analytics Functions
export const getQuizStatistics = async (quizId?: string, subjectId?: string): Promise<any> => {
  const url = new URL(`${API_BASE_URL}/statistics`)
  if (quizId) url.searchParams.append('quizId', quizId)
  if (subjectId) url.searchParams.append('subjectId', subjectId)
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const getQuizAnalytics = async (quizId: string): Promise<QuizAnalytics> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/analytics`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const getQuestionAnalytics = async (quizId: string): Promise<QuestionAnalytics[]> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/question-analytics`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

// AI-Powered Functions (if available)
export const generateQuizWithAI = async (prompt: string, subjectId: string): Promise<QuizResponse> => {
  const response = await fetch(`${API_BASE_URL}/ai/generate-quiz`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ prompt, subjectId })
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const suggestQuestions = async (quizId: string, topic: string): Promise<QuestionResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/ai/suggest-questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quizId, topic })
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}

export const analyzeQuizPerformance = async (quizId: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/ai/analyze-performance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quizId })
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.result
}
