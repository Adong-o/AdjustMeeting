import React, { useRef, useEffect, useState } from 'react'
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
      
      // Ensure video plays
      videoRef.current.play().catch(console.error)
    }
  }, [stream])


  return (
    <div className={`relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 ${className}`}>
      {stream && isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent feedback
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
          <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2">
            <User className="w-8 h-8 text-gray-300" />
          </div>
          <span className="text-gray-300 text-sm font-medium">{name}</span>
        </div>
      )}
      
      {/* Overlay */}

      {/* Always visible name and status */}
      <div className="absolute bottom-3 left-3 flex items-center space-x-2">
        <span className="text-white text-xs font-medium bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
          {name}
        </span>
        {!isAudioEnabled && (
          <div className="bg-red-500 p-1.5 rounded-full shadow-lg">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Connection indicator */}
      <div className="absolute top-3 right-3">
        <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg"></div>
      </div>
    </div>
  )
}

export default VideoTile