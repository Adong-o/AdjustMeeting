import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

interface Participant {
  id: string
  name: string
  stream?: MediaStream
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isHost?: boolean
}

interface PendingParticipant {
  id: string
  name: string
  requestTime: Date
}

interface WebRTCContextType {
  localStream: MediaStream | null
  participants: Participant[]
  pendingParticipants: PendingParticipant[]
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isScreenSharing: boolean
  isHost: boolean
  roomId: string | null
  meetingTitle: string
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

// Enhanced signaling system using localStorage with real-time polling
class EnhancedSignaling {
  private roomId: string
  private participantId: string
  private onMessage: (message: any) => void
  private pollInterval: NodeJS.Timeout | null = null
  private lastMessageTime: number = 0

  constructor(roomId: string, participantId: string, onMessage: (message: any) => void) {
    this.roomId = roomId
    this.participantId = participantId
    this.onMessage = onMessage
    this.startListening()
  }

  private startListening() {
    // Poll every 200ms for faster real-time communication
    this.pollInterval = setInterval(() => {
      const messages = this.getMessages()
      const newMessages = messages.filter(msg => 
        msg.timestamp > this.lastMessageTime && 
        msg.from !== this.participantId &&
        (msg.to === this.participantId || msg.to === 'all')
      )
      
      newMessages.forEach(message => {
        this.onMessage(message)
        this.lastMessageTime = Math.max(this.lastMessageTime, message.timestamp)
      })
    }, 200)
  }

  private getMessages(): any[] {
    const key = `meeting_${this.roomId}_messages`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  private addMessage(message: any) {
    const messages = this.getMessages()
    const newMessage = { 
      ...message, 
      timestamp: Date.now(),
      from: this.participantId,
      id: Math.random().toString(36).substr(2, 9)
    }
    messages.push(newMessage)
    
    // Keep only last 50 messages for performance
    if (messages.length > 50) {
      messages.splice(0, messages.length - 50)
    }
    localStorage.setItem(`meeting_${this.roomId}_messages`, JSON.stringify(messages))
  }

  send(message: any) {
    this.addMessage(message)
  }

  cleanup() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
  }
}

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [pendingParticipants, setPendingParticipants] = useState<PendingParticipant[]>([])
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [meetingTitle, setMeetingTitle] = useState<string>('Meeting')
  
  const originalStreamRef = useRef<MediaStream | null>(null)
  const signalingRef = useRef<EnhancedSignaling | null>(null)
  const participantIdRef = useRef<string>(Math.random().toString(36).substr(2, 9))
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const currentUserNameRef = useRef<string>('')

