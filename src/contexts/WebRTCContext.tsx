import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

interface Participant {
  id: string
  name: string
  isAudioEnabled: boolean
  isVideoEnabled: boolean
}

interface PendingParticipant {
  id: string
  name: string
  requestTime: Date
}

interface WebRTCContextType {
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isScreenSharing: boolean
  participants: Participant[]
  pendingParticipants: PendingParticipant[]
  isHost: boolean
  initializeRoom: (roomId: string, meetingData?: any) => Promise<void>
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => void
  leaveMeeting: () => void
  admitParticipant: (participantId: string) => void
  rejectParticipant: (participantId: string) => void
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
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [pendingParticipants, setPendingParticipants] = useState<PendingParticipant[]>([])
  const [isHost, setIsHost] = useState(false)
  
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const socketRef = useRef<WebSocket | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const originalStreamRef = useRef<MediaStream | null>(null)

  const initializeRoom = useCallback(async (roomId: string, meetingData?: any) => {
    try {
      // Set host status
      setIsHost(meetingData?.isHost || false)
      
      // If not host, simulate joining request
      if (!meetingData?.isHost && meetingData?.participantName) {
        // Simulate pending participant (in real app, this would be sent to signaling server)
        const pendingParticipant: PendingParticipant = {
          id: Math.random().toString(36).substr(2, 9),
          name: meetingData.participantName,
          requestTime: new Date()
        }
        
        // For demo purposes, auto-add to pending list after a short delay
        setTimeout(() => {
          setPendingParticipants(prev => [...prev, pendingParticipant])
        }, 1000)
      }
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      originalStreamRef.current = stream
      
      // For demo purposes, we'll simulate a simple peer-to-peer connection
      // In a real implementation, you'd need a signaling server
      console.log(`Initialized room: ${roomId}`)
      
    } catch (error) {
      console.error('Error accessing media devices:', error)
      // Try again with audio only
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
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        
        screenStreamRef.current = screenStream
        setLocalStream(screenStream)
        setIsScreenSharing(true)
        
        // Listen for screen share end
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          // Restore original stream
          if (originalStreamRef.current) {
            setLocalStream(originalStreamRef.current)
            setIsScreenSharing(false)
            screenStreamRef.current = null
          }
        })
        
      } else {
        // Stop screen sharing
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop())
          screenStreamRef.current = null
        }
        
        if (originalStreamRef.current) {
          setLocalStream(originalStreamRef.current)
        }
        setIsScreenSharing(false)
      }
    } catch (error) {
      console.error('Error toggling screen share:', error)
    }
  }, [isScreenSharing])

  const admitParticipant = useCallback((participantId: string) => {
    setPendingParticipants(prev => {
      const participant = prev.find(p => p.id === participantId)
      if (participant) {
        // Add to participants list
        const newParticipant: Participant = {
          id: participant.id,
          name: participant.name,
          isAudioEnabled: true,
          isVideoEnabled: true
        }
        setParticipants(prevParticipants => [...prevParticipants, newParticipant])
        
        // Remove from pending list
        return prev.filter(p => p.id !== participantId)
      }
      return prev
    })
  }, [])

  const rejectParticipant = useCallback((participantId: string) => {
    setPendingParticipants(prev => prev.filter(p => p.id !== participantId))
  }, [])

  const leaveMeeting = useCallback(() => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop())
    }
    
    // Close peer connections
    peerConnectionsRef.current.forEach(pc => pc.close())
    peerConnectionsRef.current.clear()
    
    // Close socket connection
    if (socketRef.current) {
      socketRef.current.close()
    }
    
    // Reset state
    setLocalStream(null)
    setRemoteStreams([])
    setParticipants([])
    setPendingParticipants([])
    setIsScreenSharing(false)
    setIsAudioEnabled(true)
    setIsVideoEnabled(true)
    setIsHost(false)
  }, [localStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveMeeting()
    }
  }, [leaveMeeting])

  const value: WebRTCContextType = {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    participants,
    pendingParticipants,
    isHost,
    initializeRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveMeeting,
    admitParticipant,
    rejectParticipant
  }

  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  )
}

export default WebRTCProvider