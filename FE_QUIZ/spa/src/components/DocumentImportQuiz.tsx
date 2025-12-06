import React, { useState, useEffect } from 'react'
import { getAllSubjects, SubjectResponse, importQuizFromDocument, importMixedQuizFromDocument, DocumentImportRequest, DocumentImportMixedRequest } from '@/api/quizClient'

interface DocumentImportQuizProps {
  onClose: () => void
  onSuccess: (quizId: string) => void
}

type ImportType = 'mcq' | 'mixed'

interface ImportFormData {
  importType: ImportType
  subjectId: string
  title: string
  // MCQ only fields
  totalQuestions: number
  perChunk: number
  // Mixed fields
  mcqCount: number
  shortCount: number
  essayCount: number
  shortMax?: number
  essayMax?: number
  shuffle: boolean
  file: File | null
}

export default function DocumentImportQuiz({ onClose, onSuccess }: DocumentImportQuizProps) {
  const [subjects, setSubjects] = useState<SubjectResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragActive, setDragActive] = useState(false)
  
  const [formData, setFormData] = useState<ImportFormData>({
    importType: 'mcq',
    subjectId: '',
    title: '',
    totalQuestions: 10,
    perChunk: 5,
    mcqCount: 10,
    shortCount: 5,
    essayCount: 3,
    shortMax: 10,
    essayMax: 10,
    shuffle: true,
    file: null
  })

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjectsData = await getAllSubjects()
        setSubjects(subjectsData)
      } catch (error) {
        console.error('Error loading subjects:', error)
      }
    }
    
    loadSubjects()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.subjectId) {
      newErrors.subjectId = 'Please select a subject'
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Quiz title is required'
    }
    
    // Validate based on import type
    if (formData.importType === 'mcq') {
      if (formData.totalQuestions < 1 || formData.totalQuestions > 50) {
        newErrors.totalQuestions = 'Number of questions must be between 1 and 50'
      }
    } else {
      if (formData.mcqCount < 0 || formData.mcqCount > 30) {
        newErrors.mcqCount = 'MCQ count must be between 0 and 30'
      }
      if (formData.shortCount < 0 || formData.shortCount > 20) {
        newErrors.shortCount = 'Short answer count must be between 0 and 20'
      }
      if (formData.essayCount < 0 || formData.essayCount > 10) {
        newErrors.essayCount = 'Essay count must be between 0 and 10'
      }
      if (formData.mcqCount + formData.shortCount + formData.essayCount === 0) {
        newErrors.mixed = 'At least one question type must be selected'
      }
    }
    
    if (!formData.file) {
      newErrors.file = 'Please select a file to import'
    } else {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]
      const fileExtension = formData.file.name.toLowerCase().split('.').pop()
      const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx']
      
      if (!allowedTypes.includes(formData.file.type) && !allowedExtensions.includes(fileExtension || '')) {
        newErrors.file = 'Please select a valid file (PDF, DOC, DOCX, PPT, PPTX)'
      }
      if (formData.file.size > 10 * 1024 * 1024) { // 10MB limit
        newErrors.file = 'File size must be less than 10MB'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ImportFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileSelect = (file: File) => {
    handleInputChange('file', file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsUploading(true)
    setErrors({})

    try {
      let result: DocumentImportResponse

      if (formData.importType === 'mcq') {
        const importData: DocumentImportRequest = {
          subjectId: formData.subjectId,
          title: formData.title,
          totalQuestions: formData.totalQuestions,
          perChunk: formData.perChunk,
          shuffle: formData.shuffle,
          file: formData.file!
        }
        result = await importQuizFromDocument(importData)
      } else {
        const importData: DocumentImportMixedRequest = {
          subjectId: formData.subjectId,
          title: formData.title,
          mcqCount: formData.mcqCount,
          shortCount: formData.shortCount,
          essayCount: formData.essayCount,
          shortMax: formData.shortMax,
          essayMax: formData.essayMax,
          shuffle: formData.shuffle,
          file: formData.file!
        }
        result = await importMixedQuizFromDocument(importData)
      }

      onSuccess(result.quizId)
      
    } catch (error) {
      console.error('Error importing quiz:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Import failed. Please try again.' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-pink-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📄</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Import Quiz from Document
              </h2>
              <p className="text-gray-600 font-medium">Upload a document to generate quiz questions automatically</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.subjectId 
                    ? 'border-red-300 bg-red-50 focus:border-red-400' 
                    : 'border-gray-200 bg-white focus:border-pink-400'
                }`}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subjectId && <p className="text-red-500 text-sm mt-1">{errors.subjectId}</p>}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 flex items-center">
                <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">✏️</span>
                Quiz Title <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.title 
                    ? 'border-red-300 bg-red-50 focus:border-red-400' 
                    : 'border-gray-200 bg-white focus:border-pink-400'
                }`}
                placeholder="Enter quiz title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
          </div>

          {/* Import Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 flex items-center">
              <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">🎯</span>
              Question Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('importType', 'mcq')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.importType === 'mcq'
                    ? 'border-blue-400 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-blue-400 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔘</span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800">Multiple Choice Only</h4>
                    <p className="text-sm text-gray-600">Generate MCQ questions only</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('importType', 'mixed')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  formData.importType === 'mixed'
                    ? 'border-purple-400 bg-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-purple-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-300 to-purple-400 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📝</span>
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800">Mixed Questions</h4>
                    <p className="text-sm text-gray-600">MCQ + Short Answer + Essay</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 flex items-center">
              <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">📄</span>
              Document File <span className="text-red-500 ml-1">*</span>
            </label>
            
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-pink-400 bg-pink-50' 
                  : errors.file 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-pink-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {formData.file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-300 to-green-400 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">{formData.file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('file', null)}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">Drop your document here</p>
                    <p className="text-sm text-gray-600">or click to browse files</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: PDF, DOC, DOCX, PPT, PPTX (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
          </div>

          {/* Advanced Settings */}
          {formData.importType === 'mcq' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">💭</span>
                  Total Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.totalQuestions}
                  onChange={(e) => handleInputChange('totalQuestions', parseInt(e.target.value) || 1)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                    errors.totalQuestions 
                      ? 'border-red-300 bg-red-50 focus:border-red-400' 
                      : 'border-gray-200 bg-white focus:border-pink-400'
                  }`}
                />
                {errors.totalQuestions && <p className="text-red-500 text-sm mt-1">{errors.totalQuestions}</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">📝</span>
                  Questions per Chunk
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.perChunk}
                  onChange={(e) => handleInputChange('perChunk', parseInt(e.target.value) || 5)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-pink-400 transition-all duration-300"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">🔀</span>
                  Shuffle Answers
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.shuffle}
                      onChange={(e) => handleInputChange('shuffle', e.target.checked)}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-400"
                    />
                    <span className="ml-2 text-sm text-gray-700">Randomize answer order</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 flex items-center">
                    <span className="w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full flex items-center justify-center mr-2 text-white text-xs">🔘</span>
                    MCQ Questions
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.mcqCount}
                    onChange={(e) => handleInputChange('mcqCount', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.mcqCount 
                        ? 'border-red-300 bg-red-50 focus:border-red-400' 
                        : 'border-gray-200 bg-white focus:border-blue-400'
                    }`}
                  />
                  {errors.mcqCount && <p className="text-red-500 text-sm mt-1">{errors.mcqCount}</p>}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 flex items-center">
                    <span className="w-6 h-6 bg-gradient-to-br from-green-300 to-green-400 rounded-full flex items-center justify-center mr-2 text-white text-xs">✏️</span>
                    Short Answer
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.shortCount}
                    onChange={(e) => handleInputChange('shortCount', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.shortCount 
                        ? 'border-red-300 bg-red-50 focus:border-red-400' 
                        : 'border-gray-200 bg-white focus:border-green-400'
                    }`}
                  />
                  {errors.shortCount && <p className="text-red-500 text-sm mt-1">{errors.shortCount}</p>}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 flex items-center">
                    <span className="w-6 h-6 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full flex items-center justify-center mr-2 text-white text-xs">📄</span>
                    Essay Questions
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.essayCount}
                    onChange={(e) => handleInputChange('essayCount', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.essayCount 
                        ? 'border-red-300 bg-red-50 focus:border-red-400' 
                        : 'border-gray-200 bg-white focus:border-purple-400'
                    }`}
                  />
                  {errors.essayCount && <p className="text-red-500 text-sm mt-1">{errors.essayCount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 flex items-center">
                    <span className="w-6 h-6 bg-gradient-to-br from-green-300 to-green-400 rounded-full flex items-center justify-center mr-2 text-white text-xs">📏</span>
                    Short Answer Max Length
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={formData.shortMax || 10}
                    onChange={(e) => handleInputChange('shortMax', parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-green-400 transition-all duration-300"
                    placeholder="Maximum words for short answers"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 flex items-center">
                    <span className="w-6 h-6 bg-gradient-to-br from-purple-300 to-purple-400 rounded-full flex items-center justify-center mr-2 text-white text-xs">📏</span>
                    Essay Max Length
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={formData.essayMax || 10}
                    onChange={(e) => handleInputChange('essayMax', parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-purple-400 transition-all duration-300"
                    placeholder="Maximum words for essays"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center mr-2 text-white text-xs">🔀</span>
                  Shuffle Answers
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.shuffle}
                      onChange={(e) => handleInputChange('shuffle', e.target.checked)}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-400"
                    />
                    <span className="ml-2 text-sm text-gray-700">Randomize answer order</span>
                  </label>
                </div>
              </div>

              {errors.mixed && <p className="text-red-500 text-sm mt-1">{errors.mixed}</p>}
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <span className="text-red-500 text-lg mr-2">⚠️</span>
                <p className="text-red-700 font-medium">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">📄</span>
                  <span>Import Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
