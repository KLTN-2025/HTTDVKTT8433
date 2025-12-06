import React from 'react'
import { Link } from 'react-router-dom'

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-4 border-black max-w-md w-full mx-4 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-20 h-20 bg-pink-200 rounded-full -translate-x-10 -translate-y-10 opacity-60 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-200 rounded-full translate-x-8 -translate-y-8 opacity-70 animate-bounce"></div>
          <div className="absolute bottom-0 left-1/4 w-12 h-12 bg-green-200 rounded-full -translate-y-6 opacity-50 animate-ping"></div>
          <div className="absolute bottom-0 right-1/4 w-14 h-14 bg-blue-200 rounded-full -translate-y-7 opacity-60 animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          {/* Close Button */}
          <button
            onClick={onClose}
            title="Đóng"
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl flex items-center justify-center border-2 border-black">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-2xl font-rounded font-bold text-gray-900 mb-2 animate-heartbeat">
              🎯 Sẵn sàng bắt đầu?
            </h2>
            <p className="text-gray-700 font-semibold">
              ✨ Đăng nhập để tham gia quiz và theo dõi tiến độ học tập ✨
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/login"
              onClick={onClose}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-rounded font-bold py-4 px-6 rounded-xl border-4 border-black shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3 btn-magic"
            >
              <span className="text-xl">🔐</span>
              <span>Đăng nhập</span>
              <span className="text-xl">→</span>
            </Link>

            <Link
              to="/register"
              onClick={onClose}
              className="w-full bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 text-white font-rounded font-bold py-4 px-6 rounded-xl border-4 border-black shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3 btn-magic"
            >
              <span className="text-xl">✨</span>
              <span>Đăng ký ngay</span>
              <span className="text-xl">🚀</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              💡 Tạo tài khoản miễn phí để trải nghiệm đầy đủ tính năng
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPromptModal
