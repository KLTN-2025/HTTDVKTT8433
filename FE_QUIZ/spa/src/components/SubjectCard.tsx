import React from 'react'
import { SubjectResponse } from '@/api/types'

interface SubjectCardProps {
  subject: SubjectResponse
  onClick: (subject: SubjectResponse) => void
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  // Generate unique beautiful icons for each subject
  const getSubjectIcon = (subjectName: string) => {
    const icons = [
      // Math & Science - New unique icons
      { name: 'math', icon: '🔢', color: 'from-rose-300 to-pink-400', bgColor: 'bg-rose-50' },
      { name: 'toán', icon: '🧮', color: 'from-rose-300 to-pink-400', bgColor: 'bg-rose-50' },
      { name: 'science', icon: '🔬', color: 'from-sky-300 to-blue-400', bgColor: 'bg-sky-50' },
      { name: 'khoa học', icon: '⚗️', color: 'from-sky-300 to-blue-400', bgColor: 'bg-sky-50' },
      { name: 'physics', icon: '⚛️', color: 'from-violet-300 to-purple-400', bgColor: 'bg-violet-50' },
      { name: 'vật lý', icon: '🌌', color: 'from-violet-300 to-purple-400', bgColor: 'bg-violet-50' },
      { name: 'chemistry', icon: '🧪', color: 'from-emerald-300 to-green-400', bgColor: 'bg-emerald-50' },
      { name: 'hóa học', icon: '⚗️', color: 'from-emerald-300 to-green-400', bgColor: 'bg-emerald-50' },
      { name: 'biology', icon: '🧬', color: 'from-teal-300 to-cyan-400', bgColor: 'bg-teal-50' },
      { name: 'sinh học', icon: '🌱', color: 'from-teal-300 to-cyan-400', bgColor: 'bg-teal-50' },
      
      // Language & Literature - New unique icons
      { name: 'english', icon: '📚', color: 'from-amber-300 to-orange-400', bgColor: 'bg-amber-50' },
      { name: 'tiếng anh', icon: '🇬🇧', color: 'from-amber-300 to-orange-400', bgColor: 'bg-amber-50' },
      { name: 'literature', icon: '📖', color: 'from-rose-300 to-pink-400', bgColor: 'bg-rose-50' },
      { name: 'văn học', icon: '✍️', color: 'from-rose-300 to-pink-400', bgColor: 'bg-rose-50' },
      { name: 'language', icon: '🗣️', color: 'from-indigo-300 to-purple-400', bgColor: 'bg-indigo-50' },
      { name: 'ngôn ngữ', icon: '💬', color: 'from-indigo-300 to-purple-400', bgColor: 'bg-indigo-50' },
      
      // History & Social Sciences - New unique icons
      { name: 'history', icon: '🏛️', color: 'from-yellow-300 to-amber-400', bgColor: 'bg-yellow-50' },
      { name: 'lịch sử', icon: '📜', color: 'from-yellow-300 to-amber-400', bgColor: 'bg-yellow-50' },
      { name: 'geography', icon: '🌍', color: 'from-green-300 to-emerald-400', bgColor: 'bg-green-50' },
      { name: 'địa lý', icon: '🗺️', color: 'from-green-300 to-emerald-400', bgColor: 'bg-green-50' },
      { name: 'social', icon: '👥', color: 'from-blue-300 to-indigo-400', bgColor: 'bg-blue-50' },
      { name: 'xã hội', icon: '🏘️', color: 'from-blue-300 to-indigo-400', bgColor: 'bg-blue-50' },
      
      // Technology & Computer Science - New unique icons
      { name: 'computer', icon: '💻', color: 'from-slate-300 to-gray-400', bgColor: 'bg-slate-50' },
      { name: 'máy tính', icon: '🖥️', color: 'from-slate-300 to-gray-400', bgColor: 'bg-slate-50' },
      { name: 'programming', icon: '⚡', color: 'from-blue-300 to-indigo-400', bgColor: 'bg-blue-50' },
      { name: 'lập trình', icon: '💻', color: 'from-blue-300 to-indigo-400', bgColor: 'bg-blue-50' },
      { name: 'technology', icon: '🔧', color: 'from-gray-300 to-slate-400', bgColor: 'bg-gray-50' },
      { name: 'công nghệ', icon: '⚙️', color: 'from-gray-300 to-slate-400', bgColor: 'bg-gray-50' },
      
      // Arts & Creative - New unique icons
      { name: 'art', icon: '🎨', color: 'from-pink-300 to-rose-400', bgColor: 'bg-pink-50' },
      { name: 'nghệ thuật', icon: '🖼️', color: 'from-pink-300 to-rose-400', bgColor: 'bg-pink-50' },
      { name: 'music', icon: '🎵', color: 'from-purple-300 to-pink-400', bgColor: 'bg-purple-50' },
      { name: 'âm nhạc', icon: '🎶', color: 'from-purple-300 to-pink-400', bgColor: 'bg-purple-50' },
      { name: 'design', icon: '✏️', color: 'from-rose-300 to-pink-400', bgColor: 'bg-rose-50' },
      { name: 'thiết kế', icon: '🎨', color: 'from-rose-300 to-pink-400', bgColor: 'bg-rose-50' },
      
      // Business & Economics - New unique icons
      { name: 'business', icon: '💼', color: 'from-emerald-300 to-green-400', bgColor: 'bg-emerald-50' },
      { name: 'kinh doanh', icon: '📊', color: 'from-emerald-300 to-green-400', bgColor: 'bg-emerald-50' },
      { name: 'economics', icon: '💰', color: 'from-yellow-300 to-amber-400', bgColor: 'bg-yellow-50' },
      { name: 'kinh tế', icon: '📈', color: 'from-yellow-300 to-amber-400', bgColor: 'bg-yellow-50' },
      { name: 'finance', icon: '💳', color: 'from-green-300 to-emerald-400', bgColor: 'bg-green-50' },
      { name: 'tài chính', icon: '💎', color: 'from-green-300 to-emerald-400', bgColor: 'bg-green-50' },
      
      // Health & Medicine - New unique icons
      { name: 'health', icon: '🏥', color: 'from-red-300 to-pink-400', bgColor: 'bg-red-50' },
      { name: 'sức khỏe', icon: '❤️', color: 'from-red-300 to-pink-400', bgColor: 'bg-red-50' },
      { name: 'medicine', icon: '⚕️', color: 'from-red-300 to-rose-400', bgColor: 'bg-red-50' },
      { name: 'y học', icon: '🩺', color: 'from-red-300 to-rose-400', bgColor: 'bg-red-50' },
      { name: 'psychology', icon: '🧠', color: 'from-purple-300 to-indigo-400', bgColor: 'bg-purple-50' },
      { name: 'tâm lý', icon: '🧘', color: 'from-purple-300 to-indigo-400', bgColor: 'bg-purple-50' },
      
      // Sports & Physical Education - New unique icons
      { name: 'sports', icon: '⚽', color: 'from-green-300 to-emerald-400', bgColor: 'bg-green-50' },
      { name: 'thể thao', icon: '🏃', color: 'from-green-300 to-emerald-400', bgColor: 'bg-green-50' },
      { name: 'physical', icon: '💪', color: 'from-orange-300 to-red-400', bgColor: 'bg-orange-50' },
      { name: 'thể chất', icon: '🏋️', color: 'from-orange-300 to-red-400', bgColor: 'bg-orange-50' },
      
      // Philosophy & Ethics - New unique icons
      { name: 'philosophy', icon: '🤔', color: 'from-indigo-300 to-purple-400', bgColor: 'bg-indigo-50' },
      { name: 'triết học', icon: '💭', color: 'from-indigo-300 to-purple-400', bgColor: 'bg-indigo-50' },
      { name: 'ethics', icon: '⚖️', color: 'from-gray-300 to-slate-400', bgColor: 'bg-gray-50' },
      { name: 'đạo đức', icon: '🕊️', color: 'from-gray-300 to-slate-400', bgColor: 'bg-gray-50' },
    ]
    
    const lowerName = subjectName.toLowerCase()
    const matchedIcon = icons.find(icon => 
      lowerName.includes(icon.name.toLowerCase())
    )
    
    return matchedIcon || { 
      name: 'default', 
      icon: '📚', 
      color: 'from-indigo-300 to-purple-400',
      bgColor: 'bg-indigo-50'
    }
  }

