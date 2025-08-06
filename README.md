# AdjustMeeting 🎥

*A beautiful, open-source video conferencing solution with advanced features that works entirely in your browser*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://opensource.org/)

## 🌐 **Live Demo**

**Try AdjustMeeting now:** [https://adjustmeeting.onrender.com](https://adjustmeeting.onrender.com)

*No registration required - just create or join a meeting instantly!*

**AdjustMeeting** is a free, open-source video conferencing platform that works entirely in your browser. No downloads, no registration, no hassle - just instant video meetings with anyone, anywhere.

## ✨ Features

### 🚀 **Core Features**
- **Zero Setup** - Works instantly in any modern browser
- **Privacy First** - Peer-to-peer connections, no data stored on servers
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **Cross-Platform** - Works on Windows, Mac, Linux, iOS, Android

### 📹 **Video & Audio**
- **HD Video Calls** - Crystal clear video with automatic quality adjustment
- **Screen Sharing** - Share your entire screen with presentation mode
- **Audio/Video Controls** - Mute, unmute, camera on/off with one click
- **Smart Layout** - Automatic grid layout that adapts to participant count

### 👥 **Meeting Management**
- **Participant Management** - See who's in the meeting and their status
- **Meeting Admission** - Host controls who can join the meeting
- **Host Controls** - Crown indicator and special permissions for meeting hosts
- **Real-time Status** - Live audio/video status indicators for all participants

### 🎨 **Collaboration Tools**
- **Real-time Whiteboard** - Draw, annotate, and brainstorm together
  - Multiple drawing tools (pen, eraser, shapes)
  - Color picker with 8+ colors
  - Adjustable brush sizes
  - Download whiteboard as PNG
  - Multi-user simultaneous drawing

- **Live Chat with File Sharing** - Communicate without interrupting
  - Real-time messaging
  - File upload and sharing
  - Typing indicators
  - Message timestamps
  - Unread message notifications

### 🎯 **Professional Features**
- **Modern UI** - Clean, professional interface inspired by industry leaders
- **Meeting Rooms** - Custom room codes for easy joining
- **Persistent Sessions** - Drawings and chat history maintained during meeting

## 🚀 Quick Start

### For Users

1. **Visit the website** (or run locally)
2. **Create a meeting:**
   - Enter a custom room code or generate one
   - Set your meeting title and your name as host
   - Share the meeting link with participants
3. **Join a meeting:**
   - Click the shared meeting link
   - Enter your name
   - Wait for host approval to join
4. **Use collaboration tools:**
   - Click the chat icon to send messages and share files
   - Click the whiteboard icon to draw and annotate together
   - Use screen sharing for presentations

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

## 🏗️ Architecture

AdjustMeeting is built with modern web technologies:

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS for responsive design
- **Icons:** Lucide React for consistent iconography
- **WebRTC:** Native browser APIs for peer-to-peer communication
- **Routing:** React Router for navigation

### Project Structure

```
src/
├── components/          # React components
│   ├── HomePage.tsx     # Landing page with create/join options
│   ├── MeetingRoom.tsx  # Main meeting interface
│   ├── VideoGrid.tsx    # Video layout management
│   ├── VideoTile.tsx    # Individual participant video
│   ├── ControlBar.tsx   # Meeting controls (mute, camera, etc.)
│   ├── ParticipantsList.tsx  # Participant management
│   ├── AdmissionControl.tsx  # Host admission controls
│   ├── ChatPanel.tsx    # Real-time chat with file sharing
│   └── Whiteboard.tsx   # Collaborative whiteboard
├── contexts/            # React contexts
│   └── WebRTCContext.tsx     # WebRTC state management
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
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
- 🌍 **Translations** - Help make AdjustMeeting accessible worldwide

### Getting Started with Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes:** `git commit -m 'Add amazing feature'`
5. **Push to the branch:** `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features when applicable
- Update documentation for any API changes
- Ensure your code works across different browsers

### Good First Issues

Look for issues labeled `good first issue` - these are perfect for newcomers:

- UI improvements and styling fixes
- Adding new icons or animations
- Improving error messages
- Writing tests
- Documentation updates

## 🛠️ Technical Details

### WebRTC Implementation

AdjustMeeting uses WebRTC for peer-to-peer communication:

- **getUserMedia()** - Access camera and microphone
- **getDisplayMedia()** - Screen sharing functionality
- **RTCPeerConnection** - Direct peer-to-peer connections
- **MediaStream** - Handle audio/video streams

### Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Security Features

- Peer-to-peer connections (no server-side data storage)
- HTTPS required for camera/microphone access
- Host-controlled meeting admission
- No personal data collection

## 📱 Usage Examples

### Creating a Meeting

```javascript
// Example: Programmatically create a meeting
const meetingConfig = {
  roomId: 'my-awesome-meeting',
  hostName: 'John Doe',
  title: 'Weekly Team Sync',
  requireAdmission: true
};
```

### Joining a Meeting

```javascript
// Example: Join meeting flow
const joinRequest = {
  roomId: 'my-awesome-meeting',
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

- `tailwind.config.js` - Colors, fonts, and styling
- `src/consts.ts` - Application constants
- `src/components/` - UI components and layout

## 🚀 Deployment

### Deploy to Netlify

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

**Screen sharing not working:**
- Screen sharing requires HTTPS
- Some browsers may block screen sharing in iframes
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
- Tailwind CSS for beautiful styling utilities
- Lucide for clean, consistent icons
- Canvas API for whiteboard functionality
- File API for seamless file sharing
- All our contributors who make this project better

## 🌟 Star History

If you find AdjustMeeting useful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/adjustmeeting&type=Date)](https://star-history.com/#yourusername/adjustmeeting&Date)

---

**Made with ❤️ by the open source community**

[Website](https://adjustmeeting.com) • [Documentation](https://docs.adjustmeeting.com) • [Community](https://github.com/yourusername/adjustmeeting/discussions) • [Twitter](https://twitter.com/adongoabc)