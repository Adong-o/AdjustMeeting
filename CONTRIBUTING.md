# Contributing to AdjustMeeting

Thank you for your interest in contributing to AdjustMeeting! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern browser with WebRTC support
- Basic knowledge of React and TypeScript

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/adjustmeeting.git
   cd adjustmeeting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎨 Project Structure

```
src/
├── components/          # React components
│   ├── HomePage.tsx     # Landing page with themes
│   ├── MeetingRoom.tsx  # Main meeting interface
│   ├── VideoGrid.tsx    # Video layout management
│   ├── VideoTile.tsx    # Individual participant video
│   ├── ControlBar.tsx   # Meeting controls
│   ├── ParticipantsList.tsx  # Participant management
│   └── AdmissionControl.tsx  # Host admission controls
├── contexts/            # React contexts
│   └── WebRTCContext.tsx     # WebRTC state management
└── types/              # TypeScript definitions
```

## 🛠️ Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Use functional components with hooks
- Maintain consistent indentation (2 spaces)

### Component Guidelines

- Keep components focused and single-purpose
- Use proper TypeScript interfaces
- Include proper error handling
- Add hover states and transitions

### Theme System

We support two themes:
- **Ancient Theme**: Warm amber/gold colors with serif fonts
- **Modern Theme**: Cool blue/gray colors with sans-serif fonts

When adding new components, ensure they work with both themes.

## 🎯 Areas for Contribution

### 🐛 Bug Fixes
- WebRTC connection issues
- UI/UX improvements
- Cross-browser compatibility
- Mobile responsiveness

### ✨ New Features
- Chat functionality
- Recording capabilities
- Virtual backgrounds
- Meeting scheduling
- Breakout rooms

### 🎨 Design Improvements
- Animation enhancements
- Accessibility improvements
- Theme customization
- Icon improvements

### 📚 Documentation
- API documentation
- User guides
- Code comments
- README improvements

## 🔧 Technical Details

### WebRTC Implementation

- Uses native browser WebRTC APIs
- Peer-to-peer connections for video/audio
- Screen sharing with display media API
- Admission control system for hosts

### State Management

- React Context for WebRTC state
- Local state for UI components
- Proper cleanup on component unmount

### Styling

- Tailwind CSS for styling
- Responsive design principles
- Hover effects and transitions
- Theme-aware color system

## 📝 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Test across different browsers
   - Ensure both themes work properly

3. **Test thoroughly**
   - Test video/audio functionality
   - Test screen sharing
   - Test admission controls
   - Test responsive design

4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Provide clear description
   - Include screenshots if UI changes
   - Reference any related issues

## 🐛 Bug Reports

When reporting bugs, please include:

- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots/videos (if applicable)

## 💡 Feature Requests

For feature requests, please provide:

- Clear description of the feature
- Use case and benefits
- Mockups or examples (if applicable)
- Technical considerations

## 🎨 Design Contributions

- Follow existing design patterns
- Maintain accessibility standards
- Consider both theme variations
- Test on different screen sizes

## 📱 Mobile Considerations

- Touch-friendly interface
- Responsive layouts
- Performance optimization
- Battery usage considerations

## 🔒 Security Guidelines

- No sensitive data in client-side code
- Proper input validation
- Secure WebRTC connections
- Privacy-first approach

## 🌍 Internationalization

Future considerations for i18n:
- Text externalization
- RTL language support
- Cultural considerations
- Date/time formatting

## 📊 Performance

- Optimize bundle size
- Lazy load components
- Efficient re-renders
- Memory leak prevention

## 🧪 Testing

- Manual testing across browsers
- Responsive design testing
- WebRTC functionality testing
- Theme switching testing

## 📞 Getting Help

- Check existing issues and discussions
- Join our community discussions
- Ask questions in pull requests
- Reach out to maintainers

## 🏆 Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Project documentation

Thank you for contributing to AdjustMeeting! 🎉