import { useState, useCallback, useRef, useEffect } from 'react'
import { WebRTCService, Participant, PendingParticipant } from '../services/WebRTCService'

interface UseWebRTCReturn {
  localStream: MediaStream | null
  participants: Participant[]
  pendingParticipants: PendingParticipant[]
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isScreenSharing: boolean
  connectionStatus: string
  initializeRoom: (roomId: string, isHost: boolean, userName: string) => Promise<void>
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => void
  admitParticipant: (participantId: string) => void
  rejectParticipant: (participantId: string) => void
  leaveMeeting: () => void
}

export const useWebRTC = (): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [pendingParticipants, setPendingParticipants] = useState<PendingParticipant[]>([])
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')

  const webrtcServiceRef = useRef<WebRTCService | null>(null)
  const originalStreamRef = useRef<MediaStream | null>(null)
  const participantIdRef = useRef<string>(Math.random().toString(36).substr(2, 9))

  const initializeRoom = useCallback(async (roomId: string, isHost: boolean, userName: string) => {
    try {
      console.log('🚀 Initializing room:', roomId, 'as', isHost ? 'host' : 'participant', 'name:', userName)
      setConnectionStatus('Getting media...')
      
      // Get user media with optimized constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      setLocalStream(stream)
      originalStreamRef.current = stream
      setIsAudioEnabled(true)
      setIsVideoEnabled(true)
      
      // Initialize WebRTC service
      webrtcServiceRef.current = new WebRTCService(
        roomId,
        participantIdRef.current,
        userName,
        isHost,
        {
          onParticipantJoined: (participant) => {
            console.log('👥 Participant joined callback:', participant.name)
            setParticipants(prev => {
              const exists = prev.find(p => p.id === participant.id)
              if (!exists) {
                return [...prev, participant]
              }
              return prev
            })
          },
          onParticipantLeft: (participantId) => {
            console.log('👋 Participant left callback:', participantId)
            setParticipants(prev => prev.filter(p => p.id !== participantId))
          },
          onPendingParticipant: (participant) => {
            console.log('🙋 Pending participant callback:', participant.name)
            setPendingParticipants(prev => {
              const exists = prev.find(p => p.id === participant.id)
              if (!exists) {
                return [...prev, participant]
              }
              return prev
            })
          },
          onConnectionStatusChanged: (status) => {
            console.log('🔌 Connection status changed:', status)
            setConnectionStatus(status)
          },
          onRemoteStream: (participantId, stream) => {
            console.log('🎬 Remote stream received for:', participantId)
            setParticipants(prev => prev.map(p => 
              p.id === participantId ? { ...p, stream } : p
            ))
          },
          onParticipantMediaChanged: (participantId, isAudioEnabled, isVideoEnabled) => {
            console.log('🎥 Media state changed for:', participantId, { isAudioEnabled, isVideoEnabled })
            setParticipants(prev => prev.map(p => 
              p.id === participantId ? { ...p, isAudioEnabled, isVideoEnabled } : p
            ))
          }
        }
      )
      
      await webrtcServiceRef.current.initialize(stream)
      
    } catch (error) {
      console.error('❌ Error initializing room:', error)
      setConnectionStatus('Initialization Failed')
      
      // Try audio only as fallback
      try {
        console.log('🎤 Trying audio-only mode...')
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }, 
          video: false 
        })
        setLocalStream(audioStream)
        setIsVideoEnabled(false)
        setConnectionStatus('Audio Only Mode')
        
        if (webrtcServiceRef.current) {
          await webrtcServiceRef.current.initialize(audioStream)
        }
      } catch (audioError) {
        console.error('❌ Error accessing audio:', audioError)
        setConnectionStatus('Media Access Denied')
      }
    }
  }, [])

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
        webrtcServiceRef.current?.broadcastMediaState(audioTrack.enabled, isVideoEnabled)
        console.log('🎤 Audio toggled:', audioTrack.enabled ? 'ON' : 'OFF')
      }
    }
  }, [localStream, isVideoEnabled])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
        webrtcServiceRef.current?.broadcastMediaState(isAudioEnabled, videoTrack.enabled)
        console.log('📹 Video toggled:', videoTrack.enabled ? 'ON' : 'OFF')
      }
    }
  }, [localStream, isAudioEnabled])

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        console.log('🖥️ Starting screen share...')
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 }
          },
          audio: true
        })
        
        setLocalStream(screenStream)
        setIsScreenSharing(true)
        
        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0]
        if (videoTrack) {
          await webrtcServiceRef.current?.replaceVideoTrack(videoTrack)
        }
        
        // Handle screen share end (when user stops sharing)
        videoTrack.addEventListener('ended', () => {
          console.log('🖥️ Screen share ended by user')
          if (originalStreamRef.current) {
            setLocalStream(originalStreamRef.current)
            setIsScreenSharing(false)
            
            // Replace back to camera
            const cameraTrack = originalStreamRef.current.getVideoTracks()[0]
            if (cameraTrack) {
              webrtcServiceRef.current?.replaceVideoTrack(cameraTrack)
            }
          }
        })
        
      } else {
        console.log('🖥️ Stopping screen share...')
        if (originalStreamRef.current) {
          setLocalStream(originalStreamRef.current)
          setIsScreenSharing(false)
          
          const videoTrack = originalStreamRef.current.getVideoTracks()[0]
          if (videoTrack) {
            await webrtcServiceRef.current?.replaceVideoTrack(videoTrack)
          }
        }
      }
    } catch (error) {
      console.error('❌ Error toggling screen share:', error)
      setConnectionStatus('Screen Share Failed')
    }
  }, [isScreenSharing])

  const admitParticipant = useCallback((participantId: string) => {
    const pending = pendingParticipants.find(p => p.id === participantId)
    if (pending) {
      console.log('✅ Admitting participant:', pending.name)
      webrtcServiceRef.current?.admitParticipant(participantId, pending.name)
      setPendingParticipants(prev => prev.filter(p => p.id !== participantId))
    }
  }, [pendingParticipants])

  const rejectParticipant = useCallback((participantId: string) => {
    const pending = pendingParticipants.find(p => p.id === participantId)
    if (pending) {
      console.log('❌ Rejecting participant:', pending.name)
      webrtcServiceRef.current?.rejectParticipant(participantId)
      setPendingParticipants(prev => prev.filter(p => p.id !== participantId))
    }
  }, [pendingParticipants])

  const leaveMeeting = useCallback(() => {
    console.log('👋 Leaving meeting...')
    webrtcServiceRef.current?.leave()
    
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop()
        console.log('🛑 Stopped track:', track.kind)
      })
    }
    if (originalStreamRef.current) {
      originalStreamRef.current.getTracks().forEach(track => track.stop())
    }
    
    // Reset state
    setLocalStream(null)
    setParticipants([])
    setPendingParticipants([])
    setIsScreenSharing(false)
    setIsAudioEnabled(true)
    setIsVideoEnabled(true)
    setConnectionStatus('Disconnected')
  }, [localStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webrtcServiceRef.current?.leave()
    }
  }, [])

  // Debug logging
  useEffect(() => {
    const interval = setInterval(() => {
      if (webrtcServiceRef.current) {
        const states = webrtcServiceRef.current.getConnectionStates()
        if (Object.keys(states).length > 0) {
          console.log('🔍 Connection states:', states)
        }
      }
    }, 10000) // Log every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return {
    localStream,
    participants,
    pendingParticipants,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    connectionStatus,
    initializeRoom,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    admitParticipant,
    rejectParticipant,
    leaveMeeting
  }
}