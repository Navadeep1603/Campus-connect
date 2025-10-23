import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { listEvents, createAnnouncement, listAnnouncements, deleteAnnouncement } from '../../services/apiRouter'

export default function Announcements() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState('info')
  const [targetAudience, setTargetAudience] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [events, setEvents] = useState([])
  const [history, setHistory] = useState([])
  const [success, setSuccess] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [eventsData, announcementsData] = await Promise.all([
        listEvents(),
        listAnnouncements()
      ])
      setEvents(eventsData)
      setHistory(announcementsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Please fill in both title and message')
      return
    }

    setSending(true)
    
    try {
      // Create announcement in database
      await createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        type,
        targetAudience,
        eventId: selectedEvent || null,
        userId: user?.id
      })
      
      // Reload announcements
      await loadData()
      
      // Reset form
      setMessage('')
      setTitle('')
      setType('info')
      setTargetAudience('all')
      setSelectedEvent('')
      
      setSuccess(`Announcement sent successfully to ${targetAudience}!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      alert(`Error sending announcement: ${error.message}`)
    } finally {
      setSending(false)
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Delete this announcement from history?')) return
    
    try {
      await deleteAnnouncement(id)
      await loadData()
      setSuccess('Announcement deleted successfully!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (error) {
      alert(`Error deleting announcement: ${error.message}`)
    }
  }

  const typeColors = {
    info: 'blue',
    warning: 'yellow',
    urgent: 'red',
    success: 'green',
    event: 'purple'
  }

  const audienceLabels = {
    all: 'All Students',
    students: 'Students Only',
    faculty: 'Faculty Only',
    event: 'Event Participants'
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Total Sent</div>
          <div className="text-3xl font-bold">{history.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">This Week</div>
          <div className="text-3xl font-bold">
            {history.filter(a => {
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return new Date(a.timestamp) > weekAgo
            }).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Today</div>
          <div className="text-3xl font-bold">
            {history.filter(a => {
              const today = new Date().toDateString()
              return new Date(a.timestamp).toDateString() === today
            }).length}
          </div>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">
          {success}
        </div>
      )}

      {/* Create Announcement Form */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📢 Create New Announcement
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input 
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="info">ℹ️ Information</option>
                <option value="warning">⚠️ Warning</option>
                <option value="urgent">🚨 Urgent</option>
                <option value="success">✅ Success/Update</option>
                <option value="event">📅 Event Reminder</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target Audience *</label>
              <select value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="all">👥 All Students</option>
                <option value="students">🎓 Students Only</option>
                <option value="faculty">👨‍🏫 Faculty Only</option>
                <option value="event">📅 Event Participants</option>
              </select>
            </div>
          </div>

          {targetAudience === 'event' && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Event</label>
              <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Choose an event</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Message *</label>
            <textarea 
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              placeholder="Write your announcement message here..."
              className="w-full border rounded px-3 py-2"
            />
            <div className="text-sm text-gray-500 mt-1">
              {message.length} characters
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={send}
              disabled={sending}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-medium disabled:opacity-50"
            >
              {sending ? 'Sending...' : '📤 Send Announcement'}
            </button>
            <button 
              onClick={() => {
                setMessage('')
                setTitle('')
                setType('info')
                setTargetAudience('all')
                setSelectedEvent('')
              }}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Announcement History */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📜 Announcement History
          <span className="text-sm font-normal text-gray-600">({history.length})</span>
        </h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">⏳</div>
            <div>Loading announcements...</div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <div>No announcements sent yet</div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(announcement => (
              <div key={announcement.id} className={`p-4 border-l-4 border-${typeColors[announcement.type]}-500 rounded-lg bg-gray-50`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <span className={`px-2 py-0.5 bg-${typeColors[announcement.type]}-100 text-${typeColors[announcement.type]}-800 text-xs rounded`}>
                        {announcement.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{announcement.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📅 {new Date(announcement.created_at).toLocaleString()}</span>
                      <span>👥 {audienceLabels[announcement.target_audience]}</span>
                      {announcement.event_id && announcement.events && (
                        <span>📌 {announcement.events.title}</span>
                      )}
                      {announcement.profiles && (
                        <span>👤 {announcement.profiles.first_name} {announcement.profiles.last_name}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="text-red-600 hover:text-red-800 text-sm ml-4"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
