import React from 'react'
import VideoTile from './VideoTile'

interface VideoGridProps {
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  isScreenSharing: boolean
  isLocalVideoEnabled: boolean
}

const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  isScreenSharing,
  isLocalVideoEnabled
}) => {
  const totalParticipants = 1 + remoteStreams.length
  
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
            isScreenShare={true}
            name="You (Screen Share)"
            className="w-full h-full rounded-lg shadow-2xl"
          />
        </div>
        
        {/* Sidebar with participant videos */}
        <div className="w-80 p-6 space-y-4 bg-gray-800/80 backdrop-blur-sm border-l border-gray-700">
          <div className="text-white text-sm font-medium mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Participants ({1 + remoteStreams.length})
          </div>
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isLocalVideoEnabled}
            name="You"
            className="w-full h-32 rounded-lg shadow-lg"
          />
          {remoteStreams.map((stream, index) => (
            <VideoTile
              key={index}
              stream={stream}
              isLocal={false}
              isVideoEnabled={true}
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
        <VideoTile
          stream={localStream}
          isLocal={true}
          isVideoEnabled={isLocalVideoEnabled}
          name="You"
          className="rounded-lg shadow-lg"
        />
        
        {/* Remote videos */}
        {remoteStreams.map((stream, index) => (
          <VideoTile
            key={index}
            stream={stream}
            isLocal={false}
            isVideoEnabled={true}
            name={`Participant ${index + 1}`}
            className="rounded-lg shadow-lg"
          />
        ))}
      </div>
    </div>
  )
}

export default VideoGrid