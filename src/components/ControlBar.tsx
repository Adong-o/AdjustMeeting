import React from 'react'
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Phone, Settings } from 'lucide-react'

interface ControlBarProps {
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isScreenSharing: boolean
  onToggleAudio: () => void
  onToggleVideo: () => void
  onToggleScreenShare: () => void
  onLeaveMeeting: () => void
}

const ControlBar: React.FC<ControlBarProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveMeeting
}) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
      <div className="flex items-center justify-center space-x-4">
        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-4 rounded-full transition-all duration-200 shadow-lg hover:scale-110 ${
            isAudioEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={onToggleVideo}
          className={`p-4 rounded-full transition-all duration-200 shadow-lg hover:scale-110 ${
            isVideoEnabled
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={onToggleScreenShare}
          className={`p-4 rounded-full transition-all duration-200 shadow-lg hover:scale-110 ${
            isScreenSharing
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </button>

        {/* Settings */}
        <button
          className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200 shadow-lg hover:scale-110"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Leave Meeting */}
        <button
          onClick={onLeaveMeeting}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-lg hover:scale-110 ml-8"
          title="Leave meeting"
        >
          <Phone className="w-5 h-5 rotate-[135deg]" />
        </button>
      </div>
    </div>
  )
}

export default ControlBar