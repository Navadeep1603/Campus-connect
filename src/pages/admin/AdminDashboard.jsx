import { useState } from 'react'
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { useAuth } from '../../contexts/AuthContext'
import Events from './Events'
import Clubs from './Clubs'
import CalendarPage from './Calendar'
import Registrations from './Registrations'
import Reports from './Reports'
import Announcements from './Announcements'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const items = [
    { to: '/admin/events', label: 'Events', icon: '📅' },
    { to: '/admin/clubs', label: 'Clubs', icon: '🏢' },
    { to: '/admin/calendar', label: 'Calendar', icon: '📆' },
    { to: '/admin/registrations', label: 'Registrations', icon: '📝' },
    { to: '/admin/reports', label: 'Reports', icon: '📊' },
    { to: '/admin/announcements', label: 'Announcements', icon: '📢' },
  ]

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 100%)'}}>
      <Sidebar 
        items={items} 
        onLogout={logout} 
        brand="Admin Portal" 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="md:pl-[280px]">
        <Topbar 
          title="Admin Dashboard" 
          onOpenMenu={() => setIsMobileMenuOpen(true)}
        />
        <main className="container-page space-y-6 px-4 md:px-6">
          <Routes>
            <Route path="/" element={<Navigate to="events" replace />} />
            <Route path="events" element={<Events />} />
            <Route path="clubs" element={<Clubs />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="reports" element={<Reports />} />
            <Route path="announcements" element={<Announcements />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