  const initializeRoom = useCallback(async (roomId: string, meetingData?: any) => {
    try {
      console.log('Initializing room:', roomId, meetingData)
      setRoomId(roomId)
      setIsHost(meetingData?.isHost || false)
      setMeetingTitle(meetingData?.meetingTitle || 'Meeting')
      currentUserNameRef.current = meetingData?.isHost ? meetingData.hostName : meetingData.participantName
      
      // Get user media with better constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      setLocalStream(stream)
      originalStreamRef.current = stream
      setIsAudioEnabled(true)
      setIsVideoEnabled(true)
      
      // Initialize enhanced signaling
      signalingRef.current = new EnhancedSignaling(
        roomId,
        participantIdRef.current,
        handleSignalingMessage
      )
      
      // Clear any existing room data
      localStorage.removeItem(`meeting_${roomId}_messages`)
      
      // Announce presence
      if (meetingData?.isHost) {
        console.log('Creating room as host')
        signalingRef.current.send({
          type: 'room_created',
          to: 'all',
          hostId: participantIdRef.current,
          hostName: meetingData.hostName,
          meetingTitle: meetingData.meetingTitle
        })
      } else {
        console.log('Requesting to join as participant')
        signalingRef.current.send({
          type: 'join_request',
          to: 'all',
          participantName: meetingData.participantName,
          participantId: participantIdRef.current
        })
      }
      
    } catch (error) {
      console.error('Error initializing room:', error)
      // Fallback to audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        setLocalStream(audioStream)
        setIsVideoEnabled(false)
      } catch (audioError) {
        console.error('Error accessing audio:', audioError)
      }
    }
  }, [])

  const handleSignalingMessage = useCallback(async (message: any) => {
    console.log('🔄 Received message:', message.type, 'from:', message.from, message)
    
    switch (message.type) {
      case 'room_created':
        if (message.from !== participantIdRef.current) {
          setMeetingTitle(message.meetingTitle || 'Meeting')
          console.log('🏠 Room created by host:', message.hostName)
        }
        break
        
      case 'join_request':
        if (isHost && message.from !== participantIdRef.current) {
          console.log('🙋 Join request from:', message.participantName, 'ID:', message.from)
          setPendingParticipants(prev => {
            const exists = prev.find(p => p.id === message.from)
            if (!exists) {
              return [...prev, {
                id: message.from,
                name: message.participantName,
                requestTime: new Date()
              }]
            }
            return prev
          })
        }
        break
        
      case 'join_approved':
        if (message.to === participantIdRef.current) {
          console.log('✅ Join approved! Creating peer connection with host')
          await createPeerConnection(message.from, true)
        }
        break
        
      case 'participant_joined':
        if (message.participantId !== participantIdRef.current) {
          console.log('👥 Participant joined:', message.participantName, 'ID:', message.participantId)
          setParticipants(prev => {
            const exists = prev.find(p => p.id === message.participantId)
            if (!exists) {
              return [...prev, {
                id: message.participantId,
                name: message.participantName,
                isAudioEnabled: true,
                isVideoEnabled: true
              }]
            }
            return prev
          })
          
          // Create peer connection if we're host
          if (isHost) {
            await createPeerConnection(message.participantId, true)
          }
        }
        break
        
      case 'webrtc_offer':
        console.log('📞 Received WebRTC offer from:', message.from)
        await handleOffer(message.from, message.offer)
        break
        
      case 'webrtc_answer':
        console.log('📞 Received WebRTC answer from:', message.from)
        await handleAnswer(message.from, message.answer)
        break
        
      case 'webrtc_ice_candidate':
        console.log('🧊 Received ICE candidate from:', message.from)
        await handleIceCandidate(message.from, message.candidate)
        break
        
      case 'participant_left':
        console.log('Participant left:', message.participantId)
        setParticipants(prev => prev.filter(p => p.id !== message.participantId))
        const pc = peerConnectionsRef.current.get(message.participantId)
        if (pc) {
          pc.close()
          peerConnectionsRef.current.delete(message.participantId)
        }
        break

      case 'media_state_changed':
        if (message.participantId !== participantIdRef.current) {
          setParticipants(prev => prev.map(p => 
            p.id === message.participantId 
              ? { ...p, isAudioEnabled: message.isAudioEnabled, isVideoEnabled: message.isVideoEnabled }
              : p
          ))
        }
        break
    }
  }, [isHost])

  const createPeerConnection = async (participantId: string, createOffer: boolean) => {
    console.log('🔗 Creating peer connection with:', participantId, 'createOffer:', createOffer)
    
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    })

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log('🎥 Adding track:', track.kind, 'to peer connection')
        peerConnection.addTrack(track, localStream)
      })
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('🎬 Received remote track from:', participantId, 'kind:', event.track.kind)
      const [remoteStream] = event.streams
      setParticipants(prev => prev.map(p => 
        p.id === participantId 
          ? { ...p, stream: remoteStream }
          : p
      ))
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && signalingRef.current) {
        console.log('🧊 Sending ICE candidate to:', participantId)
        signalingRef.current.send({
          type: 'webrtc_ice_candidate',
          to: participantId,
          candidate: event.candidate
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('🔌 Connection state with', participantId, ':', peerConnection.connectionState)
    }

    peerConnectionsRef.current.set(participantId, peerConnection)

    if (createOffer) {
      try {
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        
        console.log('📤 Sending offer to:', participantId)
        if (signalingRef.current) {
          signalingRef.current.send({
            type: 'webrtc_offer',
            to: participantId,
            offer: offer
          })
        }
      } catch (error) {
        console.error('Error creating offer:', error)
      }
    }
  }

  const handleOffer = async (participantId: string, offer: RTCSessionDescriptionInit) => {
    try {
      await createPeerConnection(participantId, false)
      const peerConnection = peerConnectionsRef.current.get(participantId)
      
      if (peerConnection) {
        await peerConnection.setRemoteDescription(offer)
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        
        console.log('📤 Sending answer to:', participantId)
        if (signalingRef.current) {
          signalingRef.current.send({
            type: 'webrtc_answer',
            to: participantId,
            answer: answer
          })
        }
      }
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  const handleAnswer = async (participantId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(participantId)
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer)
        console.log('✅ Set remote description (answer) for:', participantId)
      }
    } catch (error) {
      console.error('Error handling answer:', error)
    }
  }

  const handleIceCandidate = async (participantId: string, candidate: RTCIceCandidateInit) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(participantId)
      if (peerConnection && peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(candidate)
        console.log('✅ Added ICE candidate for:', participantId)
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
    }
  }

  const admitParticipant = useCallback((participantId: string) => {
    const pending = pendingParticipants.find(p => p.id === participantId)
    if (pending && signalingRef.current) {
      console.log('✅ Admitting participant:', pending.name, 'ID:', participantId)
      
      // Remove from pending
      setPendingParticipants(prev => prev.filter(p => p.id !== participantId))
      
      // Send approval
      signalingRef.current.send({
        type: 'join_approved',
        to: participantId
      })
      
      // Announce to all participants
      signalingRef.current.send({
        type: 'participant_joined',
        to: 'all',
        participantId: participantId,
        participantName: pending.name
      })
    }
  }, [pendingParticipants])

  const rejectParticipant = useCallback((participantId: string) => {
    console.log('❌ Rejecting participant:', participantId)
    setPendingParticipants(prev => prev.filter(p => p.id !== participantId))
    
    if (signalingRef.current) {
      signalingRef.current.send({
        type: 'join_rejected',
        to: participantId
      })
    }
  }, [])

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
        
        // Notify other participants
        if (signalingRef.current) {
          signalingRef.current.send({
            type: 'media_state_changed',
            to: 'all',
            participantId: participantIdRef.current,
            isAudioEnabled: audioTrack.enabled,
            isVideoEnabled: isVideoEnabled
          })
        }
      }
    }
  }, [localStream, isVideoEnabled])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
        
        // Notify other participants
        if (signalingRef.current) {
          signalingRef.current.send({
            type: 'media_state_changed',
            to: 'all',
            participantId: participantIdRef.current,
            isAudioEnabled: isAudioEnabled,
            isVideoEnabled: videoTrack.enabled
          })
        }
      }
    }
  }, [localStream, isAudioEnabled])

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        
        setLocalStream(screenStream)
        setIsScreenSharing(true)
        
        // Replace video track in all peer connections
        peerConnectionsRef.current.forEach(peerConnection => {
          const videoTrack = screenStream.getVideoTracks()[0]
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack)
          }
        })
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          if (originalStreamRef.current) {
            setLocalStream(originalStreamRef.current)
            setIsScreenSharing(false)
            
            // Replace back to camera
            peerConnectionsRef.current.forEach(peerConnection => {
              const videoTrack = originalStreamRef.current?.getVideoTracks()[0]
              const sender = peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
              )
              if (sender && videoTrack) {
                sender.replaceTrack(videoTrack)
              }
            })
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
    console.log('👋 Leaving meeting')
    
    // Notify others
    if (signalingRef.current) {
      signalingRef.current.send({
        type: 'participant_left',
        to: 'all',
        participantId: participantIdRef.current
      })
      signalingRef.current.cleanup()
    }
    
    // Close peer connections
    peerConnectionsRef.current.forEach(pc => pc.close())
    peerConnectionsRef.current.clear()
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
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
    setRoomId(null)
  }, [localStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (signalingRef.current) {
        signalingRef.current.cleanup()
      }
      peerConnectionsRef.current.forEach(pc => pc.close())
    }
  }, [])

  const value: WebRTCContextType = {
    localStream,
    participants,
    pendingParticipants,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isHost,
    roomId,
    meetingTitle,
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