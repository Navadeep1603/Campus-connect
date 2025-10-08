import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import NotificationsPanel from '../../components/NotificationsPanel'
import { useAuth } from '../../contexts/AuthContext'
import Events from './Events'
import Clubs from './Clubs'
import CalendarPage from './Calendar'
import Registrations from './Registrations'
import Reports from './Reports'
import Announcements from './Announcements'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const items = [
    { to: '/admin/events', label: 'Events' },
    { to: '/admin/clubs', label: 'Clubs' },
    { to: '/admin/calendar', label: 'Calendar' },
    { to: '/admin/registrations', label: 'Registrations' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/announcements', label: 'Announcements' },
  ]

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 100%)'}}>
      <Sidebar items={items} onLogout={logout} />
      <div className="md:pl-[280px]">
        <Topbar title="Admin" />
        <main className="container-page space-y-6">
          <Routes>
            <Route path="/" element={<Navigate to="events" replace />} />
            <Route path="events" element={<Events />} />
            <Route path="clubs" element={<Clubs />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="reports" element={<Reports />} />
            <Route path="announcements" element={<Announcements />} />
          </Routes>
          <NotificationsPanel />
        </main>
      </div>
    </div>
  )
}
