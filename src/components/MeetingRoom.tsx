import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useWebRTC } from '../contexts/WebRTCContext'
import VideoGrid from './VideoGrid'
import ControlBar from './ControlBar'
import ParticipantsList from './ParticipantsList'
import AdmissionControl from './AdmissionControl'
import { Copy, Users, UserCheck } from 'lucide-react'
import { X } from 'lucide-react'

const MeetingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    localStream, 
    participants,
    pendingParticipants,
    isAudioEnabled, 
    isVideoEnabled, 
    isScreenSharing,
    isHost,
    initializeRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveMeeting
  } = useWebRTC()

  const [copied, setCopied] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showAdmission, setShowAdmission] = useState(false)
  const [showJoinNotification, setShowJoinNotification] = useState(false)
  const [meetingInfo, setMeetingInfo] = useState({
    hostName: 'Host',
    participantName: 'Participant',
    isHost: false,
    meetingTitle: 'Meeting'
  })

  useEffect(() => {
    if (roomId) {
      const meetingData = location.state || {}
      console.log('🚀 Initializing meeting room with data:', meetingData)
      setMeetingInfo(meetingData)
      initializeRoom(roomId, meetingData)
    }
  }, [roomId, initializeRoom, location.state])

  // Auto-show admission control when there are pending participants
  useEffect(() => {
    if (isHost && pendingParticipants.length > 0 && !showAdmission) {
      console.log('👋 New join request detected, showing notification')
      setShowJoinNotification(true)
      // Auto-hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowJoinNotification(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isHost, pendingParticipants.length, showAdmission])

  // Debug logging for participants
  useEffect(() => {
    console.log('👥 Current participants:', participants.length)
    console.log('⏳ Pending participants:', pendingParticipants.length)
  }, [participants.length, pendingParticipants.length])

  const copyRoomId = async () => {
    if (roomId) {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLeaveMeeting = () => {
    leaveMeeting()
    navigate('/')
  }

  if (!roomId) {
    return <div>Invalid room</div>
  }

  const remoteStreams = participants.map(p => p.stream).filter(Boolean) as MediaStream[]
  const currentUserName = meetingInfo.isHost ? meetingInfo.hostName : meetingInfo.participantName

  return (
    <div className="h-screen bg-gray-900 flex flex-col lg:flex-row">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <h1 className="text-lg sm:text-xl font-semibold text-white">AdjustMeeting</h1>
              <div className="text-sm sm:text-base text-gray-300">{meetingInfo.meetingTitle}</div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 text-sm sm:text-base">
                <span className="text-gray-300">Room:</span>
                <span className="font-mono text-blue-400 bg-gray-700 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">{roomId}</span>
                <button
                  onClick={copyRoomId}
                  className="p-1 sm:p-2 text-gray-400 hover:text-white transition-colors"
                  title="Copy room code"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                {copied && (
                  <span className="text-green-400 text-xs sm:text-sm">Copied!</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Participants button */}
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{participants.length + 1}</span>
                </button>
                
                {/* Admission control button (host only) */}
                {isHost && (
                  <button
                    onClick={() => setShowAdmission(!showAdmission)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                      pendingParticipants.length > 0
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                    {pendingParticipants.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                        {pendingParticipants.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            isScreenSharing={isScreenSharing}
            isLocalVideoEnabled={isVideoEnabled}
            isLocalAudioEnabled={isAudioEnabled}
            localUserName={currentUserName}
            participants={participants}
          />
        </div>

        {/* Controls */}
        <ControlBar
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onLeaveMeeting={handleLeaveMeeting}
        />
      </div>
      
      {/* Participants Panel */}
      {showParticipants && (
        <div className="w-full lg:w-80 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 max-h-96 lg:max-h-full overflow-y-auto">
          <ParticipantsList
            participants={participants}
            localParticipantName={currentUserName}
            isLocalHost={isHost}
            isLocalAudioEnabled={isAudioEnabled}
            isLocalVideoEnabled={isVideoEnabled}
            onClose={() => setShowParticipants(false)}
          />
        </div>
      )}
      
      {/* Join Request Notification */}
      {showJoinNotification && isHost && pendingParticipants.length > 0 && !showAdmission && (
        <div className="fixed top-4 right-4 z-50 bg-orange-600 text-white p-3 sm:p-4 rounded-lg shadow-lg border border-orange-500 max-w-xs sm:max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-sm sm:text-base">Join Request</span>
            </div>
            <button
              onClick={() => setShowJoinNotification(false)}
              className="text-orange-200 hover:text-white"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-sm mb-3">
            {pendingParticipants[0]?.name} wants to join the meeting
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setShowAdmission(true)
                setShowJoinNotification(false)
              }}
              className="flex-1 bg-white text-orange-600 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Review
            </button>
          </div>
        </div>
      )}
      
      {/* Admission Control Modal */}
      {showAdmission && isHost && (
        <AdmissionControl
          pendingParticipants={pendingParticipants}
          onClose={() => setShowAdmission(false)}
        />
      )}
    </div>
  )
}

export default MeetingRoom