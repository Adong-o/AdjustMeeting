# AdjustMeeting 🎥

*A beautiful, responsive, open-source video conferencing solution with advanced features that works entirely in your browser.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)

## 🌐 **Live Demo**

**Try AdjustMeeting now:** [https://adjustmeeting.netlify.app](https://adjustmeeting.netlify.app)

*No registration required - just create or join a meeting instantly!*

**AdjustMeeting** is a free, open-source video conferencing platform that works entirely in your browser. No downloads, no registration, no hassle - just instant video meetings with anyone, anywhere.

## ✨ Features

### 🚀 **Core Features**
- **Zero Setup** - Works instantly in any modern browser
- **Privacy First** - Peer-to-peer connections, no data stored on servers
- **Fully Responsive** - Perfect on desktop, tablet, and mobile devices
- **Cross-Platform** - Works on Windows, Mac, Linux, iOS, Android

### 📹 **Video & Audio**
- **HD Video Calls** - Crystal clear video with automatic quality adjustment
- **Screen Sharing** - Share your entire screen with presentation mode
- **Audio/Video Controls** - Mute, unmute, camera on/off with one click
- **Smart Layout** - Automatic grid layout that adapts to participant count
- **Mobile Optimized** - Touch-friendly controls and responsive video tiles

### 👥 **Meeting Management**
- **Meeting Titles** - Set custom titles for organized meetings
- **Participant Management** - See who's in the meeting and their status
- **Host Admission Control** - Host controls who can join the meeting
- **Real-time Notifications** - Popup alerts when participants request to join
- **Host Controls** - Crown indicator and special permissions for meeting hosts
- **Real-time Status** - Live audio/video status indicators for all participants

### 📱 **Mobile & Responsive Design**
- **Mobile-First Design** - Optimized for smartphones and tablets
- **Touch Controls** - Large, touch-friendly buttons and interfaces
- **Adaptive Layouts** - UI adjusts perfectly to any screen size
- **Portrait & Landscape** - Works seamlessly in both orientations
- **Swipe Navigation** - Intuitive mobile navigation patterns

### 🎯 **Professional Features**
- **Modern UI** - Clean, professional interface inspired by industry leaders
- **Meeting Rooms** - Custom room codes for easy joining
- **Persistent Sessions** - Maintain connections during the meeting
- **Join Request System** - Hosts get instant notifications with approve/reject options

## 🚀 Quick Start

### For Users

#### **Creating a Meeting:**
1. **Visit** [https://adjustmeeting.netlify.app](https://adjustmeeting.netlify.app)
2. **Fill in the Create Meeting form:**
   - Enter your name (will show as host)
   - Enter a meeting title (e.g., "Team Standup", "Client Call")
   - Enter a custom room code or click "Generate" for a random one
3. **Click "Create Meeting"**
4. **Share the room code** with participants
5. **Approve participants** when they request to join

#### **Joining a Meeting:**
1. **Get the room code** from the meeting host
2. **Visit** [https://adjustmeeting.netlify.app](https://adjustmeeting.netlify.app)
3. **Fill in the Join Meeting form:**
   - Enter your name
   - Enter the room code
4. **Click "Join Meeting"**
5. **Wait for host approval** to enter the meeting

#### **During the Meeting:**
- **Camera/Mic Controls:** Click the camera or microphone buttons to toggle
- **Screen Sharing:** Click the monitor icon to share your screen
- **Participants List:** Click the users icon to see who's in the meeting
- **Leave Meeting:** Click the red phone button to exit

#### **Host Features:**
- **Admission Control:** Orange notification appears when someone wants to join
- **Participant Management:** See all participants and their audio/video status
- **Meeting Control:** Full control over who can join and participate

### For Developers

#### Prerequisites

- Node.js 18+ and npm
- Modern browser with WebRTC support
- Basic knowledge of React and TypeScript

#### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/adjustmeeting.git
cd adjustmeeting

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

#### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📱 Mobile Experience

AdjustMeeting is designed mobile-first with special attention to mobile users:

### **📲 Mobile Features:**
- **Responsive Video Grid** - Adapts to portrait and landscape modes
- **Touch-Optimized Controls** - Large buttons perfect for touch interaction
- **Mobile-Friendly Notifications** - Join request popups sized for mobile screens
- **Swipe-Friendly Panels** - Easy access to participants and controls
- **Battery Optimized** - Efficient WebRTC implementation for longer battery life

### **📐 Screen Size Support:**
- **📱 Mobile Phones** (320px+) - Optimized single-column layouts
- **📱 Large Phones** (375px+) - Enhanced button sizes and spacing
- **📱 Tablets** (768px+) - Two-column layouts where appropriate
- **💻 Desktop** (1024px+) - Full multi-column experience

## 🏗️ Architecture

AdjustMeeting is built with modern web technologies:

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS for responsive design
- **Icons:** Lucide React for consistent iconography
- **WebRTC:** Native browser APIs for peer-to-peer communication
- **Routing:** React Router for navigation
- **State Management:** React Context for WebRTC state

### Project Structure

```
src/
├── components/          # React components
│   ├── HomePage.tsx     # Landing page with create/join options
│   ├── MeetingRoom.tsx  # Main meeting interface
│   ├── VideoGrid.tsx    # Responsive video layout management
│   ├── VideoTile.tsx    # Individual participant video
│   ├── ControlBar.tsx   # Meeting controls (mute, camera, etc.)
│   ├── ParticipantsList.tsx  # Participant management
│   └── AdmissionControl.tsx  # Host admission controls
├── contexts/            # React contexts
│   └── WebRTCContext.tsx     # WebRTC state management
└── types/              # TypeScript type definitions
```

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how you can help:

### Ways to Contribute

- 🐛 **Bug Reports** - Found a bug? Open an issue with details
- 💡 **Feature Requests** - Have an idea? We'd love to hear it
- 🔧 **Code Contributions** - Submit pull requests for fixes or features
- 📖 **Documentation** - Help improve our docs and guides
- 🎨 **Design** - Contribute to UI/UX improvements
- 📱 **Mobile Testing** - Test on different devices and report issues
- 🌍 **Translations** - Help make AdjustMeeting accessible worldwide

### Getting Started with Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly on multiple devices
4. **Commit your changes:** `git commit -m 'Add amazing feature'`
5. **Push to the branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Test on mobile devices and different screen sizes
- Write clear, descriptive commit messages
- Add tests for new features when applicable
- Update documentation for any API changes
- Ensure your code works across different browsers

## 🛠️ Technical Details

### WebRTC Implementation

AdjustMeeting uses WebRTC for peer-to-peer communication:

- **getUserMedia()** - Access camera and microphone
- **getDisplayMedia()** - Screen sharing functionality
- **RTCPeerConnection** - Direct peer-to-peer connections
- **MediaStream** - Handle audio/video streams

### Responsive Design System

- **Mobile-First Approach** - Designed for mobile, enhanced for desktop
- **Tailwind CSS** - Utility-first CSS framework for rapid responsive development
- **Breakpoint System:**
  - `sm:` 640px+ (Large phones)
  - `md:` 768px+ (Tablets)
  - `lg:` 1024px+ (Desktop)
  - `xl:` 1280px+ (Large desktop)

### Browser Compatibility

- ✅ Chrome 60+ (Mobile & Desktop)
- ✅ Firefox 55+ (Mobile & Desktop)
- ✅ Safari 11+ (Mobile & Desktop)
- ✅ Edge 79+ (Mobile & Desktop)
- ✅ Samsung Internet 8+
- ✅ iOS Safari 11+
- ✅ Chrome Mobile 60+

### Security Features

- Peer-to-peer connections (no server-side data storage)
- HTTPS required for camera/microphone access
- Host-controlled meeting admission
- No personal data collection

## 📱 Usage Examples

### Creating a Meeting

```javascript
// Example: Meeting creation flow
const meetingConfig = {
  roomId: 'team-standup-monday',
  hostName: 'John Doe',
  meetingTitle: 'Weekly Team Standup',
  requireAdmission: true
};
```

### Joining a Meeting

```javascript
// Example: Join meeting flow
const joinRequest = {
  roomId: 'team-standup-monday',
  participantName: 'Jane Smith',
  requestTime: new Date()
};
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file for custom configuration:

```env
VITE_APP_NAME=AdjustMeeting
VITE_DEFAULT_ROOM_PREFIX=meeting-
VITE_MAX_PARTICIPANTS=10
```

### Customization

You can customize the application by modifying:

- `tailwind.config.js` - Colors, fonts, and responsive breakpoints
- `src/consts.ts` - Application constants
- `src/components/` - UI components and layout

## 🚀 Deployment

### Deploy to Netlify (Recommended)

1. Fork this repository
2. Connect your GitHub account to Netlify
3. Select the repository and deploy
4. Your app will be live at `https://your-app.netlify.app`

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Self-Hosting

```bash
npm run build
# Serve the 'dist' folder with any static file server
```

## 🐛 Troubleshooting

### Common Issues

**Camera/Microphone not working:**
- Ensure you're using HTTPS (required for media access)
- Check browser permissions for camera/microphone
- Try refreshing the page

**Mobile issues:**
- Ensure you're using a supported mobile browser
- Check that camera/microphone permissions are granted
- Try switching between portrait and landscape modes

**Screen sharing not working:**
- Screen sharing requires HTTPS
- Some mobile browsers don't support screen sharing
- Check browser compatibility

**Connection issues:**
- Ensure both participants have stable internet
- Try refreshing both browsers
- Check firewall settings

### Getting Help

- 📖 Check our [Wiki](https://github.com/yourusername/adjustmeeting/wiki)
- 💬 Join our [Discussions](https://github.com/yourusername/adjustmeeting/discussions)
- 🐛 Report bugs in [Issues](https://github.com/yourusername/adjustmeeting/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- WebRTC community for excellent documentation
- React team for the amazing framework
- Tailwind CSS for beautiful responsive styling utilities
- Lucide for clean, consistent icons
- All our contributors who make this project better

## 🌟 Star History

If you find AdjustMeeting useful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/adjustmeeting&type=Date)](https://star-history.com/#yourusername/adjustmeeting&Date)

---

**Made with ❤️ by the open source community**

[Website](https://adjustmeeting.netlify.app) • [Documentation](https://docs.adjustmeeting.com) • [Community](https://github.com/yourusername/adjustmeeting/discussions) • [Twitter](https://twitter.com/adongoabc)