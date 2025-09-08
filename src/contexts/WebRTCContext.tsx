import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

interface WebRTCContextType {
  localStream: MediaStream | null
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isScreenSharing: boolean
  initializeRoom: (roomId: string, meetingData?: any) => Promise<void>
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => void
  leaveMeeting: () => void
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined)

export const useWebRTC = () => {
  const context = useContext(WebRTCContext)
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider')
  }
  return context
}

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  
  const originalStreamRef = useRef<MediaStream | null>(null)

  const initializeRoom = useCallback(async (roomId: string, meetingData?: any) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      originalStreamRef.current = stream
      setIsAudioEnabled(true)
      setIsVideoEnabled(true)
      
      console.log(`Room ${roomId} initialized successfully`)
      
    } catch (error) {
      console.error('Error accessing media devices:', error)
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        })
        setLocalStream(audioStream)
        setIsVideoEnabled(false)
      } catch (audioError) {
        console.error('Error accessing audio device:', audioError)
      }
    }
  }, [])

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }, [localStream])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [localStream])

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        
        setLocalStream(screenStream)
        setIsScreenSharing(true)
        
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          if (originalStreamRef.current) {
            setLocalStream(originalStreamRef.current)
            setIsScreenSharing(false)
          }
        })
        
      } else {
        if (originalStreamRef.current) {
          setLocalStream(originalStreamRef.current)
          setIsScreenSharing(false)
        }
      }
    } catch (error) {
      console.error('Error toggling screen share:', error)
    }
  }, [isScreenSharing])

  const leaveMeeting = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    
    setLocalStream(null)
    setIsScreenSharing(false)
    setIsAudioEnabled(true)
    setIsVideoEnabled(true)
  }, [localStream])

  const value: WebRTCContextType = {
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    initializeRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveMeeting
  }

  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  )
}