import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useWebRTC } from '../contexts/WebRTCContext'
import VideoTile from './VideoTile'
import ControlBar from './ControlBar'
import { Copy } from 'lucide-react'

const MeetingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    localStream, 
    isAudioEnabled, 
    isVideoEnabled, 
    isScreenSharing,
    initializeRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveMeeting
  } = useWebRTC()

  const [copied, setCopied] = useState(false)
  const [meetingInfo, setMeetingInfo] = useState({
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
    <div className="h-screen bg-gray-900 flex flex-col">
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
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 p-6">
        <div className="h-full max-w-4xl mx-auto">
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            name={meetingInfo.isHost ? meetingInfo.hostName : 'You'}
            isScreenShare={isScreenSharing}
            className="w-full h-full rounded-lg shadow-lg"
          />
        </div>
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
  )
}

export default MeetingRoom