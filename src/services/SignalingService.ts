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
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectTimer: NodeJS.Timeout | null = null
  private pollInterval: NodeJS.Timeout | null = null
  private lastMessageTime: number = 0

  // Multiple signaling methods for maximum compatibility
  private firebaseUrl: string
  private broadcastChannel: BroadcastChannel | null = null

  constructor(roomId: string, participantId: string, callbacks: SignalingCallbacks) {
    this.roomId = roomId
    this.participantId = participantId
    this.callbacks = callbacks
    this.firebaseUrl = `https://adjustmeeting-default-rtdb.firebaseio.com/rooms/${this.roomId}/messages.json`
    this.connect()
  }

  private async connect() {
    console.log('🔌 Connecting to signaling service for room:', this.roomId)
    
    try {
      // Method 1: Try Firebase Realtime Database (works across all browsers/devices)
      if (await this.tryFirebaseSignaling()) {
        console.log('✅ Using Firebase Realtime Database signaling')
        this.isConnected = true
        this.callbacks.onConnected()
        return
      }

      // Method 2: Use BroadcastChannel for same-origin (same browser, different tabs)
      if (this.tryBroadcastChannel()) {
        console.log('✅ Using BroadcastChannel signaling (same browser)')
        this.isConnected = true
        this.callbacks.onConnected()
        return
      }

      // Method 3: Enhanced localStorage with polling (fallback)
      this.startLocalStorageSignaling()
      console.log('✅ Using localStorage signaling (fallback)')
      this.isConnected = true
      this.callbacks.onConnected()

    } catch (error) {
      console.error('❌ Failed to connect to signaling service:', error)
      this.callbacks.onError('Failed to connect to signaling service')
      this.attemptReconnect()
    }
  }

  private async tryFirebaseSignaling(): Promise<boolean> {
    try {
      // Test Firebase connection
      const testResponse = await fetch(this.firebaseUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (testResponse.ok) {
        this.startFirebasePolling()
        return true
      }
    } catch (error) {
      console.log('⚠️ Firebase not available:', error)
    }
    return false
  }

  private startFirebasePolling() {
    // Clear any existing interval
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    this.pollInterval = setInterval(async () => {
      try {
        const response = await fetch(this.firebaseUrl)
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
              console.log('📨 Firebase message received:', message.type, 'from:', message.from.substring(0, 8))
              this.callbacks.onMessage(message)
              this.lastMessageTime = Math.max(this.lastMessageTime, message.timestamp)
            })
          }
        }
      } catch (error) {
        console.error('❌ Firebase polling error:', error)
        this.attemptReconnect()
      }
    }, 500) // Poll every 500ms for real-time feel
  }

  private tryBroadcastChannel(): boolean {
    try {
      this.broadcastChannel = new BroadcastChannel(`meeting_${this.roomId}`)
      
      this.broadcastChannel.onmessage = (event) => {
        const message = event.data as SignalingMessage
        if (message.from !== this.participantId && 
            (message.to === this.participantId || message.to === 'all')) {
          console.log('📨 BroadcastChannel message received:', message.type)
          this.callbacks.onMessage(message)
        }
      }

      this.broadcastChannel.onerror = (error) => {
        console.error('❌ BroadcastChannel error:', error)
      }

      return true
    } catch (error) {
      console.log('⚠️ BroadcastChannel not available:', error)
      return false
    }
  }

  private startLocalStorageSignaling() {
    // Clear any existing interval
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    this.pollInterval = setInterval(() => {
      try {
        const messages = this.getLocalMessages()
        const newMessages = messages.filter(msg => 
          msg.timestamp > this.lastMessageTime && 
          msg.from !== this.participantId &&
          (msg.to === this.participantId || msg.to === 'all')
        )
        
        newMessages.forEach(message => {
          console.log('📨 localStorage message received:', message.type)
          this.callbacks.onMessage(message)
          this.lastMessageTime = Math.max(this.lastMessageTime, message.timestamp)
        })
      } catch (error) {
        console.error('❌ localStorage polling error:', error)
      }
    }, 300) // Faster polling for localStorage
  }

  private getLocalMessages(): SignalingMessage[] {
    try {
      const key = `meeting_${this.roomId}_messages`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('❌ Error reading localStorage:', error)
      return []
    }
  }

  private addLocalMessage(message: SignalingMessage) {
    try {
      const messages = this.getLocalMessages()
      messages.push(message)
      
      // Keep only last 100 messages to prevent memory issues
      if (messages.length > 100) {
        messages.splice(0, messages.length - 100)
      }
      
      const key = `meeting_${this.roomId}_messages`
      localStorage.setItem(key, JSON.stringify(messages))
      
      // Also broadcast via BroadcastChannel if available
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(message)
      }
    } catch (error) {
      console.error('❌ Error writing to localStorage:', error)
    }
  }

  async send(message: Omit<SignalingMessage, 'from' | 'timestamp'>) {
    const fullMessage: SignalingMessage = {
      ...message,
      from: this.participantId,
      timestamp: Date.now()
    }

    console.log('📤 Sending message:', fullMessage.type, 'to:', fullMessage.to)

    let sent = false

    // Try Firebase first (works across all browsers/devices)
    try {
      const response = await fetch(this.firebaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullMessage)
      })

      if (response.ok) {
        console.log('✅ Message sent via Firebase')
        sent = true
      }
    } catch (error) {
      console.log('⚠️ Firebase send failed:', error)
    }

    // Fallback to localStorage + BroadcastChannel
    if (!sent) {
      this.addLocalMessage(fullMessage)
      console.log('✅ Message sent via localStorage/BroadcastChannel')
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      this.callbacks.onError('Connection failed after multiple attempts')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000) // Exponential backoff

    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  disconnect() {
    console.log('🔌 Disconnecting from signaling service')
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.close()
      this.broadcastChannel = null
    }
    
    this.isConnected = false
    this.callbacks.onDisconnected()
  }

  isConnectedToSignaling(): boolean {
    return this.isConnected
  }

  // Clean up old messages to prevent memory leaks
  private cleanupOldMessages() {
    try {
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
      const messages = this.getLocalMessages()
      const recentMessages = messages.filter(msg => msg.timestamp > cutoffTime)
      
      if (recentMessages.length !== messages.length) {
        const key = `meeting_${this.roomId}_messages`
        localStorage.setItem(key, JSON.stringify(recentMessages))
        console.log('🧹 Cleaned up old messages')
      }
    } catch (error) {
      console.error('❌ Error cleaning up messages:', error)
    }
  }
}