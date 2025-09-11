import React, { useRef, useEffect } from 'react'
import { User, Mic, MicOff } from 'lucide-react'

interface VideoTileProps {
  stream: MediaStream | null
  isLocal: boolean
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  name: string
  isScreenShare?: boolean
  className?: string
}

const VideoTile: React.FC<VideoTileProps> = ({
  stream,
  isLocal,
  isVideoEnabled,
  isAudioEnabled,
  name,
  isScreenShare = false,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 w-full h-full ${className}`}>
      {stream && isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal && !isScreenShare ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 p-2">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
          </div>
          <span className="text-gray-300 text-xs sm:text-sm font-medium text-center">{name}</span>
        </div>
      )}
      
      {/* Name and status overlay */}
      <div className="absolute bottom-1 left-1 flex items-center space-x-1">
        <span className="text-white text-xs font-medium bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-full max-w-[120px] truncate">
          {name}
        </span>
        {!isAudioEnabled && (
          <div className="bg-red-500 p-1 rounded-full">
            <MicOff className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
      
      {/* Connection indicator */}
      <div className="absolute top-1 right-1">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    </div>
  )
}

export default VideoTile