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
  const userNameRef = useRef<string>('')

  const initializeRoom = useCallback(async (roomId: string, isHost: boolean, userName: string) => {
    try {
      console.log('🚀 Initializing room:', roomId, 'as', isHost ? 'host' : 'participant')
      userNameRef.current = userName
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
      
      // Try audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: false 
        })
        setLocalStream(audioStream)
        setIsVideoEnabled(false)
        setConnectionStatus('Audio Only Mode')
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
      }
    }
  }, [localStream, isAudioEnabled])

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        })
        
        setLocalStream(screenStream)
        setIsScreenSharing(true)
        
        // Replace video track in all peer connections
        const videoTrack = screenStream.getVideoTracks()[0]
        if (videoTrack) {
          await webrtcServiceRef.current?.replaceVideoTrack(videoTrack)
        }
        
        // Handle screen share end
        videoTrack.addEventListener('ended', () => {
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
    }
  }, [isScreenSharing])

  const admitParticipant = useCallback((participantId: string) => {
    const pending = pendingParticipants.find(p => p.id === participantId)
    if (pending) {
      webrtcServiceRef.current?.admitParticipant(participantId, pending.name)
      setPendingParticipants(prev => prev.filter(p => p.id !== participantId))
    }
  }, [pendingParticipants])

  const rejectParticipant = useCallback((participantId: string) => {
    webrtcServiceRef.current?.rejectParticipant(participantId)
    setPendingParticipants(prev => prev.filter(p => p.id !== participantId))
  }, [])

  const leaveMeeting = useCallback(() => {
    webrtcServiceRef.current?.leave()
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    if (originalStreamRef.current) {
      originalStreamRef.current.getTracks().forEach(track => track.stop())
    }
    
    setLocalStream(null)
    setParticipants([])
    setPendingParticipants([])
    setIsScreenSharing(false)
    setIsAudioEnabled(true)
    setIsVideoEnabled(true)
    setConnectionStatus('Disconnected')
  }, [localStream])

  useEffect(() => {
    return () => {
      webrtcServiceRef.current?.leave()
    }
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