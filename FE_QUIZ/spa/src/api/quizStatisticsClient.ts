// Using fetch instead of axios for consistency with other API clients

// Types for Quiz Statistics API
export interface QuizStatisticsResponse {
  code: number
  message: string
  result: {
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
    perQuestion: QuestionAnalysis[]
    perQuiz: QuizAnalysis[]
    perSubject: SubjectAnalysis[]
    students: {
      perQuiz: StudentPerformance[]
      groupSummary: {
        [level: string]: number
      }
    }
  }
}

export interface QuestionAnalysis {
  questionId: string
  quizId: string
  subjectId: string
  contentPreview: string
  attempts: number
  correct: number
  accuracy: number
  difficultyBucket: 'Easy' | 'Medium' | 'Hard'
}

export interface QuizAnalysis {
  quizId: string
  quizTitle: string
  subjectId: string
  questions: number
  attempts: number
  correct: number
  accuracy: number
  difficultyDistribution: {
    [difficulty: string]: number
  }
  hardestQuestions: QuestionAnalysis[]
  easiestQuestions: QuestionAnalysis[]
}

export interface SubjectAnalysis {
  subjectId: string
  quizzes: number
  attempts: number
  correct: number
  accuracy: number
  difficultyDistribution: {
    [difficulty: string]: number
  }
}

export interface StudentPerformance {
  userIdOrName: string
  quizId: string
  attemptCountPerUser: number
  firstAttemptScore: number
  bestAttemptScore: number
  lastAttemptScore: number
  lastSubmittedAt: string
  lastDurationSeconds: number | null
  level: string
}

// API calls
export const getQuizStatistics = async (): Promise<QuizStatisticsResponse> => {
  const response = await fetch('/api/v1/quiz/Ai/quiz/statistics', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return await response.json()
}

// Helper functions
export const formatAccuracy = (accuracy: number): string => {
  return `${(accuracy * 100).toFixed(1)}%`
}

export const formatScore = (score: number): string => {
  return `${score.toFixed(1)}%`
}

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy': return 'text-green-600 bg-green-100'
    case 'Medium': return 'text-yellow-600 bg-yellow-100'
    case 'Hard': return 'text-red-600 bg-red-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

export const getPerformanceLevelColor = (level: string): string => {
  switch (level) {
    case 'Xuất sắc': return 'text-purple-600 bg-purple-100'
    case 'Giỏi': return 'text-blue-600 bg-blue-100'
    case 'Khá': return 'text-green-600 bg-green-100'
    case 'Trung bình': return 'text-yellow-600 bg-yellow-100'
    case 'Yếu': return 'text-red-600 bg-red-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}
