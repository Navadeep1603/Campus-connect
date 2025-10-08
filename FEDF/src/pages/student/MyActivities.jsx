import { useEffect, useMemo, useState } from 'react'
import { listEvents, listRegistrations } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function MyActivities() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [regs, setRegs] = useState([])

  useEffect(()=>{ listEvents().then(setEvents); listRegistrations().then(setRegs) },[])
  const my = useMemo(() => regs.filter(r => r.studentId === user.id).map(r => ({
    ...r,
    event: events.find(e => e.id === r.eventId) || {},
  })), [regs, events, user.id])

  return (
    <div className="bg-white border rounded-lg p-4">
      <h2 className="font-semibold mb-3">My Registrations</h2>
      {my.length === 0 && <div className="text-sm text-gray-600">No registrations yet. Explore events to register.</div>}
      <ul className="divide-y">
        {my.map(r => (
          <li key={r.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.event.title || 'Event'}</div>
              <div className="text-sm text-gray-600">{new Date(r.timestamp).toLocaleString()}</div>
            </div>
            <div className="text-sm text-gray-500">Venue: {r.event.venue}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