  const iconData = getSubjectIcon(subject.name)

  return (
    <div 
      className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-105 cursor-pointer overflow-hidden border-4 border-white/20 hover-lift"
      onClick={() => onClick(subject)}
      style={{
        background: 'linear-gradient(135deg, #FFF9F3 0%, #FFF6ED 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Beautiful gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${iconData.color} opacity-0 group-hover:opacity-10 transition-all duration-700`} />
      
      {/* Content */}
      <div className="relative p-8">
        {/* Icon with beautiful styling */}
        <div className="flex items-center justify-center mb-6">
          <div 
            className={`w-24 h-24 rounded-3xl ${iconData.bgColor} flex items-center justify-center text-5xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-4 border-white/50 btn-magic animate-float`}
            style={{
              background: `linear-gradient(135deg, ${iconData.color.replace('from-', '').replace(' to-', ', ')})`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
            }}
          >
            <span className="group-hover:animate-bounce">{iconData.icon}</span>
          </div>
        </div>
        
        {/* Subject name with beautiful typography */}
        <h3 className="text-2xl font-rounded font-bold text-gray-800 text-center mb-4 group-hover:text-rainbow transition-all duration-300 tracking-tight animate-fade-in">
          {subject.name}
        </h3>
        
        {/* Description with improved styling */}
        <p className="text-gray-600 text-center text-sm leading-relaxed group-hover:text-glow transition-all duration-300 font-rounded font-semibold animate-slide-up">
          {subject.description || '✨ Khám phá kiến thức và thử thách bản thân ✨'}
        </p>
        
        {/* Beautiful hover effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/20 transition-all duration-700 rounded-3xl" />
        
        {/* Magic sparkle effects */}
        <div className="absolute top-6 right-6 w-3 h-3 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500" />
        <div className="absolute bottom-8 left-8 w-2 h-2 bg-pink-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700 delay-100" />
        <div className="absolute top-1/2 right-8 w-2 h-2 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-1000 delay-200" />
        <div className="absolute top-1/4 left-6 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-800 delay-300" />
      </div>
      
      {/* Beautiful bottom accent line */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${iconData.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 rounded-b-3xl`}
        style={{
          background: `linear-gradient(90deg, ${iconData.color.replace('from-', '').replace(' to-', ', ')})`
        }}
      />
      
      {/* Subtle border glow */}
      <div className={`absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/30 transition-all duration-500`} />
    </div>
  )
}

export default SubjectCard
