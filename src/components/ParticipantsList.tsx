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
  localParticipantName: string
  isLocalHost: boolean
  isLocalAudioEnabled: boolean
  isLocalVideoEnabled: boolean
  onClose: () => void
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ 
  participants, 
  localParticipantName,
  isLocalHost,
  isLocalAudioEnabled,
  isLocalVideoEnabled,
  onClose 
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white text-sm sm:text-base font-semibold">Participants ({participants.length + 1})</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors lg:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto">
        {/* Current User */}
        <div className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm font-semibold">
                {localParticipantName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-white text-sm sm:text-base font-medium">{localParticipantName} (You)</span>
                {isLocalHost && <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />}
              </div>
              <span className="text-gray-400 text-xs sm:text-sm">{isLocalHost ? 'Host' : 'Participant'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            {isLocalAudioEnabled ? (
              <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            ) : (
              <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
            )}
            {isLocalVideoEnabled ? (
              <Video className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            ) : (
              <VideoOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
            )}
          </div>
        </div>

        {/* Other Participants */}
        {participants.map((participant, index) => (
          <div key={participant.id} className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {participant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-white text-sm sm:text-base font-medium">{participant.name}</span>
                <div className="text-gray-400 text-xs sm:text-sm">Participant</div>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {participant.isAudioEnabled ? (
                <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              ) : (
                <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
              )}
              {participant.isVideoEnabled ? (
                <Video className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              ) : (
                <VideoOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
              )}
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <div className="p-6 sm:p-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">Waiting for others to join...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ParticipantsList