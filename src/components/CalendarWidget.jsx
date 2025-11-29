import { eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, startOfMonth } from 'date-fns'

export default function CalendarWidget({ month = new Date(), events = [], registeredEvents = [], onSelect }) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days = eachDayOfInterval({ start, end })

  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{format(month, 'LLLL yyyy')}</div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(d => {
          const dayEvents = events.filter(e => isSameMonth(new Date(e.start), month) && isSameDay(new Date(e.start), d))
          const registeredEventIds = registeredEvents.map(e => e.id)
          
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelect && onSelect(d)}
              className={`h-20 border rounded p-1 text-left hover:bg-gray-50`}
            >
              <div className="text-xs text-gray-500">{format(d, 'd')}</div>
              <div className="space-y-1 mt-1">
                {dayEvents.slice(0,2).map(ev => {
                  const isRegistered = registeredEventIds.includes(ev.id)
                  return (
                    <div 
                      key={ev.id} 
                      className={`truncate text-[10px] px-1 py-0.5 rounded ${
                        isRegistered 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-brand-50 text-brand-700'
                      }`}
                      title={isRegistered ? `${ev.title} (Registered)` : ev.title}
                    >
                      {ev.title}
                      {isRegistered && <span className="ml-1">✓</span>}
                    </div>
                  )
                })}
                {dayEvents.length > 2 && <div className="text-[10px] text-gray-500">+{dayEvents.length-2} more</div>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
