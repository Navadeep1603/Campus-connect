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
    <header className="h-16 bg-white/90 backdrop-blur-lg sticky top-0 z-10 flex items-center px-6 gap-4 shadow-lg transition-all duration-500">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-purple-500/5 to-blue-500/5 animate-pulse"></div>
      
      {/* User Name on the left */}
      <div className={`flex items-center transition-all duration-700 delay-100 ${
        isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
      }`}>
        <h1 className="text-xl font-semibold text-gray-800">
          {getUserDisplayName()}
        </h1>
      </div>
      
      {/* Right side with search and notifications */}
      <div className={`ml-auto flex items-center gap-4 transition-all duration-700 delay-200 ${
        isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}>
        {/* Search bar */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-20 transition-all duration-300 blur-sm"></div>
          <input 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            placeholder="🔍 Search..." 
            className="relative px-4 py-2 border-2 border-gray-200 rounded-xl w-64 text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all duration-300 outline-none bg-white/80 backdrop-blur-sm hover:shadow-lg focus:shadow-xl transform hover:scale-105 focus:scale-105"
          />
        </div>
        
        {/* Notification bell */}
        <div className="transform transition-all duration-300 hover:scale-110">
          <NotificationBell />
        </div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-1/4 w-1 h-1 bg-brand-400 rounded-full animate-float-1"></div>
        <div className="absolute top-4 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-float-2"></div>
        <div className="absolute bottom-3 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-float-3"></div>
      </div>
    </header>
  )
}
