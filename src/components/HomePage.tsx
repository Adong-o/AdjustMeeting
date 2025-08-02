import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, Users, Shield, Globe, User } from 'lucide-react'

const HomePage: React.FC = () => {
  const [roomId, setRoomId] = useState('')
  const [hostName, setHostName] = useState('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [participantName, setParticipantName] = useState('')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Video className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">AdjustMeeting</h1>
          </div>
          <p className="text-xl text-gray-300 mb-8">
            Free, open source video conferencing. No registration required.
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Private & Secure</h3>
              <p className="text-gray-400">End-to-end encrypted peer-to-peer connections</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <Globe className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">No Registration</h3>
              <p className="text-gray-400">Create or join meetings instantly without accounts</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Easy Sharing</h3>
              <p className="text-gray-400">Share custom room codes with anyone</p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Meeting */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Video className="w-6 h-6 mr-3 text-blue-400" />
              Create Meeting
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your name (as host)
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors mb-4"
                />
                
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting title (optional)
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Enter meeting title"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors mb-4"
                />
                
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose your room code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter custom room code"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={generateRandomId}
                    className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <button
                onClick={createMeeting}
                disabled={!roomId.trim() || !hostName.trim()}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Create Meeting
              </button>
            </div>
          </div>

          {/* Join Meeting */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-green-400" />
              Join Meeting
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors mb-4"
                />
                
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter room code
                </label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Enter room code to join"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={joinMeeting}
                disabled={!joinRoomId.trim() || !participantName.trim()}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Join Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p>Open source video conferencing built with WebRTC</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage