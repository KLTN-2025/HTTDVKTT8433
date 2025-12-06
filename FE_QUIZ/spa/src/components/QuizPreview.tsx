import React from 'react'

interface QuizPreviewProps {
  quizData: {
    quizId: string
    result: string
  }
  onClose: () => void
  onEdit: (quizId: string) => void
}

export default function QuizPreview({ quizData, onClose, onEdit }: QuizPreviewProps) {
  // Parse the AI-generated content
  const parseQuizContent = (content: string) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content)
      return parsed
    } catch {
      // If not JSON, treat as plain text
      return { content }
    }
  }

  const quizContent = parseQuizContent(quizData.result)
  
  // Check if it's an array of questions (MCQ format)
  const isQuestionArray = Array.isArray(quizContent) && quizContent.length > 0 && quizContent[0].question
  
  // Check if it's mixed content (has different question types)
  const isMixedContent = Array.isArray(quizContent) && quizContent.length > 0 && 
    (quizContent[0].type || quizContent[0].questionType || quizContent[0].question)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-pink-200 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-300 to-emerald-300 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  AI Quiz Preview
                </h2>
                <p className="text-gray-600 font-medium">Review your AI-generated quiz before editing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Quiz Content */}
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">🎯</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800">Quiz Generated Successfully!</h3>
                  <p className="text-green-700 font-medium">Your AI quiz has been created and saved.</p>
                </div>
              </div>
            </div>

            {/* Quiz ID */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🆔</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-800">Quiz ID</h3>
                  <p className="text-blue-700 font-mono text-sm">{quizData.quizId}</p>
                </div>
              </div>
            </div>

            {/* AI Generated Questions */}
            {isQuestionArray ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-lg">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-800">AI Generated Questions</h3>
                    <p className="text-purple-700 text-sm">{quizContent.length} questions created by AI</p>
                  </div>
                </div>
                
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {quizContent.map((question: any, index: number) => {
                const questionType = question.type || question.questionType || 'MCQ'
                const questionText = question.question || question.content || question.text
                const isMCQ = questionType === 'MCQ' || question.options
                
                return (
                  <div key={index} className="bg-white/80 rounded-xl p-6 border border-purple-200 hover:border-purple-300 transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        {/* Question Type Badge */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            questionType === 'MCQ' ? 'bg-blue-100 text-blue-800' :
                            questionType === 'SHORT' ? 'bg-orange-100 text-orange-800' :
                            questionType === 'ESSAY' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {questionType === 'MCQ' ? '✏️ Multiple Choice' :
                             questionType === 'SHORT' ? '✍️ Short Answer' :
                             questionType === 'ESSAY' ? '📄 Essay' :
                             '💭 Question'}
                          </span>
                          {question.maxScore && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                              {question.maxScore} points
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-bold text-gray-800 text-lg mb-3">{questionText}</h4>
                        
                        {/* MCQ Options */}
                        {isMCQ && question.options && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            {Object.entries(question.options).map(([key, value]) => (
                              <div key={key} className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-300 ${
                                question.answer === key 
                                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                  question.answer === key 
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' 
                                    : 'bg-gray-300 text-gray-600'
                                }`}>
                                  {key}
                                </div>
                                <span className={`font-medium ${
                                  question.answer === key ? 'text-green-800' : 'text-gray-700'
                                }`}>
                                  {value as string}
                                </span>
                                {question.answer === key && (
                                  <span className="text-green-600 text-lg">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Essay Rubric */}
                        {question.essayRubric && question.essayRubric.length > 0 && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h5 className="font-bold text-blue-800 mb-2 flex items-center">
                              <span className="mr-2">📋</span>
                              Essay Rubric
                            </h5>
                            <div className="space-y-2">
                              {question.essayRubric.map((rubric: any, rubricIndex: number) => (
                                <div key={rubricIndex} className="bg-white/80 rounded-lg p-3 border border-blue-200">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-blue-700">{rubric.criterion}</span>
                                    <span className="text-sm text-blue-600 font-medium">
                                      {((rubric.weight || 0) * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  {rubric.keywordsCsv && (
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">Keywords:</span> {rubric.keywordsCsv}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Correct Answer for MCQ */}
                        {isMCQ && question.answer && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600 text-lg">🎯</span>
                              <span className="text-green-800 font-bold">Correct Answer: {question.answer}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-lg">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-purple-800">AI Generated Content</h3>
                    <p className="text-purple-700 text-sm">Raw content from AI service</p>
                  </div>
                </div>
                
                <div className="bg-white/80 rounded-xl p-4 border border-purple-200">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                    {typeof quizContent === 'object' 
                      ? JSON.stringify(quizContent, null, 2)
                      : quizContent.content || quizContent
                    }
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold"
              >
                Close Preview
              </button>
              <button
                onClick={() => onEdit(quizData.quizId)}
                className="group px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3"
              >
                <span className="text-xl group-hover:rotate-12 transition-transform duration-300">✏️</span>
                <span>Edit Quiz</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
