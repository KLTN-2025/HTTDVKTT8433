// Public Quiz API Client for non-authenticated users

export interface PublicQuiz {
  id: string
  title: string
  subjectName: string
  durationMinutes: number
  hasNoTimeLimit: boolean
  status: 'PUBLISHED' | 'DRAFT'
  createdBy: string | null
  createdByFirstName: string | null
  createdByLastName: string | null
  questionCount: number
  numQuestionsHint: number | null
}

export interface PublicQuizResponse {
  code: number
  message: string
  result: PublicQuiz[]
}

// API calls for public quiz data
export const getPublicQuizzes = async (): Promise<PublicQuizResponse> => {
  const response = await fetch('/api/v1/quiz/public/quizzes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return await response.json()
}

export interface PublicSubject {
  id: string
  name: string
}

export interface PublicSubjectResponse {
  code: number
  message: string
  result: PublicSubject[]
}

export const getPublicSubjects = async (): Promise<PublicSubjectResponse> => {
  const response = await fetch('/api/v1/quiz/admin/quiz/subjects', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return await response.json()
}
