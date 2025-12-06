import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isStudent } from '@/utils/apiTransform'
import { StudentNavigation } from '@/components/StudentNavigation'
import { AnswerExplanation } from '@/components/AnswerExplanation'
import { 
  createQuestion, 
  createAnswer, 
  updateQuestion, 
  updateAnswer, 
  deleteQuestion, 
  deleteAnswer,
  publishQuiz,
  unpublishQuiz,
  forkQuiz,
  archiveQuiz,
  getAllQuizzes,
  getAllQuestions,
  getAllAnswers,
  addQuestionToQuiz,
  getQuizEditView,
  CreateQuestionRequest,
  CreateAnswerRequest,
  UpdateQuestionRequest,
  UpdateAnswerRequest,
  QuestionCreate,
  QuestionUpdate,
  AnswerCreate,
  AnswerUpdate,
  QuestionResponse,
  AnswerResponse,
  QuizResponse,
  QuizEditViewResponse
} from '@/api/quizClient'

// Essay Rubric Item type
interface EssayRubricItem {
  criterion: string
  weight: number
  keywordsCsv: string
}

export default function StudentQuizEditor() {
  const { id: quizId } = useParams<{ id: string }>()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  
  const [quiz, setQuiz] = useState<QuizEditViewResponse | null>(null)
  const [questions, setQuestions] = useState<QuestionResponse[]>([])
  const [answers, setAnswers] = useState<AnswerResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Question form state
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionResponse | null>(null)
  const [questionForm, setQuestionForm] = useState<QuestionCreate>({
    content: '',
    type: 'MCQ',
    maxScore: 1,
    answers: [],
    essayRubric: [],
    topicTags: [],
    difficulty: 1
  })
  
  // Essay rubric state
  const [essayRubric, setEssayRubric] = useState<EssayRubricItem[]>([])
  const [newRubricItem, setNewRubricItem] = useState<EssayRubricItem>({
    criterion: '',
    weight: 0,
    keywordsCsv: ''
  })
  
  // Answer explanation state
  const [showExplanation, setShowExplanation] = useState(false)
  const [explanationData, setExplanationData] = useState<{
    questionContent: string
    options: string[]
    correctAnswerLabel: string
  } | null>(null)

  useEffect(() => {
    if (quizId) {
      loadQuizData()
    }
  }, [quizId])

  const loadQuizData = async () => {
    setIsLoading(true)
    setError(null) // Clear previous errors
    setSuccessMessage(null) // Clear success messages
    
    try {
      console.log('Loading quiz data for:', quizId)
      
      // Use the new edit-view API
      const quizData = await getQuizEditView(quizId!)
      
      console.log('Loaded quiz data:', quizData)
      console.log('Quiz data structure:', JSON.stringify(quizData, null, 2))
      
      setQuiz(quizData)
      setQuestions(quizData.questions)

      // Extract all answers from questions
      let allAnswers = quizData.questions.flatMap(q => (q as any).answers || [])
      
      // Check if isCorrect values are null - if so, fetch them separately
      if (allAnswers.some(a => a.isCorrect === null || a.isCorrect === undefined)) {
        console.log('isCorrect values are null, fetching answers separately...')
        try {
          const answersWithCorrect = await getAllAnswers()
          console.log('Fetched answers with isCorrect:', answersWithCorrect)
          
          // Merge the isCorrect values
          allAnswers = allAnswers.map(answer => {
            const correctAnswer = answersWithCorrect.find(a => a.id === answer.id)
            return {
              ...answer,
              isCorrect: correctAnswer ? correctAnswer.isCorrect : answer.isCorrect
            }
          })
          console.log('Merged answers:', allAnswers)
        } catch (error) {
          console.error('Failed to fetch answers separately:', error)
        }
      }
      
      setAnswers(allAnswers)
      
      console.log('Quiz questions:', quizData.questions.length)
      console.log('Quiz answers:', allAnswers.length)
      
    } catch (error) {
      console.error('Error loading quiz data:', error)
      setError('Không thể tải dữ liệu quiz. Vui lòng thử lại sau.')
      setQuiz(null)
      setQuestions([])
      setAnswers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (editingQuestion) {
        // Update existing question
        const updateData: any = {
          content: questionForm.content,
          type: questionForm.type,
          maxScore: questionForm.maxScore,
          essayRubric: questionForm.type !== 'MCQ' ? essayRubric : [],
          topicTags: questionForm.topicTags,
          difficulty: questionForm.difficulty
        }
        
        const updatedQuestion = await updateQuestion(editingQuestion.id, updateData)
        console.log('Question updated successfully:', updatedQuestion)
        
        // Update existing answers if MCQ and answers changed
        if (questionForm.type === 'MCQ' && questionForm.answers.length > 0) {
          console.log('Updating answers for question:', editingQuestion.id)
          
          // Get existing answers
          const existingAnswers = (editingQuestion as any).answers || []
          
          // Update each answer
          for (let i = 0; i < questionForm.answers.length; i++) {
            const formAnswer = questionForm.answers[i]
            const existingAnswer = existingAnswers[i]
            
            if (existingAnswer) {
              // Update existing answer
              await updateAnswer(existingAnswer.id, {
                content: formAnswer.content,
                isCorrect: formAnswer.isCorrect
              })
              console.log(`Updated answer ${i + 1}:`, formAnswer)
            } else {
              // Create new answer
              await createAnswer({
                questionId: editingQuestion.id,
                content: formAnswer.content,
                isCorrect: formAnswer.isCorrect
              })
              console.log(`Created new answer ${i + 1}:`, formAnswer)
            }
          }
          
          // Delete extra answers if form has fewer answers
          if (questionForm.answers.length < existingAnswers.length) {
            for (let i = questionForm.answers.length; i < existingAnswers.length; i++) {
              await deleteAnswer(existingAnswers[i].id)
              console.log(`Deleted extra answer ${i + 1}`)
            }
          }
        }
        
        // Show success message
        setSuccessMessage(`Câu hỏi "${questionForm.content.substring(0, 50)}..." đã được cập nhật thành công!`)
      } else {
        // Create new question
        const questionData: QuestionCreate = {
          ...questionForm,
          essayRubric: questionForm.type !== 'MCQ' ? essayRubric : []
        }
        
        const newQuestion = await addQuestionToQuiz(quizId!, questionData)
        console.log('Question created successfully:', newQuestion)
        
        // Show success message
        setSuccessMessage(`Câu hỏi "${questionForm.content.substring(0, 50)}..." đã được tạo thành công!`)
      }
      
      // Reload data to show the updated question
      console.log('Reloading quiz data after update...')
      await loadQuizData()
      console.log('Quiz data reloaded successfully')
      
      setShowQuestionForm(false)
      setEditingQuestion(null)
      resetQuestionForm()
    } catch (error: any) {
      console.error('Error creating question:', error)
      
      // Handle specific error cases
      if (error.message?.includes('409') || error.message?.includes('HTTP 409')) {
        setError('Quiz đã được xuất bản hoặc lưu trữ. Chỉ có thể chỉnh sửa quiz ở trạng thái DRAFT. Vui lòng tạo bản sao (Fork) để chỉnh sửa.')
      } else {
        setError('Không thể tạo câu hỏi. Vui lòng thử lại.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const resetQuestionForm = () => {
    setQuestionForm({
      content: '',
      type: 'MCQ',
      maxScore: 1,
      answers: [],
      essayRubric: [],
      topicTags: [],
      difficulty: 1
    })
    setEssayRubric([])
    setEditingQuestion(null)
    setNewRubricItem({
      criterion: '',
      weight: 0,
      keywordsCsv: ''
    })
  }

  const handleUpdateQuestion = async (questionId: string, updates: Omit<QuestionUpdate, 'questionId'>) => {
    try {
      await updateQuestion(questionId, updates)
      await loadQuizData()
    } catch (error) {
      console.error('Error updating question:', error)
      setError('Không thể cập nhật câu hỏi. Vui lòng thử lại.')
    }
  }

  const handleCreateAnswer = async (questionId: string, content: string, isCorrect: boolean) => {
    try {
      await createAnswer({ questionId, content, isCorrect })
      await loadQuizData()
    } catch (error) {
      console.error('Error creating answer:', error)
      setError('Không thể tạo đáp án. Vui lòng thử lại.')
    }
  }

  const handleUpdateAnswer = async (answerId: string, updates: Omit<AnswerUpdate, 'answerId'>) => {
    try {
      console.log('Updating answer:', { answerId, updates })
      const updatedAnswer = await updateAnswer(answerId, updates)
      console.log('Answer updated successfully:', updatedAnswer)
      await loadQuizData()
      console.log('Quiz data reloaded after answer update')
    } catch (error) {
      console.error('Error updating answer:', error)
      setError('Không thể cập nhật đáp án. Vui lòng thử lại.')
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return
    
    try {
      await deleteQuestion(questionId)
      await loadQuizData()
    } catch (error) {
      console.error('Error deleting question:', error)
      setError('Không thể xóa câu hỏi. Vui lòng thử lại.')
    }
  }

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đáp án này?')) return
    
    try {
      await deleteAnswer(answerId)
      await loadQuizData()
    } catch (error) {
      console.error('Error deleting answer:', error)
      setError('Không thể xóa đáp án. Vui lòng thử lại.')
    }
  }

  const handlePublishQuiz = async () => {
    if (!quizId) return
    
    try {
      await publishQuiz(quizId)
      await loadQuizData()
    } catch (error) {
      console.error('Error publishing quiz:', error)
      setError('Không thể xuất bản quiz. Vui lòng thử lại.')
    }
  }

  const handleUnpublishQuiz = async () => {
    if (!quizId) return
    
    try {
      await unpublishQuiz(quizId)
      await loadQuizData()
    } catch (error) {
      console.error('Error unpublishing quiz:', error)
      setError('Không thể hủy xuất bản quiz. Vui lòng thử lại.')
    }
  }

  const handleForkQuiz = async () => {
    if (!quizId) return
    
    try {
      const forkedQuiz = await forkQuiz(quizId)
      navigate(`/student/quiz/${forkedQuiz.id}/edit`)
    } catch (error) {
      console.error('Error forking quiz:', error)
      setError('Không thể tạo bản sao quiz. Vui lòng thử lại.')
    }
  }

  const handleArchiveQuiz = async () => {
    if (!quizId) return
    
    if (!confirm('Bạn có chắc chắn muốn lưu trữ quiz này?')) return
    
    try {
      await archiveQuiz(quizId)
      navigate('/student/quiz-management')
    } catch (error) {
      console.error('Error archiving quiz:', error)
      setError('Không thể lưu trữ quiz. Vui lòng thử lại.')
    }
  }

  const handleExplainAnswer = (question: any) => {
    if (question.type === 'MCQ' && question.answers && question.answers.length > 0) {
      const options = question.answers.map((answer: any) => answer.content)
      const correctAnswerIndex = question.answers.findIndex((answer: any) => answer.isCorrect)
      const correctAnswerLabel = String.fromCharCode(65 + correctAnswerIndex)
      
      setExplanationData({
        questionContent: question.content,
        options,
        correctAnswerLabel
      })
      setShowExplanation(true)
    } else {
      alert('Chỉ có thể giải thích cho câu hỏi trắc nghiệm có đáp án')
    }
  }

  const getAnswersForQuestion = (questionId: string) => {
    return answers.filter(a => a.questionId === questionId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isStudent(user)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
          <p className="text-gray-600">You need student permissions to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <StudentNavigation />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b-2 border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-300 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <span className="text-3xl">✏️</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Quiz Editor
                </h1>
                <p className="text-lg text-gray-600 mt-2 font-medium">Quiz ID: {quizId}</p>
                {quiz && (
                  <div className="mt-2 space-y-2">
                    <div className="text-xl font-bold text-gray-800">{quiz.title}</div>
                    <div className="text-sm text-gray-600">
                      Subject: {quiz.subjectName} | Duration: {quiz.durationMinutes} minutes
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        quiz.status === 'DRAFT' 
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200'
                          : quiz.status === 'PUBLISHED'
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200'
                      }`}>
                        Status: {quiz.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        Created by: {quiz.createdByFirstName} {quiz.createdByLastName}
                      </span>
                    </div>
                    {quiz.status !== 'DRAFT' && (
                      <span className="text-sm text-red-600 font-medium">
                        ⚠️ Chỉ có thể chỉnh sửa quiz ở trạng thái DRAFT
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setEditingQuestion(null)
                  resetQuestionForm()
                  setShowQuestionForm(true)
                }}
                disabled={quiz?.status !== 'DRAFT'}
                className={`group relative overflow-hidden px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform shadow-lg ${
                  quiz?.status === 'DRAFT'
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white hover:scale-105 hover:shadow-xl'
                    : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span className="text-xl">🌟</span>
                  <span>Add Question</span>
                </span>
                {quiz?.status === 'DRAFT' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
              
              {quiz?.status !== 'DRAFT' && (
                <button
                  onClick={handleForkQuiz}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span className="text-xl">🔄</span>
                    <span>Fork to Edit</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}
              <button
                onClick={handlePublishQuiz}
                className="group relative overflow-hidden bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span className="text-xl">📢</span>
                  <span>Publish</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => navigate('/student/quiz-management')}
                className="group relative overflow-hidden bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span className="text-xl">←</span>
                  <span>Back to Quizzes</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-red-800">Oops! Something went wrong</h3>
                <p className="text-red-700 mt-1 font-medium">{error}</p>
                {quizId && (
                  <div className="mt-2 text-sm text-red-600">
                    <p>Quiz ID: <code className="bg-red-100 px-2 py-1 rounded">{quizId}</code></p>
                    <p>Current URL: <code className="bg-red-100 px-2 py-1 rounded">{window.location.href}</code></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-green-800">Success!</h3>
                <p className="text-green-700 mt-1 font-medium">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Questions List */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">💭 Questions ({questions.length})</h2>
              
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">💭</span>
                  <p className="text-gray-600 mb-4">No questions yet</p>
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Add Your First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => {
                    const questionAnswers = answers.filter(a => a.questionId === question.id)
                    return (
                      <div key={question.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-pink-200 hover:border-pink-300 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl">
                        <div className="p-6">
                          {/* Question Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <span className="text-white font-bold text-lg">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-pink-600 transition-colors duration-300">
                                  {question.content}
                                </h3>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">✏️</span>
                                    </span>
                                    <span className="text-sm font-semibold text-gray-600">{(question as any).questionType || 'MCQ'}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 bg-gradient-to-br from-green-300 to-green-400 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">⭐</span>
                                    </span>
                                    <span className="text-sm font-semibold text-gray-600">{(question as any).points || 1} points</span>
                                  </div>
                                  {question.difficulty && (
                                    <div className="flex items-center space-x-2">
                                      <span className="w-6 h-6 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">⚡</span>
                                      </span>
                                      <span className="text-sm font-semibold text-gray-600">Level {question.difficulty}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingQuestion(question)
                                  setQuestionForm({
                                    content: question.content,
                                    type: (question as any).type || 'MCQ',
                                    maxScore: (question as any).maxScore || 1,
                                    answers: (question as any).answers || [],
                                    essayRubric: (question as any).essayRubric || [],
                                    topicTags: (question as any).topicTags || [],
                                    difficulty: (question as any).difficulty || 1
                                  })
                                  // Load existing answers for editing
                                  if ((question as any).answers && (question as any).answers.length > 0) {
                                    setQuestionForm(prev => ({
                                      ...prev,
                                      answers: (question as any).answers.map((answer: any) => ({
                                        content: answer.content,
                                        isCorrect: answer.isCorrect || false
                                      }))
                                    }))
                                  }
                                  setShowQuestionForm(true)
                                }}
                                className="group/edit bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                              >
                                <span className="text-lg group-hover/edit:rotate-12 transition-transform duration-300">✏️</span>
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleExplainAnswer(question)}
                                className="group/explain bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                              >
                                <span className="text-lg group-hover/explain:rotate-12 transition-transform duration-300">💡</span>
                                <span>Explain</span>
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="group/delete bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                              >
                                <span className="text-lg group-hover/delete:rotate-12 transition-transform duration-300">🗑️</span>
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                          
                          {/* Answers Section */}
                          <div className="ml-16">
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200">
                              <div className="flex items-center space-x-2 mb-4">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">💡</span>
                                </div>
                                <h4 className="font-bold text-gray-800">Answer Options</h4>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                                  {questionAnswers.length} options
                                </span>
                              </div>
                              
                              {questionAnswers.length === 0 ? (
                                <div className="text-center py-6">
                                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">💭</span>
                                  </div>
                                  <p className="text-gray-500 font-medium">No answers yet</p>
                                  <p className="text-sm text-gray-400">Add answer options for this question</p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {questionAnswers.map((answer, answerIndex) => {
                                    // Get the answer from our answers state which has the correct isCorrect value
                                    const answerData = answers.find(a => a.id === answer.id) || answer
                                    const isCorrect = Boolean(answerData.isCorrect)
                                    
                                    console.log('Rendering answer:', { id: answer.id, content: answer.content, isCorrect: answerData.isCorrect })
                                    console.log('Answer isCorrect check:', { 
                                      isCorrect, 
                                      original: answerData.isCorrect,
                                      type: typeof answerData.isCorrect
                                    })
                                    return (
                                    <div key={answer.id} className={`group/answer flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                                      isCorrect 
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:border-green-400' 
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}>
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        isCorrect 
                                          ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' 
                                          : 'bg-gray-300 text-gray-600'
                                      }`}>
                                        {String.fromCharCode(65 + answerIndex)}
                                      </div>
                                      <div className="flex-1">
                                        <span className={`font-medium ${
                                          isCorrect ? 'text-green-800' : 'text-gray-700'
                                        }`}>
                                          {answer.content}
                                        </span>
                                        {isCorrect && (
                                          <div className="flex items-center space-x-1 mt-1">
                                            <span className="text-green-600 text-sm">✓</span>
                                            <span className="text-green-700 text-xs font-semibold">Correct Answer</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex space-x-2 opacity-0 group-hover/answer:opacity-100 transition-opacity duration-300">
                                        <button
                                          onClick={() => handleUpdateAnswer(answer.id, { 
                                            content: answer.content, 
                                            isCorrect: !isCorrect 
                                          })}
                                          className="group/toggle bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-1"
                                        >
                                          <span className="text-sm group-hover/toggle:rotate-12 transition-transform duration-300">🔄</span>
                                          <span>Toggle</span>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteAnswer(answer.id)}
                                          className="group/delete bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-1"
                                        >
                                          <span className="text-sm group-hover/delete:rotate-12 transition-transform duration-300">🗑️</span>
                                          <span>Delete</span>
                                        </button>
                                      </div>
                                    </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quiz Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🎛️ Quiz Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={handlePublishQuiz}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  📢 Publish
                </button>
                <button
                  onClick={handleUnpublishQuiz}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  ✏️ Unpublish
                </button>
                <button
                  onClick={handleForkQuiz}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  🔄 Fork
                </button>
                <button
                  onClick={handleArchiveQuiz}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  📦 Archive
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Question Form Modal */}
        {showQuestionForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-pink-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">💭</span>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowQuestionForm(false)}
                  className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateQuestion} className="space-y-6">
                {/* Question Content */}
                    <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Question Content
                  </label>
                      <textarea
                    value={questionForm.content}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your question..."
                    rows={4}
                    className="w-full px-6 py-4 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-lg font-medium"
                    required
                      />
                    </div>
                
                {/* Question Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Question Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'MCQ', label: 'Multiple Choice', icon: '🔘', desc: 'Trắc nghiệm', color: 'from-blue-400 to-blue-500' },
                      { value: 'SHORT', label: 'Short Answer', icon: '✏️', desc: 'Tự luận ngắn', color: 'from-green-400 to-green-500' },
                      { value: 'ESSAY', label: 'Essay', icon: '📄', desc: 'Tự luận dài', color: 'from-purple-400 to-purple-500' }
                    ].map((type) => (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => setQuestionForm(prev => ({ ...prev, type: type.value as 'MCQ' | 'SHORT' | 'ESSAY' }))}
                        className={`group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          questionForm.type === type.value
                            ? 'border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-pink-200 hover:shadow-md'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br ${type.color}`}>
                            <span className="text-3xl">{type.icon}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{type.label}</h3>
                          <p className="text-sm text-gray-600 font-medium">{type.desc}</p>
                        </div>
                        {questionForm.type === type.value && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                    </button>
                    ))}
                  </div>
                </div>

                {/* Max Score */}
                          <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Max Score
                  </label>
                            <input
                    type="number"
                    min="1"
                    value={questionForm.maxScore}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 1 }))}
                    className="w-full px-6 py-4 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 text-lg font-medium"
                    title="Enter maximum score for this question"
                    placeholder="Enter max score"
                            />
                          </div>
                
                {/* MCQ Answers */}
                {questionForm.type === 'MCQ' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Answer Options
                    </label>
                    
                    {/* Show existing answers if editing */}
                    {editingQuestion && (editingQuestion as any).answers && (editingQuestion as any).answers.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-600 mb-3">Existing Answers:</h4>
                        <div className="space-y-2">
                          {(editingQuestion as any).answers.map((answer: any, index: number) => (
                            <div key={answer.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                answer.isCorrect 
                                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' 
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="flex-1 font-medium text-gray-700">{answer.content}</span>
                              {answer.isCorrect && (
                                <span className="text-green-600 text-sm font-semibold">✓ Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              const existingAnswers = (editingQuestion as any).answers || []
                              setQuestionForm(prev => ({
                                ...prev,
                                answers: existingAnswers.map((answer: any) => ({
                                  content: answer.content,
                                  isCorrect: answer.isCorrect || false
                                }))
                              }))
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <span>✏️</span>
                            <span>Load Existing Answers</span>
                          </button>
                          <p className="text-xs text-gray-500">
                            💡 Click to load existing answers into the form for editing
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {questionForm.answers.map((answer, index) => (
                        <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                              <input
                                type="checkbox"
                            checked={answer.isCorrect}
                            onChange={(e) => {
                              const newAnswers = [...questionForm.answers]
                              newAnswers[index].isCorrect = e.target.checked
                              setQuestionForm(prev => ({ ...prev, answers: newAnswers }))
                            }}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            title={`Mark answer ${index + 1} as correct`}
                            aria-label={`Mark answer ${index + 1} as correct`}
                          />
                          <input
                            type="text"
                            value={answer.content}
                            onChange={(e) => {
                              const newAnswers = [...questionForm.answers]
                              newAnswers[index].content = e.target.value
                              setQuestionForm(prev => ({ ...prev, answers: newAnswers }))
                            }}
                            placeholder={`Answer option ${index + 1}`}
                            className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                          />
                            <button
                            type="button"
                            onClick={() => {
                              const newAnswers = questionForm.answers.filter((_, i) => i !== index)
                              setQuestionForm(prev => ({ ...prev, answers: newAnswers }))
                            }}
                            className="w-8 h-8 bg-red-400 hover:bg-red-500 text-white rounded-lg flex items-center justify-center transition-colors duration-300"
                          >
                            ✕
                            </button>
                        </div>
                      ))}
                            <button
                        type="button"
                        onClick={() => {
                          setQuestionForm(prev => ({
                            ...prev,
                            answers: [...prev.answers, { content: '', isCorrect: false }]
                          }))
                        }}
                        className="w-full py-3 bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        + Add Answer Option
                            </button>
                          </div>
                        </div>
                )}

                {/* Essay Rubric for SHORT/ESSAY */}
                {(questionForm.type === 'SHORT' || questionForm.type === 'ESSAY') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Essay Rubric
                    </label>
                    <div className="space-y-4">
                      {essayRubric.map((item, index) => (
                        <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Criterion</label>
                              <input
                                type="text"
                                value={item.criterion}
                                onChange={(e) => {
                                  const newRubric = [...essayRubric]
                                  newRubric[index].criterion = e.target.value
                                  setEssayRubric(newRubric)
                                }}
                                className="w-full px-4 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                                placeholder="Evaluation criterion"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                value={item.weight}
                                onChange={(e) => {
                                  const newRubric = [...essayRubric]
                                  newRubric[index].weight = parseFloat(e.target.value) || 0
                                  setEssayRubric(newRubric)
                                }}
                                className="w-full px-4 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                                placeholder="0.0 - 1.0"
                              />
                          </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                              <input
                                type="text"
                                value={item.keywordsCsv}
                                onChange={(e) => {
                                  const newRubric = [...essayRubric]
                                  newRubric[index].keywordsCsv = e.target.value
                                  setEssayRubric(newRubric)
                                }}
                                className="w-full px-4 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                                placeholder="Comma-separated keywords"
                              />
                            </div>
                          </div>
                            <button
                            type="button"
                              onClick={() => {
                              const newRubric = essayRubric.filter((_, i) => i !== index)
                              setEssayRubric(newRubric)
                            }}
                            className="mt-2 w-full py-2 bg-red-400 hover:bg-red-500 text-white rounded-xl font-medium transition-colors duration-300"
                          >
                            Remove Criterion
                            </button>
                        </div>
                      ))}
                            <button
                        type="button"
                        onClick={() => {
                          setEssayRubric([...essayRubric, { criterion: '', weight: 0, keywordsCsv: '' }])
                        }}
                        className="w-full py-3 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        + Add Rubric Criterion
                            </button>
                          </div>
                  </div>
                )}
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowQuestionForm(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none"
                  >
                    {isSubmitting 
                      ? (editingQuestion ? 'Updating...' : 'Creating...') 
                      : (editingQuestion ? 'Update Question' : 'Create Question')
                    }
                  </button>
                    </div>
              </form>
                </div>
              </div>
        )}

        {/* Answer Explanation Modal */}
        {showExplanation && explanationData && (
          <AnswerExplanation
            questionContent={explanationData.questionContent}
            options={explanationData.options}
            correctAnswerLabel={explanationData.correctAnswerLabel}
            onClose={() => {
              setShowExplanation(false)
              setExplanationData(null)
            }}
          />
        )}
      </div>
    </div>
  )
}