import { NavLink } from 'react-router-dom'

export default function Sidebar({ items, onLogout, brand = 'Campus Connect', isOpen = false, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-[280px] bg-white/80 backdrop-blur-xl border-r border-gray-200/50 
        flex flex-col shadow-xl z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 pointer-events-none"></div>
      
      {/* Header with Logo */}
      <div className="relative h-20 flex items-center gap-3 px-5 border-b border-gray-200/50">
        {/* CC Logo SVG */}
        <svg className="flex-shrink-0" viewBox="0 0 200 200" width="48" height="48">
          <defs>
            <linearGradient id="gradient1-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#667eea', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#764ba2', stopOpacity: 1}} />
            </linearGradient>
            <linearGradient id="gradient2-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#f093fb', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#f5576c', stopOpacity: 1}} />
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
        
        <div className="flex flex-col">
          <div className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-base leading-tight">Campus</div>
          <div className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-base leading-tight">Connect</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {items.map((it, idx) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => `
              relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
              transition-all duration-300 w-full group overflow-hidden
              ${isActive 
                ? 'text-white shadow-lg shadow-purple-500/30' 
                : 'text-gray-700 hover:bg-white/60 hover:shadow-md'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {/* Gradient pill background for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl animate-gradient-shift"></div>
                )}
                <span className={`relative text-lg flex-shrink-0 transition-transform duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  {it.icon || '•'}
                </span>
                <span className="relative whitespace-nowrap overflow-hidden text-ellipsis">{it.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="relative p-3 border-t border-gray-200/50">
        <button 
          onClick={onLogout} 
          className="w-full px-4 py-3 text-sm font-medium bg-white/60 backdrop-blur-md hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl border border-gray-200/50 hover:border-red-300 transition-all duration-300 shadow-sm hover:shadow-lg flex items-center justify-center gap-2 group"
        >
          <span className="text-lg transition-transform duration-300 group-hover:rotate-12">🚺</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  )
}
