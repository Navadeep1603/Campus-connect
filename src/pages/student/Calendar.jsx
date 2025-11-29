import { useEffect, useState } from 'react'
import CalendarWidget from '../../components/CalendarWidget'
import { listEvents, getMyRegisteredEvents } from '../../services/apiRouter'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentCalendar() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [registeredEvents, setRegisteredEvents] = useState([])
  
  useEffect(() => {
    listEvents().then(setEvents)
    if (user?.id) {
      getMyRegisteredEvents(user.id).then(setRegisteredEvents)
    }
  }, [user?.id])
  
  return (
    <div className="grid md:grid-cols-5 gap-4">
      <div className="md:col-span-3">
        <CalendarWidget events={events} registeredEvents={registeredEvents} />
      </div>
      <div className="md:col-span-2">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Upcoming Events</h2>
          <ul className="space-y-2 text-sm">
            {events.slice(0,8).map(e => {
              const isRegistered = registeredEvents.some(re => re.id === e.id)
              return (
                <li key={e.id} className={`flex items-center justify-between p-2 rounded ${
                  isRegistered ? 'bg-green-50 border border-green-200' : ''
                }`}>
                  <span className={`truncate ${isRegistered ? 'text-green-800 font-medium' : ''}`}>
                    {e.title}
                    {isRegistered && <span className="ml-2 text-green-600">✓ Registered</span>}
                  </span>
                  <span className="text-gray-500">{new Date(e.start).toLocaleDateString()}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
