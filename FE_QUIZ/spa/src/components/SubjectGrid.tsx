import React, { useState, useEffect } from 'react'
import { getPublicSubjects, PublicSubject } from '@/api/publicQuizClient'

interface SubjectGridProps {
  onSubjectClick?: () => void
}

const SubjectGrid: React.FC<SubjectGridProps> = ({ onSubjectClick }) => {
  const [subjects, setSubjects] = useState<PublicSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getPublicSubjects()
      console.log('Subjects API response:', response)
      if (response.code === 1000) {
        console.log('Subjects loaded:', response.result)
        setSubjects(response.result)
      } else {
        setError('Không thể tải danh sách môn học')
      }
    } catch (err: any) {
      console.error('Error loading subjects:', err)
      setError('Không thể kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  const getSubjectIcon = (subjectName: string) => {
    const iconMap: { [key: string]: string } = {
      'Công dân': '📖',
      'Công nghệ': '🚀',
      'Hóa học': '🧪',
      'Sinh học': '🧬',
      'Vật lý': '⚛️',
      'Toán học': '📐',
      'Lịch sử': '🏛️',
      'Địa lý': '🌍',
      'Văn học': '📚',
      'Tiếng Anh': '🇬🇧',
      'Tin học': '💻',
      'Khoa học': '🔬',
      'Nghệ thuật': '🎨',
      'Thể dục': '⚽',
      'Âm nhạc': '🎵',
      'Triết học': '🤔',
      'Kinh tế': '💰',
      'Chính trị': '🏛️',
      'Tâm lý': '🧠',
      'Xã hội': '👥',
      'Môi trường': '🌱'
    }
    return iconMap[subjectName] || '📖'
  }

  const getSubjectColor = (index: number) => {
    const colors = [
      'blue',
      'green', 
      'purple',
      'pink',
      'yellow',
      'orange',
      'teal',
      'red'
    ]
    return colors[index % colors.length]
  }

  const getSubjectPattern = (index: number) => {
    const patterns = [
      'bg-gradient-to-br',
      'bg-gradient-to-tr', 
      'bg-gradient-to-bl',
      'bg-gradient-to-tl',
      'bg-gradient-to-r',
      'bg-gradient-to-l',
      'bg-gradient-to-t',
      'bg-gradient-to-b'
    ]
    return patterns[index % patterns.length]
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-6">
                <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Lỗi tải môn học</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSubjects}
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
          >
            🔄 Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-rounded text-rainbow mb-4 animate-heartbeat">
          🎓 Khám Phá Môn Học
        </h2>
        <p className="text-gray-700 text-base lg:text-lg font-semibold animate-fade-in">
          ✨ Chọn môn học yêu thích và bắt đầu hành trình học tập của bạn ✨
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {subjects.map((subject, index) => (
          <div
            key={subject.id}
            className={`subject-card ${getSubjectColor(index)} p-6 relative`}
            onClick={() => {
              console.log('Selected subject:', subject.name)
              onSubjectClick?.()
            }}
          >
            {/* Content */}
            <div className="text-center">
              <div className="icon mb-4">
                {getSubjectIcon(subject.name)}
              </div>
              <h3 className="title text-lg mb-2">
                {subject.name}
              </h3>
              <div className="subtitle text-sm">
                Khám phá ngay
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="gradient-pastel-blue rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl font-bold text-blue-600 font-rounded animate-bounce">{subjects.length}</div>
            <div className="text-sm text-blue-800 font-semibold">📚 Môn học</div>
          </div>
          <div className="gradient-pastel-green rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl font-bold text-green-600 font-rounded animate-pulse">∞</div>
            <div className="text-sm text-green-800 font-semibold">🧠 Kiến thức</div>
          </div>
          <div className="gradient-pastel-purple rounded-xl p-4 transform hover:scale-105 transition-all duration-300">
            <div className="text-2xl font-bold text-purple-600 font-rounded animate-wiggle">🚀</div>
            <div className="text-sm text-purple-800 font-semibold">🎯 Học tập</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <div className="gradient-pastel-purple rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
          <div className="relative z-10">
            <h3 className="text-lg lg:text-xl font-rounded text-glow mb-2 animate-heartbeat">🎯 Sẵn sàng bắt đầu?</h3>
            <p className="text-purple-100 mb-4 text-sm lg:text-base font-semibold">✨ Đăng nhập để tham gia quiz và theo dõi tiến độ học tập ✨</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/login'}
                className="group relative px-6 py-3 bg-white text-purple-600 rounded-xl font-rounded font-bold hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 btn-magic border-2 border-purple-300"
              >
                <span className="mr-2 animate-wiggle">🔐</span>
                <span>Đăng nhập</span>
                <span className="ml-2 group-hover:animate-bounce">→</span>
              </button>
              <button
                onClick={() => window.location.href = '/register'}
                className="group relative px-6 py-3 bg-purple-600 text-white rounded-xl font-rounded font-bold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 btn-magic border-2 border-purple-400"
              >
                <span className="mr-2 animate-wiggle">✨</span>
                <span>Đăng ký ngay</span>
                <span className="ml-2 group-hover:animate-bounce">🚀</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubjectGrid
