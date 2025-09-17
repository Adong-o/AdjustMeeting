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
  private isHost: boolean
  private localStream: MediaStream | null = null
  private signalingService: SignalingService | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private callbacks: WebRTCCallbacks
  private connectionStatus: string = 'Disconnected'

  constructor(roomId: string, participantId: string, isHost: boolean, callbacks: WebRTCCallbacks) {
    this.roomId = roomId
    this.participantId = participantId
    this.isHost = isHost
    this.callbacks = callbacks
  }

  async initialize(localStream: MediaStream) {
    console.log('🚀 Initializing WebRTC service')
    this.localStream = localStream
    
    this.signalingService = new SignalingService(this.roomId, this.participantId, {
      onMessage: this.handleSignalingMessage.bind(this),
      onConnected: () => {
        console.log('✅ Signaling connected')
        this.updateConnectionStatus('Signaling Connected')
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

    // Wait for signaling to connect
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (this.isHost) {
      await this.createRoom()
    } else {
      await this.requestToJoin()
    }
  }

  private async createRoom() {
    console.log('👑 Creating room as host')
    this.updateConnectionStatus('Room Created - Waiting for participants')
    
    await this.signalingService?.send({
      type: 'room_created',
      to: 'all',
      data: {
        hostId: this.participantId,
        roomId: this.roomId
      }
    })
  }

  private async requestToJoin() {
    console.log('🙋 Requesting to join room')
    this.updateConnectionStatus('Requesting to join...')
    
    await this.signalingService?.send({
      type: 'join_request',
      to: 'all',
      data: {
        participantId: this.participantId,
        participantName: 'Participant' // This should come from the UI
      }
    })
  }

  private async handleSignalingMessage(message: SignalingMessage) {
    console.log('📨 Handling signaling message:', message.type, 'from:', message.from.substring(0, 8))
    
    switch (message.type) {
      case 'room_created':
        if (message.from !== this.participantId) {
          console.log('🏠 Room created by host')
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
        
      case 'participant_joined':
        if (message.data.participantId !== this.participantId) {
          console.log('👥 Participant joined:', message.data.participantName)
          this.callbacks.onParticipantJoined({
            id: message.data.participantId,
            name: message.data.participantName,
            isAudioEnabled: true,
            isVideoEnabled: true
          })
          
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
        this.handleParticipantLeft(message.data.participantId)
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
  }

  private async createPeerConnection(participantId: string, createOffer: boolean) {
    console.log('🔗 Creating peer connection with:', participantId.substring(0, 8))
    
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
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
      console.log('🎬 Received remote track:', event.track.kind)
      const [remoteStream] = event.streams
      this.callbacks.onRemoteStream(participantId, remoteStream)
      this.updateConnectionStatus('Connected')
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate')
        this.signalingService?.send({
          type: 'webrtc_ice_candidate',
          to: participantId,
          data: { candidate: event.candidate }
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('🔌 Connection state with', participantId.substring(0, 8), ':', peerConnection.connectionState)
      if (peerConnection.connectionState === 'connected') {
        this.updateConnectionStatus('Connected')
      } else if (peerConnection.connectionState === 'failed') {
        this.updateConnectionStatus('Connection Failed')
        // Try to reconnect
        setTimeout(() => {
          this.createPeerConnection(participantId, true)
        }, 2000)
      }
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
      await this.createPeerConnection(participantId, false)
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
    
    await this.signalingService?.send({
      type: 'join_approved',
      to: participantId,
      data: {}
    })
    
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
      data: {}
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
    this.peerConnections.forEach(peerConnection => {
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      )
      if (sender) {
        sender.replaceTrack(newTrack)
      }
    })
  }

  async leave() {
    console.log('👋 Leaving meeting')
    
    await this.signalingService?.send({
      type: 'participant_left',
      to: 'all',
      data: { participantId: this.participantId }
    })
    
    this.peerConnections.forEach(pc => pc.close())
    this.peerConnections.clear()
    this.signalingService?.disconnect()
  }

  private updateConnectionStatus(status: string) {
    this.connectionStatus = status
    this.callbacks.onConnectionStatusChanged(status)
  }

  getConnectionStatus(): string {
    return this.connectionStatus
  }
}