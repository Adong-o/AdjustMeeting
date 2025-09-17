import React, { createContext, useContext } from 'react'
import { useWebRTC } from '../hooks/useWebRTC'

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
  connectionStatus: string
  initializeRoom: (roomId: string, isHost: boolean, userName: string) => Promise<void>
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => void
  admitParticipant: (participantId: string) => void
  rejectParticipant: (participantId: string) => void
  leaveMeeting: () => void
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined)

export const useWebRTCContext = () => {
  const context = useContext(WebRTCContext)
  if (!context) {
    throw new Error('useWebRTCContext must be used within a WebRTCProvider')
  }
  return context
}

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const webrtcHook = useWebRTC()

  return (
    <WebRTCContext.Provider value={webrtcHook}>
      {children}
    </WebRTCContext.Provider>
  )
}