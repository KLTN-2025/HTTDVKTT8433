import React, { useState, useRef, useEffect } from 'react'
import { askAI, getAISuggestions } from '../api/aiService'

interface FloatingAIAssistantProps {
  className?: string
}

export default function FloatingAIAssistant({ className = '' }: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai', content: string, timestamp: Date }>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions] = useState(getAISuggestions())
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isMinimized, setIsMinimized] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Handle drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === iconRef.current || (iconRef.current && iconRef.current.contains(e.target as Node))) {
      setIsDragging(true)
      const rect = iconRef.current!.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  // Auto-adjust position to stay within viewport
  const adjustPosition = () => {
    const chatElement = chatRef.current
    if (chatElement) {
      const rect = chatElement.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      let newX = position.x
      let newY = position.y
      
      // Adjust horizontal position
      if (rect.right > viewportWidth) {
        newX = viewportWidth - rect.width - 20
      }
      if (rect.left < 0) {
        newX = 20
      }
      
      // Adjust vertical position
      if (rect.bottom > viewportHeight) {
        newY = viewportHeight - rect.height - 20
      }
      if (rect.top < 0) {
        newY = 20
      }
      
      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY })
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 60
      const maxY = window.innerHeight - 60
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  // Handle AI chat
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = inputMessage.trim()
    setInputMessage('') // Clear input immediately
    setIsLoading(true)

    // Add user message
    const newMessages = [...messages, {
      type: 'user' as const,
      content: userMessage,
      timestamp: new Date()
    }]
    setMessages(newMessages)

    try {
      const response = await askAI({ userQuestion: userMessage })
      console.log('AI Response received:', response)
      
      // Add AI response
      setMessages(prev => [...prev, {
        type: 'ai',
        content: typeof response === 'string' ? response : (response.answer || 'Không có phản hồi từ AI'),
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
      // Đảm bảo chat window không bị minimize
      setIsMinimized(false)
      // Focus lại input sau khi AI trả lời
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Nhập câu hỏi"]') as HTMLInputElement
        if (input) {
          input.focus()
          input.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }


  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        })
      }, 100)
    }
  }, [messages, isLoading])

  // Adjust position when chat opens or content changes
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(adjustPosition, 100)
    }
  }, [isOpen, isMinimized, messages.length])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault()
            handleZoomIn()
            break
          case '-':
            e.preventDefault()
            handleZoomOut()
            break
          case '0':
            e.preventDefault()
            handleResetZoom()
            break
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div 
      className={`fixed z-50 ${className}`} 
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
    >
      {/* Floating AI Icon */}
      <div
        ref={iconRef}
        className={`w-16 h-16 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full shadow-2xl border-4 border-black cursor-move hover:scale-110 transition-all duration-300 flex items-center justify-center btn-magic ${isDragging ? 'scale-110' : ''}`}
        onMouseDown={handleMouseDown}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-2xl animate-bounce">🤖</span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className={`absolute top-20 left-0 bg-white rounded-2xl shadow-2xl border-4 border-black overflow-hidden transition-all duration-300 flex flex-col ${
            isMinimized ? 'w-80 h-24' : 'w-[400px] min-h-[400px] max-h-[85vh]'
          }`}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 40px)',
            minWidth: '320px'
          }}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <h3 className="font-rounded font-bold text-lg">AI Assistant</h3>
                  <p className="text-sm text-white/90">✨ Trợ lý thông minh cho quản trị viên ✨</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                {!isMinimized && (
                  <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
                    <button
                      onClick={handleZoomOut}
                      className="w-6 h-6 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
                      title="Thu nhỏ (Ctrl + -)"
                      disabled={zoomLevel <= 0.5}
                    >
                      <span className="text-xs">−</span>
                    </button>
                    <span className="text-xs px-1 min-w-[2.5rem] text-center font-bold">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="w-6 h-6 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
                      title="Phóng to (Ctrl + +)"
                      disabled={zoomLevel >= 2}
                    >
                      <span className="text-xs">+</span>
                    </button>
                    <button
                      onClick={handleResetZoom}
                      className="w-6 h-6 bg-white/20 rounded flex items-center justify-center hover:bg-white/30 transition-colors"
                      title="Reset zoom (Ctrl + 0)"
                    >
                      <span className="text-xs">⌂</span>
                    </button>
                  </div>
                )}
                
                <button
                  onClick={handleMinimize}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
                >
                  <span className="text-lg">{isMinimized ? "⬆" : "⬇"}</span>
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div 
              className="p-4 flex-1 overflow-y-auto" 
              style={{ 
                maxHeight: 'calc(80vh - 160px)',
                minHeight: '200px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e0 #f7fafc'
              }}
            >
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h4 className="font-rounded font-bold text-gray-800 mb-2">Chào mừng đến với AI Assistant!</h4>
                  <p className="text-sm text-gray-600 font-rounded">Hãy đặt câu hỏi hoặc ra lệnh quản trị</p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 p-4 rounded-2xl border-2 border-black shadow-lg ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-50 to-cyan-50 ml-8'
                      : 'bg-gradient-to-r from-green-50 to-blue-50 mr-8'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-400 to-cyan-400' 
                        : 'bg-gradient-to-r from-green-400 to-blue-400'
                    }`}>
                      {message.type === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="flex-1">
                      <div className="prose prose-sm max-w-none">
                        <div className="text-gray-800 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere max-w-full">
                          {message.content.split('\n').map((line, lineIndex) => {
                            // Xử lý bullet points
                            if (line.trim().startsWith('**') && line.includes('**')) {
                              const cleanLine = line.replace(/\*\*/g, '')
                              return (
                                <div key={lineIndex} className="font-bold text-blue-800 mb-2">
                                  {cleanLine}
                                </div>
                              )
                            }
                            
                            // Xử lý numbered lists
                            if (line.trim().match(/^\d+\./)) {
                              return (
                                <div key={lineIndex} className="ml-4 mb-2 flex items-start">
                                  <span className="text-blue-600 font-bold mr-2">{line.trim().split('.')[0]}.</span>
                                  <span className="text-gray-700">{line.trim().substring(line.trim().indexOf('.') + 1).trim()}</span>
                                </div>
                              )
                            }
                            
                            // Xử lý bullet points với *
                            if (line.trim().startsWith('*') && !line.trim().startsWith('**')) {
                              return (
                                <div key={lineIndex} className="ml-4 mb-2 flex items-start">
                                  <span className="text-green-600 mr-2">•</span>
                                  <span className="text-gray-700">{line.trim().substring(1).trim()}</span>
                                </div>
                              )
                            }
                            
                            // Text thường
                            return (
                              <p key={lineIndex} className="mb-2 text-gray-700">
                                {line}
                              </p>
                            )
                          })}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <span>🕒</span>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-black shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400"></div>
                    <span className="text-sm font-rounded text-gray-600">AI đang suy nghĩ...</span>
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Chat Input - Always show when chat is open */}
          {!isMinimized && (
            <div className="p-4 border-t-4 border-black bg-gradient-to-r from-pink-50 to-purple-50 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi hoặc lệnh quản trị..."
                className="flex-1 px-4 py-2 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-400 focus:border-pink-400 transition-all duration-200 bg-white/90 font-rounded font-semibold"
                disabled={isLoading}
                autoFocus
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl border-4 border-black hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-rounded font-bold btn-magic"
                title={!inputMessage.trim() ? "Vui lòng nhập câu hỏi" : "Gửi câu hỏi"}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  '💬'
                )}
              </button>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  )
}
