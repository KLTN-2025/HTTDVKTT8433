import React from 'react'
import { QuizResponse } from '@/api/quizClient'
import DoodleIcons from './DoodleIcons'

interface QuizCardProps {
  quiz: QuizResponse
  onClick: (quiz: QuizResponse) => void
  index?: number
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onClick, index = 0 }) => {
  // Get random doodle icon based on quiz title
  const getQuizIcon = (title: string) => {
    const icons = ['book', 'calculator', 'science', 'music', 'art', 'sports', 'star', 'target', 'puzzle', 'circus']
    const hash = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return icons[hash % icons.length]
  }

  const iconName = getQuizIcon(quiz.title)

  return (
    <div
      className="animate-fade-in-up cursor-pointer group"
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
      onClick={() => onClick(quiz)}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-4 border-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-blue-100 to-cyan-100 hover-lift group-hover:shadow-3xl">
        {/* Header with icon and status */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg animate-float group-hover:scale-110 transition-transform duration-300">
            <DoodleIcons name={iconName} size={24} className="text-white" />
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
              {quiz.status}
            </div>
          </div>
        </div>

        {/* Quiz content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
            {quiz.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
            {quiz.description || 'Không có mô tả'}
          </p>
        </div>

        {/* Quiz stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
          <div className="flex items-center space-x-1">
            <span className="text-blue-500">📊</span>
            <span>{quiz.questions?.length || 0} câu hỏi</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-green-500">⏱️</span>
            <span>{quiz.timeLimit || 0} phút</span>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        {/* Sparkle effects on hover */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 delay-100"></div>
        <div className="absolute top-1/2 right-1 w-1 h-1 bg-green-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300 delay-200"></div>
      </div>
    </div>
  )
}

export default QuizCard
