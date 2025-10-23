import { useState, useEffect } from 'react'
import { listAnnouncements } from '../../services/apiRouter'

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const data = await listAnnouncements()
      setAnnouncements(data)
    } catch (error) {
      console.error('Error loading announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const typeColors = {
    info: 'blue',
    warning: 'yellow',
    urgent: 'red',
    success: 'green',
    event: 'purple'
  }

  const typeIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    urgent: '🚨',
    success: '✅',
    event: '📅'
  }

  const filteredAnnouncements = announcements.filter(a => {
    if (filter === 'all') return true
    return a.type === filter
  })

  const todayAnnouncements = announcements.filter(a => {
    const today = new Date().toDateString()
    return new Date(a.created_at).toDateString() === today
  })

  const thisWeekAnnouncements = announcements.filter(a => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(a.created_at) > weekAgo
  })

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Total Announcements</div>
          <div className="text-3xl font-bold">{announcements.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">This Week</div>
          <div className="text-3xl font-bold">{thisWeekAnnouncements.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Today</div>
          <div className="text-3xl font-bold">{todayAnnouncements.length}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📢 Announcements
            <span className="text-sm font-normal text-gray-600">({filteredAnnouncements.length})</span>
          </h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded ${
                filter === 'all' 
                  ? 'bg-brand-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {Object.keys(typeIcons).map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 text-sm rounded ${
                  filter === type 
                    ? `bg-${typeColors[type]}-600 text-white` 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {typeIcons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
            <div className="text-2xl mb-2">⏳</div>
            <div>Loading announcements...</div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <div>No announcements yet</div>
          </div>
        ) : (
          filteredAnnouncements.map(announcement => (
            <div 
              key={announcement.id} 
              className={`bg-white border-l-4 border-${typeColors[announcement.type]}-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{typeIcons[announcement.type]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{announcement.title}</h3>
                    <span className={`px-2 py-0.5 bg-${typeColors[announcement.type]}-100 text-${typeColors[announcement.type]}-800 text-xs rounded font-medium`}>
                      {announcement.type}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{announcement.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      📅 {new Date(announcement.created_at).toLocaleDateString()} at {new Date(announcement.created_at).toLocaleTimeString()}
                    </span>
                    {announcement.profiles && (
                      <span className="flex items-center gap-1">
                        👤 {announcement.profiles.first_name} {announcement.profiles.last_name}
                      </span>
                    )}
                    {announcement.events && (
                      <span className="flex items-center gap-1">
                        📌 {announcement.events.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
