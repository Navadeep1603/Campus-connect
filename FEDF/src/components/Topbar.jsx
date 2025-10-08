import { useState } from 'react'

export default function Topbar({ title, onOpenMenu }) {
  const [q, setQ] = useState('')
  return (
    <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center px-6 gap-4 shadow-sm">
      <button 
        className="md:hidden p-2 rounded-lg hover:bg-brand-50 text-gray-700 hover:text-brand-700 transition-all" 
        onClick={onOpenMenu} 
        aria-label="Open menu"
      >
        <span className="text-xl">☰</span>
      </button>
      <h1 className="text-xl font-bold text-gray-900 gradient-text">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <div className="relative">
          <input 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            placeholder="🔍 Search..." 
            className="px-4 py-2 border-2 border-gray-200 rounded-xl w-64 text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all outline-none"
          />
        </div>
        <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-brand-700 transition-all relative">
          <span className="text-xl">🔔</span>
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  )
}
