import React from 'react'
import { Video } from 'lucide-react'
import VideoTile from './VideoTile'

interface Participant {
  id: string
  name: string
  stream?: MediaStream
  isAudioEnabled: boolean
  isVideoEnabled: boolean
}

interface VideoGridProps {
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  isScreenSharing: boolean
  isLocalVideoEnabled: boolean
  isLocalAudioEnabled: boolean
  localUserName: string
  participants: Participant[]
}

const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  isScreenSharing,
  isLocalVideoEnabled,
  isLocalAudioEnabled,
  localUserName,
  participants
}) => {
  const totalParticipants = (localStream ? 1 : 0) + remoteStreams.length
  
  // If someone is screen sharing, use a different layout
  if (isScreenSharing) {
    return (
      <div className="h-full flex flex-col lg:flex-row bg-gray-900">
        {/* Main screen share area */}
        <div className="flex-1 p-3 sm:p-6">
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isLocalVideoEnabled}
            isAudioEnabled={isLocalAudioEnabled}
            isScreenShare={true}
            name={`${localUserName} (Screen Share)`}
            className="w-full h-full rounded-lg shadow-2xl"
          />
        </div>
        
        {/* Sidebar with participant videos */}
        <div className="w-full lg:w-80 p-3 sm:p-6 space-y-2 sm:space-y-4 bg-gray-800/80 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-gray-700 max-h-48 lg:max-h-full overflow-y-auto">
          <div className="text-white text-xs sm:text-sm font-medium mb-2 sm:mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Participants ({totalParticipants})
          </div>
          
          <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 sm:lg:space-y-4 overflow-x-auto lg:overflow-x-visible">
          {localStream && (
            <VideoTile
              stream={localStream}
              isLocal={true}
              isVideoEnabled={isLocalVideoEnabled}
              isAudioEnabled={isLocalAudioEnabled}
              name={localUserName}
              className="w-24 h-16 sm:w-32 sm:h-20 lg:w-full lg:h-32 rounded-lg shadow-lg flex-shrink-0"
            />
          )}
          {remoteStreams.map((stream, index) => {
            const participant = participants[index]
            return (
            <VideoTile
              key={index}
              stream={stream}
              isLocal={false}
              isVideoEnabled={participant?.isVideoEnabled ?? true}
              isAudioEnabled={participant?.isAudioEnabled ?? true}
              name={participant?.name || `Participant ${index + 1}`}
              className="w-24 h-16 sm:w-32 sm:h-20 lg:w-full lg:h-32 rounded-lg shadow-lg flex-shrink-0"
            />
            )
          })}
          </div>
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
    <div className="h-full p-3 sm:p-6 bg-gray-900">
      <div className={`grid ${getGridClass()} gap-4 h-full`}>
        {/* Local video */}
        {localStream && (
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isLocalVideoEnabled}
            isAudioEnabled={isLocalAudioEnabled}
            name={localUserName}
            className="rounded-lg shadow-lg"
          />
        )}
        
        {/* Remote videos */}
        {remoteStreams.map((stream, index) => {
          const participant = participants[index]
          return (
          <VideoTile
            key={index}
            stream={stream}
            isLocal={false}
            isVideoEnabled={participant?.isVideoEnabled ?? true}
            isAudioEnabled={participant?.isAudioEnabled ?? true}
            name={participant?.name || `Participant ${index + 1}`}
            className="rounded-lg shadow-lg"
          />
          )
        })}
        
        {/* Show loading state when no streams */}
        {totalParticipants === 0 && (
          <div className="flex items-center justify-center bg-gray-800 rounded-lg">
            <div className="text-center text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Waiting for participants to join...</p>
              <p className="text-sm mt-2">Share the room code with others</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoGrid