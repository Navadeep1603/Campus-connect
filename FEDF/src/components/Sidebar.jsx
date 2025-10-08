import { NavLink } from 'react-router-dom'

export default function Sidebar({ items, onLogout, brand = 'Campus Connect' }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-white border-r border-gray-200 hidden md:flex md:flex-col shadow-lg z-50">
      {/* Header with Logo */}
      <div className="h-20 flex items-center gap-3 px-5 border-b border-gray-200 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 bg-animated-gradient">
        {/* CC Logo SVG */}
        <svg className="flex-shrink-0" viewBox="0 0 200 200" width="48" height="48">
          <defs>
            <linearGradient id="gradient1-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#FF6B6B', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#4ECDC4', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#45B7D1', stopOpacity: 1}} />
            </linearGradient>
            <linearGradient id="gradient2-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#A8E6CF', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#FFD93D', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#FF6B9D', stopOpacity: 1}} />
            </linearGradient>
          </defs>
          
          {/* First C */}
          <path
            d="M 100 40 A 50 50 0 1 1 100 140 A 50 50 0 0 0 100 60 A 30 30 0 1 0 100 120"
            fill="none"
            stroke="url(#gradient1-sidebar)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Second C */}
          <path
            d="M 140 70 A 30 30 0 1 1 140 110 A 30 30 0 0 0 140 80 A 20 20 0 1 0 140 100"
            fill="none"
            stroke="url(#gradient2-sidebar)"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </svg>
        
        <div className="flex flex-col overflow-hidden">
          <div className="font-bold text-white text-sm leading-tight whitespace-nowrap">Campus</div>
          <div className="font-bold text-white/90 text-sm leading-tight whitespace-nowrap">Connect</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {items.map((it, idx) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
              transition-all duration-200 w-full
              ${isActive 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-orange-600'
              }
            `}
          >
            {it.icon ? <span className="text-lg flex-shrink-0">{it.icon}</span> : null}
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{it.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200">
        <button 
          onClick={onLogout} 
          className="w-full px-4 py-3 text-sm font-medium bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg border-2 border-gray-200 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
