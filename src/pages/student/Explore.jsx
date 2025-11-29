import { useEffect, useMemo, useState } from 'react'
import { listClubs, listEvents, registerForEvent } from '../../services/apiRouter'
import EventCard from '../../components/EventCard'
import { useAuth } from '../../contexts/AuthContext'

export default function Explore() {
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const { user } = useAuth()

  useEffect(()=>{ listEvents().then(setEvents); listClubs().then(setClubs) },[])

  const register = async (ev) => {
    try {
      const result = await registerForEvent(ev.id, user.id)
      if (result.pending) {
        alert('Registration request submitted! Waiting for admin approval.')
      } else {
        alert('Registered successfully!')
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const categories = useMemo(() => ['All', ...Array.from(new Set(events.map(e => e.category || 'General')))], [events])
  const filtered = useMemo(() => events.filter(e => {
    const matchQ = [e.title, e.venue, e.category].join(' ').toLowerCase().includes(q.toLowerCase())
    const matchC = cat === 'All' || (e.category || 'General') === cat
    return matchQ && matchC
  }), [events, q, cat])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Explore Events</h2>
        <p className="text-gray-600">Discover and register for upcoming campus events</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="card p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px]">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Search Events</label>
            <input 
              value={q} 
              onChange={e=>setQ(e.target.value)} 
              placeholder="🔍 Search by title, venue, or category..." 
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none"
            />
          </div>
          <div className="w-full sm:w-auto min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
            <select 
              value={cat} 
              onChange={e=>setCat(e.target.value)} 
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none cursor-pointer"
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="card-grid">
        {filtered.map(ev => (
          <EventCard key={ev.id} event={ev} onRegister={register} />
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}
