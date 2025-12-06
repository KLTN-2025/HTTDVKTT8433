import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UserProfile } from '@/types/auth'
import { isTeacher } from '@/utils/apiTransform'
import { TeacherNavigation } from '@/components/TeacherNavigation'
import { getAllSubjects, createQuiz } from '@/api/quizClient'
import AIQuizGenerator from '@/components/AIQuizGenerator'
import DocumentImportQuiz from '@/components/DocumentImportQuiz'

interface Subject {
  id: string
  name: string
  description?: string
}

interface CreateQuizRequest {
  title: string
  subjectId: string
  durationMinutes: number
  hasNoTimeLimit: boolean
  expirationTime?: string
  numQuestions?: number
  answersPerQuestion?: number
}

export default function TeacherCreateQuiz() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showDocumentImport, setShowDocumentImport] = useState(false)
  const [formData, setFormData] = useState<CreateQuizRequest>({
    title: '',
    subjectId: '',
    durationMinutes: 30,
    hasNoTimeLimit: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadSubjects = async () => {
      setIsLoading(true)
      try {
        console.log('Loading subjects from API...')
        const subjectsData = await getAllSubjects()
        console.log('Loaded subjects:', subjectsData)
        setSubjects(subjectsData as Subject[])
      } catch (error) {
        console.error('Error loading subjects:', error)
        setSubjects([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSubjects()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-reverse-slow"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Quiz title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Quiz title must be at least 3 characters'
    }

    if (!formData.subjectId) {
      newErrors.subjectId = 'Please select a subject'
    }

    if (!formData.hasNoTimeLimit && formData.durationMinutes <= 0) {
      newErrors.durationMinutes = 'Duration must be greater than 0'
    }

    if (formData.numQuestions && (formData.numQuestions < 1 || formData.numQuestions > 50)) {
      newErrors.numQuestions = 'Number of questions must be between 1 and 50'
    }

    if (formData.answersPerQuestion && (formData.answersPerQuestion < 2 || formData.answersPerQuestion > 6)) {
      newErrors.answersPerQuestion = 'Answers per question must be between 2 and 6'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Creating quiz:', formData)
      
      const quizResponse = await createQuiz(formData)
      console.log('Quiz created successfully:', quizResponse)
      
      const quizId = quizResponse.id || 'new-quiz-id'
      navigate(`/teacher/quiz/${quizId}/edit`)
    } catch (error) {
      console.error('Error creating quiz:', error)
      alert(`Failed to create quiz: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateQuizRequest, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-reverse-slow"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading subjects...</p>
        </div>
      </div>
    )
  }

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
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="group relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-200 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-500 group-hover:rotate-6 border-4 border-amber-300 animate-heartbeat btn-magic">
                  <span className="text-2xl group-hover:animate-bounce filter drop-shadow-lg animate-wiggle">🎯</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500"></div>
              </div>
              <div>
                <h1 className="text-3xl font-rounded font-bold text-rainbow tracking-tight animate-heartbeat">
                  🎓 Create Quiz Magic
                </h1>
                <p className="text-lg text-amber-700 font-rounded font-bold flex items-center space-x-2 animate-fade-in">
                  <span className="text-xl animate-bounce filter drop-shadow-md">✨</span>
                  <span className="tracking-wide">🌟 Build Your Learning Universe 🌟</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAIGenerator(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-rounded font-bold text-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl border-4 border-purple-300 hover:border-purple-400 btn-magic"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span className="text-xl group-hover:rotate-180 transition-transform duration-500 animate-wiggle">🤖</span>
                  <span className="tracking-wide">AI Magic</span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">✨</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
              
              <button
                onClick={() => setShowDocumentImport(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-rounded font-bold text-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl border-4 border-blue-300 hover:border-blue-400 btn-magic"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span className="text-xl group-hover:rotate-180 transition-transform duration-500 animate-wiggle">📄</span>
                  <span className="tracking-wide">Import</span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">📚</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
              
              <button
                onClick={() => navigate('/teacher/quizzes')}
                className="group relative overflow-hidden bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-rounded font-bold text-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl border-4 border-gray-300 hover:border-gray-400 btn-magic"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span className="text-xl group-hover:rotate-180 transition-transform duration-500 animate-wiggle">↩️</span>
                  <span className="tracking-wide">Cancel</span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform duration-300">🚪</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quiz Information */}
          <div className="gradient-pastel-yellow backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-4 border-yellow-300 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-200 rounded-full -translate-y-10 translate-x-10 opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-200 rounded-full translate-y-8 -translate-x-8 opacity-40 animate-bounce"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-300 to-orange-300 rounded-xl flex items-center justify-center shadow-lg border-4 border-amber-400 animate-pulse btn-magic">
                  <span className="text-xl filter drop-shadow-lg animate-wiggle">✏️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-rounded font-bold text-rainbow tracking-wide animate-heartbeat">
                    ✨ Quiz Information
                  </h2>
                  <p className="text-base text-amber-700 font-rounded font-bold animate-fade-in">🌟 Set up your magical quiz 🌟</p>
                </div>
              </div>
            
              <div className="space-y-8">
                {/* Quiz Title */}
                <div className="space-y-3">
                  <label className="block text-base font-rounded font-bold text-amber-800 flex items-center tracking-wide animate-fade-in">
                    <span className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-2 text-white text-xs border-4 border-amber-500 animate-wiggle">✏️</span>
                    Quiz Title <span className="text-rose-500 ml-1 text-lg animate-pulse">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter magical quiz title..."
                    className={`w-full px-4 py-3 rounded-xl border-4 transition-all duration-300 text-base font-rounded font-bold ${
                      errors.title 
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200' 
                        : 'border-amber-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200'
                    }`}
                  />
                  {errors.title && <p className="text-rose-600 text-sm font-rounded font-bold mt-1 flex items-center animate-fade-in"><span className="mr-1 animate-wiggle">⚠️</span>{errors.title}</p>}
                </div>

                {/* Subject Selection */}
                <div className="space-y-3">
                  <label className="block text-base font-rounded font-bold text-amber-800 flex items-center tracking-wide animate-fade-in">
                    <span className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-2 text-white text-xs border-4 border-amber-500 animate-wiggle">📖</span>
                    Subject <span className="text-rose-500 ml-1 text-lg animate-pulse">*</span>
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => handleInputChange('subjectId', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-4 transition-all duration-300 text-base font-rounded font-bold ${
                      errors.subjectId 
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200' 
                        : 'border-amber-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200'
                    }`}
                    title="Select subject"
                  >
                    <option value="">Select a magical subject...</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {errors.subjectId && <p className="text-rose-600 text-sm font-rounded font-bold mt-1 flex items-center animate-fade-in"><span className="mr-1 animate-wiggle">⚠️</span>{errors.subjectId}</p>}
                </div>

                {/* Number of Questions */}
                <div className="space-y-3">
                  <label className="block text-base font-rounded font-bold text-amber-800 flex items-center tracking-wide animate-fade-in">
                    <span className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-2 text-white text-xs border-4 border-amber-500 animate-wiggle">💭</span>
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.numQuestions}
                    onChange={(e) => handleInputChange('numQuestions', parseInt(e.target.value) || 5)}
                    className={`w-full px-4 py-3 rounded-xl border-4 transition-all duration-300 text-base font-rounded font-bold ${
                      errors.numQuestions 
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200' 
                        : 'border-amber-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200'
                    }`}
                    title="Number of questions in the quiz"
                  />
                  {errors.numQuestions && <p className="text-rose-600 text-sm font-rounded font-bold mt-1 flex items-center animate-fade-in"><span className="mr-1 animate-wiggle">⚠️</span>{errors.numQuestions}</p>}
                  <p className="mt-2 text-sm text-amber-600 font-rounded font-bold flex items-center animate-fade-in">
                    <span className="mr-1 animate-wiggle">💡</span>Recommended: 5-20 questions for most quizzes
                  </p>
                </div>

                {/* Answers per Question */}
                <div className="space-y-3">
                  <label className="block text-base font-rounded font-bold text-amber-800 flex items-center tracking-wide animate-fade-in">
                    <span className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-2 text-white text-xs border-4 border-amber-500 animate-wiggle">🔢</span>
                    Answers per Question
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="6"
                    value={formData.answersPerQuestion}
                    onChange={(e) => handleInputChange('answersPerQuestion', parseInt(e.target.value) || 4)}
                    className={`w-full px-4 py-3 rounded-xl border-4 transition-all duration-300 text-base font-rounded font-bold ${
                      errors.answersPerQuestion 
                        ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200' 
                        : 'border-amber-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200'
                    }`}
                    title="Number of answer choices per question"
                  />
                  {errors.answersPerQuestion && <p className="text-rose-600 text-sm font-rounded font-bold mt-1 flex items-center animate-fade-in"><span className="mr-1 animate-wiggle">⚠️</span>{errors.answersPerQuestion}</p>}
                  <p className="mt-2 text-sm text-amber-600 font-rounded font-bold flex items-center animate-fade-in">
                    <span className="mr-1 animate-wiggle">💡</span>Recommended: 4 answers per question
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Time Settings */}
          <div className="gradient-pastel-pink backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-4 border-pink-300 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-pink-200 rounded-full -translate-y-10 translate-x-10 opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-rose-200 rounded-full translate-y-8 -translate-x-8 opacity-40 animate-bounce"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-rose-300 rounded-xl flex items-center justify-center shadow-lg border-4 border-pink-400 animate-pulse btn-magic">
                  <span className="text-xl filter drop-shadow-lg animate-wiggle">⏰</span>
                </div>
                <div>
                  <h2 className="text-2xl font-rounded font-bold text-rainbow tracking-wide animate-heartbeat">
                    ✨ Time Settings
                  </h2>
                  <p className="text-base text-pink-700 font-rounded font-bold animate-fade-in">🌟 Configure your magical timing 🌟</p>
                </div>
              </div>
            
              <div className="space-y-8">
                {/* Time Limit Toggle */}
                <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border-4 border-pink-200 hover:border-pink-300 transition-all duration-300">
                  <input
                    type="checkbox"
                    id="hasNoTimeLimit"
                    checked={formData.hasNoTimeLimit}
                    onChange={(e) => handleInputChange('hasNoTimeLimit', e.target.checked)}
                    className="w-6 h-6 text-pink-600 border-4 border-pink-300 rounded-lg focus:ring-pink-500 focus:ring-2 transition-all duration-300"
                  />
                  <label htmlFor="hasNoTimeLimit" className="text-lg font-rounded font-bold text-pink-800 flex items-center cursor-pointer animate-fade-in">
                    <span className="w-8 h-8 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full flex items-center justify-center mr-4 text-white text-sm border-4 border-pink-400 animate-wiggle">∞</span>
                    No time limit (students can take as long as they need)
                  </label>
                </div>

                {/* Duration */}
                {!formData.hasNoTimeLimit && (
                  <div className="space-y-3">
                    <label className="block text-base font-rounded font-bold text-pink-800 flex items-center tracking-wide animate-fade-in">
                      <span className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center mr-2 text-white text-xs border-4 border-pink-500 animate-wiggle">⏰</span>
                      Duration (minutes) <span className="text-rose-500 ml-1 text-lg animate-pulse">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={formData.durationMinutes}
                      onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3 rounded-xl border-4 transition-all duration-300 text-base font-rounded font-bold ${
                        errors.durationMinutes 
                          ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-2 focus:ring-rose-200' 
                          : 'border-pink-200 bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-200'
                      }`}
                      title="Quiz duration in minutes"
                    />
                    {errors.durationMinutes && <p className="text-rose-600 text-sm font-rounded font-bold mt-1 flex items-center animate-fade-in"><span className="mr-1 animate-wiggle">⚠️</span>{errors.durationMinutes}</p>}
                    <p className="mt-2 text-sm text-pink-600 font-rounded font-bold flex items-center animate-fade-in">
                      <span className="mr-1 animate-wiggle">💡</span>Recommended: 15-60 minutes for most quizzes
                    </p>
                  </div>
                )}

                {/* Expiration Time */}
                <div className="space-y-3">
                  <label className="block text-base font-rounded font-bold text-pink-800 flex items-center tracking-wide animate-fade-in">
                    <span className="w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center mr-2 text-white text-xs border-4 border-pink-500 animate-wiggle">📅</span>
                    Quiz Expiration (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expirationTime}
                    onChange={(e) => handleInputChange('expirationTime', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-4 border-pink-200 bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all duration-300 text-base font-rounded font-bold"
                    title="Quiz expiration date and time"
                  />
                  <p className="mt-2 text-sm text-pink-600 font-rounded font-bold flex items-center animate-fade-in">
                    <span className="mr-1 animate-wiggle">💡</span>Leave empty for no expiration date
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="gradient-pastel-blue backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-4 border-blue-300 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -translate-y-10 translate-x-10 opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-cyan-200 rounded-full translate-y-8 -translate-x-8 opacity-40 animate-bounce"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-xl flex items-center justify-center shadow-lg border-4 border-blue-400 animate-pulse btn-magic">
                  <span className="text-xl filter drop-shadow-lg animate-wiggle">📋</span>
                </div>
                <div>
                  <h2 className="text-2xl font-rounded font-bold text-rainbow tracking-wide animate-heartbeat">
                    ✨ Next Steps
                  </h2>
                  <p className="text-base text-blue-700 font-rounded font-bold animate-fade-in">🌟 Your magical journey awaits 🌟</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-4 border-blue-200 hover:border-blue-300 transition-all duration-300 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-400 group-hover:scale-110 transition-transform duration-300 btn-magic">
                    <span className="text-lg font-rounded font-bold text-white animate-wiggle">1</span>
                  </div>
                  <div>
                    <h3 className="font-rounded font-bold text-blue-800 text-xl mb-2 animate-fade-in">Create Quiz Structure</h3>
                    <p className="text-blue-600 font-rounded font-bold animate-fade-in">After creating, you'll be taken to the quiz editor to add questions and answers.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-4 border-blue-200 hover:border-blue-300 transition-all duration-300 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-400 group-hover:scale-110 transition-transform duration-300 btn-magic">
                    <span className="text-lg font-rounded font-bold text-white animate-wiggle">2</span>
                  </div>
                  <div>
                    <h3 className="font-rounded font-bold text-blue-800 text-xl mb-2 animate-fade-in">Add Questions</h3>
                    <p className="text-blue-600 font-rounded font-bold animate-fade-in">Create multiple choice, true/false, or essay questions for your quiz.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-4 border-blue-200 hover:border-blue-300 transition-all duration-300 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full flex items-center justify-center shadow-lg border-4 border-blue-400 group-hover:scale-110 transition-transform duration-300 btn-magic">
                    <span className="text-lg font-rounded font-bold text-white animate-wiggle">3</span>
                  </div>
                  <div>
                    <h3 className="font-rounded font-bold text-blue-800 text-xl mb-2 animate-fade-in">Preview & Publish</h3>
                    <p className="text-blue-600 font-rounded font-bold animate-fade-in">Review your quiz and publish it for students to take.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-6 pt-4 border-t-4 border-amber-200">
            <button
              type="button"
              onClick={() => navigate('/teacher/quizzes')}
              className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 rounded-xl font-rounded font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border-4 border-gray-300 hover:border-gray-400 btn-magic"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative overflow-hidden px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-rounded font-bold text-base transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border-4 border-amber-300 hover:border-amber-400 disabled:border-gray-300 btn-magic"
            >
              <span className="relative z-10 flex items-center space-x-2">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Creating Magic...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg group-hover:rotate-180 transition-transform duration-300 animate-wiggle">✨</span>
                    <span>Create Universe</span>
                    <span className="text-base group-hover:translate-x-1 transition-transform duration-200">🚀</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>
      </div>

      {/* AI Quiz Generator Modal */}
      {showAIGenerator && (
        <AIQuizGenerator onClose={() => setShowAIGenerator(false)} />
      )}

      {/* Document Import Modal */}
      {showDocumentImport && (
        <DocumentImportQuiz 
          onClose={() => setShowDocumentImport(false)}
          onSuccess={(quizId) => {
            setShowDocumentImport(false)
            navigate(`/teacher/quiz/${quizId}/edit`)
          }}
        />
      )}
    </div>
  )
}