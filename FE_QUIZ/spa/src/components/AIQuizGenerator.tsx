import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllSubjects, generateAutoQuiz, generateMixedQuiz, AutoQuizRequest, SubjectResponse } from '@/api/quizClient'
import { useAuth } from '@/hooks/useAuth'
import { isStudent, isTeacher } from '@/utils/apiTransform'
import QuizPreview from './QuizPreview'

interface AIQuizGeneratorProps {
  onClose: () => void
}

export default function AIQuizGenerator({ onClose }: AIQuizGeneratorProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<SubjectResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [generatedQuiz, setGeneratedQuiz] = useState<{ quizId: string; result: string } | null>(null)
  const [quizType, setQuizType] = useState<'mcq' | 'mixed'>('mcq')
  const [formData, setFormData] = useState<AutoQuizRequest>({
    subjectId: '',
    quizTitle: '',
    topic: '',
    numQuestions: 5,
    shuffleAnswers: true,
    mix: {
      mcq: 3,
      short: 1,
      essay: 1
    },
    defaults: {
      shortMax: 10,
      essayMax: 10
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjectsData = await getAllSubjects()
        setSubjects(subjectsData)
      } catch (error) {
        console.error('Error loading subjects:', error)
      }
    }
    
    // Debug: Check authentication status
    const token = localStorage.getItem('access_token')
    console.log('AI Generator - Auth token status:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
    })
    
    loadSubjects()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.subjectId) {
      newErrors.subjectId = 'Please select a subject'
    }

    if (!formData.quizTitle.trim()) {
      newErrors.quizTitle = 'Quiz title is required'
    } else if (formData.quizTitle.length < 3) {
      newErrors.quizTitle = 'Quiz title must be at least 3 characters'
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required'
    } else if (formData.topic.length < 3) {
      newErrors.topic = 'Topic must be at least 3 characters'
    }

    if (formData.numQuestions < 1 || formData.numQuestions > 50) {
      newErrors.numQuestions = 'Number of questions must be between 1 and 50'
    }

    if (quizType === 'mixed' && formData.mix) {
      const total = (formData.mix.mcq || 0) + (formData.mix.short || 0) + (formData.mix.essay || 0)
      if (total !== formData.numQuestions) {
        newErrors.mix = `Total questions in mix (${total}) must equal numQuestions (${formData.numQuestions})`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGenerate = async () => {
    if (!validateForm()) return

    setIsGenerating(true)
    try {
      let response
      if (quizType === 'mcq') {
        // Remove mix and defaults for MCQ-only generation
        const { mix, defaults, ...mcqData } = formData
        response = await generateAutoQuiz(mcqData)
      } else {
        response = await generateMixedQuiz(formData)
      }

      console.log('AI Quiz generated successfully:', response)
      
      // Store the generated quiz data and show preview
      setGeneratedQuiz({
        quizId: response.quizId,
        result: response.result || 'No content available'
      })
      setShowPreview(true)
    } catch (error) {
      console.error('Error generating AI quiz:', error)
      
      // Handle specific error cases
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        if (error.message.includes('No access token found')) {
          errorMessage = 'Please login first to use AI features'
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication failed. Please login again'
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = 'You do not have permission to use AI features'
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'AI service is temporarily unavailable. Please try again later'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(`Failed to generate AI quiz: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleInputChange = (field: keyof AutoQuizRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleMixChange = (field: keyof NonNullable<AutoQuizRequest['mix']>, value: number) => {
    setFormData(prev => ({
      ...prev,
      mix: {
        ...prev.mix,
        [field]: value
      } as NonNullable<AutoQuizRequest['mix']>
    }))
  }

  const handleDefaultsChange = (field: keyof NonNullable<AutoQuizRequest['defaults']>, value: number) => {
    setFormData(prev => ({
      ...prev,
      defaults: {
        ...prev.defaults,
        [field]: value
      } as NonNullable<AutoQuizRequest['defaults']>
    }))
  }

  const handleEditQuiz = (quizId: string) => {
    // Debug user role detection
    console.log('AIQuizGenerator - User:', user)
    console.log('AIQuizGenerator - isStudent(user):', user ? isStudent(user) : false)
    console.log('AIQuizGenerator - isTeacher(user):', user ? isTeacher(user) : false)
    console.log('AIQuizGenerator - User roles:', user?.roles)
    
    // Route based on user role
    if (user && isStudent(user)) {
      console.log('AIQuizGenerator - Navigating to student edit:', `/student/quiz/${quizId}/edit`)
      navigate(`/student/quiz/${quizId}/edit`)
    } else if (user && isTeacher(user)) {
      console.log('AIQuizGenerator - Navigating to teacher edit:', `/teacher/quiz/${quizId}/edit`)
      navigate(`/teacher/quiz/${quizId}/edit`)
    } else {
      // Fallback to student route if role is unclear
      console.log('AIQuizGenerator - Fallback to student edit:', `/student/quiz/${quizId}/edit`)
      navigate(`/student/quiz/${quizId}/edit`)
    }
    onClose()
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setGeneratedQuiz(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-pink-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  AI Quiz Generator
                </h2>
                <p className="text-gray-600 font-medium">Let AI create your quiz automatically</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Quiz Type Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
              <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">🎯</span>
              Quiz Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setQuizType('mcq')}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  quizType === 'mcq'
                    ? 'border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-pink-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-blue-400 rounded-xl flex items-center justify-center">
                    <span className="text-xl">✏️</span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800">Multiple Choice Only</h4>
                    <p className="text-sm text-gray-600">Generate MCQ questions only</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setQuizType('mixed')}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  quizType === 'mixed'
                    ? 'border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-pink-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-300 to-purple-400 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🎨</span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800">Mixed Questions</h4>
                    <p className="text-sm text-gray-600">Generate MCQ, Short Answer & Essay</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">📖</span>
                  Subject <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => handleInputChange('subjectId', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 ${
                    errors.subjectId ? 'border-red-300' : 'border-pink-200'
                  }`}
                  title="Select a subject"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
                {errors.subjectId && (
                  <p className="text-sm text-red-600 font-medium">{errors.subjectId}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">✏️</span>
                  Quiz Title <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.quizTitle}
                  onChange={(e) => handleInputChange('quizTitle', e.target.value)}
                  placeholder="Enter quiz title..."
                  className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 ${
                    errors.quizTitle ? 'border-red-300' : 'border-pink-200'
                  }`}
                />
                {errors.quizTitle && (
                  <p className="text-sm text-red-600 font-medium">{errors.quizTitle}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">🎯</span>
                  Topic <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder="Enter topic (e.g., 'Chiến dịch Tây Bắc')..."
                  className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 ${
                    errors.topic ? 'border-red-300' : 'border-pink-200'
                  }`}
                />
                {errors.topic && (
                  <p className="text-sm text-red-600 font-medium">{errors.topic}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">💭</span>
                  Number of Questions <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.numQuestions}
                  onChange={(e) => handleInputChange('numQuestions', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 ${
                    errors.numQuestions ? 'border-red-300' : 'border-pink-200'
                  }`}
                  title="Total number of questions to generate"
                  placeholder="5"
                />
                {errors.numQuestions && (
                  <p className="text-sm text-red-600 font-medium">{errors.numQuestions}</p>
                )}
              </div>
            </div>

            {/* Mixed Quiz Configuration */}
            {quizType === 'mixed' && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">🎨</span>
                  Question Mix Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">MCQ Questions</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.mix?.mcq || 0}
                      onChange={(e) => handleMixChange('mcq', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      title="Number of MCQ questions"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Short Answer</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.mix?.short || 0}
                      onChange={(e) => handleMixChange('short', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      title="Number of short answer questions"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Essay Questions</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.mix?.essay || 0}
                      onChange={(e) => handleMixChange('essay', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      title="Number of essay questions"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Short Answer Max Score</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.defaults?.shortMax || 10}
                      onChange={(e) => handleDefaultsChange('shortMax', parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      title="Maximum score for short answer questions"
                      placeholder="10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Essay Max Score</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.defaults?.essayMax || 10}
                      onChange={(e) => handleDefaultsChange('essayMax', parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                      title="Maximum score for essay questions"
                      placeholder="10"
                    />
                  </div>
                </div>

                {errors.mix && (
                  <p className="text-sm text-red-600 font-medium mt-2">{errors.mix}</p>
                )}
              </div>
            )}

            {/* Shuffle Answers */}
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-100">
              <input
                type="checkbox"
                id="shuffleAnswers"
                checked={formData.shuffleAnswers || false}
                onChange={(e) => handleInputChange('shuffleAnswers', e.target.checked)}
                className="w-5 h-5 text-pink-600 border-2 border-pink-300 rounded-lg focus:ring-pink-500"
              />
              <label htmlFor="shuffleAnswers" className="text-sm font-bold text-gray-700 flex items-center">
                <span className="w-5 h-5 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">🔀</span>
                Shuffle answer options
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="group px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 disabled:from-pink-300 disabled:to-purple-400 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span className="text-xl group-hover:rotate-12 transition-transform duration-300">🤖</span>
                  <span>Generate AI Quiz</span>
                  <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Preview Modal */}
      {showPreview && generatedQuiz && (
        <QuizPreview
          quizData={generatedQuiz}
          onClose={handleClosePreview}
          onEdit={handleEditQuiz}
        />
      )}
    </div>
  )
}
