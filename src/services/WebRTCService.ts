import { SignalingService, SignalingMessage } from './SignalingService'

export interface Participant {
  id: string
  name: string
  stream?: MediaStream
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isHost?: boolean
}

export interface PendingParticipant {
  id: string
  name: string
  requestTime: Date
}

export interface WebRTCCallbacks {
  onParticipantJoined: (participant: Participant) => void
  onParticipantLeft: (participantId: string) => void
  onPendingParticipant: (participant: PendingParticipant) => void
  onConnectionStatusChanged: (status: string) => void
  onRemoteStream: (participantId: string, stream: MediaStream) => void
  onParticipantMediaChanged: (participantId: string, isAudioEnabled: boolean, isVideoEnabled: boolean) => void
}

export class WebRTCService {
  private roomId: string
  private participantId: string
  private participantName: string
  private isHost: boolean
  private localStream: MediaStream | null = null
  private signalingService: SignalingService | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private callbacks: WebRTCCallbacks
  private connectionStatus: string = 'Disconnected'
  private iceServers: RTCIceServer[]

  constructor(roomId: string, participantId: string, participantName: string, isHost: boolean, callbacks: WebRTCCallbacks) {
    this.roomId = roomId
    this.participantId = participantId
    this.participantName = participantName
    this.isHost = isHost
    this.callbacks = callbacks

    // Enhanced ICE servers for better connectivity
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Add more STUN servers for better connectivity
      { urls: 'stun:stun.services.mozilla.com' },
      { urls: 'stun:stun.stunprotocol.org:3478' }
    ]
  }

  async initialize(localStream: MediaStream) {
    console.log('🚀 Initializing WebRTC service for:', this.participantName)
    this.localStream = localStream
    
    this.signalingService = new SignalingService(this.roomId, this.participantId, {
      onMessage: this.handleSignalingMessage.bind(this),
      onConnected: () => {
        console.log('✅ Signaling connected')
        this.updateConnectionStatus('Signaling Connected')
        // Start the room flow after signaling is connected
        if (this.isHost) {
          this.createRoom()
        } else {
          this.requestToJoin()
        }
      },
      onDisconnected: () => {
        console.log('❌ Signaling disconnected')
        this.updateConnectionStatus('Signaling Disconnected')
      },
      onError: (error) => {
        console.error('❌ Signaling error:', error)
        this.updateConnectionStatus('Signaling Error')
      }
    })
  }

  private async createRoom() {
    console.log('👑 Creating room as host:', this.participantName)
    this.updateConnectionStatus('Room Created - Waiting for participants')
    
    await this.signalingService?.send({
      type: 'room_created',
      to: 'all',
      data: {
        hostId: this.participantId,
        hostName: this.participantName,
        roomId: this.roomId
      }
    })
  }

  private async requestToJoin() {
    console.log('🙋 Requesting to join room as:', this.participantName)
    this.updateConnectionStatus('Requesting to join...')
    
    await this.signalingService?.send({
      type: 'join_request',
      to: 'all',
      data: {
        participantId: this.participantId,
        participantName: this.participantName
      }
    })
  }

  private async handleSignalingMessage(message: SignalingMessage) {
    console.log('📨 Handling signaling message:', message.type, 'from:', message.from.substring(0, 8))
    
    try {
      switch (message.type) {
        case 'room_created':
          if (message.from !== this.participantId) {
            console.log('🏠 Room created by host:', message.data.hostName)
          }
          break
          
        case 'join_request':
          if (this.isHost && message.from !== this.participantId) {
            console.log('🙋 Join request received from:', message.data.participantName)
            this.callbacks.onPendingParticipant({
              id: message.from,
              name: message.data.participantName,
              requestTime: new Date()
            })
          }
          break
          
        case 'join_approved':
          if (message.to === this.participantId) {
            console.log('✅ Join approved! Creating peer connection')
            this.updateConnectionStatus('Connecting to host...')
            await this.createPeerConnection(message.from, true)
          }
          break
          
        case 'join_rejected':
          if (message.to === this.participantId) {
            console.log('❌ Join rejected')
            this.updateConnectionStatus('Join request rejected')
          }
          break
          
        case 'participant_joined':
          if (message.data.participantId !== this.participantId) {
            console.log('👥 Participant joined:', message.data.participantName)
            this.callbacks.onParticipantJoined({
              id: message.data.participantId,
              name: message.data.participantName,
              isAudioEnabled: true,
              isVideoEnabled: true
            })
            
            // If we're the host, create a peer connection to the new participant
            if (this.isHost) {
              await this.createPeerConnection(message.data.participantId, true)
            }
          }
          break
          
        case 'webrtc_offer':
          await this.handleOffer(message.from, message.data.offer)
          break
          
        case 'webrtc_answer':
          await this.handleAnswer(message.from, message.data.answer)
          break
          
        case 'webrtc_ice_candidate':
          await this.handleIceCandidate(message.from, message.data.candidate)
          break
          
        case 'participant_left':
          if (message.data.participantId !== this.participantId) {
            this.handleParticipantLeft(message.data.participantId)
          }
          break

        case 'media_state_changed':
          if (message.data.participantId !== this.participantId) {
            this.callbacks.onParticipantMediaChanged(
              message.data.participantId,
              message.data.isAudioEnabled,
              message.data.isVideoEnabled
            )
          }
          break
      }
    } catch (error) {
      console.error('❌ Error handling signaling message:', error)
    }
  }

  private async createPeerConnection(participantId: string, createOffer: boolean) {
    console.log('🔗 Creating peer connection with:', participantId.substring(0, 8))
    
    const peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceCandidatePoolSize: 10
    })

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log('🎥 Adding local track:', track.kind)
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('🎬 Received remote track:', event.track.kind, 'from:', participantId.substring(0, 8))
      const [remoteStream] = event.streams
      this.callbacks.onRemoteStream(participantId, remoteStream)
      this.updateConnectionStatus('Connected')
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to:', participantId.substring(0, 8))
        this.signalingService?.send({
          type: 'webrtc_ice_candidate',
          to: participantId,
          data: { candidate: event.candidate }
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState
      console.log('🔌 Connection state with', participantId.substring(0, 8), ':', state)
      
      switch (state) {
        case 'connected':
          this.updateConnectionStatus('Connected')
          break
        case 'disconnected':
          this.updateConnectionStatus('Disconnected')
          break
        case 'failed':
          this.updateConnectionStatus('Connection Failed')
          console.log('🔄 Attempting to reconnect...')
          // Attempt to reconnect
          setTimeout(() => {
            if (peerConnection.connectionState === 'failed') {
              this.createPeerConnection(participantId, true)
            }
          }, 2000)
          break
      }
    }

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state with', participantId.substring(0, 8), ':', peerConnection.iceConnectionState)
    }

    this.peerConnections.set(participantId, peerConnection)

    if (createOffer) {
      try {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        })
        await peerConnection.setLocalDescription(offer)
        
        console.log('📤 Sending offer to:', participantId.substring(0, 8))
        await this.signalingService?.send({
          type: 'webrtc_offer',
          to: participantId,
          data: { offer }
        })
      } catch (error) {
        console.error('❌ Error creating offer:', error)
        this.updateConnectionStatus('Offer Failed')
      }
    }
  }

  private async handleOffer(participantId: string, offer: RTCSessionDescriptionInit) {
    try {
      console.log('📞 Handling offer from:', participantId.substring(0, 8))
      
      // Create peer connection if it doesn't exist
      if (!this.peerConnections.has(participantId)) {
        await this.createPeerConnection(participantId, false)
      }
      
      const peerConnection = this.peerConnections.get(participantId)
      
      if (peerConnection) {
        await peerConnection.setRemoteDescription(offer)
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        
        console.log('📤 Sending answer to:', participantId.substring(0, 8))
        await this.signalingService?.send({
          type: 'webrtc_answer',
          to: participantId,
          data: { answer }
        })
      }
    } catch (error) {
      console.error('❌ Error handling offer:', error)
      this.updateConnectionStatus('Answer Failed')
    }
  }

  private async handleAnswer(participantId: string, answer: RTCSessionDescriptionInit) {
    try {
      console.log('📞 Handling answer from:', participantId.substring(0, 8))
      const peerConnection = this.peerConnections.get(participantId)
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer)
        console.log('✅ Set remote description (answer)')
      }
    } catch (error) {
      console.error('❌ Error handling answer:', error)
    }
  }

  private async handleIceCandidate(participantId: string, candidate: RTCIceCandidateInit) {
    try {
      const peerConnection = this.peerConnections.get(participantId)
      if (peerConnection && peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(candidate)
        console.log('✅ Added ICE candidate from:', participantId.substring(0, 8))
      } else {
        console.log('⏳ Queuing ICE candidate (no remote description yet)')
      }
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error)
    }
  }

  private handleParticipantLeft(participantId: string) {
    console.log('👋 Participant left:', participantId.substring(0, 8))
    const peerConnection = this.peerConnections.get(participantId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(participantId)
    }
    this.callbacks.onParticipantLeft(participantId)
  }

  async admitParticipant(participantId: string, participantName: string) {
    console.log('✅ Admitting participant:', participantName)
    
    // Send approval to the specific participant
    await this.signalingService?.send({
      type: 'join_approved',
      to: participantId,
      data: { hostName: this.participantName }
    })
    
    // Broadcast to all that this participant has joined
    await this.signalingService?.send({
      type: 'participant_joined',
      to: 'all',
      data: {
        participantId,
        participantName
      }
    })
  }

  async rejectParticipant(participantId: string) {
    console.log('❌ Rejecting participant:', participantId.substring(0, 8))
    await this.signalingService?.send({
      type: 'join_rejected',
      to: participantId,
      data: { reason: 'Rejected by host' }
    })
  }

  async broadcastMediaState(isAudioEnabled: boolean, isVideoEnabled: boolean) {
    await this.signalingService?.send({
      type: 'media_state_changed',
      to: 'all',
      data: {
        participantId: this.participantId,
        isAudioEnabled,
        isVideoEnabled
      }
    })
  }

  async replaceVideoTrack(newTrack: MediaStreamTrack) {
    console.log('🔄 Replacing video track for all peer connections')
    this.peerConnections.forEach(async (peerConnection, participantId) => {
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      )
      if (sender) {
        try {
          await sender.replaceTrack(newTrack)
          console.log('✅ Video track replaced for:', participantId.substring(0, 8))
        } catch (error) {
          console.error('❌ Error replacing video track:', error)
        }
      }
    })
  }

  async leave() {
    console.log('👋 Leaving meeting')
    
    // Notify others that we're leaving
    await this.signalingService?.send({
      type: 'participant_left',
      to: 'all',
      data: { participantId: this.participantId }
    })
    
    // Close all peer connections
    this.peerConnections.forEach(pc => {
      pc.close()
    })
    this.peerConnections.clear()
    
    // Disconnect signaling
    this.signalingService?.disconnect()
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
    }
  }

  private updateConnectionStatus(status: string) {
    this.connectionStatus = status
    this.callbacks.onConnectionStatusChanged(status)
  }

  getConnectionStatus(): string {
    return this.connectionStatus
  }

  getPeerConnectionsCount(): number {
    return this.peerConnections.size
  }

  // Debug method to get connection states
  getConnectionStates(): Record<string, string> {
    const states: Record<string, string> = {}
    this.peerConnections.forEach((pc, id) => {
      states[id.substring(0, 8)] = pc.connectionState
    })
    return states
  }
}