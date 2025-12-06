import React, { useState } from 'react'
import { explainAnswer, ExplainRequest, ExplainResponse } from '@/api/aiService'

interface AnswerExplanationProps {
  questionContent: string
  options: string[]
  correctAnswerLabel: string
  onClose: () => void
}

export const AnswerExplanation: React.FC<AnswerExplanationProps> = ({
  questionContent,
  options,
  correctAnswerLabel,
  onClose
}) => {
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatExplanation = (text: string) => {
    // Tách text thành các đoạn
    const paragraphs = text.split('\n').filter(p => p.trim() !== '')
    
    return paragraphs.map((paragraph, index) => {
      // Xử lý bullet points với format **A. 1946:**
      if (paragraph.trim().startsWith('*   **')) {
        const cleanText = paragraph.replace(/^\*\s+\*\*/, '').replace(/\*\*$/, '')
        const parts = cleanText.split(':**')
        if (parts.length === 2) {
          return {
            type: 'bullet',
            label: parts[0],
            content: parts[1],
            key: index
          }
        }
      }
      
      // Xử lý text thường
      return {
        type: 'text',
        content: paragraph,
        key: index
      }
    })
  }

  const handleExplain = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const request: ExplainRequest = {
        questionContent,
        options,
        correctAnswerLabel
      }
      
      const response = await explainAnswer(request)
      setExplanation(response)
    } catch (error) {
      console.error('Error getting explanation:', error)
      setError('Không thể tạo giải thích. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-rose-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-400 to-pink-400 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Giải thích đáp án</h2>
                <p className="text-rose-100 text-sm">AI sẽ giải thích tại sao đáp án này đúng</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Question Info */}
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-rose-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-6 h-6 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex items-center justify-center mr-3 text-white text-sm">❓</span>
              Câu hỏi
            </h3>
            <p className="text-gray-700 font-medium mb-4">{questionContent}</p>
            
            <div className="space-y-2">
              {options.map((option, index) => {
                const label = String.fromCharCode(65 + index)
                const isCorrect = label === correctAnswerLabel
                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 ${
                      isCorrect
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCorrect
                        ? 'bg-gradient-to-r from-emerald-400 to-green-400 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {label}
                    </div>
                    <span className={`font-medium ${
                      isCorrect ? 'text-emerald-800' : 'text-gray-700'
                    }`}>
                      {option}
                    </span>
                    {isCorrect && (
                      <span className="text-emerald-600 text-sm font-semibold">✓ Đúng</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Explanation Section */}
          {!explanation && !isLoading && !error && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tạo giải thích AI</h3>
              <p className="text-gray-600 mb-6">AI sẽ phân tích câu hỏi và giải thích tại sao đáp án đúng</p>
              <button
                onClick={handleExplain}
                className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 mx-auto"
              >
                <span className="text-2xl">🚀</span>
                <span>Tạo giải thích</span>
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-200 mx-auto mb-6"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-300 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2 animate-reverse-slow"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI đang phân tích...</h3>
              <p className="text-gray-600 font-medium">Đang tạo giải thích chi tiết cho câu hỏi</p>
              <div className="flex justify-center space-x-1 mt-4">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Lỗi</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={handleExplain}
                className="bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Explanation Result */}
          {explanation && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-emerald-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-br from-emerald-300 to-green-300 rounded-full flex items-center justify-center mr-3 text-white text-sm">💡</span>
                  Giải thích chi tiết
                </h3>
                <div className="text-gray-700 font-medium leading-relaxed space-y-4">
                  {formatExplanation(explanation.explanation).map((item) => {
                    if (item.type === 'bullet') {
                      return (
                        <div key={item.key} className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-all duration-300">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                            <span className="text-white text-sm font-bold">•</span>
                          </div>
                          <div className="flex-1">
                            <span className="font-bold text-emerald-800 text-lg">{item.label}:</span>
                            <p className="text-gray-700 mt-1 leading-relaxed">{item.content}</p>
                          </div>
                        </div>
                      )
                    }
                    
                    return (
                      <p key={item.key} className="text-gray-700 leading-relaxed text-lg">
                        {item.content}
                      </p>
                    )
                  })}
                </div>
              </div>

              {explanation.reasoning && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full flex items-center justify-center mr-3 text-white text-sm">🧠</span>
                    Lý do
                  </h3>
                  <p className="text-gray-700 font-medium leading-relaxed">{explanation.reasoning}</p>
                </div>
              )}

              {explanation.additionalInfo && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center mr-3 text-white text-sm">📚</span>
                    Thông tin bổ sung
                  </h3>
                  <p className="text-gray-700 font-medium leading-relaxed">{explanation.additionalInfo}</p>
                </div>
              )}

              <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleExplain}
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                >
                  <span className="text-xl">🔄</span>
                  <span>Tạo lại giải thích</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-500 hover:to-green-500 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                >
                  <span className="text-xl">✓</span>
                  <span>Đóng</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
