import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useWebRTC } from '../contexts/WebRTCContext'
import VideoGrid from './VideoGrid'
import ControlBar from './ControlBar'
import ParticipantsList from './ParticipantsList'
import AdmissionControl from './AdmissionControl'
import { Copy, Users, Settings, Crown } from 'lucide-react'

const MeetingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    localStream, 
    remoteStreams, 
    isAudioEnabled, 
    isVideoEnabled, 
    isScreenSharing,
    participants,
    pendingParticipants,
    isHost,
    initializeRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveMeeting
  } = useWebRTC()

  const [showParticipants, setShowParticipants] = useState(false)
  const [showAdmissionControl, setShowAdmissionControl] = useState(false)
  const [copied, setCopied] = useState(false)
  const [meetingInfo, setMeetingInfo] = useState({
    title: 'Meeting',
    hostName: 'Host',
    isHost: false
  })

  useEffect(() => {
    if (roomId) {
      const meetingData = location.state || {}
      setMeetingInfo(meetingData)
      initializeRoom(roomId, meetingData)
    }
  }, [roomId, initializeRoom, location.state])

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

  return (
    <div className="h-screen bg-gray-900 flex flex-col relative">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center">
              AdjustMeeting
              {meetingInfo.isHost && <Crown className="w-5 h-5 ml-2 text-yellow-500" />}
            </h1>
            <p className="text-sm text-gray-400">{meetingInfo.title} • Host: {meetingInfo.hostName}</p>
          </div>
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
        </div>
        
        <div className="flex items-center space-x-4">
          {meetingInfo.isHost && pendingParticipants.length > 0 && (
            <button
              onClick={() => setShowAdmissionControl(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-300 animate-pulse shadow-lg"
            >
              <Users className="w-4 h-4" />
              <span>{pendingParticipants.length} waiting</span>
            </button>
          )}
          
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:scale-105"
          >
            <Users className="w-4 h-4" />
            <span>{participants.length + 1}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Video Grid */}
        <div className="flex-1">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            isScreenSharing={isScreenSharing}
            isLocalVideoEnabled={isVideoEnabled}
          />
        </div>

        {/* Participants Panel */}
        {showParticipants && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <ParticipantsList
              participants={participants}
              onClose={() => setShowParticipants(false)}
            />
          </div>
        )}
      </div>

      {/* Admission Control Modal */}
      {showAdmissionControl && meetingInfo.isHost && (
        <AdmissionControl
          pendingParticipants={pendingParticipants}
          onClose={() => setShowAdmissionControl(false)}
        />
      )}

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
  )
}

export default MeetingRoom