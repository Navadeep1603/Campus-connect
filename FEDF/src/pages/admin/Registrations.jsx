import { useEffect, useMemo, useState } from 'react'
import { listEvents, listRegistrations, listPendingRegistrations, approveRegistration, rejectRegistration } from '../../services/apiRouter'
import { exportCSV } from '../../services/api'

export default function Registrations() {
  const [events, setEvents] = useState([])
  const [regs, setRegs] = useState([])
  const [pendingRegs, setPendingRegs] = useState([])
  const [loading, setLoading] = useState(false)
  const [attendance, setAttendance] = useState({}) // Track attendance by registration ID
  const [selectedEvent, setSelectedEvent] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    try {
      const [eventsData, regsData, pendingData] = await Promise.all([
        listEvents(),
        listRegistrations(),
        listPendingRegistrations()
      ])
      
      setEvents(eventsData)
      setRegs(regsData)
      setPendingRegs(pendingData)
      
      // Load attendance from localStorage or initialize
      const saved = localStorage.getItem('attendance-records')
      if (saved) {
        setAttendance(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApprove = async (regId) => {
    setLoading(true)
    try {
      await approveRegistration(regId)
      loadData()
      setSuccess('Registration approved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (regId) => {
    if (!confirm('Are you sure you want to reject this registration?')) return
    setLoading(true)
    try {
      await rejectRegistration(regId)
      loadData()
      setSuccess('Registration rejected.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleAttendance = (regId) => {
    const newAttendance = {...attendance, [regId]: !attendance[regId]}
    setAttendance(newAttendance)
    localStorage.setItem('attendance-records', JSON.stringify(newAttendance))
    setSuccess(`Attendance ${newAttendance[regId] ? 'marked' : 'unmarked'} successfully!`)
    setTimeout(() => setSuccess(''), 2000)
  }

  const markAllPresent = () => {
    if (!confirm('Mark all filtered registrations as present?')) return
    const newAttendance = {...attendance}
    filteredRegs.forEach(r => {
      newAttendance[r.id] = true
    })
    setAttendance(newAttendance)
    localStorage.setItem('attendance-records', JSON.stringify(newAttendance))
    setSuccess(`Marked ${filteredRegs.length} students as present!`)
    setTimeout(() => setSuccess(''), 3000)
  }
  // Filter registrations
  const filteredRegs = useMemo(() => {
    return regs.filter(r => {
      const event = events.find(e => e.id === r.eventId)
      const matchesEvent = selectedEvent === 'all' || r.eventId === selectedEvent
      const matchesSearch = !searchTerm || 
        (event?.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesEvent && matchesSearch
    })
  }, [regs, selectedEvent, searchTerm, events])

  const rows = useMemo(() => regs.map(r => ({
    id: r.id,
    eventId: r.eventId,
    eventTitle: events.find(e => e.id === r.eventId)?.title || '—',
    studentId: r.studentId,
    timestamp: r.timestamp,
  })), [regs, events])

  const pendingRows = useMemo(() => pendingRegs.map(r => ({
    id: r.id,
    eventTitle: events.find(e => e.id === r.eventId)?.title || '—',
    studentId: r.studentId,
    timestamp: r.timestamp,
  })), [pendingRegs, events])

  // Calculate stats
  const totalAttended = Object.values(attendance).filter(Boolean).length
  const attendanceRate = filteredRegs.length > 0 ? ((filteredRegs.filter(r => attendance[r.id]).length / filteredRegs.length) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Total Registrations</div>
          <div className="text-3xl font-bold">{regs.length}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Pending Approval</div>
          <div className="text-3xl font-bold">{pendingRegs.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Attended</div>
          <div className="text-3xl font-bold">{totalAttended}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow">
          <div className="text-sm opacity-90">Attendance Rate</div>
          <div className="text-3xl font-bold">{attendanceRate}%</div>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">
          {success}
        </div>
      )}

      {/* Pending Registrations */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            ⏳ Pending Registrations 
            <span className="text-sm font-normal text-gray-600">({pendingRegs.length})</span>
          </h2>
        </div>
        {pendingRegs.length === 0 ? (
          <p className="text-sm text-gray-500">No pending registrations</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-3 py-2">ID</th>
                  <th className="text-left px-3 py-2">Event</th>
                  <th className="text-left px-3 py-2">Student</th>
                  <th className="text-left px-3 py-2">Time</th>
                  <th className="text-left px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingRows.map(r => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2">{r.eventTitle}</td>
                    <td className="px-3 py-2">{r.studentId}</td>
                    <td className="px-3 py-2">{new Date(r.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(r.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approved Registrations with Attendance */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            ✅ Approved Registrations & Attendance
            <span className="text-sm font-normal text-gray-600">({filteredRegs.length})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={markAllPresent} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium">
              Mark All Present
            </button>
            <button onClick={()=>exportCSV(rows, 'registrations.csv')} className="px-4 py-2 border rounded text-sm hover:bg-gray-50 font-medium">
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Event</label>
            <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="all">All Events</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input 
              type="text"
              placeholder="Search by event or student ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {filteredRegs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No registrations found matching your filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-3 py-2">Event</th>
                  <th className="text-left px-3 py-2">Student ID</th>
                  <th className="text-left px-3 py-2">Registered At</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRegs.map(r => (
                  <tr key={r.id} className={attendance[r.id] ? 'bg-green-50' : ''}>
                    <td className="px-3 py-2 font-medium">
                      {events.find(e => e.id === r.eventId)?.title || '—'}
                    </td>
                    <td className="px-3 py-2">{r.studentId}</td>
                    <td className="px-3 py-2">{new Date(r.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Approved</span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggleAttendance(r.id)}
                        className={`px-3 py-1 text-xs rounded font-medium ${
                          attendance[r.id]
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {attendance[r.id] ? '✓ Present' : 'Mark Present'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
