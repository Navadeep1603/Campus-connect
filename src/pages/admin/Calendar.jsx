import { useEffect, useState } from 'react'
import CalendarWidget from '../../components/CalendarWidget'
import { listEvents } from '../../services/api'

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  useEffect(()=>{ listEvents().then(setEvents) },[])
  return (
    <div className="grid md:grid-cols-5 gap-4">
      <div className="md:col-span-3">
        <CalendarWidget events={events} />
      </div>
      <div className="md:col-span-2">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Upcoming</h2>
          <ul className="space-y-2 text-sm">
            {events.slice(0,8).map(e => (
              <li key={e.id} className="flex items-center justify-between">
                <span className="truncate">{e.title}</span>
                <span className="text-gray-500">{new Date(e.start).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
