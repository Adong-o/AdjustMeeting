import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import MeetingRoom from './components/MeetingRoom'
import { WebRTCProvider } from './contexts/WebRTCContext'

function App() {
  return (
    <WebRTCProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomId" element={<MeetingRoom />} />
          </Routes>
        </div>
      </Router>
    </WebRTCProvider>
  )
}

export default App