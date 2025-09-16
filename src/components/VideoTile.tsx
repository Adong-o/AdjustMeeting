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
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 ${className}`}>
      {stream && isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full ${isScreenShare ? 'object-contain' : 'object-cover'} ${isLocal && !isScreenShare ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 p-4">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-3">
            <User className="w-8 h-8 text-gray-300" />
          </div>
          <span className="text-gray-300 text-sm font-medium text-center">{name}</span>
        </div>
      )}
      
      {/* Name and status overlay */}
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <span className="text-white text-xs font-medium bg-black/80 backdrop-blur-sm px-2 py-1 rounded-full max-w-[140px] truncate">
          {name}
        </span>
        {!isAudioEnabled && (
          <div className="bg-red-500 p-1.5 rounded-full">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Connection indicator */}
      <div className="absolute top-2 right-2">
        <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
      </div>
    </div>
  )
}

export default VideoTile