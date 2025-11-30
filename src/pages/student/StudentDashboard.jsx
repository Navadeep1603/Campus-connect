import { useState } from 'react'
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { useAuth } from '../../contexts/AuthContext'
import Explore from './Explore'
import MyActivities from './MyActivities'
import Certificates from './Certificates'
import Feedback from './Feedback'
import StudentAnnouncements from './Announcements'

export default function StudentDashboard() {
  const { logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const items = [
    { to: '/student/explore', label: 'Explore', icon: '🔍' },
    { to: '/student/my', label: 'My Activities', icon: '📋' },
    { to: '/student/announcements', label: 'Announcements', icon: '📢' },
    { to: '/student/certificates', label: 'Certificates', icon: '🎓' },
    { to: '/student/feedback', label: 'Feedback', icon: '💬' },
  ]

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 100%)'}}>
      <Sidebar 
        items={items} 
        onLogout={logout} 
        brand="Student Portal"
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="md:pl-[280px]">
        <Topbar 
          title="Student Dashboard"
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="container-page space-y-6 px-4 md:px-6">
          <Routes>
            <Route path="/" element={<Navigate to="explore" replace />} />
            <Route path="explore" element={<Explore />} />
            <Route path="my" element={<MyActivities />} />
            <Route path="announcements" element={<StudentAnnouncements />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="feedback" element={<Feedback />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
