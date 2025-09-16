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
  connectionStatus: string
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

// Simple Firebase-like signaling using a public API
class SimpleSignaling {
  private roomId: string
  private participantId: string
  private onMessage: (message: any) => void
  private pollInterval: NodeJS.Timeout | null = null
  private lastMessageTime: number = 0
  private baseUrl = 'https://api.jsonbin.io/v3/b'
  private binId: string | null = null

  constructor(roomId: string, participantId: string, onMessage: (message: any) => void) {
    this.roomId = roomId
    this.participantId = participantId
    this.onMessage = onMessage
    this.initializeBin()
  }

  private async initializeBin() {
    try {
      // Try to get existing bin for this room
      const existingBin = localStorage.getItem(`room_${this.roomId}_bin`)
      if (existingBin) {
        this.binId = existingBin
        this.startListening()
        return
      }

      // Create new bin for this room
      const response = await fetch('https://api.jsonbin.io/v3/b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bin-Name': `meeting-${this.roomId}`
        },
        body: JSON.stringify({ messages: [], created: Date.now() })
      })

      if (response.ok) {
        const data = await response.json()
        this.binId = data.metadata.id
        localStorage.setItem(`room_${this.roomId}_bin`, this.binId)
        console.log('✅ Created signaling bin:', this.binId)
        this.startListening()
      } else {
        console.error('❌ Failed to create signaling bin, falling back to localStorage')
        this.fallbackToLocalStorage()
      }
    } catch (error) {
      console.error('❌ Signaling initialization failed, using localStorage fallback:', error)
      this.fallbackToLocalStorage()
    }
  }

  private fallbackToLocalStorage() {
    // Fallback to localStorage for same-device testing
    console.log('📱 Using localStorage fallback (same device only)')
    this.startLocalStoragePolling()
  }

  private startLocalStoragePolling() {
    this.pollInterval = setInterval(() => {
      const messages = this.getLocalMessages()
      const newMessages = messages.filter(msg => 
        msg.timestamp > this.lastMessageTime && 
        msg.from !== this.participantId &&
        (msg.to === this.participantId || msg.to === 'all')
      )
      
      newMessages.forEach(message => {
        this.onMessage(message)
        this.lastMessageTime = Math.max(this.lastMessageTime, message.timestamp)
      })
    }, 500)
  }

  private getLocalMessages(): any[] {
    const key = `meeting_${this.roomId}_messages`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  private addLocalMessage(message: any) {
    const messages = this.getLocalMessages()
    const newMessage = { 
      ...message, 
      timestamp: Date.now(),
      from: this.participantId,
      id: Math.random().toString(36).substr(2, 9)
    }
    messages.push(newMessage)
    
    if (messages.length > 50) {
      messages.splice(0, messages.length - 50)
    }
    localStorage.setItem(`meeting_${this.roomId}_messages`, JSON.stringify(messages))
  }

  private async startListening() {
    if (!this.binId) return

    this.pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/${this.binId}/latest`)
        if (response.ok) {
          const data = await response.json()
          const messages = data.record.messages || []
          
          const newMessages = messages.filter((msg: any) => 
            msg.timestamp > this.lastMessageTime && 
            msg.from !== this.participantId &&
            (msg.to === this.participantId || msg.to === 'all')
          )
          
          newMessages.forEach((message: any) => {
            this.onMessage(message)
            this.lastMessageTime = Math.max(this.lastMessageTime, message.timestamp)
          })
        }
      } catch (error) {
        console.error('❌ Polling error:', error)
      }
    }, 1000)
  }

  async send(message: any) {
    const newMessage = { 
      ...message, 
      timestamp: Date.now(),
      from: this.participantId,
      id: Math.random().toString(36).substr(2, 9)
    }

    if (this.binId) {
      try {
        const response = await fetch(`${this.baseUrl}/${this.binId}/latest`)
        if (response.ok) {
          const data = await response.json()
          const messages = data.record.messages || []
          messages.push(newMessage)
          
          if (messages.length > 50) {
            messages.splice(0, messages.length - 50)
          }

          await fetch(`${this.baseUrl}/${this.binId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
          })
        }
      } catch (error) {
        console.error('❌ Send error, falling back to localStorage:', error)
        this.addLocalMessage(newMessage)
      }
    } else {
      this.addLocalMessage(newMessage)
    }
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
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected')
  
  const originalStreamRef = useRef<MediaStream | null>(null)
  const signalingRef = useRef<SimpleSignaling | null>(null)
  const participantIdRef = useRef<string>(Math.random().toString(36).substr(2, 9))
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const currentUserNameRef = useRef<string>('')

  const initializeRoom = useCallback(async (roomId: string, meetingData?: any) => {
    try {
      console.log('🚀 Initializing room:', roomId, meetingData)
      setRoomId(roomId)
      setIsHost(meetingData?.isHost || false)
      setMeetingTitle(meetingData?.meetingTitle || 'Meeting')
      currentUserNameRef.current = meetingData?.isHost ? meetingData.hostName : meetingData.participantName
      setConnectionStatus('Connecting...')
      
      // Get user media with optimized constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 320, max: 640 },
          height: { ideal: 240, max: 480 },
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
      
      // Initialize signaling
      signalingRef.current = new SimpleSignaling(
        roomId,
        participantIdRef.current,
        handleSignalingMessage
      )
      
      // Wait a bit for signaling to initialize
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (meetingData?.isHost) {
        console.log('👑 Creating room as host')
        setConnectionStatus('Room Created - Waiting for participants')
        await signalingRef.current.send({
          type: 'room_created',
          to: 'all',
          hostId: participantIdRef.current,
          hostName: meetingData.hostName,
          meetingTitle: meetingData.meetingTitle
        })
      } else {
        console.log('🙋 Requesting to join as participant')
        setConnectionStatus('Requesting to join...')
        await signalingRef.current.send({
          type: 'join_request',
          to: 'all',
          participantName: meetingData.participantName,
          participantId: participantIdRef.current
        })
      }
      
    } catch (error) {
      console.error('❌ Error initializing room:', error)
      setConnectionStatus('Connection Failed')
      
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

  const handleSignalingMessage = useCallback(async (message: any) => {
    console.log('📨 Received message:', message.type, 'from:', message.from?.substring(0, 8))
    
    switch (message.type) {
      case 'room_created':
        if (message.from !== participantIdRef.current) {
          setMeetingTitle(message.meetingTitle || 'Meeting')
          console.log('🏠 Room created by host:', message.hostName)
        }
        break
        
      case 'join_request':
        if (isHost && message.from !== participantIdRef.current) {
          console.log('🙋 Join request from:', message.participantName)
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
          console.log('✅ Join approved! Creating peer connection')
          setConnectionStatus('Connecting to host...')
          await createPeerConnection(message.from, true)
        }
        break
        
      case 'participant_joined':
        if (message.participantId !== participantIdRef.current) {
          console.log('👥 Participant joined:', message.participantName)
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
          
          if (isHost) {
            await createPeerConnection(message.participantId, true)
          }
        }
        break
        
      case 'webrtc_offer':
        console.log('📞 Received WebRTC offer')
        await handleOffer(message.from, message.offer)
        break
        
      case 'webrtc_answer':
        console.log('📞 Received WebRTC answer')
        await handleAnswer(message.from, message.answer)
        break
        
      case 'webrtc_ice_candidate':
        console.log('🧊 Received ICE candidate')
        await handleIceCandidate(message.from, message.candidate)
        break
        
      case 'participant_left':
        console.log('👋 Participant left:', message.participantId)
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
    console.log('🔗 Creating peer connection with:', participantId.substring(0, 8))
    
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    })

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log('🎥 Adding local track:', track.kind)
        peerConnection.addTrack(track, localStream)
      })
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('🎬 Received remote track:', event.track.kind)
      const [remoteStream] = event.streams
      setParticipants(prev => prev.map(p => 
        p.id === participantId 
          ? { ...p, stream: remoteStream }
          : p
      ))
      setConnectionStatus('Connected')
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && signalingRef.current) {
        console.log('🧊 Sending ICE candidate')
        signalingRef.current.send({
          type: 'webrtc_ice_candidate',
          to: participantId,
          candidate: event.candidate
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('🔌 Connection state:', peerConnection.connectionState)
      if (peerConnection.connectionState === 'connected') {
        setConnectionStatus('Connected')
      } else if (peerConnection.connectionState === 'failed') {
        setConnectionStatus('Connection Failed')
      }
    }

    peerConnectionsRef.current.set(participantId, peerConnection)

    if (createOffer) {
      try {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        })
        await peerConnection.setLocalDescription(offer)
        
        console.log('📤 Sending offer')
        if (signalingRef.current) {
          await signalingRef.current.send({
            type: 'webrtc_offer',
            to: participantId,
            offer: offer
          })
        }
      } catch (error) {
        console.error('❌ Error creating offer:', error)
        setConnectionStatus('Offer Failed')
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
        
        console.log('📤 Sending answer')
        if (signalingRef.current) {
          await signalingRef.current.send({
            type: 'webrtc_answer',
            to: participantId,
            answer: answer
          })
        }
      }
    } catch (error) {
      console.error('❌ Error handling offer:', error)
      setConnectionStatus('Answer Failed')
    }
  }

  const handleAnswer = async (participantId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(participantId)
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer)
        console.log('✅ Set remote description (answer)')
      }
    } catch (error) {
      console.error('❌ Error handling answer:', error)
    }
  }

  const handleIceCandidate = async (participantId: string, candidate: RTCIceCandidateInit) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(participantId)
      if (peerConnection && peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(candidate)
        console.log('✅ Added ICE candidate')
      }
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error)
    }
  }

  const admitParticipant = useCallback(async (participantId: string) => {
    const pending = pendingParticipants.find(p => p.id === participantId)
    if (pending && signalingRef.current) {
      console.log('✅ Admitting participant:', pending.name)
      
      setPendingParticipants(prev => prev.filter(p => p.id !== participantId))
      
      await signalingRef.current.send({
        type: 'join_approved',
        to: participantId
      })
      
      await signalingRef.current.send({
        type: 'participant_joined',
        to: 'all',
        participantId: participantId,
        participantName: pending.name
      })
    }
  }, [pendingParticipants])

  const rejectParticipant = useCallback(async (participantId: string) => {
    console.log('❌ Rejecting participant:', participantId)
    setPendingParticipants(prev => prev.filter(p => p.id !== participantId))
    
    if (signalingRef.current) {
      await signalingRef.current.send({
        type: 'join_rejected',
        to: participantId
      })
    }
  }, [])

  const toggleAudio = useCallback(async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
        
        if (signalingRef.current) {
          await signalingRef.current.send({
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

  const toggleVideo = useCallback(async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
        
        if (signalingRef.current) {
          await signalingRef.current.send({
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
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
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
      console.error('❌ Error toggling screen share:', error)
    }
  }, [isScreenSharing])

  const leaveMeeting = useCallback(async () => {
    console.log('👋 Leaving meeting')
    
    if (signalingRef.current) {
      await signalingRef.current.send({
        type: 'participant_left',
        to: 'all',
        participantId: participantIdRef.current
      })
      signalingRef.current.cleanup()
    }
    
    peerConnectionsRef.current.forEach(pc => pc.close())
    peerConnectionsRef.current.clear()
    
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
    setRoomId(null)
    setConnectionStatus('Disconnected')
  }, [localStream])

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
    connectionStatus,
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