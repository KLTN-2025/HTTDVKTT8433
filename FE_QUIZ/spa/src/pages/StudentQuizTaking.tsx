import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getAllQuizzes, startQuiz as startQuizAPI, submitQuiz, StartQuizResponse, QuizSubmitRequest, QuizResultResponse, getMyQuizHistory, getMyReviewQuizzes } from '@/api/quizClient'
import { StudentNavigation } from '@/components/StudentNavigation'
import { askAI } from '@/api/aiService'

// New Doodle Icons Component
const DoodleIcons = ({ name, size = 24, className = "" }: { name: string, size?: number, className?: string }) => {
  const iconStyle = {
    width: size,
    height: size,
    fill: 'none',
    stroke: '#374151',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }

  const icons: { [key: string]: React.ReactNode } = {
    // Quiz Pencil - cute pencil with sparkles
    'quiz-pencil': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M12 20h9" stroke="#374151" strokeWidth="1.5"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="#FBB6CE" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="6" cy="6" r="1" fill="#FDE68A"/>
        <circle cx="18" cy="6" r="1" fill="#FDE68A"/>
        <circle cx="12" cy="2" r="0.5" fill="#FDE68A"/>
      </svg>
    ),
    
    // Brain Thinking - cute brain with sparkles
    'brain-thinking': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 2.5 2.5 0 0 1-1.04-1.04 2.5 2.5 0 0 1 0-3.84 2.5 2.5 0 0 1 1.04-1.04 2.5 2.5 0 0 1 2.96-3.08A2.5 2.5 0 0 1 9.5 2z" fill="#A7F3D0" stroke="#374151" strokeWidth="1.5"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 2.5 2.5 0 0 0 1.04-1.04 2.5 2.5 0 0 0 0-3.84 2.5 2.5 0 0 0-1.04-1.04 2.5 2.5 0 0 0-2.96-3.08A2.5 2.5 0 0 0 14.5 2z" fill="#C7D2FE" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="16" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="12" cy="4" r="0.5" fill="#FDE68A"/>
      </svg>
    ),
    
    // Clock Timer - cute clock with sparkles
    'clock-timer': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10" fill="#FBB6CE" stroke="#374151" strokeWidth="1.5"/>
        <path d="M12 6v6l4 2" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="1" fill="#374151"/>
        <circle cx="6" cy="6" r="0.5" fill="#FDE68A"/>
        <circle cx="18" cy="6" r="0.5" fill="#FDE68A"/>
        <circle cx="6" cy="18" r="0.5" fill="#FDE68A"/>
        <circle cx="18" cy="18" r="0.5" fill="#FDE68A"/>
      </svg>
    ),
    
    // Trophy Winner - cute trophy with sparkles
    'trophy-winner': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" fill="#FDE68A" stroke="#374151" strokeWidth="1.5"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" fill="#FDE68A" stroke="#374151" strokeWidth="1.5"/>
        <path d="M6 9v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" fill="#A7F3D0" stroke="#374151" strokeWidth="1.5"/>
        <path d="M12 15v4" stroke="#374151" strokeWidth="1.5"/>
        <path d="M8 19h8" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="16" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="12" cy="4" r="0.5" fill="#FDE68A"/>
      </svg>
    ),
    
    // Book Study - cute book with sparkles
    'book-study': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="#FBB6CE" stroke="#374151" strokeWidth="1.5"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#A7F3D0" stroke="#374151" strokeWidth="1.5"/>
        <line x1="8" y1="6" x2="18" y2="6" stroke="#374151" strokeWidth="1"/>
        <line x1="8" y1="10" x2="16" y2="10" stroke="#374151" strokeWidth="1"/>
        <line x1="8" y1="14" x2="14" y2="14" stroke="#374151" strokeWidth="1"/>
        <circle cx="10" cy="18" r="1" fill="#FDE68A"/>
        <circle cx="6" cy="6" r="0.5" fill="#FDE68A"/>
        <circle cx="18" cy="6" r="0.5" fill="#FDE68A"/>
      </svg>
    ),
    
    // Star Achievement - cute star with sparkles
    'star-achievement': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#FDE68A" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1" fill="#FBB6CE"/>
        <circle cx="16" cy="8" r="1" fill="#FBB6CE"/>
        <circle cx="8" cy="16" r="1" fill="#FBB6CE"/>
        <circle cx="16" cy="16" r="1" fill="#FBB6CE"/>
        <circle cx="12" cy="4" r="0.5" fill="#FBB6CE"/>
      </svg>
    ),
    
    // Lightbulb Idea - cute lightbulb with sparkles
    'lightbulb-idea': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z" fill="#FDE68A" stroke="#374151" strokeWidth="1.5"/>
        <path d="M12 2C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" fill="#A7F3D0" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="16" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="12" cy="4" r="0.5" fill="#FDE68A"/>
      </svg>
    ),
    
    // Rocket Launch - cute rocket with sparkles
    'rocket-launch': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#FBB6CE" stroke="#374151" strokeWidth="1.5"/>
        <path d="M12 15l-3-3a5 5 0 0 1 7.54-6.54L12 15z" fill="#A7F3D0" stroke="#374151" strokeWidth="1.5"/>
        <path d="M12 15l3-3a5 5 0 0 0-7.54-6.54L12 15z" fill="#C7D2FE" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="16" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="12" cy="4" r="0.5" fill="#FDE68A"/>
      </svg>
    ),
    
    // Puzzle Piece - cute puzzle with sparkles
    'puzzle-piece': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <path d="M19.439 13.269l-1.27 1.27a2.5 2.5 0 0 1-3.54 0l-1.27-1.27a2.5 2.5 0 0 1 0-3.54l1.27-1.27a2.5 2.5 0 0 1 3.54 0l1.27 1.27a2.5 2.5 0 0 1 0 3.54z" fill="#FBB6CE" stroke="#374151" strokeWidth="1.5"/>
        <path d="M9.5 2.5a2.5 2.5 0 0 1 5 0v2.5a2.5 2.5 0 0 1-5 0V2.5z" fill="#A7F3D0" stroke="#374151" strokeWidth="1.5"/>
        <path d="M9.5 19a2.5 2.5 0 0 1 5 0v2.5a2.5 2.5 0 0 1-5 0V19z" fill="#C7D2FE" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="16" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="8" cy="16" r="1" fill="#FDE68A"/>
        <circle cx="16" cy="16" r="1" fill="#FDE68A"/>
      </svg>
    ),
    
    // Target Goal - cute target with sparkles
    'target-goal': (
      <svg viewBox="0 0 24 24" style={iconStyle} className={className}>
        <circle cx="12" cy="12" r="10" fill="#FBB6CE" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="6" fill="#A7F3D0" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="2" fill="#FDE68A" stroke="#374151" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="16" cy="8" r="1" fill="#FDE68A"/>
        <circle cx="8" cy="16" r="1" fill="#FDE68A"/>
        <circle cx="16" cy="16" r="1" fill="#FDE68A"/>
      </svg>
    )
  }

  return <>{icons[name] || <div>Icon not found</div>}</>
}

