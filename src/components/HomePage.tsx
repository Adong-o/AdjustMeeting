import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, Users, Shield, Globe, Crown, Scroll, Zap, Lock, Wifi, UserCheck } from 'lucide-react'

const HomePage: React.FC = () => {
  const [roomId, setRoomId] = useState('')
  const [hostName, setHostName] = useState('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [theme, setTheme] = useState<'ancient' | 'modern'>('modern')
  const navigate = useNavigate()

  const createMeeting = () => {
    if (roomId.trim() && hostName.trim()) {
      const meetingData = {
        roomId: roomId.trim(),
        hostName: hostName.trim(),
        title: meetingTitle.trim() || 'Meeting',
        isHost: true
      }
      navigate(`/room/${roomId.trim()}`, { state: meetingData })
    }
  }

  const joinMeeting = () => {
    if (joinRoomId.trim() && participantName.trim()) {
      const participantData = {
        roomId: joinRoomId.trim(),
        participantName: participantName.trim(),
        isHost: false
      }
      navigate(`/room/${joinRoomId.trim()}`, { state: participantData })
    }
  }

  const generateRandomId = () => {
    const id = Math.random().toString(36).substr(2, 8).toUpperCase()
    setRoomId(id)
  }

  const toggleTheme = () => {
    setTheme(theme === 'modern' ? 'ancient' : 'modern')
  }

  // Ancient theme styles
  const ancientStyles = {
    background: 'bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900',
    cardBg: 'bg-gradient-to-br from-amber-800/90 to-yellow-700/90 backdrop-blur-sm',
    border: 'border-amber-600',
    text: 'text-amber-100',
    textSecondary: 'text-amber-200',
    textMuted: 'text-amber-300',
    button: 'bg-amber-700 hover:bg-amber-600',
    buttonSecondary: 'bg-yellow-700 hover:bg-yellow-600',
    input: 'bg-amber-800/50 border-amber-600 text-amber-100 placeholder-amber-300',
    accent: 'text-amber-400'
  }

  // Modern theme styles
  const modernStyles = {
    background: 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900',
    cardBg: 'bg-gray-800/80 backdrop-blur-sm',
    border: 'border-gray-700',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: 'bg-green-600 hover:bg-green-700',
    input: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
    accent: 'text-blue-400'
  }

  const styles = theme === 'ancient' ? ancientStyles : modernStyles

  return (
    <div className={`min-h-screen ${styles.background} flex items-center justify-center p-4 relative`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 ${styles.cardBg} ${styles.border} border rounded-full ${styles.text} hover:scale-110 transition-all duration-300 z-10`}
        title={`Switch to ${theme === 'modern' ? 'Ancient' : 'Modern'} theme`}
      >
        {theme === 'modern' ? <Scroll className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
      </button>

      {/* Ancient Background Pattern */}
      {theme === 'ancient' && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      )}

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            {theme === 'ancient' ? (
              <Scroll className={`w-12 h-12 ${styles.accent} mr-3`} />
            ) : (
              <Video className={`w-12 h-12 ${styles.accent} mr-3`} />
            )}
            <h1 className={`text-4xl font-bold ${styles.text} ${theme === 'ancient' ? 'font-serif' : ''}`}>
              {theme === 'ancient' ? 'AdjustMeeting' : 'AdjustMeeting'}
            </h1>
          </div>
          <p className={`text-xl ${styles.textSecondary} mb-8 ${theme === 'ancient' ? 'font-serif italic' : ''}`}>
            {theme === 'ancient' 
              ? 'Gather ye companions across the digital realm. No scrolls of registration required.'
              : 'Free, open source video conferencing. No registration required.'
            }
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className={`${styles.cardBg} rounded-lg p-6 border ${styles.border} hover:scale-105 transition-all duration-300`}>
              {theme === 'ancient' ? (
                <Shield className={`w-8 h-8 text-yellow-400 mx-auto mb-3`} />
              ) : (
                <Lock className={`w-8 h-8 text-green-400 mx-auto mb-3`} />
              )}
              <h3 className={`text-lg font-semibold ${styles.text} mb-2 ${theme === 'ancient' ? 'font-serif' : ''}`}>
                {theme === 'ancient' ? 'Sacred & Secure' : 'Private & Secure'}
              </h3>
              <p className={`${styles.textMuted} ${theme === 'ancient' ? 'font-serif text-sm' : ''}`}>
                {theme === 'ancient' 
                  ? 'Protected by ancient cryptographic arts, peer-to-peer enchantments'
                  : 'End-to-end encrypted peer-to-peer connections'
                }
              </p>
            </div>
            <div className={`${styles.cardBg} rounded-lg p-6 border ${styles.border} hover:scale-105 transition-all duration-300`}>
              {theme === 'ancient' ? (
                <UserCheck className={`w-8 h-8 text-amber-400 mx-auto mb-3`} />
              ) : (
                <Wifi className={`w-8 h-8 text-blue-400 mx-auto mb-3`} />
              )}
              <h3 className={`text-lg font-semibold ${styles.text} mb-2 ${theme === 'ancient' ? 'font-serif' : ''}`}>
                {theme === 'ancient' ? 'No Ancient Scrolls' : 'No Registration'}
              </h3>
              <p className={`${styles.textMuted} ${theme === 'ancient' ? 'font-serif text-sm' : ''}`}>
                {theme === 'ancient' 
                  ? 'Summon or join gatherings instantly without binding contracts'
                  : 'Create or join meetings instantly without accounts'
                }
              </p>
            </div>
            <div className={`${styles.cardBg} rounded-lg p-6 border ${styles.border} hover:scale-105 transition-all duration-300`}>
              {theme === 'ancient' ? (
                <Users className={`w-8 h-8 text-orange-400 mx-auto mb-3`} />
              ) : (
                <Users className={`w-8 h-8 text-purple-400 mx-auto mb-3`} />
              )}
              <h3 className={`text-lg font-semibold ${styles.text} mb-2 ${theme === 'ancient' ? 'font-serif' : ''}`}>
                {theme === 'ancient' ? 'Mystical Sharing' : 'Easy Sharing'}
              </h3>
              <p className={`${styles.textMuted} ${theme === 'ancient' ? 'font-serif text-sm' : ''}`}>
                {theme === 'ancient' 
                  ? 'Share sacred chamber codes with fellow travelers'
                  : 'Share custom room codes with anyone'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Meeting */}
          <div className={`${styles.cardBg} rounded-xl p-8 border ${styles.border} hover:border-opacity-80 transition-all duration-300 hover:scale-105`}>
            <h2 className={`text-2xl font-bold ${styles.text} mb-6 flex items-center ${theme === 'ancient' ? 'font-serif' : ''}`}>
              {theme === 'ancient' ? (
                <Crown className={`w-6 h-6 mr-3 text-yellow-400`} />
              ) : (
                <Video className={`w-6 h-6 mr-3 ${styles.accent}`} />
              )}
              {theme === 'ancient' ? 'Summon Gathering' : 'Create Meeting'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${styles.textSecondary} mb-2 ${theme === 'ancient' ? 'font-serif' : ''}`}>
                  {theme === 'ancient' ? 'Thy noble name (as host)' : 'Your name (as host)'}
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder={theme === 'ancient' ? 'Enter thy name' : 'Enter your name'}
                  className={`w-full px-4 py-3 ${styles.input} border rounded-lg focus:border-opacity-80 focus:outline-none transition-colors mb-4 ${theme === 'ancient' ? 'font-serif' : ''}`}
                />
                
                <label className={`block text-sm font-medium ${styles.textSecondary} mb-2 ${theme === 'ancient' ? 'font-serif' : ''}`}>
                  {theme === 'ancient' ? 'Gathering purpose (optional)' : 'Meeting title (optional)'}
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder={theme === 'ancient' ? 'Enter gathering purpose' : 'Enter meeting title'}
                  className={`w-full px-4 py-3 ${styles.input} border rounded-lg focus:border-opacity-80 focus:outline-none transition-colors mb-4 ${theme === 'ancient' ? 'font-serif' : ''}`}
                />
                
                <label className={`block text-sm font-medium ${styles.textSecondary} mb-2 ${theme === 'ancient' ? 'font-serif' : ''}`}>
                  {theme === 'ancient' ? 'Choose thy chamber code' : 'Choose your room code'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder={theme === 'ancient' ? 'Enter sacred chamber code' : 'Enter custom room code'}
                    className={`flex-1 px-4 py-3 ${styles.input} border rounded-lg focus:border-opacity-80 focus:outline-none transition-colors ${theme === 'ancient' ? 'font-serif' : ''}`}
                  />
                  <button
                    onClick={generateRandomId}
                    className={`px-4 py-3 bg-opacity-80 hover:bg-opacity-100 ${styles.textSecondary} rounded-lg transition-colors whitespace-nowrap border ${styles.border} ${theme === 'ancient' ? 'font-serif' : ''}`}
                  >
                    {theme === 'ancient' ? 'Conjure' : 'Generate'}
                  </button>
                </div>
              </div>
              <button
                onClick={createMeeting}
                disabled={!roomId.trim() || !hostName.trim()}
                className={`w-full px-6 py-3 ${styles.button} disabled:bg-gray-600 disabled:cursor-not-allowed ${styles.text} font-semibold rounded-lg transition-colors hover:scale-105 ${theme === 'ancient' ? 'font-serif' : ''}`}
              >
                {theme === 'ancient' ? 'Summon Gathering' : 'Create Meeting'}
              </button>
            </div>
          </div>

          {/* Join Meeting */}
          <div className={`${styles.cardBg} rounded-xl p-8 border ${styles.border} hover:border-opacity-80 transition-all duration-300 hover:scale-105`}>
            <h2 className={`text-2xl font-bold ${styles.text} mb-6 flex items-center ${theme === 'ancient' ? 'font-serif' : ''}`}>
              {theme === 'ancient' ? (
                <Users className={`w-6 h-6 mr-3 text-orange-400`} />
              ) : (
                <Users className={`w-6 h-6 mr-3 text-green-400`} />
              )}
              {theme === 'ancient' ? 'Join Gathering' : 'Join Meeting'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${styles.textSecondary} mb-2 ${theme === 'ancient' ? 'font-serif' : ''}`}>
                  {theme === 'ancient' ? 'Thy noble name' : 'Your name'}
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder={theme === 'ancient' ? 'Enter thy name' : 'Enter your name'}
                  className={`w-full px-4 py-3 ${styles.input} border rounded-lg focus:border-opacity-80 focus:outline-none transition-colors mb-4 ${theme === 'ancient' ? 'font-serif' : ''}`}
                />
                
                <label className={`block text-sm font-medium ${styles.textSecondary} mb-2 ${theme === 'ancient' ? 'font-serif' : ''}`}>
                  {theme === 'ancient' ? 'Enter chamber code' : 'Enter room code'}
                </label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder={theme === 'ancient' ? 'Enter sacred chamber code' : 'Enter room code to join'}
                  className={`w-full px-4 py-3 ${styles.input} border rounded-lg focus:border-opacity-80 focus:outline-none transition-colors ${theme === 'ancient' ? 'font-serif' : ''}`}
                />
              </div>
              <button
                onClick={joinMeeting}
                disabled={!joinRoomId.trim() || !participantName.trim()}
                className={`w-full px-6 py-3 ${styles.buttonSecondary} disabled:bg-gray-600 disabled:cursor-not-allowed ${styles.text} font-semibold rounded-lg transition-colors hover:scale-105 ${theme === 'ancient' ? 'font-serif' : ''}`}
              >
                {theme === 'ancient' ? 'Join Gathering' : 'Join Meeting'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center mt-12 ${styles.textMuted}`}>
          <p className={theme === 'ancient' ? 'font-serif italic' : ''}>
            {theme === 'ancient' 
              ? 'Ancient wisdom meets modern sorcery - Built with mystical WebRTC arts'
              : 'Open source video conferencing built with WebRTC'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage