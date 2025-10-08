import { format } from 'date-fns'

export default function EventCard({ event, onRegister, actions, highlight=false }) {
  const { title, venue, start, end, category, attendees = [], capacity } = event
  const color = categoryColor(category)
  return (
    <div className={`card hover-lift animate-fade-in-up ${highlight ? 'ring-2 ring-brand-400 shadow-glow' : ''}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <span className={`badge ${color.bg} ${color.text} mb-2`}>{category}</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{title}</h3>
          </div>
        </div>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-brand-600">📍</span>
            <span className="font-medium">{venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-brand-600">🕒</span>
            <span>{format(new Date(start), 'PP p')} - {format(new Date(end), 'p')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-brand-600">👥</span>
            <span className="font-medium">{attendees.length}{capacity ? `/${capacity}`:''} attending</span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          {onRegister && <button onClick={()=>onRegister(event)} className="btn-primary">Register Now</button>}
          {actions}
        </div>
      </div>
    </div>
  )
}

function categoryColor(cat) {
  switch ((cat||'').toLowerCase()) {
    case 'workshop': return { bg: 'bg-blue-50', text: 'text-blue-700' }
    case 'audition': return { bg: 'bg-purple-50', text: 'text-purple-700' }
    case 'seminar': return { bg: 'bg-amber-50', text: 'text-amber-700' }
    default: return { bg: 'bg-emerald-50', text: 'text-emerald-700' }
  }
}
