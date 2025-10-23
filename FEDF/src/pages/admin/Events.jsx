import { useEffect, useState } from 'react'
import EventCard from '../../components/EventCard'
import { createEvent, deleteEvent, listClubs, listEvents, updateEvent } from '../../services/apiRouter'

export default function Events() {
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])
  const [form, setForm] = useState({ title:'', clubId:'', venue:'', start:'', end:'', category:'', capacity:30, description:'' })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const evs = await listEvents()
    const cls = await listClubs()
    setEvents(evs)
    setClubs(cls)
  }

  const checkConflicts = (newEvent) => {
    const start = new Date(newEvent.start)
    const end = new Date(newEvent.end)
    
    for (const event of events) {
      if (editingId && event.id === editingId) continue
      if (event.venue !== newEvent.venue) continue
      
      const existingStart = new Date(event.start)
      const existingEnd = new Date(event.end)
      
      if ((start >= existingStart && start < existingEnd) || 
          (end > existingStart && end <= existingEnd) ||
          (start <= existingStart && end >= existingEnd)) {
        return `Conflict: Venue "${newEvent.venue}" is already booked for "${event.title}" from ${existingStart.toLocaleString()} to ${existingEnd.toLocaleString()}`
      }
    }
    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Check for conflicts
    const conflict = checkConflicts(form)
    if (conflict) {
      setError(conflict)
      return
    }
    
    try {
      if (editingId) {
        await updateEvent(editingId, form)
        setEvents(prev => prev.map(e => e.id === editingId ? {...e, ...form} : e))
        setSuccess('Event updated successfully!')
        setEditingId(null)
      } else {
        const created = await createEvent(form)
        setEvents(prev => [created, ...prev])
        setSuccess('Event created successfully!')
      }
      setForm({ title:'', clubId:'', venue:'', start:'', end:'', category:'', capacity:30, description:'' })
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = (event) => {
    setEditingId(event.id)
    setForm({
      title: event.title,
      clubId: event.clubId,
      venue: event.venue,
      start: event.start,
      end: event.end,
      category: event.category,
      capacity: event.capacity || 30,
      description: event.description || ''
    })
    setError('')
    setSuccess('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ title:'', clubId:'', venue:'', start:'', end:'', category:'', capacity:30, description:'' })
    setError('')
    setSuccess('')
  }

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await deleteEvent(id)
      setEvents(prev => prev.filter(e => e.id !== id))
      setSuccess('Event deleted successfully!')
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredEvents = events.filter(ev => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return new Date(ev.start) > new Date()
    if (filter === 'past') return new Date(ev.end) < new Date()
    return ev.category === filter
  })

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Total Events</div>
          <div className="text-3xl font-bold">{events.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Upcoming</div>
          <div className="text-3xl font-bold">{events.filter(e => new Date(e.start) > new Date()).length}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Active Clubs</div>
          <div className="text-3xl font-bold">{clubs.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">This Month</div>
          <div className="text-3xl font-bold">{events.filter(e => {
            const start = new Date(e.start)
            const now = new Date()
            return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear()
          }).length}</div>
        </div>
      </div>

      {/* Create/Edit Event Form */}
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          {editingId ? '📝 Edit Event' : '➕ Create New Event'}
        </h2>
        {error && <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded mb-3">{error}</div>}
        {success && <div className="p-3 text-sm bg-green-50 text-green-700 border border-green-200 rounded mb-3">{success}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Title *</label>
              <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Enter event title" className="w-full border rounded px-3 py-2"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Club *</label>
              <select required value={form.clubId} onChange={e=>setForm({...form,clubId:e.target.value})} className="w-full border rounded px-3 py-2">
                <option value="">Select club</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Venue *</label>
              <input required value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} placeholder="e.g., Main Auditorium" className="w-full border rounded px-3 py-2"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full border rounded px-3 py-2">
                <option value="">Select category</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Competition">Competition</option>
                <option value="Social">Social</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Academic">Academic</option>
                <option value="Audition">Audition</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity *</label>
              <input type="number" min="1" value={form.capacity} onChange={e=>setForm({...form,capacity:parseInt(e.target.value||'0')})} placeholder="Max attendees" className="w-full border rounded px-3 py-2"/>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date & Time *</label>
              <input required type="datetime-local" value={form.start} onChange={e=>setForm({...form,start:e.target.value})} className="w-full border rounded px-3 py-2"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date & Time *</label>
              <input required type="datetime-local" value={form.end} onChange={e=>setForm({...form,end:e.target.value})} className="w-full border rounded px-3 py-2"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Event description..." rows="3" className="w-full border rounded px-3 py-2"/>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-medium">
              {editingId ? 'Update Event' : 'Create Event'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 border rounded-lg shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>setFilter('all')} className={`px-4 py-2 rounded ${filter==='all' ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            All ({events.length})
          </button>
          <button onClick={()=>setFilter('upcoming')} className={`px-4 py-2 rounded ${filter==='upcoming' ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            Upcoming ({events.filter(e => new Date(e.start) > new Date()).length})
          </button>
          <button onClick={()=>setFilter('past')} className={`px-4 py-2 rounded ${filter==='past' ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            Past ({events.filter(e => new Date(e.end) < new Date()).length})
          </button>
          <button onClick={()=>setFilter('Workshop')} className={`px-4 py-2 rounded ${filter==='Workshop' ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            Workshops
          </button>
          <button onClick={()=>setFilter('Seminar')} className={`px-4 py-2 rounded ${filter==='Seminar' ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            Seminars
          </button>
          <button onClick={()=>setFilter('Competition')} className={`px-4 py-2 rounded ${filter==='Competition' ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            Competitions
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEvents.map(ev => (
          <EventCard 
            key={ev.id} 
            event={ev} 
            actions={
              <div className="flex gap-2">
                <button onClick={()=>startEdit(ev)} className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  Edit
                </button>
                <button onClick={()=>remove(ev.id)} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                  Delete
                </button>
              </div>
            } 
          />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">📅</div>
          <div className="text-gray-600">No events found</div>
        </div>
      )}
    </div>
  )
}
