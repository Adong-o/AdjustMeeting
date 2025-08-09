import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Download, X, MessageCircle, Image, FileText, File } from 'lucide-react'

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: Date
  type: 'text' | 'file'
  fileData?: {
    name: string
    size: number
    type: string
    url: string
  }
}

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  currentUser: string
  participants: Array<{ name: string }>
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  participants
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate typing indicators (in real app, this would come from WebRTC data channels)
  useEffect(() => {
    if (newMessage.length > 0) {
      // Simulate other users seeing typing indicator
      const timer = setTimeout(() => {
        setIsTyping([])
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [newMessage])

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: currentUser,
        message: newMessage.trim(),
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 10MB for demo)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      try {
        // Create object URL for file preview/download
        const fileUrl = URL.createObjectURL(file)
        
        const fileMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: currentUser,
          message: `Shared a file: ${file.name}`,
          timestamp: new Date(),
          type: 'file',
          fileData: {
            name: file.name,
            size: file.size,
            type: file.type,
            url: fileUrl
          }
        }
        setMessages(prev => [...prev, fileMessage])
      } catch (error) {
        console.error('Error uploading file:', error)
        alert('Error uploading file. Please try again.')
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">Chat</h3>
          <span className="text-gray-400 text-sm">({participants.length + 1})</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === currentUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {message.sender !== currentUser && (
                  <p className="text-xs text-gray-300 mb-1">{message.sender}</p>
                )}
                
                {message.type === 'text' ? (
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm">{message.message}</p>
                    {message.fileData && (
                      <div className="bg-black/20 rounded p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(message.fileData.type)}
                          <div>
                            <p className="text-sm font-medium">{message.fileData.name}</p>
                            <p className="text-xs opacity-75">{formatFileSize(message.fileData.size)}</p>
                          </div>
                        </div>
                        <a
                          href={message.fileData.url}
                          download={message.fileData.name}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                <p className="text-xs opacity-75 mt-1">{formatTime(message.timestamp)}</p>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicators */}
        {isTyping.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs ml-2">Someone is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <div className="flex space-x-1">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel