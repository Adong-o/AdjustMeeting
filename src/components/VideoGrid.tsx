import React from 'react'
import { Video } from 'lucide-react'
import VideoTile from './VideoTile'

interface VideoGridProps {
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  isScreenSharing: boolean
  isLocalVideoEnabled: boolean
  isLocalAudioEnabled: boolean
}

const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  isScreenSharing,
  isLocalVideoEnabled,
  isLocalAudioEnabled
}) => {
  const totalParticipants = (localStream ? 1 : 0) + remoteStreams.length
  
  // If someone is screen sharing, use a different layout
  if (isScreenSharing) {
    return (
      <div className="h-full flex bg-gray-900">
        {/* Main screen share area */}
        <div className="flex-1 p-6">
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isLocalVideoEnabled}
            isAudioEnabled={isLocalAudioEnabled}
            isScreenShare={true}
            name="You (Screen Share)"
            className="w-full h-full rounded-lg shadow-2xl"
          />
        </div>
        
        {/* Sidebar with participant videos */}
        <div className="w-80 p-6 space-y-4 bg-gray-800/80 backdrop-blur-sm border-l border-gray-700">
          <div className="text-white text-sm font-medium mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Participants ({totalParticipants})
          </div>
          {localStream && (
            <VideoTile
              stream={localStream}
              isLocal={true}
              isVideoEnabled={isLocalVideoEnabled}
              isAudioEnabled={isLocalAudioEnabled}
              name="You"
              className="w-full h-32 rounded-lg shadow-lg"
            />
          )}
          {remoteStreams.map((stream, index) => (
            <VideoTile
              key={index}
              stream={stream}
              isLocal={false}
              isVideoEnabled={true}
              isAudioEnabled={true}
              name={`Participant ${index + 1}`}
              className="w-full h-32 rounded-lg shadow-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  // Regular grid layout
  const getGridClass = () => {
    if (totalParticipants === 0) return 'grid-cols-1'
    if (totalParticipants === 1) return 'grid-cols-1'
    if (totalParticipants === 2) return 'grid-cols-2'
    if (totalParticipants <= 4) return 'grid-cols-2 grid-rows-2'
    if (totalParticipants <= 6) return 'grid-cols-3 grid-rows-2'
    return 'grid-cols-3 grid-rows-3'
  }

  return (
    <div className="h-full p-6 bg-gray-900">
      <div className={`grid ${getGridClass()} gap-4 h-full`}>
        {/* Local video */}
        {localStream && (
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isLocalVideoEnabled}
            isAudioEnabled={isLocalAudioEnabled}
            name="You"
            className="rounded-lg shadow-lg"
          />
        )}
        
        {/* Remote videos */}
        {remoteStreams.map((stream, index) => (
          <VideoTile
            key={index}
            stream={stream}
            isLocal={false}
            isVideoEnabled={true}
            isAudioEnabled={true}
            name={`Participant ${index + 1}`}
            className="rounded-lg shadow-lg"
          />
        ))}
        
        {/* Show loading state when no streams */}
        {totalParticipants === 0 && (
          <div className="flex items-center justify-center bg-gray-800 rounded-lg">
            <div className="text-center text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Connecting to camera...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoGrid