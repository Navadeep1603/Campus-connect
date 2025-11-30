import { useEffect, useMemo, useState } from 'react'
import { listEvents, listRegistrations, listPendingRegistrations } from '../../services/apiRouter'
import { useAuth } from '../../contexts/AuthContext'

export default function MyActivities() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [approvedRegs, setApprovedRegs] = useState([])
  const [pendingRegs, setPendingRegs] = useState([])

  useEffect(() => {
    const loadData = async () => {
      console.log('📊 Loading student registrations for user:', user.id)
      const [eventsData, approvedData, pendingData] = await Promise.all([
        listEvents(),
        listRegistrations(),
        listPendingRegistrations()
      ])
      
      setEvents(eventsData)
      setApprovedRegs(approvedData)
      setPendingRegs(pendingData)
      
      console.log('✅ Approved registrations:', approvedData?.length || 0)
      console.log('⏳ Pending registrations:', pendingData?.length || 0)
    }
    
    loadData()
  }, [user.id])
  
  // Filter registrations for current user (handle both field name formats)
  const myApproved = useMemo(() => approvedRegs
    .filter(r => (r.student_id === user.id || r.studentId === user.id))
    .map(r => ({
      ...r,
      event: r.events || events.find(e => e.id === (r.event_id || r.eventId)) || {},
      status: 'approved'
    })), [approvedRegs, events, user.id])
    
  const myPending = useMemo(() => pendingRegs
    .filter(r => (r.student_id === user.id || r.studentId === user.id))
    .map(r => ({
      ...r,
      event: r.events || events.find(e => e.id === (r.event_id || r.eventId)) || {},
      status: 'pending'
    })), [pendingRegs, events, user.id])
    
  const allMyRegs = useMemo(() => [...myPending, ...myApproved], [myPending, myApproved])

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Total Registrations</div>
          <div className="text-3xl font-bold">{allMyRegs.length}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Pending Approval</div>
          <div className="text-3xl font-bold">{myPending.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Approved</div>
          <div className="text-3xl font-bold">{myApproved.length}</div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-bold mb-4">📋 My Event Registrations</h2>
        
        {allMyRegs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <div>No registrations yet.</div>
            <div className="text-sm">Explore events to register!</div>
          </div>
        )}
        
        <div className="space-y-3">
          {allMyRegs.map(r => (
            <div key={r.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-lg">{r.event.title || 'Event'}</div>
                    {r.status === 'approved' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        ✓ Approved
                      </span>
                    )}
                    {r.status === 'pending' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                        ⏳ Pending
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>📍 Venue: {r.event.venue || '—'}</div>
                    <div>📅 Registered: {new Date(r.created_at || r.timestamp).toLocaleString()}</div>
                    {r.event.start_time && (
                      <div>🕐 Event Date: {new Date(r.event.start_time).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
