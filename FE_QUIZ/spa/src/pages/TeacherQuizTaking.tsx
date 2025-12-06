import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isTeacher } from '@/utils/apiTransform'
import { TeacherNavigation } from '@/components/TeacherNavigation'
import { getAllQuizzes, getMyReviewQuizzes, ReviewQuizResponse, startQuiz as startQuizAPI, StartQuizResponse } from '@/api/quizClient'

interface Quiz {
  id: string
  title: string
  status: string
  createdAt: string
  updatedAt: string
  targetCount?: number
  aiToppedUp?: boolean
  baseQuizId?: string
}

// StartQuizResponse interface is now imported from quizClient

interface SubmitQuizResponse {
  code: number
  result: {
    profileId: string
    submissionId: string
    quizTitle: string
    totalQuestions: number
    correctAnswers: number
    scorePercent: number
    results: Array<{
      questionId: string
      questionContent: string
      selectedAnswer: string
      isCorrect: boolean
      correctAnswer: string
      aiScore: number | null
      aiComment: string | null
      rubric: any[]
      rubricDefinition: any[]
    }>
    feedback: string
    cheatingAnalysis: string
    suggestReview: boolean
    reviewText: string
    reviewQuizId: string
  }
}

export default function TeacherQuizTaking() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const quizId = searchParams.get('quizId')
  const quizType = searchParams.get('type') // 'review' or 'normal'
  const reviewQuizId = searchParams.get('reviewQuizId')
  
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizSession, setQuizSession] = useState<StartQuizResponse | null>(null)
  const [quizResults, setQuizResults] = useState<SubmitQuizResponse['result'] | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [showSubmitAnimation, setShowSubmitAnimation] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [showQuestionTransition, setShowQuestionTransition] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    reviewText: false,
    feedback: false,
    cheatingAnalysis: false
  })
  const [showUnansweredModal, setShowUnansweredModal] = useState(false)
  const [showNavigationNotification, setShowNavigationNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isContinuingQuiz, setIsContinuingQuiz] = useState(false)

  useEffect(() => {
    if (quizType === 'review') {
      loadReviewQuizzes()
    } else {
      loadQuizzes()
    }
  }, [quizType])

  // Detect dark mode preference
  useEffect(() => {
    const checkDarkMode = () => {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark') {
        setIsDarkMode(true)
        return
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true)
        return
      }
      
      setIsDarkMode(false)
    }

    checkDarkMode()

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => checkDarkMode()
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (quizId) {
      const quiz = quizzes.find(q => q.id === quizId)
      if (quiz) {
        setSelectedQuiz(quiz)
        // If this is a review quiz with reviewQuizId, auto-start the quiz
        if (quizType === 'review' && reviewQuizId) {
          startQuiz(quiz)
        }
      }
    }
  }, [quizId, quizzes, quizType, reviewQuizId])

  // Handle continue quiz from submissionId
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const continueQuiz = urlParams.get('continue')
    const submissionId = urlParams.get('submissionId')
    const quizIdFromUrl = urlParams.get('quizId')
    
    if (continueQuiz === 'true' && submissionId && quizIdFromUrl) {
      // Find the quiz and auto-start it
      const quiz = quizzes.find(q => q.id === quizIdFromUrl)
      if (quiz) {
        setSelectedQuiz(quiz)
        setIsContinuingQuiz(true)
        // Load the existing submission data
        loadExistingSubmission(submissionId)
      }
    }
  }, [quizzes])

  const loadExistingSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`https://api.duongtech.me/api/v1/quiz/submissions/${submissionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.code === 1000 && data.result) {
          const submission = data.result
          // Set the quiz session with existing data
          setQuizSession(submission)
          setCurrentQuestionIndex(0)
          setShowResults(false)
          
          // Load existing answers if any
          if (submission.answers) {
            setAnswers(submission.answers)
          }
          if (submission.textAnswers) {
            setTextAnswers(submission.textAnswers)
          }
        }
      }
    } catch (error) {
      console.error('Error loading existing submission:', error)
    }
  }

  const loadQuizzes = async () => {
    try {
      const quizList = await getAllQuizzes()
      // Convert QuizResponse to Quiz format
      const convertedQuizzes: Quiz[] = quizList.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        status: quiz.status,
        createdAt: quiz.createdAt || new Date().toISOString(),
        updatedAt: quiz.updatedAt || new Date().toISOString()
      }))
      setQuizzes(convertedQuizzes)
    } catch (error) {
      console.error('Error loading quizzes:', error)
    }
  }

  const loadReviewQuizzes = async () => {
    try {
      const reviewQuizList = await getMyReviewQuizzes()
      // Convert ReviewQuizResponse to Quiz format
      const convertedQuizzes: Quiz[] = reviewQuizList.map(reviewQuiz => ({
        id: reviewQuiz.baseQuizId, // Use baseQuizId as the main ID for starting quiz
        title: reviewQuiz.title,
        status: 'PUBLISHED', // Review quizzes are always available
        createdAt: reviewQuiz.createdAt,
        updatedAt: reviewQuiz.createdAt,
        targetCount: reviewQuiz.targetCount,
        aiToppedUp: reviewQuiz.aiToppedUp,
        baseQuizId: reviewQuiz.baseQuizId
      }))
      setQuizzes(convertedQuizzes)
    } catch (error) {
      console.error('Error loading review quizzes:', error)
    }
  }

  const startQuiz = async (quiz: Quiz) => {
    setIsLoading(true)
    try {
      // For review quizzes, quiz.id is already the baseQuizId
      // For normal quizzes, quiz.id is the quiz ID
      const actualQuizId = quiz.id
      
      console.log('🔍 Starting quiz with:', {
        quizId: quiz.id,
        quizTitle: quiz.title,
        actualQuizId: actualQuizId,
        baseQuizId: quiz.baseQuizId,
        reviewQuizId: reviewQuizId,
        quizType: quizType
      })

      const data = await startQuizAPI({ quizId: actualQuizId })
      console.log('✅ Quiz started successfully:', data)
      
      setQuizSession(data)
      setSelectedQuiz(quiz)
      setCurrentQuestionIndex(0)
      setAnswers({})
                    setTextAnswers({})
      setTextAnswers({})
      setTimeLeft(30 * 60) // 30 minutes timer
      setShowResults(false)
      
      // If this is a review quiz, update the quiz title to show it's a review
      if (quizType === 'review' && reviewQuizId) {
        setQuizSession(prev => prev ? {
          ...prev,
          quizTitle: `🔄 Review: ${prev.quizTitle}`
        } : null)
      }
        
        // Fun start message
        const startMessages = [
          "🎯 Quiz bắt đầu! Chúc may mắn!",
          "🚀 Sẵn sàng chưa? Bắt đầu thôi!",
          "🎪 Hãy thể hiện kiến thức của bạn!",
          "🎨 Thời gian để tỏa sáng!",
          "🎭 Hãy làm tốt nhất có thể!"
        ]
        const randomStartMessage = startMessages[Math.floor(Math.random() * startMessages.length)]
        
        // Show fun start animation
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = randomStartMessage
        tempDiv.style.position = 'fixed'
        tempDiv.style.fontSize = '1.5rem'
        tempDiv.style.pointerEvents = 'none'
        tempDiv.style.zIndex = '9999'
        tempDiv.style.left = '50%'
        tempDiv.style.top = '30%'
        tempDiv.style.transform = 'translate(-50%, -50%)'
        tempDiv.style.backgroundColor = '#FFB6C1'
        tempDiv.style.color = '#5D4E75'
        tempDiv.style.padding = '1rem 2rem'
        tempDiv.style.borderRadius = '1rem'
        tempDiv.style.fontWeight = 'bold'
        tempDiv.style.animation = 'bounce 1s ease-out forwards'
        document.body.appendChild(tempDiv)
        
        setTimeout(() => {
          document.body.removeChild(tempDiv)
        }, 2000)
    } catch (error) {
      console.error('Error starting quiz:', error)
      alert('Failed to start quiz. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitQuiz = async () => {
    if (!quizSession) return
    
    // Double check: prevent submission if no session
    if (!quizSession.submissionId) {
      alert('Không có phiên làm bài. Vui lòng bắt đầu lại.')
      return
    }
    
    // Allow retry - remove blocking logic
    
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate request')
      return
    }

    // Check for unanswered questions
    const unansweredQuestions = getUnansweredQuestions()
    if (unansweredQuestions.length > 0) {
      setShowUnansweredModal(true)
      return
    }

    // Fun submission messages
    const funMessages = [
      "🎯 Đang chấm điểm... Hãy chờ một chút!",
      "🤖 AI đang suy nghĩ... Có vẻ khó đây!",
      "📊 Tính toán kết quả... Đừng lo lắng!",
      "🎪 Máy tính đang làm việc... Sắp xong rồi!",
      "🧠 Phân tích câu trả lời... Thú vị quá!",
      "🎨 Tạo báo cáo đẹp... Sắp hoàn thành!",
      "🚀 Xử lý dữ liệu... Bay lên nào!",
      "🎭 Chuẩn bị kết quả... Hài hước lắm!"
    ]

    setIsSubmitting(true)
    setShowSubmitAnimation(true)
    
    // Show random fun message
    const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)]
    setSubmitMessage(randomMessage)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const answersArray = Object.entries(answers).map(([questionId, answerId]) => ({
        questionId,
        answerId
      }))

      const textAnswersArray = Object.entries(textAnswers).map(([questionId, answerText]) => ({
        questionId,
        answerText
      }))

      let data: SubmitQuizResponse
      
      // Use normal quiz submit API for both normal and review quizzes
      // The backend will handle review quiz logic internally
      const response = await fetch('https://api.duongtech.me/api/v1/quiz/quizzes/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId: quizSession.submissionId,
          answers: answersArray,
          textAnswers: textAnswersArray
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      data = await response.json()
      
      if (data.code === 1000 && data.result) {
        // Quiz submitted successfully
        
        // Don't reset session immediately - let user see results first
        // Session will be reset when user navigates away or starts new quiz
        
        // Add delay for dramatic effect
        setTimeout(() => {
          setQuizResults(data.result)
          setShowResults(true)
          setShowSubmitAnimation(false)
          
          // Fun completion message
          const completionMessages = [
            "🎉 Hoàn thành! Bạn đã làm rất tốt!",
            "🎊 Tuyệt vời! Kết quả sắp hiện ra!",
            "🎯 Xuất sắc! Hãy xem điểm số!",
            "🚀 Ấn tượng! Kết quả đây rồi!",
            "🎪 Tuyệt vời! Bạn đã hoàn thành!"
          ]
          const randomCompletionMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)]
          
          // Show fun completion animation
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = randomCompletionMessage
          tempDiv.style.position = 'fixed'
          tempDiv.style.fontSize = '1.5rem'
          tempDiv.style.pointerEvents = 'none'
          tempDiv.style.zIndex = '9999'
          tempDiv.style.left = '50%'
          tempDiv.style.top = '30%'
          tempDiv.style.transform = 'translate(-50%, -50%)'
          tempDiv.style.backgroundColor = '#B8E6B8'
          tempDiv.style.color = '#5D4E75'
          tempDiv.style.padding = '1rem 2rem'
          tempDiv.style.borderRadius = '1rem'
          tempDiv.style.fontWeight = 'bold'
          tempDiv.style.animation = 'bounce 1s ease-out forwards'
          document.body.appendChild(tempDiv)
          
          setTimeout(() => {
            document.body.removeChild(tempDiv)
          }, 2000)
        }, 2000)
      } else {
        throw new Error('Failed to submit quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setShowSubmitAnimation(false)
      setSubmitMessage('')
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
    
    // Fun sound effects (visual feedback)
    const funEmojis = ['🎯', '✨', '🎪', '🎨', '🚀', '🎭', '🎊', '🎉']
    const randomEmoji = funEmojis[Math.floor(Math.random() * funEmojis.length)]
    
    // Create temporary emoji animation
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = randomEmoji
    tempDiv.style.position = 'fixed'
    tempDiv.style.fontSize = '2rem'
    tempDiv.style.pointerEvents = 'none'
    tempDiv.style.zIndex = '9999'
    tempDiv.style.animation = 'bounce 0.6s ease-out forwards'
    tempDiv.style.left = '50%'
    tempDiv.style.top = '50%'
    tempDiv.style.transform = 'translate(-50%, -50%)'
    document.body.appendChild(tempDiv)
    
    setTimeout(() => {
      document.body.removeChild(tempDiv)
    }, 600)
  }

  const handleTextAnswerChange = (questionId: string, answerText: string) => {
    setTextAnswers(prev => ({
      ...prev,
      [questionId]: answerText
    }))
  }

  // Helper function to determine if a question is an essay question
  const isEssayQuestion = (question: any) => {
    return question.type === 'ESSAY'
  }

  // Helper function to determine if a question is a short answer question
  const isShortQuestion = (question: any) => {
    return question.type === 'SHORT'
  }

  // Helper function to determine if a question requires text input
  const isTextQuestion = (question: any) => {
    return question.type === 'ESSAY' || question.type === 'SHORT'
  }

  // Helper function to check if all questions are answered
  const isAllQuestionsAnswered = () => {
    if (!quizSession) return false
    
    return quizSession.questions.every(question => {
      if (isTextQuestion(question)) {
        // For essay and short questions, check if there's a text answer
        return textAnswers[question.id] && textAnswers[question.id].trim().length > 0
      } else {
        // For multiple choice questions, check if there's a selected answer
        return answers[question.id] && answers[question.id].length > 0
      }
    })
  }

  // Theme-aware color system
  const getThemeColors = () => {
    if (isDarkMode) {
      return {
        // Dark mode colors
        background: '#1a1a1a',
        surface: '#2d2d2d',
        surfaceLight: '#3a3a3a',
        text: '#ffffff',
        textSecondary: '#b3b3b3',
        textMuted: '#808080',
        border: '#404040',
        borderLight: '#4a4a4a',
        primary: '#FFB6C1',
        primaryLight: '#FF9BB3',
        secondary: '#A8E6CF',
        accent: '#E8D5B7',
        warning: '#FFB3BA',
        success: '#A8E6CF',
        error: '#FF6B6B',
        shadow: 'rgba(0, 0, 0, 0.5)',
        shadowLight: 'rgba(0, 0, 0, 0.3)'
      }
    } else {
      return {
        // Light mode colors (existing)
        background: '#FFF6ED',
        surface: '#FFFFFF',
        surfaceLight: '#FFF9F3',
        text: '#5D4E75',
        textSecondary: '#8B5A96',
        textMuted: '#A67C8A',
        border: '#E8D5B7',
        borderLight: '#F4E4C1',
        primary: '#FFB6C1',
        primaryLight: '#FF9BB3',
        secondary: '#A8E6CF',
        accent: '#E8D5B7',
        warning: '#FFB3BA',
        success: '#A8E6CF',
        error: '#FF6B6B',
        shadow: 'rgba(0, 0, 0, 0.1)',
        shadowLight: 'rgba(0, 0, 0, 0.05)'
      }
    }
  }

  // Helper function to determine if a result is from a text question (essay or short)
  const isTextResult = (result: any) => {
    // Text questions typically have AI scoring, comments, or no correct answer
    return result.aiScore !== null || result.aiComment || !result.correctAnswer || result.correctAnswer === ''
  }

  // Helper function to determine if a result is from an essay question specifically
  const isEssayResult = (result: any) => {
    // For now, we'll treat all text results as essay results in the display
    // This can be enhanced later if we need to distinguish between essay and short results
    return isTextResult(result)
  }

  // Helper function to check if current question is answered
  const isCurrentQuestionAnswered = () => {
    if (!quizSession || currentQuestionIndex >= quizSession.questions.length) return true
    
    const currentQuestion = quizSession.questions[currentQuestionIndex]
    if (!currentQuestion) return true
    
    if (isTextQuestion(currentQuestion)) {
      return textAnswers[currentQuestion.id] && textAnswers[currentQuestion.id].trim().length > 0
    } else {
      return answers[currentQuestion.id] && answers[currentQuestion.id].length > 0
    }
  }

  // Helper function to get unanswered questions
  const getUnansweredQuestions = () => {
    if (!quizSession) return []
    
    const unanswered: Array<{questionId: string, questionNumber: number, questionContent: string, questionType: string}> = []
    
    quizSession.questions.forEach((question, index) => {
      if (isTextQuestion(question)) {
        // For text questions, check if there's a text answer
        if (!textAnswers[question.id] || textAnswers[question.id].trim().length === 0) {
          unanswered.push({
            questionId: question.id,
            questionNumber: index + 1,
            questionContent: question.content || '',
            questionType: question.type || 'MCQ'
          })
        }
      } else {
        // For multiple choice questions, check if there's a selected answer
        if (!answers[question.id] || answers[question.id].length === 0) {
          unanswered.push({
            questionId: question.id,
            questionNumber: index + 1,
            questionContent: question.content || '',
            questionType: question.type || 'MCQ'
          })
        }
      }
    })
    
    return unanswered
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const goToNextQuestion = () => {
    if (!isCurrentQuestionAnswered()) {
      showNavigationWarning('next')
      return
    }
    
    setShowQuestionTransition(true)
    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowQuestionTransition(false)
    }, 300)
  }

  const goToPreviousQuestion = () => {
    if (!isCurrentQuestionAnswered()) {
      showNavigationWarning('previous')
      return
    }
    
    setShowQuestionTransition(true)
    setTimeout(() => {
      setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
      setShowQuestionTransition(false)
    }, 300)
  }

  const goToQuestion = (questionIndex: number) => {
    setShowQuestionTransition(true)
    setTimeout(() => {
      setCurrentQuestionIndex(questionIndex)
      setShowQuestionTransition(false)
      setShowUnansweredModal(false)
    }, 300)
  }

  const showNavigationWarning = (direction: 'next' | 'previous') => {
    if (!quizSession || currentQuestionIndex >= quizSession.questions.length) return
    
    const currentQuestion = quizSession.questions[currentQuestionIndex]
    if (!currentQuestion) return
    
    const questionType = isTextQuestion(currentQuestion) 
      ? (isEssayQuestion(currentQuestion) ? 'essay' : 'short answer')
      : 'multiple choice'
    
    const message = direction === 'next' 
      ? `⚠️ Please answer this ${questionType} question before proceeding to the next question.`
      : `⚠️ Please answer this ${questionType} question before going back.`
    
    setNotificationMessage(message)
    setShowNavigationNotification(true)
    
    // Auto-hide notification after 4 seconds
    setTimeout(() => {
      setShowNavigationNotification(false)
    }, 4000)
  }

  useEffect(() => {
    let interval: number
    if (timeLeft > 0 && quizSession && !showResults) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up! Auto submit with fun message
            setTimeout(() => {
              setSubmitMessage("⏰ Hết giờ rồi! Tự động nộp bài...")
              submitQuiz()
            }, 1000)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timeLeft, quizSession, showResults])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        {/* Beautiful floating shapes with enhanced animations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-amber-200/30 rounded-full blur-xl animate-bounce" />
        
        <div className="text-center relative z-10">
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 w-32 h-32 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animate-reverse-slow"></div>
            <div className="absolute inset-4 w-24 h-24 border-4 border-transparent border-t-rose-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-bounce filter drop-shadow-lg animate-wiggle">🌟</span>
            </div>
          </div>
          <h3 className="text-2xl font-rounded font-bold text-amber-700 mb-2 tracking-wide animate-heartbeat">🔄 Loading Your Universe</h3>
          <p className="text-lg text-amber-600 font-rounded font-bold animate-fade-in">✨ Preparing magical quizzes... ✨</p>
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300" />
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isTeacher(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Access Denied</h1>
          <p className="text-gray-600">You need teacher permissions to access this page.</p>
        </div>
      </div>
    )
  }

  // Quiz Selection Screen
  if (!selectedQuiz && !quizSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Beautiful floating shapes with enhanced animations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-amber-200/30 rounded-full blur-xl animate-bounce" />
        
        {/* Additional floating elements */}
        <div className="absolute top-10 left-1/3 w-6 h-6 bg-yellow-300 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-20 right-1/3 w-4 h-4 bg-pink-300 rounded-full animate-float-delayed opacity-70"></div>
        <div className="absolute bottom-10 left-20 w-8 h-8 bg-green-300 rounded-full animate-float-slow opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-blue-300 rounded-full animate-float-delayed-2 opacity-60"></div>
        
        <TeacherNavigation />
        
        {/* Beautiful Header with enhanced styling */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 shadow-2xl border-b-4 border-pink-300 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full -translate-x-16 -translate-y-16 opacity-60 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full translate-x-12 -translate-y-12 opacity-70 animate-bounce"></div>
            <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-green-200 rounded-full -translate-y-10 opacity-50 animate-ping"></div>
            <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-blue-200 rounded-full -translate-y-8 opacity-60 animate-pulse"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="group relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-500 group-hover:rotate-6 border-4 border-amber-300 animate-heartbeat btn-magic">
                  <span className="text-2xl group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">{quizType === 'review' ? '🔄' : '🧩'}</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500"></div>
              </div>
              <div>
                <h1 className="text-3xl font-rounded font-bold text-rainbow tracking-tight animate-heartbeat">
                  🎓 {quizType === 'review' ? 'Review Quizzes' : 'Quiz Practice'}
                </h1>
                <p className="text-lg text-amber-700 font-rounded font-bold flex items-center space-x-2 animate-fade-in">
                  <span className="text-xl animate-bounce filter drop-shadow-md">✨</span>
                  <span className="tracking-wide">
                    {quizType === 'review' 
                      ? '🌟 Personalized review quizzes based on your performance 🌟' 
                      : '🌟 Test your knowledge with your own quizzes 🌟'
                    }
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => {
              const quizIcons = ['🧮', '🔬', '📚', '🎨', '🌍', '💻', '🧪', '📐', '🎵', '🏛️', '⚗️', '📊']
              const icon = quizIcons[index % quizIcons.length]
              const colors = [
                'from-amber-200 to-orange-200 border-amber-300 hover:border-amber-400',
                'from-rose-200 to-pink-200 border-rose-300 hover:border-rose-400', 
                'from-emerald-200 to-teal-200 border-emerald-300 hover:border-emerald-400',
                'from-violet-200 to-purple-200 border-violet-300 hover:border-violet-400',
                'from-cyan-200 to-blue-200 border-cyan-300 hover:border-cyan-400',
                'from-lime-200 to-green-200 border-lime-300 hover:border-lime-400'
              ]
              const colorClass = colors[index % colors.length]
              
              return (
                <div
                  key={quiz.id}
                  className={`group relative bg-gradient-to-br ${colorClass} backdrop-blur-sm rounded-2xl shadow-lg p-6 border-4 transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:-rotate-1 hover-lift animate-fade-in-up`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                  <div className="relative">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 btn-magic animate-float`}>
                        <span className="text-lg group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-rounded font-bold text-gray-900 group-hover:text-rainbow transition-all duration-300 tracking-wide truncate animate-fade-in">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-gray-600 font-rounded font-semibold animate-slide-up">
                          {quizType === 'review' ? 'Review Quiz' : `Created: ${new Date(quiz.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-700 font-rounded font-bold tracking-wide animate-fade-in">
                          {quizType === 'review' ? 'REVIEW QUIZ' : quiz.status}
                        </span>
                      </div>
                      {quiz.aiToppedUp && (
                        <div className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800 font-rounded font-bold animate-fade-in">
                          ✨ AI Enhanced
                        </div>
                      )}
                    </div>
                
                    {quizType === 'review' && quiz.targetCount && (
                      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-4 border-blue-200 animate-fade-in">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-rounded font-bold text-blue-800 animate-fade-in">
                            📊 {quiz.targetCount} câu hỏi ôn tập
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-700 font-rounded font-bold tracking-wide animate-fade-in">Ready</span>
                      </div>
                      <button
                        onClick={() => startQuiz(quiz)}
                        disabled={isLoading}
                        className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-rounded font-bold text-base transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border-4 border-amber-300 hover:border-amber-400 disabled:border-gray-300 btn-magic"
                      >
                        <span className="relative z-10 flex items-center space-x-2">
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Starting Magic...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg group-hover:rotate-180 transition-transform duration-300 animate-wiggle">✨</span>
                              <span>{quizType === 'review' ? 'Start Review' : 'Start Quiz'}</span>
                              <span className="text-base group-hover:translate-x-1 transition-transform duration-200">🚀</span>
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Quiz Taking Screen
  if (quizSession && !showResults) {
    const currentQuestion = quizSession.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / quizSession.questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Beautiful floating shapes with enhanced animations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-amber-200/30 rounded-full blur-xl animate-bounce" />
        
        <TeacherNavigation />
        
        {/* Continue Quiz Notification */}
        {isContinuingQuiz && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="gradient-pastel-blue rounded-2xl p-4 border-4 border-blue-300 shadow-2xl max-w-md">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center transform hover:rotate-12 transition-all duration-300 bg-gradient-to-br from-blue-300 to-cyan-300 border-4 border-blue-400 btn-magic">
                  <span className="text-lg animate-wiggle">🔄</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-rounded font-bold text-blue-800 animate-fade-in">
                    🔄 Đang tiếp tục bài kiểm tra từ lịch sử
                  </p>
                  <p className="text-xs text-blue-600 font-rounded font-bold animate-fade-in">
                    Các câu trả lời trước đó đã được khôi phục
                  </p>
                </div>
                <button
                  onClick={() => setIsContinuingQuiz(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 bg-gradient-to-br from-blue-300 to-cyan-300 border-4 border-blue-400 btn-magic"
                >
                  <span className="text-xs text-white animate-wiggle">✕</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Quiz Header */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 shadow-2xl border-b-4 border-pink-300 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full -translate-x-16 -translate-y-16 opacity-60 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full translate-x-12 -translate-y-12 opacity-70 animate-bounce"></div>
            <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-green-200 rounded-full -translate-y-10 opacity-50 animate-ping"></div>
            <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-blue-200 rounded-full -translate-y-8 opacity-60 animate-pulse"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="group relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-500 group-hover:rotate-6 border-4 border-amber-300 animate-heartbeat btn-magic">
                    <span className="text-2xl group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">🎪</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-rounded font-bold text-rainbow tracking-tight animate-heartbeat">{quizSession.quizTitle}</h1>
                  <p className="text-sm text-amber-700 font-rounded font-bold flex items-center space-x-2 animate-fade-in">
                    <span className="text-lg animate-bounce filter drop-shadow-md">✨</span>
                    <span className="tracking-wide">Question {currentQuestionIndex + 1} of {quizSession.questions.length}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`text-2xl font-rounded font-bold transition-all duration-300 ${timeLeft <= 60 ? 'animate-pulse' : ''}`} 
                       style={{ 
                         color: timeLeft <= 60 ? '#FF6B6B' : timeLeft <= 300 ? '#FFB347' : '#D4A574'
                       }}>
                    {formatTime(timeLeft)}
                    {timeLeft <= 60 && <span className="ml-2 animate-wiggle">⚠️</span>}
                  </div>
                  <div className="text-sm text-amber-700 font-rounded font-bold animate-fade-in">
                    {timeLeft <= 60 ? 'Hurry Up! ⏰' : 'Time Left'}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/teacher/quiz-taking')}
                  className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white rounded-xl font-rounded font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-4 border-gray-300 hover:border-gray-400 btn-magic"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span className="text-lg group-hover:rotate-180 transition-transform duration-300 animate-wiggle">🚪</span>
                    <span>Exit Quiz</span>
                    <span className="text-base group-hover:translate-x-1 transition-transform duration-200">↩️</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full rounded-full h-4 bg-gradient-to-r from-amber-200 to-orange-200 border-4 border-amber-300 shadow-lg">
                <div 
                  className="h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg"
                  style={{ 
                    width: `${progress}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm font-rounded font-bold text-amber-700 animate-fade-in">
                <span className="flex items-center space-x-1">
                  <span className="animate-wiggle">📊</span>
                  <span>Progress</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="animate-wiggle">✨</span>
                  <span>{Math.round(progress)}%</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Submit Animation Overlay */}
          {showSubmitAnimation && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
              <div className="gradient-pastel-yellow rounded-2xl p-8 border-4 border-yellow-300 shadow-2xl text-center max-w-md mx-4">
                <div className="mb-6">
                  <div className="relative mx-auto w-20 h-20 mb-4">
                    <div className="absolute inset-0 w-20 h-20 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animate-reverse-slow"></div>
                    <div className="absolute inset-4 w-12 h-12 border-4 border-transparent border-t-rose-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl animate-bounce filter drop-shadow-lg animate-wiggle">🎯</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-rounded font-bold text-rainbow mb-4 tracking-wide animate-heartbeat">
                  {submitMessage}
                </h3>
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 rounded-full animate-bounce bg-pink-400" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 rounded-full animate-bounce bg-purple-400" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 rounded-full animate-bounce bg-indigo-400" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Unanswered Questions Modal */}
          {showUnansweredModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
              <div className="gradient-pastel-pink rounded-2xl p-8 border-4 border-pink-300 shadow-2xl max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300 bg-gradient-to-br from-pink-300 to-rose-300 border-4 border-pink-400 btn-magic">
                    <span className="text-2xl animate-wiggle">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-rounded font-bold text-rainbow tracking-wide animate-heartbeat">
                      Chưa hoàn thành tất cả câu hỏi
                    </h3>
                    <p className="text-sm text-pink-700 font-rounded font-bold animate-fade-in">
                      ✨ Vui lòng trả lời tất cả câu hỏi trước khi nộp bài ✨
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-lg font-medium mb-4" style={{ color: '#5D4E75' }}>
                    Các câu hỏi chưa trả lời:
                  </p>
                  <div className="space-y-3">
                    {getUnansweredQuestions().map((question, index) => (
                      <div key={question.questionId} className="p-4 rounded-2xl border-2 transform hover:scale-102 transition-all duration-300 cursor-pointer" 
                           style={{ backgroundColor: '#FFFFFF', borderColor: '#E8D5B7' }}
                           onClick={() => goToQuestion(question.questionNumber - 1)}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-white text-sm font-bold transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: '#FFB3BA' }}>
                            {question.questionNumber}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-bold" style={{ color: '#8B5A96' }}>
                                Câu {question.questionNumber}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#FFB3BA', color: '#8B5A96' }}>
                                {question.questionType === 'ESSAY' ? '🖋️ Tự luận' : question.questionType === 'SHORT' ? '📄 Ngắn' : '🎯 Trắc nghiệm'}
                              </span>
                            </div>
                            <p className="text-sm font-medium" style={{ color: '#5D4E75' }}>
                              {question.questionContent.length > 100 
                                ? `${question.questionContent.substring(0, 100)}...` 
                                : question.questionContent}
                            </p>
                          </div>
                          <div className="text-2xl transform hover:scale-110 transition-all duration-200">👆</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUnansweredModal(false)}
                    className="px-6 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
                    style={{ 
                      backgroundColor: '#E8D5B7',
                      color: '#5D4E75'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#D4A574'
                      e.currentTarget.style.color = '#4A3C5C'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#E8D5B7'
                      e.currentTarget.style.color = '#5D4E75'
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Notification */}
          {showNavigationNotification && (
            <div className="fixed top-4 right-4 z-50 animate-bounce">
              <div className="rounded-2xl p-4 border-2 shadow-lg max-w-sm" style={{ 
                borderColor: getThemeColors().warning, 
                backgroundColor: getThemeColors().surfaceLight,
                boxShadow: `0 8px 25px ${getThemeColors().shadowLight}`
              }}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: getThemeColors().warning }}>
                    <span className="text-lg">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: getThemeColors().textSecondary }}>
                      {notificationMessage}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNavigationNotification(false)}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200" 
                    style={{ backgroundColor: getThemeColors().warning }}
                  >
                    <span className="text-xs" style={{ color: getThemeColors().textSecondary }}>✕</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={`rounded-3xl p-8 border-2 transition-all duration-300 ${showQuestionTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`} style={{ 
            borderColor: getThemeColors().border, 
            backgroundColor: getThemeColors().background,
            boxShadow: `0 6px 20px ${getThemeColors().shadowLight}`
          }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: getThemeColors().text }}>
                {currentQuestion.content}
              </h2>
              
              {/* Multiple Choice Questions */}
              {currentQuestion.type === 'MCQ' && (
                <div className="space-y-4">
                  {currentQuestion.answers.map((answer) => (
                    <label
                      key={answer.id}
                      className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        answers[currentQuestion.id] === answer.id
                          ? 'shadow-lg'
                          : ''
                      }`}
                      style={{
                        borderColor: answers[currentQuestion.id] === answer.id ? getThemeColors().primary : getThemeColors().border,
                        backgroundColor: answers[currentQuestion.id] === answer.id ? getThemeColors().surfaceLight : getThemeColors().surface
                      }}
                      onMouseEnter={(e) => {
                        if (answers[currentQuestion.id] !== answer.id) {
                          e.currentTarget.style.borderColor = getThemeColors().accent
                          e.currentTarget.style.backgroundColor = getThemeColors().surfaceLight
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (answers[currentQuestion.id] !== answer.id) {
                          e.currentTarget.style.borderColor = getThemeColors().border
                          e.currentTarget.style.backgroundColor = getThemeColors().surface
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={answer.id}
                        checked={answers[currentQuestion.id] === answer.id}
                        onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion.id] === answer.id
                            ? ''
                            : ''
                        }`}
                        style={{
                          borderColor: answers[currentQuestion.id] === answer.id ? '#FFB6C1' : '#D4A574',
                          backgroundColor: answers[currentQuestion.id] === answer.id ? '#FFB6C1' : 'transparent'
                        }}>
                          {answers[currentQuestion.id] === answer.id && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                      <span className="text-lg font-medium" style={{ color: getThemeColors().text }}>
                        {answer.content}
                      </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Text Input Questions (Essay and Short) */}
              {isTextQuestion(currentQuestion) && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl border-2 transform hover:scale-102 transition-all duration-300" style={{ 
                    borderColor: getThemeColors().borderLight, 
                    backgroundColor: getThemeColors().surfaceLight,
                    boxShadow: `0 6px 20px ${getThemeColors().shadowLight}`
                  }}>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: getThemeColors().primary }}>
                        <span className="text-2xl">{isEssayQuestion(currentQuestion) ? '🖋️' : '📄'}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold" style={{ color: getThemeColors().textSecondary, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          {isEssayQuestion(currentQuestion) ? 'Essay Answer' : 'Short Answer'}
                        </h3>
                        <p className="text-sm font-medium" style={{ color: getThemeColors().textMuted }}>
                          {isEssayQuestion(currentQuestion) 
                            ? '🖋️ Please provide a detailed written response' 
                            : '📄 Please provide a concise written response'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <textarea
                        value={textAnswers[currentQuestion.id] || ''}
                        onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                        placeholder={isEssayQuestion(currentQuestion) 
                          ? "🖋️ Nhập câu trả lời chi tiết của bạn ở đây..." 
                          : "📄 Nhập câu trả lời ngắn gọn của bạn ở đây..."
                        }
                        className="w-full p-5 rounded-2xl border-2 resize-none transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-opacity-30 font-medium"
                        style={{
                          borderColor: textAnswers[currentQuestion.id] ? getThemeColors().primary : getThemeColors().borderLight,
                          backgroundColor: textAnswers[currentQuestion.id] ? getThemeColors().surfaceLight : getThemeColors().surface,
                          minHeight: isEssayQuestion(currentQuestion) ? '250px' : '150px',
                          color: getThemeColors().text,
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          boxShadow: textAnswers[currentQuestion.id] 
                            ? `0 4px 15px ${getThemeColors().shadowLight}` 
                            : `0 2px 8px ${getThemeColors().shadowLight}`
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = getThemeColors().primary
                          e.target.style.backgroundColor = getThemeColors().surfaceLight
                          e.target.style.boxShadow = `0 6px 20px ${getThemeColors().shadowLight}`
                          e.target.style.transform = 'scale(1.02)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = textAnswers[currentQuestion.id] ? getThemeColors().primary : getThemeColors().borderLight
                          e.target.style.backgroundColor = textAnswers[currentQuestion.id] ? getThemeColors().surfaceLight : getThemeColors().surface
                          e.target.style.boxShadow = textAnswers[currentQuestion.id] 
                            ? `0 4px 15px ${getThemeColors().shadowLight}` 
                            : `0 2px 8px ${getThemeColors().shadowLight}`
                          e.target.style.transform = 'scale(1)'
                        }}
                      />
                      
                      {/* Floating label effect */}
                      {textAnswers[currentQuestion.id] && (
                        <div className="absolute -top-2 left-4 px-2 text-xs font-bold transform transition-all duration-300" style={{ 
                          backgroundColor: getThemeColors().surfaceLight, 
                          color: getThemeColors().textSecondary 
                        }}>
                          {isEssayQuestion(currentQuestion) ? '🖋️ Your Essay' : '📄 Your Answer'}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: getThemeColors().primary }}>
                            <span className="text-sm">🔢</span>
                          </div>
                          <div className="text-sm font-bold" style={{ color: getThemeColors().textSecondary }}>
                            {textAnswers[currentQuestion.id]?.length || 0} characters
                          </div>
                        </div>
                        {isEssayQuestion(currentQuestion) && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getThemeColors().primary }}></div>
                            <span className="text-xs font-medium" style={{ color: getThemeColors().textMuted }}>
                              Detailed response recommended
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: getThemeColors().secondary }}>
                            <span className="text-sm">✅</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: getThemeColors().textSecondary }}>Status:</span>
                        </div>
                        <span className={`px-4 py-2 rounded-2xl text-sm font-bold transform hover:scale-110 transition-all duration-200 ${
                          textAnswers[currentQuestion.id] && textAnswers[currentQuestion.id].trim().length > 0
                            ? 'bg-green-200 text-green-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {textAnswers[currentQuestion.id] && textAnswers[currentQuestion.id].trim().length > 0
                            ? (isEssayQuestion(currentQuestion) ? '🖋️ Essay Complete' : '📄 Answer Complete')
                            : (isEssayQuestion(currentQuestion) ? '🖋️ Essay Pending' : '📄 Answer Pending')
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  !isCurrentQuestionAnswered() && currentQuestionIndex > 0 ? 'animate-pulse' : ''
                }`}
                style={{ 
                  backgroundColor: !isCurrentQuestionAnswered() && currentQuestionIndex > 0 ? getThemeColors().warning : getThemeColors().accent,
                  color: getThemeColors().text,
                  border: !isCurrentQuestionAnswered() && currentQuestionIndex > 0 ? `2px solid ${getThemeColors().primaryLight}` : 'none'
                }}
                onMouseEnter={(e) => {
                  if (currentQuestionIndex > 0) {
                    e.currentTarget.style.backgroundColor = getThemeColors().accent
                    e.currentTarget.style.color = getThemeColors().text
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentQuestionIndex > 0) {
                    e.currentTarget.style.backgroundColor = !isCurrentQuestionAnswered() ? getThemeColors().warning : getThemeColors().accent
                    e.currentTarget.style.color = getThemeColors().text
                  }
                }}
              >
                ⬅️ Previous
              </button>
              
              <div className="flex space-x-4">
                {currentQuestionIndex === quizSession.questions.length - 1 ? (
                  <button
                    onClick={submitQuiz}
                    disabled={isSubmitting || !isAllQuestionsAnswered()}
                    className="px-8 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: getThemeColors().success,
                      color: getThemeColors().text
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting && isAllQuestionsAnswered()) {
                        e.currentTarget.style.backgroundColor = getThemeColors().secondary
                        e.currentTarget.style.color = getThemeColors().text
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting && isAllQuestionsAnswered()) {
                        e.currentTarget.style.backgroundColor = getThemeColors().success
                        e.currentTarget.style.color = getThemeColors().text
                      }
                    }}
                  >
                    {isSubmitting ? '🎯 Submitting...' : '🚀 Submit Quiz'}
                  </button>
                ) : (
                  <button
                    onClick={goToNextQuestion}
                    className={`px-6 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      !isCurrentQuestionAnswered() ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      backgroundColor: !isCurrentQuestionAnswered() ? getThemeColors().warning : getThemeColors().primary,
                      color: getThemeColors().text,
                      border: !isCurrentQuestionAnswered() ? `2px solid ${getThemeColors().primaryLight}` : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = getThemeColors().primaryLight
                      e.currentTarget.style.color = getThemeColors().text
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = !isCurrentQuestionAnswered() ? getThemeColors().warning : getThemeColors().primary
                      e.currentTarget.style.color = getThemeColors().text
                    }}
                  >
                    Next ➡️
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Encouragement Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border-2 mb-8" style={{ borderColor: '#E8D5B7' }}>
            <div className="text-center">
              <div className="text-6xl mb-4">
                {(quizResults?.scorePercent ?? 0) >= 80 ? '🎉' : (quizResults?.scorePercent ?? 0) >= 60 ? '👍' : (quizResults?.scorePercent ?? 0) >= 40 ? '💪' : '📚'}
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#5D4E75' }}>
                {(quizResults?.scorePercent ?? 0) >= 80 
                  ? 'Outstanding Performance! 🌟' 
                  : (quizResults?.scorePercent ?? 0) >= 60 
                  ? 'Great Job! Keep It Up! 🚀' 
                  : (quizResults?.scorePercent ?? 0) >= 40 
                  ? 'Good Effort! You Can Do Better! 💪' 
                  : 'Keep Learning! Every Step Counts! 📖'
                }
              </h2>
              <p className="text-lg mb-6" style={{ color: '#A67C8A' }}>
                {(quizResults?.scorePercent ?? 0) >= 80 
                  ? 'You have mastered this topic! Your knowledge is impressive! 🏆' 
                  : (quizResults?.scorePercent ?? 0) >= 60 
                  ? 'You are on the right track! A few more attempts and you will excel! 🎯' 
                  : (quizResults?.scorePercent ?? 0) >= 40 
                  ? 'You are making progress! Review the feedback and try again! 📈' 
                  : 'Learning is a journey! Every mistake is a step towards success! 🌱'
                }
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => {
                    setQuizSession(null)
                    setQuizResults(null)
                    setShowResults(false)
                    setSelectedQuiz(null)
                    setAnswers({})
                    setTextAnswers({})
                    setCurrentQuestionIndex(0)
                  }}
                  className="px-8 py-4 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
                  style={{ 
                    backgroundColor: '#FFB6C1',
                    color: '#5D4E75'
                  }}
                >
                  🎯 Try Another Quiz
                </button>
                <button
                  onClick={() => {
                    setQuizSession(null)
                    setQuizResults(null)
                    setShowResults(false)
                    setSelectedQuiz(null)
                    setAnswers({})
                    setTextAnswers({})
                    setCurrentQuestionIndex(0)
                  }}
                  className="px-8 py-4 font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
                  style={{ 
                    backgroundColor: '#B8E6B8',
                    color: '#5D4E75'
                  }}
                >
                  🔄 Retry This Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quiz Results Screen
  if (showResults && quizResults) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFF9F3' }}>
        <TeacherNavigation />
        
        {/* Results Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b-2" style={{ borderColor: '#F4E4C1' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ backgroundColor: '#B8E6B8' }}>
                  <span className="text-3xl">🎊</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold" style={{ color: '#5D4E75' }}>
                    Quiz Completed!
                  </h1>
                  <p className="text-lg mt-2 font-medium" style={{ color: '#A67C8A' }}>
                    {quizResults?.quizTitle}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setQuizSession(null)
                  setQuizResults(null)
                  setShowResults(false)
                  setSelectedQuiz(null)
                  setAnswers({})
                    setTextAnswers({})
                  setCurrentQuestionIndex(0)
                }}
                className="px-6 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
                style={{ 
                  backgroundColor: '#FFB6C1',
                  color: '#5D4E75'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF9BB3'
                  e.currentTarget.style.color = '#4A3C5C'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFB6C1'
                  e.currentTarget.style.color = '#5D4E75'
                }}
              >
                Take Another Quiz
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl p-6 border-2 transform hover:scale-105 transition-all duration-300" style={{ borderColor: '#B8E6B8', backgroundColor: '#FFF6ED' }}>
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {quizResults?.scorePercent >= 80 ? '🏆' : quizResults?.scorePercent >= 60 ? '🥈' : quizResults?.scorePercent >= 40 ? '🥉' : '📚'}
                </div>
                <div className="text-4xl font-bold mb-2" style={{ color: '#5D4E75' }}>
                  {quizResults?.scorePercent?.toFixed(1)}%
                </div>
                <div className="text-lg font-semibold" style={{ color: '#A67C8A' }}>
                  {quizResults?.scorePercent >= 80 ? 'Excellent! 🎉' : quizResults?.scorePercent >= 60 ? 'Good Job! 👍' : quizResults?.scorePercent >= 40 ? 'Keep Trying! 💪' : 'Study More! 📖'}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border-2 transform hover:scale-105 transition-all duration-300" style={{ borderColor: '#FFB6C1', backgroundColor: '#FFF6ED' }}>
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <div className="text-4xl font-bold mb-2" style={{ color: '#5D4E75' }}>
                  {quizResults?.correctAnswers}/{quizResults?.totalQuestions}
                </div>
                <div className="text-lg font-semibold" style={{ color: '#A67C8A' }}>
                  {quizResults?.correctAnswers === quizResults?.totalQuestions ? 'Perfect Score! 🌟' : `${quizResults?.correctAnswers} Correct! 🎊`}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border-2 transform hover:scale-105 transition-all duration-300" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <div className="text-4xl font-bold mb-2" style={{ color: '#5D4E75' }}>
                  {quizResults?.totalQuestions}
                </div>
                <div className="text-lg font-semibold" style={{ color: '#A67C8A' }}>
                  Total Questions 📚
                </div>
              </div>
            </div>
          </div>

          {/* Fun Statistics */}
          <div className="bg-white rounded-3xl p-8 border-2 mb-8" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#5D4E75' }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm" style={{ backgroundColor: '#FFB6C1' }}>📊</span>
              Fun Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#E8F5E8' }}>
                <div className="text-3xl mb-2">🎪</div>
                <div className="text-2xl font-bold" style={{ color: '#5D4E75' }}>
                  {Math.round((quizResults?.correctAnswers / quizResults?.totalQuestions) * 100)}%
                </div>
                <div className="text-sm" style={{ color: '#A67C8A' }}>Accuracy Rate</div>
              </div>
              
              <div className="text-center p-4 rounded-xl transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#FFE8E8' }}>
                <div className="text-3xl mb-2">🧩</div>
                <div className="text-2xl font-bold" style={{ color: '#5D4E75' }}>
                  {quizResults?.totalQuestions - quizResults?.correctAnswers}
                </div>
                <div className="text-sm" style={{ color: '#A67C8A' }}>Mistakes Made</div>
              </div>
              
              <div className="text-center p-4 rounded-xl transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#FFF0E6' }}>
                <div className="text-3xl mb-2">🎊</div>
                <div className="text-2xl font-bold" style={{ color: '#5D4E75' }}>
                  {Math.round(30 - (timeLeft / 60))} min
                </div>
                <div className="text-sm" style={{ color: '#A67C8A' }}>Time Taken</div>
              </div>
              
              <div className="text-center p-4 rounded-xl transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#E8F5E8' }}>
                <div className="text-3xl mb-2">💭</div>
                <div className="text-2xl font-bold" style={{ color: '#5D4E75' }}>
                  {quizResults?.scorePercent >= 80 ? 'A+' : quizResults?.scorePercent >= 60 ? 'B' : quizResults?.scorePercent >= 40 ? 'C' : 'D'}
                </div>
                <div className="text-sm" style={{ color: '#A67C8A' }}>Grade</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-3xl p-8 border-2 mb-8" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
            <h2 className="text-2xl font-bold mb-8 flex items-center" style={{ color: '#5D4E75' }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm" style={{ backgroundColor: '#FFB6C1' }}>📋</span>
              Detailed Results
            </h2>
            
            <div className="space-y-6">
              {quizResults?.results?.map((result, index) => (
                <div
                  key={result.questionId}
                  className="p-6 rounded-3xl transform hover:scale-105 transition-all duration-500"
                  style={{
                    borderColor: isTextResult(result) 
                      ? (result.aiScore !== null && result.aiScore >= 7 ? '#A8E6CF' : result.aiScore !== null && result.aiScore >= 5 ? '#FFD93D' : '#FFB3BA')
                      : (result.isCorrect ? '#B8E6B8' : '#FFB6C1'),
                    backgroundColor: isTextResult(result)
                      ? (result.aiScore !== null && result.aiScore >= 7 ? '#F0FFF4' : result.aiScore !== null && result.aiScore >= 5 ? '#FFFBF0' : '#FFF5F5')
                      : (result.isCorrect ? '#F0FFF0' : '#FFF0F0'),
                    borderWidth: isTextResult(result) ? '3px' : '2px',
                    boxShadow: isTextResult(result) 
                      ? '0 8px 25px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)' 
                      : '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300 shadow-lg"
                         style={{ 
                           backgroundColor: isTextResult(result)
                             ? (result.aiScore !== null && result.aiScore >= 7 ? '#A8E6CF' : result.aiScore !== null && result.aiScore >= 5 ? '#FFD93D' : '#FFB3BA')
                             : (result.isCorrect ? '#B8E6B8' : '#FFB6C1')
                         }}>
                      <span className="text-2xl">
                        {isTextResult(result) 
                          ? (result.aiScore !== null && result.aiScore >= 7 ? '🎯' : result.aiScore !== null && result.aiScore >= 5 ? '📖' : '📋')
                          : (result.isCorrect ? '✅' : '❌')
                        }
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      {/* Special header for essay questions */}
                      {isTextResult(result) && (
                        <div className="mb-6 p-4 rounded-2xl transform hover:scale-105 transition-all duration-300" style={{ 
                          backgroundColor: '#FFF9F3',
                          border: '2px solid #F4E4C1',
                          boxShadow: '0 4px 12px rgba(244, 228, 193, 0.3)'
                        }}>
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: '#FFB6C1' }}>
                              <span className="text-xl">📄</span>
                            </div>
                            <div>
                              <span className="text-lg font-bold" style={{ color: '#8B5A96', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                ESSAY QUESTION
                              </span>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold transform hover:scale-110 transition-all duration-200 ${
                                  result.aiScore !== null && result.aiScore >= 7 ? 'bg-green-200 text-green-800' : 
                                  result.aiScore !== null && result.aiScore >= 5 ? 'bg-yellow-200 text-yellow-800' : 
                                  'bg-red-200 text-red-800'
                                }`}>
                                  {result.aiScore !== null && result.aiScore >= 7 ? '🌟 Excellent' : 
                                   result.aiScore !== null && result.aiScore >= 5 ? '👍 Good' : '📚 Needs Improvement'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium" style={{ color: '#A67C8A' }}>
                            🤖 AI-Graded with detailed rubric feedback
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg font-bold" style={{ color: '#5D4E75' }}>
                          Question {index + 1}
                        </span>
                        <span className="text-2xl">
                          {isTextResult(result) 
                            ? (result.aiScore !== null && result.aiScore >= 7 ? '🌟' : result.aiScore !== null && result.aiScore >= 5 ? '👍' : '📚')
                            : (result.isCorrect ? '🎊' : '💭')
                          }
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-4 leading-relaxed" style={{ color: '#5D4E75' }}>
                        {result.questionContent}
                      </h3>
                      
                      <div className="space-y-3">
                        {/* Your Answer Section */}
                        <div className="p-3 rounded-xl" style={{ backgroundColor: result.isCorrect ? '#E8F5E8' : '#FFE8E8' }}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-bold" style={{ color: '#A67C8A' }}>
                              {isTextResult(result) ? '🖋️ Your Text Answer:' : (result.isCorrect ? '🎪 Your Answer:' : '🧩 Your Answer:')}
                            </span>
                          </div>
                          <p className="text-sm font-medium" style={{ color: result.isCorrect ? '#5D4E75' : '#D4A574' }}>
                            {result.selectedAnswer}
                          </p>
                        </div>
                        
                        {/* AI Scoring for Text Questions */}
                        {isTextResult(result) && (
                          <div className="p-6 rounded-3xl border-2 transform hover:scale-102 transition-all duration-300" style={{ 
                            backgroundColor: '#FFF9F3', 
                            borderColor: '#F4E4C1',
                            boxShadow: '0 6px 20px rgba(244, 228, 193, 0.4)'
                          }}>
                            <div className="flex items-center space-x-4 mb-6">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{ backgroundColor: '#FFB6C1' }}>
                                <span className="text-2xl">🤖</span>
                              </div>
                              <div>
                                <h4 className="text-2xl font-bold" style={{ color: '#8B5A96', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                  AI Analysis & Scoring
                                </h4>
                                <p className="text-sm font-medium" style={{ color: '#A67C8A' }}>
                                  🎨 Detailed evaluation with rubric breakdown
                                </p>
                              </div>
                            </div>
                            
                            {/* Overall Score */}
                            {result.aiScore !== null && (
                              <div className="mb-6 p-5 rounded-2xl border-2 transform hover:scale-105 transition-all duration-300" style={{ 
                                backgroundColor: '#FFFFFF', 
                                borderColor: '#E8D5B7',
                                boxShadow: '0 4px 15px rgba(232, 213, 183, 0.3)'
                              }}>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: '#FFB6C1' }}>
                                      <span className="text-xl">🎯</span>
                                    </div>
                                    <div>
                                      <span className="text-3xl font-bold" style={{ color: '#8B5A96', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        {result.aiScore}/10
                                      </span>
                                      <span className="ml-3 text-lg font-medium" style={{ color: '#A67C8A' }}>
                                        Overall Score
                                      </span>
                                    </div>
                                  </div>
                                  <span className={`px-4 py-2 rounded-2xl text-sm font-bold transform hover:scale-110 transition-all duration-200 ${
                                    result.aiScore >= 8 ? 'bg-green-200 text-green-800' : 
                                    result.aiScore >= 6 ? 'bg-yellow-200 text-yellow-800' : 
                                    'bg-red-200 text-red-800'
                                  }`}>
                                    {result.aiScore >= 8 ? '🌟 Excellent' : result.aiScore >= 6 ? '👍 Good' : '📚 Needs Improvement'}
                                  </span>
                                </div>
                                <div className="w-full h-5 rounded-full" style={{ backgroundColor: '#F4E4C1' }}>
                                  <div 
                                    className="h-5 rounded-full transition-all duration-700 ease-out"
                                    style={{ 
                                      width: `${(result.aiScore / 10) * 100}%`,
                                      backgroundColor: result.aiScore >= 8 ? '#A8E6CF' : result.aiScore >= 6 ? '#FFD93D' : '#FFB3BA'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {/* AI Comment */}
                            {result.aiComment && (
                              <div className="mb-6 p-5 rounded-2xl border-2 transform hover:scale-102 transition-all duration-300" style={{ 
                                backgroundColor: '#FFF5E6', 
                                borderColor: '#FFD93D',
                                boxShadow: '0 4px 15px rgba(255, 217, 61, 0.3)'
                              }}>
                                <div className="flex items-center space-x-3 mb-4">
                                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: '#FFD93D' }}>
                                    <span className="text-xl">💭</span>
                                  </div>
                                  <span className="text-xl font-bold" style={{ color: '#8B5A96', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    AI Feedback
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed font-medium" style={{ color: '#5D4E75' }}>
                                  {result.aiComment}
                                </p>
                              </div>
                            )}

                            {/* Rubric Breakdown */}
                            {result.rubric && result.rubric.length > 0 && (
                              <div className="mb-6">
                                <div className="flex items-center space-x-4 mb-5">
                                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{ backgroundColor: '#A8E6CF' }}>
                                    <span className="text-2xl">📈</span>
                                  </div>
                                  <span className="text-2xl font-bold" style={{ color: '#8B5A96', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    Detailed Scoring Breakdown
                                  </span>
                                </div>
                                <div className="space-y-5">
                                  {result.rubric.map((criterion: any, index: number) => (
                                    <div key={index} className="p-5 rounded-2xl border-2 transform hover:scale-102 transition-all duration-300" style={{ 
                                      backgroundColor: '#FFFFFF', 
                                      borderColor: '#E8D5B7',
                                      boxShadow: '0 4px 15px rgba(232, 213, 183, 0.2)'
                                    }}>
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-bold transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: '#FFB6C1' }}>
                                            {index + 1}
                                          </div>
                                          <span className="text-lg font-bold" style={{ color: '#8B5A96', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                            Criterion {index + 1}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-2xl font-bold" style={{ color: '#8B5A96' }}>
                                            {criterion.awarded}/{criterion.maxPoints}
                                          </span>
                                          <span className="text-sm ml-2 font-medium" style={{ color: '#A67C8A' }}>
                                            points
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="mb-4">
                                        <p className="text-sm font-medium mb-3" style={{ color: '#5D4E75' }}>
                                          {criterion.criterion}
                                        </p>
                                        <div className="w-full h-4 rounded-full" style={{ backgroundColor: '#F4E4C1' }}>
                                          <div 
                                            className="h-4 rounded-full transition-all duration-700 ease-out"
                                            style={{ 
                                              width: `${(criterion.awarded / criterion.maxPoints) * 100}%`,
                                              backgroundColor: (criterion.awarded / criterion.maxPoints) >= 0.8 ? '#A8E6CF' : 
                                                             (criterion.awarded / criterion.maxPoints) >= 0.6 ? '#FFD93D' : '#FFB3BA'
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                      
                                      {criterion.comment && (
                                        <div className="p-4 rounded-2xl transform hover:scale-102 transition-all duration-300" style={{ backgroundColor: '#FFF9F3' }}>
                                          <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: '#FFB6C1' }}>
                                              <span className="text-sm">💬</span>
                                            </div>
                                            <p className="text-sm leading-relaxed font-medium" style={{ color: '#5D4E75' }}>
                                              {criterion.comment}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Rubric Definition */}
                            {result.rubricDefinition && result.rubricDefinition.length > 0 && (
                              <div className="p-5 rounded-2xl border-2 transform hover:scale-102 transition-all duration-300" style={{ 
                                backgroundColor: '#F0FFF4', 
                                borderColor: '#A8E6CF',
                                boxShadow: '0 4px 15px rgba(168, 230, 207, 0.3)'
                              }}>
                                <div className="flex items-center space-x-4 mb-5">
                                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300" style={{ backgroundColor: '#A8E6CF' }}>
                                    <span className="text-2xl">📋</span>
                                  </div>
                                  <span className="text-2xl font-bold" style={{ color: '#8B5A96', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    Scoring Criteria
                                  </span>
                                </div>
                                <div className="space-y-4">
                                  {result.rubricDefinition.map((definition: any, index: number) => (
                                    <div key={index} className="p-4 rounded-2xl transform hover:scale-102 transition-all duration-300" style={{ backgroundColor: '#FFFFFF' }}>
                                      <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-white text-sm font-bold transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: '#A8E6CF' }}>
                                          {index + 1}
                                        </div>
                                        <span className="text-lg font-bold" style={{ color: '#8B5A96', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                          Criterion {index + 1}
                                        </span>
                                        <span className="px-3 py-1 rounded-2xl text-sm font-bold transform hover:scale-110 transition-all duration-200" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                                          {Math.round(definition.weight * 100)}% weight
                                        </span>
                                      </div>
                                      <div className="mb-3 text-sm font-medium" style={{ color: '#5D4E75' }}>
                                        {definition.criterion}
                                      </div>
                                      <div className="text-xs p-3 rounded-2xl transform hover:scale-102 transition-all duration-300" style={{ backgroundColor: '#F0FFF4', color: '#A67C8A' }}>
                                        <span className="font-bold">🔑 Keywords:</span> {definition.keywordsCsv}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Correct Answer for Multiple Choice Questions */}
                        {!isTextResult(result) && !result.isCorrect && (
                          <div className="p-3 rounded-xl" style={{ backgroundColor: '#E8F5E8' }}>
                            <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-bold" style={{ color: '#A67C8A' }}>
                              🎪 Correct Answer:
                            </span>
                            </div>
                            <p className="text-sm font-medium" style={{ color: '#5D4E75' }}>
                              {result.correctAnswer}
                            </p>
                          </div>
                        )}
                        
                        {/* Status Display */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium" style={{ color: '#A67C8A' }}>
                            Status:
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isTextResult(result) 
                              ? (result.aiScore !== null && result.aiScore >= 7 ? 'bg-green-100 text-green-800' : result.aiScore !== null && result.aiScore >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')
                              : (result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
                          }`}>
                            {isTextResult(result) 
                              ? (result.aiScore !== null && result.aiScore >= 7 ? 'Excellent! 🌟' : result.aiScore !== null && result.aiScore >= 5 ? 'Good! 👍' : 'Needs Improvement 📚')
                              : (result.isCorrect ? 'Correct! 🎊' : 'Incorrect 💭')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {(quizResults?.feedback || quizResults?.reviewText) && (
            <div className="bg-white rounded-3xl p-8 border-2 transform hover:scale-102 transition-all duration-300" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#5D4E75' }}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm" style={{ backgroundColor: '#FFB6C1' }}>🤖</span>
                AI Feedback & Analysis
              </h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-lg font-bold" style={{ color: '#5D4E75' }}>Performance Summary</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#E8F5E8' }}>
                    <div className="text-2xl font-bold" style={{ color: '#5D4E75' }}>
                      {quizResults?.correctAnswers}/{quizResults?.totalQuestions}
                    </div>
                    <div className="text-sm" style={{ color: '#A67C8A' }}>Correct Answers</div>
                  </div>
                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#FFE8E8' }}>
                    <div className="text-2xl font-bold" style={{ color: '#5D4E75' }}>
                      {quizResults?.totalQuestions - quizResults?.correctAnswers}
                    </div>
                    <div className="text-sm" style={{ color: '#A67C8A' }}>Incorrect Answers</div>
                  </div>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-lg font-bold" style={{ color: '#5D4E75' }}>Quick Summary</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#E8F5E8' }}>
                    <div className="text-lg font-bold" style={{ color: '#5D4E75' }}>
                      {quizResults?.scorePercent >= 80 ? 'Excellent! 🏆' : quizResults?.scorePercent >= 60 ? 'Good! 👍' : quizResults?.scorePercent >= 40 ? 'Fair! 💪' : 'Needs Work! 📚'}
                    </div>
                    <div className="text-xs" style={{ color: '#A67C8A' }}>Overall Performance</div>
                  </div>
                  <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#FFF0E6' }}>
                    <div className="text-lg font-bold" style={{ color: '#5D4E75' }}>
                      {quizResults?.totalQuestions - quizResults?.correctAnswers} Mistakes
                    </div>
                    <div className="text-xs" style={{ color: '#A67C8A' }}>Areas to Improve</div>
                  </div>
                  <div className="text-center p-3 rounded-xl" style={{ backgroundColor: '#E8F5E8' }}>
                    <div className="text-lg font-bold" style={{ color: '#5D4E75' }}>
                      {quizResults?.scorePercent >= 80 ? 'Mastered! 🌟' : quizResults?.scorePercent >= 60 ? 'Almost There! 🎯' : 'Keep Learning! 📖'}
                    </div>
                    <div className="text-xs" style={{ color: '#A67C8A' }}>Learning Status</div>
                  </div>
                </div>
              </div>
              
              {/* Review Text Section */}
              {quizResults?.reviewText && (
                <div className="bg-white rounded-3xl p-8 border-2 mb-8 transform hover:scale-102 transition-all duration-300" style={{ borderColor: '#D4A574', backgroundColor: '#FFF9F3' }}>
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:opacity-90 transition-all duration-300"
                    onClick={() => toggleSection('reviewText')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFB6C1' }}>
                        <span className="text-2xl">📋</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: '#5D4E75' }}>Detailed Review</h3>
                        <p className="text-sm" style={{ color: '#A67C8A' }}>Comprehensive analysis of your performance</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium" style={{ color: '#5D4E75' }}>
                        {expandedSections.reviewText ? 'Hide' : 'Show'}
                      </span>
                      <span className="text-2xl transform transition-transform duration-300" style={{ 
                        transform: expandedSections.reviewText ? 'rotate(180deg)' : 'rotate(0deg)' 
                      }}>
                        🔽
                      </span>
                    </div>
                  </div>
                  
                  {expandedSections.reviewText && (
                    <div className="mt-6 p-6 rounded-2xl border-2 transform hover:scale-101 transition-all duration-300" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
                      <div className="prose max-w-none">
                        <div 
                          className="text-sm leading-relaxed"
                          style={{ color: '#5D4E75' }}
                          dangerouslySetInnerHTML={{
                            __html: quizResults.reviewText
                              .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #5D4E75; font-weight: bold;">$1</strong>')
                              .replace(/\*(.*?)\*/g, '<span style="color: #A67C8A; font-style: italic;">$1</span>')
                              .replace(/^(\d+\.\s)/gm, '<div style="margin: 8px 0; padding: 8px; background-color: #F0FFF0; border-left: 3px solid #B8E6B8; border-radius: 4px;"><strong style="color: #5D4E75;">$1</strong>')
                              .replace(/^(\*\s)/gm, '<div style="margin: 4px 0; padding-left: 16px; position: relative;"><span style="color: #FFB6C1; font-size: 16px; position: absolute; left: 0;">•</span>')
                              .replace(/\n/g, '<br>')
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white rounded-3xl p-8 border-2 transform hover:scale-102 transition-all duration-300" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF9F3' }}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#D4A574' }}>
                    <span className="text-2xl">🔬</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#5D4E75' }}>Detailed Analysis</h3>
                    <p className="text-sm" style={{ color: '#A67C8A' }}>Question-by-question breakdown</p>
                  </div>
                </div>
                
                {/* Question-by-Question Analysis */}
                <div className="space-y-6">
                  {(() => {
                    const feedback = quizResults?.feedback
                    const questions: Array<{
                      title: string;
                      whyWrong: string;
                      whyCorrect: string;
                      index: number;
                    }> = []
                    
                    // Extract individual questions from feedback
                    const questionMatches = feedback.match(/Q\d+:.*?(?=Q\d+:|$)/gs)
                    if (questionMatches) {
                      questionMatches.forEach((questionText, index) => {
                        const lines = questionText.split('\n').filter(line => line.trim())
                        if (lines.length > 0) {
                          const questionTitle = lines[0].trim()
                          const whyWrong = lines.find(line => line.includes('Why your answer was wrong'))?.replace('* **Why your answer was wrong:**', '').trim() || ''
                          const whyCorrect = lines.find(line => line.includes('Why the correct answer is right'))?.replace('* **Why the correct answer is right:**', '').trim() || ''
                          
                          questions.push({
                            title: questionTitle,
                            whyWrong: whyWrong,
                            whyCorrect: whyCorrect,
                            index: index + 1
                          })
                        }
                      })
                    }
                    
                    return questions.map((question, qIndex) => (
                      <div key={qIndex} className="p-6 rounded-2xl border-2 transform hover:scale-102 transition-all duration-300" style={{ borderColor: '#F4E4C1', backgroundColor: '#FFF6ED' }}>
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: '#FFB6C1' }}>
                            <span className="text-lg font-bold" style={{ color: '#5D4E75' }}>
                              Q{question.index}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-lg font-bold mb-4 leading-relaxed" style={{ color: '#5D4E75' }}>
                              {question.title}
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFE8E8' }}>
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xl">🚫</span>
                                  <span className="font-bold text-sm" style={{ color: '#5D4E75' }}>Why Your Answer Was Wrong</span>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: '#A67C8A' }}>
                                  {question.whyWrong}
                                </p>
                              </div>
                              
                              <div className="p-4 rounded-xl" style={{ backgroundColor: '#E8F5E8' }}>
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xl">✅</span>
                                  <span className="font-bold text-sm" style={{ color: '#5D4E75' }}>Why The Correct Answer Is Right</span>
                                </div>
                                <p className="text-sm leading-relaxed" style={{ color: '#A67C8A' }}>
                                  {question.whyCorrect}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
                
                {/* General Tips Section */}
                <div className="mt-8 p-6 rounded-2xl border-2 transform hover:scale-101 transition-all duration-300" style={{ borderColor: '#B8E6B8', backgroundColor: '#F0FFF0' }}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#B8E6B8' }}>
                      <span className="text-xl">🎯</span>
                    </div>
                    <h4 className="text-lg font-bold" style={{ color: '#5D4E75' }}>Key Learning Points</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#FFF6ED' }}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">🎪</span>
                        <span className="font-bold text-sm" style={{ color: '#5D4E75' }}>Focus Areas</span>
                      </div>
                      <ul className="text-sm space-y-1" style={{ color: '#A67C8A' }}>
                        <li>• Understand transition period concepts</li>
                        <li>• Study foundational texts (Communist Manifesto)</li>
                        <li>• Learn about Lenin's contributions</li>
                        <li>• Review Vietnamese Constitution 2013</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-xl transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#FFF6ED' }}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">🧩</span>
                        <span className="font-bold text-sm" style={{ color: '#5D4E75' }}>Study Recommendations</span>
                      </div>
                      <ul className="text-sm space-y-1" style={{ color: '#A67C8A' }}>
                        <li>• Re-read the Communist Manifesto</li>
                        <li>• Study Lenin's works on imperialism</li>
                        <li>• Research Vietnam's socialist development</li>
                        <li>• Practice with similar questions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* General Feedback */}
              {quizResults?.feedback && (
                <div className="bg-white rounded-3xl p-8 border-2 mb-8 transform hover:scale-102 transition-all duration-300" style={{ borderColor: '#B8E6B8', backgroundColor: '#FFF9F3' }}>
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:opacity-90 transition-all duration-300"
                    onClick={() => toggleSection('feedback')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#B8E6B8' }}>
                        <span className="text-2xl">💭</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: '#5D4E75' }}>Comprehensive Feedback</h3>
                        <p className="text-sm" style={{ color: '#A67C8A' }}>Detailed analysis and improvement suggestions</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium" style={{ color: '#5D4E75' }}>
                        {expandedSections.feedback ? 'Hide' : 'Show'}
                      </span>
                      <span className="text-2xl transform transition-transform duration-300" style={{ 
                        transform: expandedSections.feedback ? 'rotate(180deg)' : 'rotate(0deg)' 
                      }}>
                        🔽
                      </span>
                    </div>
                  </div>
                  
                  {expandedSections.feedback && (
                    <div className="mt-6 p-6 rounded-2xl border-2 transform hover:scale-101 transition-all duration-300" style={{ borderColor: '#D4A574', backgroundColor: '#FFF6ED' }}>
                      <div className="prose max-w-none">
                        <div 
                          className="text-sm leading-relaxed"
                          style={{ color: '#5D4E75' }}
                          dangerouslySetInnerHTML={{
                            __html: quizResults.feedback
                              .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #5D4E75; font-weight: bold;">$1</strong>')
                              .replace(/\*(.*?)\*/g, '<span style="color: #A67C8A; font-style: italic;">$1</span>')
                              .replace(/^(\d+\.\s)/gm, '<div style="margin: 8px 0; padding: 8px; background-color: #F0FFF0; border-left: 3px solid #B8E6B8; border-radius: 4px;"><strong style="color: #5D4E75;">$1</strong>')
                              .replace(/^(\*\s)/gm, '<div style="margin: 4px 0; padding-left: 16px; position: relative;"><span style="color: #FFB6C1; font-size: 16px; position: absolute; left: 0;">•</span>')
                              .replace(/\n/g, '<br>')
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cheating Analysis */}
              {quizResults?.cheatingAnalysis && (
                <div className="bg-white rounded-3xl p-8 border-2 mb-8 transform hover:scale-102 transition-all duration-300" style={{ borderColor: '#FFA07A', backgroundColor: '#FFF9F3' }}>
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:opacity-90 transition-all duration-300"
                    onClick={() => toggleSection('cheatingAnalysis')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFA07A' }}>
                        <span className="text-2xl">🕵️</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: '#5D4E75' }}>Security Analysis</h3>
                        <p className="text-sm" style={{ color: '#A67C8A' }}>Behavioral patterns and integrity check</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium" style={{ color: '#5D4E75' }}>
                        {expandedSections.cheatingAnalysis ? 'Hide' : 'Show'}
                      </span>
                      <span className="text-2xl transform transition-transform duration-300" style={{ 
                        transform: expandedSections.cheatingAnalysis ? 'rotate(180deg)' : 'rotate(0deg)' 
                      }}>
                        🔽
                      </span>
                    </div>
                  </div>
                  
                  {expandedSections.cheatingAnalysis && (
                    <div className="mt-6 p-6 rounded-2xl border-2 transform hover:scale-101 transition-all duration-300" style={{ borderColor: '#D4A574', backgroundColor: '#FFF6ED' }}>
                      <div className="prose max-w-none">
                        <div 
                          className="text-sm leading-relaxed"
                          style={{ color: '#5D4E75' }}
                          dangerouslySetInnerHTML={{
                            __html: quizResults.cheatingAnalysis
                              .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #5D4E75; font-weight: bold;">$1</strong>')
                              .replace(/\*(.*?)\*/g, '<span style="color: #A67C8A; font-style: italic;">$1</span>')
                              .replace(/^(\d+\.\s)/gm, '<div style="margin: 8px 0; padding: 8px; background-color: #F0FFF0; border-left: 3px solid #B8E6B8; border-radius: 4px;"><strong style="color: #5D4E75;">$1</strong>')
                              .replace(/^(\*\s)/gm, '<div style="margin: 4px 0; padding-left: 16px; position: relative;"><span style="color: #FFB6C1; font-size: 16px; position: absolute; left: 0;">•</span>')
                              .replace(/\n/g, '<br>')
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6 p-6 rounded-2xl border-2 transform hover:scale-101 transition-all duration-300" style={{ borderColor: '#B8E6B8', backgroundColor: '#F0FFF0' }}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#B8E6B8' }}>
                    <span className="text-xl">🎊</span>
                  </div>
                  <span className="font-bold text-lg" style={{ color: '#5D4E75' }}>Study Tips</span>
                </div>
                <ul className="text-sm space-y-1" style={{ color: '#A67C8A' }}>
                  <li>• Review the concepts you missed</li>
                  <li>• Practice with similar questions</li>
                  <li>• Take notes on key points</li>
                  <li>• Try the quiz again to improve!</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
