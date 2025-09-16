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
      <div className="h-full flex flex-col bg-gray-900">
        {/* Main screen share area */}
        <div className="flex-1 p-2 sm:p-4 min-h-0">
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isLocalVideoEnabled}
            isAudioEnabled={isLocalAudioEnabled}
            isScreenShare={true}
            name={`${localUserName} (Screen Share)`}
            className="w-full h-full rounded-lg shadow-lg object-contain bg-black"
          />
        </div>
        
        {/* Sidebar with participant videos */}
        <div className="h-24 sm:h-32 p-2 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 overflow-x-auto">
          <div className="text-white text-xs font-medium mb-2 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Participants ({totalParticipants})
          </div>
          
          <div className="flex space-x-2 h-16">
          {localStream && (
            <VideoTile
              stream={localStream}
              isLocal={true}
              isVideoEnabled={isLocalVideoEnabled}
              isAudioEnabled={isLocalAudioEnabled}
              name={localUserName}
              className="w-20 h-16 rounded-lg shadow-lg flex-shrink-0"
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
              className="w-20 h-16 rounded-lg shadow-lg flex-shrink-0"
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
    if (totalParticipants === 2) return 'grid-cols-1 md:grid-cols-2'
    if (totalParticipants <= 4) return 'grid-cols-2 md:grid-cols-2'
    if (totalParticipants <= 6) return 'grid-cols-2 md:grid-cols-3'
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }

  const getVideoHeight = () => {
    if (totalParticipants === 1) return 'h-64 sm:h-80 md:h-96'
    if (totalParticipants === 2) return 'h-48 sm:h-64 md:h-80'
    if (totalParticipants <= 4) return 'h-40 sm:h-48 md:h-64'
    return 'h-32 sm:h-40 md:h-48'
  }

  return (
    <div className="h-full p-2 sm:p-4 bg-gray-900">
      <div className={`grid ${getGridClass()} gap-2 sm:gap-4 place-items-center`}>
        {/* Local video */}
        {localStream && (
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isLocalVideoEnabled}
            isAudioEnabled={isLocalAudioEnabled}
            name={localUserName}
            className={`rounded-lg shadow-lg w-full max-w-sm ${getVideoHeight()}`}
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
            className={`rounded-lg shadow-lg w-full max-w-sm ${getVideoHeight()}`}
          />
          )
        })}
        
        {/* Show loading state when no streams */}
        {totalParticipants === 0 && (
          <div className="flex items-center justify-center bg-gray-800 rounded-lg">
            <div className="text-center text-gray-400 p-8">
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