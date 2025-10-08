import { useEffect, useState } from 'react'
import EventCard from '../../components/EventCard'
import { createEvent, deleteEvent, listClubs, listEvents, updateEvent } from '../../services/api'

export default function Events() {
  const [events, setEvents] = useState([])
  const [clubs, setClubs] = useState([])
  const [form, setForm] = useState({ title:'', clubId:'', venue:'', start:'', end:'', category:'General', capacity:30 })
  const [error, setError] = useState('')

  useEffect(() => {
    listEvents().then(setEvents)
    listClubs().then(setClubs)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const created = await createEvent(form)
      setEvents(prev => [created, ...prev])
      setForm({ title:'', clubId:'', venue:'', start:'', end:'', category:'General', capacity:30 })
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (id) => {
    await deleteEvent(id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 border rounded-lg">
        <h2 className="font-semibold mb-3">Create Event</h2>
        {error && <div className="p-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded mb-2">{error}</div>}
        <form onSubmit={submit} className="grid md:grid-cols-3 gap-3">
          <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Title" className="border rounded px-3 py-2"/>
          <select required value={form.clubId} onChange={e=>setForm({...form,clubId:e.target.value})} className="border rounded px-3 py-2">
            <option value="">Select club</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input required value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})} placeholder="Venue" className="border rounded px-3 py-2"/>
          <input required type="datetime-local" value={form.start} onChange={e=>setForm({...form,start:e.target.value})} className="border rounded px-3 py-2"/>
          <input required type="datetime-local" value={form.end} onChange={e=>setForm({...form,end:e.target.value})} className="border rounded px-3 py-2"/>
          <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category" className="border rounded px-3 py-2"/>
          <input type="number" min="1" value={form.capacity} onChange={e=>setForm({...form,capacity:parseInt(e.target.value||'0')})} placeholder="Capacity" className="border rounded px-3 py-2"/>
          <div className="md:col-span-3 text-right">
            <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded">Create</button>
          </div>
        </form>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {events.map(ev => (
          <EventCard key={ev.id} event={ev} actions={<button onClick={()=>remove(ev.id)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">Delete</button>} />
        ))}
      </div>
    </div>
  )
}
