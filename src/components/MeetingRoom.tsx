import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useWebRTC } from '../contexts/WebRTCContext'
import VideoGrid from './VideoGrid'
import ControlBar from './ControlBar'
import ParticipantsList from './ParticipantsList'
import AdmissionControl from './AdmissionControl'
import { Copy, Users, UserCheck } from 'lucide-react'

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
  const [meetingInfo, setMeetingInfo] = useState({
    hostName: 'Host',
    participantName: 'Participant',
    isHost: false
  })

  useEffect(() => {
    if (roomId) {
      const meetingData = location.state || {}
      setMeetingInfo(meetingData)
      initializeRoom(roomId, meetingData)
    }
  }, [roomId, initializeRoom, location.state])

  // Auto-show admission control when there are pending participants
  useEffect(() => {
    if (isHost && pendingParticipants.length > 0 && !showAdmission) {
      setShowAdmission(true)
    }
  }, [isHost, pendingParticipants.length, showAdmission])

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
    <div className="h-screen bg-gray-900 flex">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-white">AdjustMeeting</h1>
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">Room:</span>
            <span className="font-mono text-blue-400 bg-gray-700 px-3 py-1 rounded">{roomId}</span>
            <button
              onClick={copyRoomId}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Copy room code"
            >
              <Copy className="w-4 h-4" />
            </button>
            {copied && (
              <span className="text-green-400 text-sm">Copied!</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Participants button */}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{participants.length + 1}</span>
            </button>
            
            {/* Admission control button (host only) */}
            {isHost && (
              <button
                onClick={() => setShowAdmission(!showAdmission)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  pendingParticipants.length > 0
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                {pendingParticipants.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingParticipants.length}
                  </span>
                )}
              </button>
            )}
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
        <div className="w-80 bg-gray-800 border-l border-gray-700">
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