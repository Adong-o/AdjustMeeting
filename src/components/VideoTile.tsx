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
          className={`w-full h-full object-cover ${isLocal && !isScreenShare ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
          <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-gray-300" />
          </div>
          <span className="text-gray-300 text-lg font-medium">{name}</span>
        </div>
      )}
      
      {/* Name and status overlay */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
        <span className="text-white text-sm font-medium bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
          {name}
        </span>
        {!isAudioEnabled && (
          <div className="bg-red-500 p-1.5 rounded-full">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Connection indicator */}
      <div className="absolute top-4 right-4">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>
    </div>
  )
}

export default VideoTile