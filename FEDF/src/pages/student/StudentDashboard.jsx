import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import NotificationsPanel from '../../components/NotificationsPanel'
import { useAuth } from '../../contexts/AuthContext'
import Explore from './Explore'
import MyActivities from './MyActivities'
import Certificates from './Certificates'
import Feedback from './Feedback'
import StudentCalendar from './Calendar'

export default function StudentDashboard() {
  const { logout } = useAuth()
  const items = [
    { to: '/student/explore', label: 'Explore' },
    { to: '/student/my', label: 'My Activities' },
    { to: '/student/calendar', label: 'Calendar' },
    { to: '/student/certificates', label: 'Certificates' },
    { to: '/student/feedback', label: 'Feedback' },
  ]

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #FFF5F0 0%, #FFFFFF 100%)'}}>
      <Sidebar items={items} onLogout={logout} />
      <div className="md:pl-[280px]">
        <Topbar title="Student" />
        <main className="container-page space-y-6">
          <Routes>
            <Route path="/" element={<Navigate to="explore" replace />} />
            <Route path="explore" element={<Explore />} />
            <Route path="my" element={<MyActivities />} />
            <Route path="calendar" element={<StudentCalendar />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="feedback" element={<Feedback />} />
          </Routes>
          <NotificationsPanel />
        </main>
      </div>
    </div>
  )
}