export default function StudentQuizTaking() {
  const { user: authUser, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const quizId = searchParams.get('quizId')
  const quizType = searchParams.get('type') // 'review' or 'normal'
  const reviewQuizId = searchParams.get('reviewQuizId')
  const [user, setUser] = useState<any>(null)
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([])
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Set<string>>(new Set())
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [quizSession, setQuizSession] = useState<StartQuizResponse | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [expandedSections, setExpandedSections] = useState({
    reviewText: false,
    feedback: false,
    cheatingAnalysis: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUserClickedSubmit, setHasUserClickedSubmit] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showQuizSelection, setShowQuizSelection] = useState(true)
  const [quizResults, setQuizResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  useEffect(() => {
    if (!loading && authUser) {
      setUser({
        name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || authUser.email,
        email: authUser.email,
        role: 'ROLE_STUDENT'
      })
      if (quizType === 'review') {
        loadReviewQuizzes()
      } else {
        loadAvailableQuizzes()
      }
    }
  }, [authUser, loading, quizType])

  // Auto-start quiz if quizId is provided in URL
  useEffect(() => {
    if (quizId && availableQuizzes.length > 0) {
      const quiz = availableQuizzes.find(q => q.id === quizId)
      if (quiz) {
        console.log('🚀 Auto-starting quiz from URL:', quiz)
        handleStartQuiz(quiz)
      }
    }
  }, [quizId, availableQuizzes])

  const loadAvailableQuizzes = async () => {
    setIsLoading(true)
    try {
      const quizzes = await getAllQuizzes()
      if (Array.isArray(quizzes)) {
        setAvailableQuizzes(quizzes)
      } else {
        console.warn('Quizzes is not an array:', quizzes)
        setAvailableQuizzes([])
      }
      
      // Load submitted quizzes
      const history = await getMyQuizHistory()
      if (Array.isArray(history)) {
        const submittedIds = new Set(history.map((item: any) => item.quizId))
        setSubmittedQuizzes(submittedIds)
      } else {
        console.warn('Quiz history is not an array:', history)
        setSubmittedQuizzes(new Set())
      }
    } catch (error) {
      console.error('Error loading quizzes:', error)
      setAvailableQuizzes([])
      setSubmittedQuizzes(new Set())
    } finally {
      setIsLoading(false)
    }
  }

  const loadReviewQuizzes = async () => {
    setIsLoading(true)
    try {
      const reviewQuizList = await getMyReviewQuizzes()
      // Convert ReviewQuizResponse to Quiz format - EXACTLY like teacher
      const convertedQuizzes: any[] = reviewQuizList.map(reviewQuiz => ({
        id: reviewQuiz.baseQuizId, // Use baseQuizId as the main ID for starting quiz
        title: reviewQuiz.title,
        status: 'PUBLISHED', // Review quizzes are always available
        createdAt: reviewQuiz.createdAt,
        updatedAt: reviewQuiz.createdAt,
        targetCount: reviewQuiz.targetCount,
        aiToppedUp: reviewQuiz.aiToppedUp,
        baseQuizId: reviewQuiz.baseQuizId
      }))
      setAvailableQuizzes(convertedQuizzes)
      
      // Load submitted quizzes
      const history = await getMyQuizHistory()
      if (Array.isArray(history)) {
        const submittedIds = new Set(history.map((item: any) => item.quizId))
        setSubmittedQuizzes(submittedIds)
      } else {
        console.warn('Quiz history is not an array:', history)
        setSubmittedQuizzes(new Set())
      }
    } catch (error) {
      console.error('Error loading review quizzes:', error)
      setAvailableQuizzes([])
      setSubmittedQuizzes(new Set())
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartQuiz = async (quiz: any) => {
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

      const response = await startQuizAPI({ quizId: actualQuizId })
      console.log('Start quiz response:', response)
      setQuizSession(response)
      setSelectedQuiz({
        ...quiz,
        questions: response.questions,
        title: response.quizTitle
      })
      setShowQuizSelection(false)
      setTimeLeft(30 * 60) // Default 30 minutes timer
      setAnswers({})
      setTextAnswers({})
      
      // If this is a review quiz, update the quiz title to show it's a review
      if (quizType === 'review' && reviewQuizId) {
        setQuizSession(prev => prev ? {
          ...prev,
          quizTitle: `🔄 Review: ${prev.quizTitle}`
        } : null)
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
      alert('Có lỗi xảy ra khi bắt đầu bài kiểm tra. Vui lòng thử lại.')
    }
  }

  const handleSubmitQuiz = async () => {
    if (!quizSession || !selectedQuiz) return
    
    setIsSubmitting(true)
    try {
      // Validate data before submitting
      if (!selectedQuiz.id) {
        throw new Error('Quiz ID is missing')
      }
      
      if ((!answers || Object.keys(answers).length === 0) && (!textAnswers || Object.keys(textAnswers).length === 0)) {
        throw new Error('No answers provided')
      }
      
      // Convert answers to the format expected by the API
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: questionId,
        answer: answer
      }))
      
      // Add text answers for SHORT and ESSAY questions
      const textAnswersFormatted = Object.entries(textAnswers).map(([questionId, answer]) => ({
        questionId: questionId,
        answer: answer as string
      }))
      
      // Combine all answers
      const allAnswers = [...formattedAnswers, ...textAnswersFormatted]
      
      const submitData: QuizSubmitRequest = {
        submissionId: quizSession.submissionId,
        answers: allAnswers
      }
      
      console.log('Submitting quiz with data:', submitData)
      
      const result = await submitQuiz(submitData)
      setQuizResults(result)
      setShowResults(true)
      setShowQuizSelection(false)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAIChat = async () => {
    if (!aiMessage.trim()) return
    
    setAiLoading(true)
    try {
      const response = await askAI(aiMessage)
      setAiResponse(response)
      setAiMessage('')
    } catch (error) {
      console.error('Error with AI chat:', error)
      setAiResponse('Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.')
    } finally {
      setAiLoading(false)
    }
  }

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quizSession && !hasUserClickedSubmit) {
      handleSubmitQuiz()
    }
  }, [timeLeft, quizSession, hasUserClickedSubmit])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Beautiful floating shapes with enhanced animations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-rose-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-amber-200/30 rounded-full blur-xl animate-bounce" />
        
        <StudentNavigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative mx-auto w-32 h-32 mb-8">
                <div className="absolute inset-0 w-32 h-32 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animate-reverse-slow"></div>
                <div className="absolute inset-4 w-24 h-24 border-4 border-transparent border-t-rose-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl animate-bounce filter drop-shadow-lg animate-wiggle">🎯</span>
              </div>
              </div>
              <h3 className="text-2xl font-rounded font-bold text-amber-700 mb-2 tracking-wide animate-heartbeat">🔄 Loading Quiz Taking...</h3>
              <p className="text-lg text-amber-600 font-rounded font-bold animate-fade-in">✨ Preparing your quiz experience... ✨</p>
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 relative overflow-hidden">
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
      
      <StudentNavigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-20">
          <div className="relative">
            <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tight animate-fade-in">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent animate-pulse">
                🎯 Take Quiz 🎯
              </span>
            </h1>
            {/* Floating sparkles */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-pink-400 rounded-full animate-ping opacity-60"></div>
            <div className="absolute -top-2 -right-4 w-6 h-6 bg-purple-400 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute -bottom-4 -left-2 w-4 h-4 bg-amber-400 rounded-full animate-pulse opacity-60"></div>
            <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-rose-300 rounded-full animate-ping opacity-60"></div>
          </div>
          <p className="text-2xl md:text-3xl text-gray-700 mb-8 font-semibold leading-relaxed max-w-4xl mx-auto animate-slide-up">
            ✨ Practice and test your knowledge ✨
          </p>
        </div>

        {/* Loading when starting quiz from URL */}
        {quizId && isLoading && (
          <div className="text-center py-20">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 w-32 h-32 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animate-reverse-slow"></div>
              <div className="absolute inset-4 w-24 h-24 border-4 border-transparent border-t-rose-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl animate-bounce filter drop-shadow-lg animate-wiggle">🎯</span>
              </div>
            </div>
            <h3 className="text-2xl font-rounded font-bold text-amber-700 mb-2 tracking-wide animate-heartbeat">🔄 Starting Quiz...</h3>
            <p className="text-lg text-amber-600 font-rounded font-bold animate-fade-in">✨ Preparing your quiz session... ✨</p>
          </div>
        )}

        {/* Quiz Selection */}
        {showQuizSelection && !quizId && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent mb-4">
                🎯 Choose Quiz
              </h2>
              <p className="text-xl text-gray-600">Select a quiz to start taking</p>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="relative mx-auto w-32 h-32 mb-8">
                  <div className="absolute inset-0 w-32 h-32 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animate-reverse-slow"></div>
                  <div className="absolute inset-4 w-24 h-24 border-4 border-transparent border-t-rose-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl animate-bounce filter drop-shadow-lg animate-wiggle">🎯</span>
                </div>
                </div>
                <h3 className="text-2xl font-rounded font-bold text-amber-700 mb-2 tracking-wide animate-heartbeat">🔄 Loading Quizzes...</h3>
                <p className="text-lg text-amber-600 font-rounded font-bold animate-fade-in">✨ Preparing your quiz collection... ✨</p>
              </div>
            ) : availableQuizzes.length === 0 ? (
              <div className="text-center py-20">
                <div className="relative mx-auto w-32 h-32 mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-amber-300 animate-pulse">
                    <span className="text-6xl filter drop-shadow-lg animate-wiggle">🎯</span>
                </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                </div>
                <h3 className="text-4xl font-rounded font-bold text-amber-700 mb-4 tracking-wide animate-heartbeat">
                  {quizType === 'review' ? '🌟 No Review Quizzes Yet' : '🌟 No Quizzes Available'}
                </h3>
                <p className="text-xl text-amber-600 mb-8 font-rounded font-bold max-w-2xl mx-auto leading-relaxed animate-fade-in">
                  {quizType === 'review' 
                    ? '✨ Complete some quizzes to get personalized review quizzes! ✨'
                    : '✨ Contact your teacher to get assigned quizzes ✨'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableQuizzes.map((quiz, index) => {
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
                      className={`group relative bg-gradient-to-br ${colorClass} backdrop-blur-sm rounded-2xl shadow-lg p-6 border-4 transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:-rotate-1 hover-lift animate-fade-in-up overflow-hidden`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
                      <div className="relative">
                        {/* Quiz Header */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 border-4 btn-magic animate-float`}>
                            <span className="text-lg group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">{icon}</span>
                    </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-rounded font-bold text-gray-900 group-hover:text-rainbow transition-all duration-300 tracking-wide truncate animate-fade-in">
                      {quiz.title}
                    </h3>
                            <p className="text-sm text-gray-600 animate-fade-in">
                              {quizType === 'review' ? 'Personalized review quiz' : (quiz.description || 'Test your knowledge')}
                            </p>
                          </div>
                        </div>

                        {/* Quiz Info */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full flex items-center justify-center animate-float">
                              <span className="text-white text-xs animate-wiggle">⏰</span>
                            </span>
                            <span className="text-sm font-rounded font-bold text-gray-700 animate-fade-in">
                              {quiz.timeLimit || 30} minutes
                            </span>
                      </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full flex items-center justify-center animate-float-delayed">
                              <span className="text-white text-xs animate-wiggle">💭</span>
                            </span>
                            <span className="text-sm font-rounded font-bold text-gray-700 animate-fade-in">
                              {quizType === 'review' ? (quiz.targetCount || 0) : (quiz.questions?.length || quiz.questionCount || 0)} questions
                            </span>
                      </div>
                    </div>
                    
                        {/* Action Button */}
                    {submittedQuizzes.has(quiz.id) ? (
                          <div className="w-full bg-gradient-to-r from-emerald-400 to-green-400 text-white py-3 px-4 rounded-xl font-rounded font-bold text-center shadow-lg">
                            ✅ Completed
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-4 rounded-xl font-rounded font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-blue-300 hover:border-blue-400 flex items-center justify-center space-x-2"
                      >
                            <span className="text-lg group-hover:rotate-12 transition-transform duration-300">🚀</span>
                            <span className="text-sm font-bold">Start Quiz</span>
                      </button>
                    )}
                  </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Quiz Taking Interface */}
        {(!showQuizSelection || quizId) && !isLoading && quizSession && selectedQuiz && !showResults && (
          <div className="mb-20">
            {/* Quiz Header */}
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border-4 border-amber-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-3xl flex items-center justify-center shadow-2xl">
                    <span className="text-2xl animate-wiggle">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {selectedQuiz.title}
                    </h2>
                    <p className="text-gray-600 font-semibold">{selectedQuiz.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center animate-float">
                      <span className="text-white text-sm animate-wiggle">⏰</span>
                    </span>
                    <span className="text-2xl font-bold text-amber-600">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">Progress</span>
                  <span className="text-sm font-semibold text-amber-600">
                    {Math.round(((Object.keys(answers).length + Object.keys(textAnswers).length) / (selectedQuiz.questions?.length || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((Object.keys(answers).length + Object.keys(textAnswers).length) / (selectedQuiz.questions?.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {selectedQuiz.questions?.map((question: any, index: number) => (
                <div
                  key={question.id}
                  className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border-4 border-amber-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{question.content}</h3>
                      
                      {question.type === 'MCQ' && question.answers && question.answers.length > 0 ? (
                      <div className="space-y-3">
                          {question.answers.map((answer: any, answerIndex: number) => (
                          <label
                              key={answerIndex}
                              className="flex items-center space-x-3 p-4 rounded-2xl border-2 border-gray-200 hover:border-amber-300 cursor-pointer transition-all duration-300 hover:bg-amber-50"
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                                value={answer.content}
                                checked={answers[question.id] === answer.content}
                              onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                                className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                            />
                              <span className="text-gray-800 font-medium">{answer.content}</span>
                          </label>
                        ))}
                      </div>
                      ) : (question.type === 'SHORT' || question.type === 'ESSAY') ? (
                        <div className="space-y-3">
                          <textarea
                            value={textAnswers[question.id] || ''}
                            onChange={(e) => setTextAnswers({...textAnswers, [question.id]: e.target.value})}
                            placeholder={`Enter your ${question.type === 'SHORT' ? 'short' : 'detailed'} answer here...`}
                            rows={question.type === 'ESSAY' ? 8 : 4}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 resize-none"
                          />
                    </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No answer options available for this question type.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => {
                  setShowQuizSelection(true)
                  setAnswers({})
                  setTextAnswers({})
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-gray-300 hover:border-gray-400"
              >
                🚪 Exit Quiz
              </button>
              
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-gray-600">
                  📊 Progress: {Object.keys(answers).length + Object.keys(textAnswers).length}/{selectedQuiz.questions?.length || 0}
                </span>
                <span className="text-lg font-semibold text-amber-600">
                  ✨ {Math.round(((Object.keys(answers).length + Object.keys(textAnswers).length) / (selectedQuiz.questions?.length || 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center mt-12">
              <button
                onClick={() => {
                  setHasUserClickedSubmit(true)
                  handleSubmitQuiz()
                }}
                disabled={isSubmitting}
                className="px-12 py-6 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-3xl font-bold text-2xl transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-3xl disabled:transform-none border-4 border-amber-300 hover:border-amber-400"
              >
                {isSubmitting ? '🔄 Submitting...' : '🚀 Submit Quiz 🚀'}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && quizResults && (
          <div className="min-h-screen" style={{ backgroundColor: '#FFF6ED' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-200 via-orange-200 to-rose-200 py-8">
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
                      setShowResults(false)
                      setShowQuizSelection(true)
                      setSelectedQuiz(null)
                      setQuizSession(null)
                      setAnswers({})
                      setTextAnswers({})
                      setQuizResults(null)
                      setHasUserClickedSubmit(false)
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
                    <div className="text-sm font-semibold" style={{ color: '#A67C8A' }}>Accuracy Rate</div>
                </div>
                
                  <div className="text-center p-4 rounded-xl transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#FFE8E8' }}>
                    <div className="text-3xl mb-2">🧩</div>
                    <div className="text-2xl font-bold" style={{ color: '#5D4E75' }}>
                      {quizResults?.totalQuestions - quizResults?.correctAnswers}
                    </div>
                    <div className="text-sm font-semibold" style={{ color: '#A67C8A' }}>Mistakes Made</div>
                </div>
                
                  <div className="text-center p-4 rounded-xl transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#E8F0FF' }}>
                    <div className="text-3xl mb-2">🎊</div>
                    <div className="text-2xl font-bold" style={{ color: '#5D4E75' }}>
                      {Math.floor(quizResults?.timeSpent / 60)} min
                </div>
                    <div className="text-sm font-semibold" style={{ color: '#A67C8A' }}>Time Taken</div>
              </div>
              
                  <div className="text-center p-4 rounded-xl transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#FFF0E8' }}>
                    <div className="text-3xl mb-2">💭</div>
                    <div className="text-2xl font-bold" style={{ color: '#5D4E75' }}>
                      {quizResults?.scorePercent >= 90 ? 'A+' : quizResults?.scorePercent >= 80 ? 'A' : quizResults?.scorePercent >= 70 ? 'B' : quizResults?.scorePercent >= 60 ? 'C' : 'D'}
                    </div>
                    <div className="text-sm font-semibold" style={{ color: '#A67C8A' }}>Grade</div>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-white rounded-3xl p-8 border-2 mb-8" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#5D4E75' }}>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm" style={{ backgroundColor: '#FFB6C1' }}>📋</span>
                  Detailed Results
                </h2>
                
                <div className="space-y-6">
                  {quizResults?.results?.map((result: any, index: number) => (
                    <div key={index} className="p-6 rounded-2xl border-2 transform hover:scale-102 transition-all duration-300" style={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: result.isCorrect ? '#B8E6B8' : '#FFB3BA',
                      boxShadow: '0 4px 15px rgba(232, 213, 183, 0.2)'
                    }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-bold transform hover:rotate-12 transition-all duration-300" style={{ backgroundColor: result.isCorrect ? '#B8E6B8' : '#FFB3BA' }}>
                            {index + 1}
                          </div>
                          <span className="text-lg font-bold" style={{ color: '#5D4E75' }}>
                            Question {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {result.isCorrect ? (
                            <span className="text-green-600 font-bold">✅</span>
                          ) : (
                            <span className="text-red-600 font-bold">❌</span>
                          )}
                          <span className="text-sm font-semibold" style={{ color: result.isCorrect ? '#4A9B4A' : '#D32F2F' }}>
                            {result.isCorrect ? 'Correct! 🎊' : 'Incorrect 💭'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-lg font-semibold mb-3" style={{ color: '#5D4E75' }}>
                          {result.questionContent}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9F3' }}>
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-lg">🧩</span>
                              <span className="font-semibold" style={{ color: '#5D4E75' }}>Your Answer:</span>
                            </div>
                            <p className="text-sm" style={{ color: '#A67C8A' }}>{result.selectedAnswer}</p>
                          </div>
                          
                          {!result.isCorrect && (
                            <div className="p-4 rounded-xl" style={{ backgroundColor: '#F0FFF4' }}>
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-lg">🎪</span>
                                <span className="font-semibold" style={{ color: '#5D4E75' }}>Correct Answer:</span>
                              </div>
                              <p className="text-sm" style={{ color: '#A67C8A' }}>{result.correctAnswer}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI Feedback */}
              {quizResults?.feedback && (
                <div className="bg-white rounded-3xl p-8 border-2 mb-8" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
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

                  {/* Detailed Review */}
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
                              __html: (quizResults.reviewText || quizResults.feedback)
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

                  {/* Detailed Analysis */}
                  <div className="bg-white rounded-3xl p-8 border-2 transform hover:scale-102 transition-all duration-300" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF9F3' }}>
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:opacity-90 transition-all duration-300"
                      onClick={() => toggleSection('feedback')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#D4A574' }}>
                          <span className="text-2xl">🔬</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold" style={{ color: '#5D4E75' }}>Detailed Analysis</h3>
                          <p className="text-sm" style={{ color: '#A67C8A' }}>Question-by-question breakdown</p>
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
                      <div className="mt-6 space-y-6">
                        <div className="p-6 rounded-2xl border-2" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
                          <h4 className="text-lg font-bold mb-4" style={{ color: '#5D4E75' }}>🎯 Key Learning Points</h4>
                          <div className="space-y-3">
                            <div className="p-4 rounded-xl" style={{ backgroundColor: '#F0FFF4' }}>
                              <h5 className="font-semibold mb-2" style={{ color: '#5D4E75' }}>🎪 Focus Areas</h5>
                              <ul className="text-sm space-y-1" style={{ color: '#A67C8A' }}>
                                <li>• Understand transition period concepts</li>
                                <li>• Study foundational texts (Communist Manifesto)</li>
                                <li>• Learn about Lenin's contributions</li>
                                <li>• Review Vietnamese Constitution 2013</li>
                              </ul>
                            </div>
                            <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9F3' }}>
                              <h5 className="font-semibold mb-2" style={{ color: '#5D4E75' }}>🧩 Study Recommendations</h5>
                              <ul className="text-sm space-y-1" style={{ color: '#A67C8A' }}>
                                <li>• Re-read the Communist Manifesto</li>
                                <li>• Study Lenin's works on imperialism</li>
                                <li>• Research Vietnam's socialist development</li>
                                <li>• Practice with similar questions</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        {/* Additional Analysis from reviewText */}
                        {quizResults.reviewText && (
                          <div className="p-6 rounded-2xl border-2" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
                            <h4 className="text-lg font-bold mb-4" style={{ color: '#5D4E75' }}>💭 Comprehensive Feedback</h4>
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
                        )}
                      </div>
                    )}
                  </div>

                  {/* Security Analysis */}
                  <div className="bg-white rounded-3xl p-8 border-2 transform hover:scale-102 transition-all duration-300" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF9F3' }}>
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:opacity-90 transition-all duration-300"
                      onClick={() => toggleSection('cheatingAnalysis')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFB6C1' }}>
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
                      <div className="mt-6 p-6 rounded-2xl border-2" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
                        <div className="text-sm leading-relaxed" style={{ color: '#5D4E75' }}>
                          {quizResults.cheatingAnalysis ? (
                            <div 
                              dangerouslySetInnerHTML={{
                                __html: quizResults.cheatingAnalysis
                                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #5D4E75; font-weight: bold;">$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<span style="color: #A67C8A; font-style: italic;">$1</span>')
                                  .replace(/^(\d+\.\s)/gm, '<div style="margin: 8px 0; padding: 8px; background-color: #F0FFF0; border-left: 3px solid #B8E6B8; border-radius: 4px;"><strong style="color: #5D4E75;">$1</strong>')
                                  .replace(/^(\*\s)/gm, '<div style="margin: 4px 0; padding-left: 16px; position: relative;"><span style="color: #FFB6C1; font-size: 16px; position: absolute; left: 0;">•</span>')
                                  .replace(/\n/g, '<br>')
                              }}
                            />
                          ) : (
                            <div>
                              <p className="mb-4">
                                <strong>Integrity Assessment:</strong> Your quiz completion shows normal learning patterns. 
                                Continue practicing to improve your understanding of the subject matter.
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl" style={{ backgroundColor: '#E8F5E8' }}>
                                  <div className="text-lg font-bold" style={{ color: '#5D4E75' }}>✅ Normal</div>
                                  <div className="text-sm" style={{ color: '#A67C8A' }}>Learning Pattern</div>
                                </div>
                                <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF0E6' }}>
                                  <div className="text-lg font-bold" style={{ color: '#5D4E75' }}>📚 Study</div>
                                  <div className="text-sm" style={{ color: '#A67C8A' }}>Recommended</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Study Tips */}
                  <div className="bg-white rounded-3xl p-8 border-2 transform hover:scale-102 transition-all duration-300" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF9F3' }}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#FFB6C1' }}>
                        <span className="text-2xl">🎊</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: '#5D4E75' }}>Study Tips</h3>
                        <p className="text-sm" style={{ color: '#A67C8A' }}>Personalized learning recommendations</p>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-2xl border-2" style={{ borderColor: '#E8D5B7', backgroundColor: '#FFF6ED' }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl" style={{ backgroundColor: '#F0FFF4' }}>
                            <div className="text-lg font-bold mb-2" style={{ color: '#5D4E75' }}>📚 Review Concepts</div>
                            <div className="text-sm" style={{ color: '#A67C8A' }}>Focus on areas you missed</div>
                          </div>
                          <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF9F3' }}>
                            <div className="text-lg font-bold mb-2" style={{ color: '#5D4E75' }}>🎯 Practice More</div>
                            <div className="text-sm" style={{ color: '#A67C8A' }}>Try similar questions</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-4 rounded-xl" style={{ backgroundColor: '#E8F5E8' }}>
                            <div className="text-lg font-bold mb-2" style={{ color: '#5D4E75' }}>📝 Take Notes</div>
                            <div className="text-sm" style={{ color: '#A67C8A' }}>Record key learning points</div>
                          </div>
                          <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF0E6' }}>
                            <div className="text-lg font-bold mb-2" style={{ color: '#5D4E75' }}>🔄 Retry Quiz</div>
                            <div className="text-sm" style={{ color: '#A67C8A' }}>Test your improvement</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setShowQuizSelection(true)
                    setSelectedQuiz(null)
                    setQuizSession(null)
                    setAnswers({})
                    setTextAnswers({})
                    setQuizResults(null)
                    setHasUserClickedSubmit(false)
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-amber-300 hover:border-amber-400"
                >
                  🔄 Take Another Quiz
                </button>
                <button
                  onClick={() => navigate('/student/dashboard')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-purple-300 hover:border-purple-400"
                >
                  🏠 Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Modal */}
        {showAIChat && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-amber-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-300 to-orange-300 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl animate-wiggle">💡</span>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    AI Support
                  </h2>
                </div>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-white rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                {aiResponse && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                  placeholder="Ask AI about the quiz..."
                  className="flex-1 px-4 py-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
                />
                <button
                  onClick={handleAIChat}
                  disabled={aiLoading}
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none border-2 border-amber-300 hover:border-amber-400"
                >
                  {aiLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}