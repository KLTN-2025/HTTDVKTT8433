export interface ApiResponse<T> {
  success?: boolean
  message?: string
  result?: T
  error?: string
}

export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  status: string
  roles?: Role[]
  permissions?: Permission[]
  createdAt: string
}

export interface Role {
  name: string
  description: string
  permissions?: Permission[]
}

export interface Permission {
  name: string
  description: string
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

// Quiz Statistics
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

// Quiz Taking Types
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

// API Functions
const QUIZ_BASE_URL = '/api/v1/quiz'
const QUIZ_BASE_URL_DIRECT = 'https://api.duongtech.me/api/v1/quiz'

// Helper function to get authenticated headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('No access token found. Please login first.')
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
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
    if ((data as any).code && (data as any).code !== 1000) throw new Error(data.message || 'Lấy danh sách môn học thất bại')
    return data.result || []
  } catch (error) {
    console.error('Get subjects API error:', error)
    // Return empty array as fallback instead of throwing
    console.warn('Quiz service not available, returning empty subjects list')
    return []
  }
}