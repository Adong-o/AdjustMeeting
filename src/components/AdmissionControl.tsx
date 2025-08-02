import React from 'react'
import { X, Check, UserX, Clock } from 'lucide-react'
import { useWebRTC } from '../contexts/WebRTCContext'

interface PendingParticipant {
  id: string
  name: string
  requestTime: Date
}

interface AdmissionControlProps {
  pendingParticipants: PendingParticipant[]
  onClose: () => void
}

const AdmissionControl: React.FC<AdmissionControlProps> = ({
  pendingParticipants,
  onClose
}) => {
  const { admitParticipant, rejectParticipant } = useWebRTC()

  const handleAdmit = (participantId: string) => {
    admitParticipant(participantId)
  }

  const handleReject = (participantId: string) => {
    rejectParticipant(participantId)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Admission Control</h2>
            <p className="text-gray-400 text-sm mt-1">
              {pendingParticipants.length} participant{pendingParticipants.length !== 1 ? 's' : ''} waiting to join
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Participants List */}
        <div className="max-h-96 overflow-y-auto">
          {pendingParticipants.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No participants waiting to join</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {pendingParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{participant.name}</p>
                      <p className="text-gray-400 text-sm">
                        Requested at {formatTime(participant.requestTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReject(participant.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Reject"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAdmit(participant.id)}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      title="Admit"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {pendingParticipants.length > 0 && (
          <div className="p-4 border-t border-gray-700 flex justify-between">
            <button
              onClick={() => {
                pendingParticipants.forEach(p => handleReject(p.id))
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Reject All
            </button>
            <button
              onClick={() => {
                pendingParticipants.forEach(p => handleAdmit(p.id))
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Admit All
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdmissionControl