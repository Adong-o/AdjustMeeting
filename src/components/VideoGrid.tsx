import React from 'react'
import { Video, Users } from 'lucide-react'
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
        <div className="flex-1 p-2 sm:p-4 min-h-0 bg-black">
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
        <div className="h-32 lg:h-full lg:w-64 p-3 bg-gray-800/90 backdrop-blur-sm border-t lg:border-t-0 lg:border-l border-gray-700 overflow-y-auto">
          <div className="text-white text-sm font-medium mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-400" />
            Participants ({totalParticipants})
          </div>
          
          <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
            {/* Local participant (not screen sharing) */}
            {originalStreamRef.current && (
              <VideoTile
                stream={originalStreamRef.current}
                isLocal={true}
                isVideoEnabled={isLocalVideoEnabled}
                isAudioEnabled={isLocalAudioEnabled}
                name={`${localUserName} (You)`}
                className="w-24 h-18 lg:w-full lg:h-20 rounded-lg shadow-lg flex-shrink-0"
              />
            )}
            {/* Remote participants */}
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
                  className="w-24 h-18 lg:w-full lg:h-20 rounded-lg shadow-lg flex-shrink-0"
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
    if (totalParticipants === 2) return 'grid-cols-1 sm:grid-cols-2'
    if (totalParticipants <= 4) return 'grid-cols-2'
    if (totalParticipants <= 6) return 'grid-cols-2 lg:grid-cols-3'
    return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  const getVideoHeight = () => {
    if (totalParticipants === 1) return 'h-48 sm:h-64 lg:h-80'
    if (totalParticipants === 2) return 'h-40 sm:h-48 lg:h-64'
    if (totalParticipants <= 4) return 'h-32 sm:h-40 lg:h-48'
    return 'h-28 sm:h-32 lg:h-40'
  }

  return (
    <div className="h-full p-3 sm:p-4 bg-gray-900 overflow-y-auto">
      {totalParticipants === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-400 p-8">
            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Waiting for participants</h3>
            <p className="text-sm">Share the room code with others to start the meeting</p>
          </div>
        </div>
      ) : (
        <div className={`grid ${getGridClass()} gap-3 sm:gap-4 place-items-center h-full`}>
        {/* Local video */}
        {localStream && (
          <VideoTile
            stream={localStream}
            isLocal={true}
            isVideoEnabled={isLocalVideoEnabled}
            isAudioEnabled={isLocalAudioEnabled}
            name={localUserName}
            className={`rounded-lg shadow-lg w-full max-w-md ${getVideoHeight()}`}
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
            className={`rounded-lg shadow-lg w-full max-w-md ${getVideoHeight()}`}
          />
          )
        })}
      </div>
      )}
    </div>
  )
}

export default VideoGrid