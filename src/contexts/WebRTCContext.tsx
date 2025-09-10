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

// Simple signaling server simulation using localStorage for demo
class SimpleSignaling {
  private roomId: string
  private participantId: string
  private onMessage: (message: any) => void

  constructor(roomId: string, participantId: string, onMessage: (message: any) => void) {
    this.roomId = roomId
    this.participantId = participantId
    this.onMessage = onMessage
    this.startListening()
  }

  private startListening() {
    // Poll for messages every 500ms (in real app, use WebSocket)
    setInterval(() => {
      const messages = this.getMessages()
      messages.forEach(message => {
        if (message.to === this.participantId || message.to === 'all') {
          this.onMessage(message)
        }
      })
    }, 500)
  }

  private getMessages(): any[] {
    const key = `meeting_${this.roomId}_messages`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  private addMessage(message: any) {
    const messages = this.getMessages()
    messages.push({ ...message, timestamp: Date.now() })
    // Keep only last 100 messages
    if (messages.length > 100) {
      messages.splice(0, messages.length - 100)
    }
    localStorage.setItem(`meeting_${this.roomId}_messages`, JSON.stringify(messages))
  }

  send(message: any) {
    this.addMessage({
      ...message,
      from: this.participantId
    })
  }

  cleanup() {
    // In real app, close WebSocket connection
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
  
  const originalStreamRef = useRef<MediaStream | null>(null)
  const signalingRef = useRef<SimpleSignaling | null>(null)
  const participantIdRef = useRef<string>(Math.random().toString(36).substr(2, 9))
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())

  const initializeRoom = useCallback(async (roomId: string, meetingData?: any) => {
    try {
      setRoomId(roomId)
      setIsHost(meetingData?.isHost || false)
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      originalStreamRef.current = stream
      setIsAudioEnabled(true)
      setIsVideoEnabled(true)
      
      // Initialize signaling
      signalingRef.current = new SimpleSignaling(
        roomId,
        participantIdRef.current,
        handleSignalingMessage
      )
      
      // If host, announce room creation
      if (meetingData?.isHost) {
        signalingRef.current.send({
          type: 'room_created',
          to: 'all',
          hostId: participantIdRef.current,
          hostName: meetingData.hostName
        })
      } else {
        // If participant, request to join
        signalingRef.current.send({
          type: 'join_request',
          to: 'all',
          participantName: meetingData.participantName,
          participantId: participantIdRef.current
        })
      }
      
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

  const handleSignalingMessage = useCallback(async (message: any) => {
    switch (message.type) {
      case 'join_request':
        if (isHost && message.from !== participantIdRef.current) {
          // Add to pending participants
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
          // Start WebRTC connection with host
          await createPeerConnection(message.from, true)
        }
        break
        
      case 'participant_joined':
        // Add participant to list
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
        
        // If we're host, create connection to new participant
        if (isHost) {
          await createPeerConnection(message.participantId, true)
        }
        break
        
      case 'webrtc_offer':
        await handleOffer(message.from, message.offer)
        break
        
      case 'webrtc_answer':
        await handleAnswer(message.from, message.answer)
        break
        
      case 'webrtc_ice_candidate':
        await handleIceCandidate(message.from, message.candidate)
        break
        
      case 'participant_left':
        setParticipants(prev => prev.filter(p => p.id !== message.participantId))
        peerConnectionsRef.current.delete(message.participantId)
        break
    }
  }, [isHost])

  const createPeerConnection = async (participantId: string, createOffer: boolean) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    // Add local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
      })
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
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
        signalingRef.current.send({
          type: 'webrtc_ice_candidate',
          to: participantId,
          candidate: event.candidate
        })
      }
    }

    peerConnectionsRef.current.set(participantId, peerConnection)

    if (createOffer) {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      
      if (signalingRef.current) {
        signalingRef.current.send({
          type: 'webrtc_offer',
          to: participantId,
          offer: offer
        })
      }
    }
  }

  const handleOffer = async (participantId: string, offer: RTCSessionDescriptionInit) => {
    await createPeerConnection(participantId, false)
    const peerConnection = peerConnectionsRef.current.get(participantId)
    
    if (peerConnection) {
      await peerConnection.setRemoteDescription(offer)
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      
      if (signalingRef.current) {
        signalingRef.current.send({
          type: 'webrtc_answer',
          to: participantId,
          answer: answer
        })
      }
    }
  }

  const handleAnswer = async (participantId: string, answer: RTCSessionDescriptionInit) => {
    const peerConnection = peerConnectionsRef.current.get(participantId)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer)
    }
  }

  const handleIceCandidate = async (participantId: string, candidate: RTCIceCandidateInit) => {
    const peerConnection = peerConnectionsRef.current.get(participantId)
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate)
    }
  }

  const admitParticipant = useCallback((participantId: string) => {
    const pending = pendingParticipants.find(p => p.id === participantId)
    if (pending && signalingRef.current) {
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
        
        // Replace tracks in all peer connections
        peerConnectionsRef.current.forEach(peerConnection => {
          const videoTrack = screenStream.getVideoTracks()[0]
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack)
          }
        })
        
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