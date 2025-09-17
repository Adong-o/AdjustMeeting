export interface SignalingMessage {
  type: string
  from: string
  to: string
  data?: any
  timestamp: number
}

export interface SignalingCallbacks {
  onMessage: (message: SignalingMessage) => void
  onConnected: () => void
  onDisconnected: () => void
  onError: (error: string) => void
}

export class SignalingService {
  private roomId: string
  private participantId: string
  private callbacks: SignalingCallbacks
  private pollInterval: NodeJS.Timeout | null = null
  private isConnected: boolean = false
  private messageQueue: SignalingMessage[] = []
  private lastMessageTime: number = 0

  constructor(roomId: string, participantId: string, callbacks: SignalingCallbacks) {
    this.roomId = roomId
    this.participantId = participantId
    this.callbacks = callbacks
    this.connect()
  }

  private async connect() {
    console.log('🔌 Connecting to signaling service for room:', this.roomId)
    
    try {
      // Try to use a simple HTTP-based signaling with better polling
      await this.initializeHttpSignaling()
      this.isConnected = true
      this.callbacks.onConnected()
      console.log('✅ Connected to signaling service')
    } catch (error) {
      console.error('❌ Failed to connect to signaling service:', error)
      this.callbacks.onError('Failed to connect to signaling service')
    }
  }

  private async initializeHttpSignaling() {
    // Use a more reliable HTTP-based signaling with Firebase Realtime Database REST API
    const firebaseUrl = `https://adjustmeeting-default-rtdb.firebaseio.com/rooms/${this.roomId}/messages.json`
    
    try {
      // Test connection
      const response = await fetch(firebaseUrl)
      if (response.ok) {
        console.log('✅ Using Firebase Realtime Database for signaling')
        this.startFirebasePolling(firebaseUrl)
        return
      }
    } catch (error) {
      console.log('⚠️ Firebase not available, using localStorage fallback')
    }

    // Fallback to enhanced localStorage with better synchronization
    this.startLocalStorageSignaling()
  }

  private startFirebasePolling(firebaseUrl: string) {
    this.pollInterval = setInterval(async () => {
      try {
        const response = await fetch(firebaseUrl)
        if (response.ok) {
          const messages = await response.json()
          if (messages) {
            const messageArray = Object.values(messages) as SignalingMessage[]
            const newMessages = messageArray.filter(msg => 
              msg.timestamp > this.lastMessageTime && 
              msg.from !== this.participantId &&
              (msg.to === this.participantId || msg.to === 'all')
            )
            
            newMessages.forEach(message => {
              this.callbacks.onMessage(message)
              this.lastMessageTime = Math.max(this.lastMessageTime, message.timestamp)
            })
          }
        }
      } catch (error) {
        console.error('❌ Firebase polling error:', error)
      }
    }, 500) // Poll every 500ms for better real-time feel
  }

  private startLocalStorageSignaling() {
    console.log('📱 Using enhanced localStorage signaling')
    
    // Use BroadcastChannel for same-origin communication
    const channel = new BroadcastChannel(`meeting_${this.roomId}`)
    
    channel.onmessage = (event) => {
      const message = event.data as SignalingMessage
      if (message.from !== this.participantId && 
          (message.to === this.participantId || message.to === 'all')) {
        console.log('📨 Received broadcast message:', message.type)
        this.callbacks.onMessage(message)
      }
    }

    // Also poll localStorage as backup
    this.pollInterval = setInterval(() => {
      const messages = this.getLocalMessages()
      const newMessages = messages.filter(msg => 
        msg.timestamp > this.lastMessageTime && 
        msg.from !== this.participantId &&
        (msg.to === this.participantId || msg.to === 'all')
      )
      
      newMessages.forEach(message => {
        this.callbacks.onMessage(message)
        this.lastMessageTime = Math.max(this.lastMessageTime, message.timestamp)
      })
    }, 300) // Faster polling for localStorage
  }

  private getLocalMessages(): SignalingMessage[] {
    const key = `meeting_${this.roomId}_messages`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  private addLocalMessage(message: SignalingMessage) {
    const messages = this.getLocalMessages()
    messages.push(message)
    
    // Keep only last 100 messages
    if (messages.length > 100) {
      messages.splice(0, messages.length - 100)
    }
    
    localStorage.setItem(`meeting_${this.roomId}_messages`, JSON.stringify(messages))
    
    // Broadcast to other tabs/windows
    const channel = new BroadcastChannel(`meeting_${this.roomId}`)
    channel.postMessage(message)
  }

  async send(message: Omit<SignalingMessage, 'from' | 'timestamp'>) {
    const fullMessage: SignalingMessage = {
      ...message,
      from: this.participantId,
      timestamp: Date.now()
    }

    console.log('📤 Sending message:', fullMessage.type, 'to:', fullMessage.to)

    try {
      // Try Firebase first
      const firebaseUrl = `https://adjustmeeting-default-rtdb.firebaseio.com/rooms/${this.roomId}/messages.json`
      const response = await fetch(firebaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullMessage)
      })

      if (response.ok) {
        console.log('✅ Message sent via Firebase')
        return
      }
    } catch (error) {
      console.log('⚠️ Firebase send failed, using localStorage')
    }

    // Fallback to localStorage
    this.addLocalMessage(fullMessage)
    console.log('✅ Message sent via localStorage')
  }

  disconnect() {
    console.log('🔌 Disconnecting from signaling service')
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    
    this.isConnected = false
    this.callbacks.onDisconnected()
  }

  isConnectedToSignaling(): boolean {
    return this.isConnected
  }
}