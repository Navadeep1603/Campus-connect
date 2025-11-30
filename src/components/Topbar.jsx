import { useState, useEffect } from 'react'
import NotificationBell from './NotificationBell'
import { useAuth } from '../contexts/AuthContext'

export default function Topbar({ title, onOpenMenu }) {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])
  
  // Get user's display name
  const getUserDisplayName = () => {
    if (!user) return title
    
    if (user.profile && user.profile.first_name && user.profile.last_name) {
      return `${user.profile.first_name} ${user.profile.last_name}`
    } else if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    } else if (user.name) {
      return user.name
    } else {
      return user.email?.split('@')[0] || title
    }
  }
  
  return (
    <header className="premium-topbar">
      {/* Animated gradient background */}
      <div className="premium-gradient-bg"></div>
      
      {/* Glassmorphism layer */}
      <div className="premium-glass-layer"></div>
      
      {/* Content container */}
      <div className="premium-content">
        {/* Mobile Menu Button */}
        {onOpenMenu && (
          <button 
            onClick={onOpenMenu}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white mr-2"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        {/* Left Section: User Name */}
        <div className={`premium-logo-section ${
          isLoaded ? 'loaded' : ''
        }`}>
          <div className="premium-user-name-left">
            <span className="premium-user-name-bold truncate max-w-[150px] sm:max-w-none">{getUserDisplayName()}</span>
            <span className="premium-wave-emoji">👋</span>
          </div>
        </div>
        
        {/* Center Section: Empty */}
        <div className="premium-center-section hidden md:block"></div>
        
        {/* Right Section: Search + Notifications */}
        <div className={`premium-right-section ${
          isLoaded ? 'loaded' : ''
        }`}>
          {/* Premium Search Box - Hidden on mobile */}
          <div className="premium-search-container hidden sm:flex">
            <div className="premium-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <input 
              value={q} 
              onChange={e=>setQ(e.target.value)} 
              placeholder="Search..." 
              className="premium-search-input"
            />
          </div>
          
          {/* Premium Notification Bell */}
          <div className="premium-notification-wrapper">
            <NotificationBell />
          </div>
        </div>
      </div>
      
      {/* Premium Floating Particles */}
      <div className="premium-particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
      </div>
      
      {/* Bottom ambient glow */}
      <div className="premium-bottom-glow"></div>
    </header>
  )
}
