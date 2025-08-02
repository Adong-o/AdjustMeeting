import React from 'react'
import { X, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react'

interface Participant {
  id: string
  name: string
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isHost?: boolean
}

interface ParticipantsListProps {
  participants: Participant[]
  onClose: () => void
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, onClose }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white font-semibold">Participants ({participants.length + 1})</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto">
        {/* Current User */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">Y</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-medium">You</span>
                <Crown className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="text-gray-400 text-sm">Host</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Mic className="w-4 h-4 text-green-400" />
            <Video className="w-4 h-4 text-green-400" />
          </div>
        </div>

        {/* Other Participants */}
        {participants.map((participant, index) => (
          <div key={participant.id} className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {participant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-white font-medium">{participant.name}</span>
                <div className="text-gray-400 text-sm">Participant</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {participant.isAudioEnabled ? (
                <Mic className="w-4 h-4 text-green-400" />
              ) : (
                <MicOff className="w-4 h-4 text-red-400" />
              )}
              {participant.isVideoEnabled ? (
                <Video className="w-4 h-4 text-green-400" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <p>Waiting for others to join...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ParticipantsList