import { useEffect, useMemo, useState } from 'react'
import { listEvents, listRegistrations, listPendingRegistrations, approveRegistration, rejectRegistration, exportCSV } from '../../services/api'

export default function Registrations() {
  const [events, setEvents] = useState([])
  const [regs, setRegs] = useState([])
  const [pendingRegs, setPendingRegs] = useState([])
  const [loading, setLoading] = useState(false)

  const loadData = () => {
    listEvents().then(setEvents)
    listRegistrations().then(setRegs)
    listPendingRegistrations().then(setPendingRegs)
  }

  useEffect(()=>{ loadData() },[])

  const handleApprove = async (regId) => {
    setLoading(true)
    try {
      await approveRegistration(regId)
      loadData()
      alert('Registration approved!')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (regId) => {
    setLoading(true)
    try {
      await rejectRegistration(regId)
      loadData()
      alert('Registration rejected.')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }
  const rows = useMemo(() => regs.map(r => ({
    id: r.id,
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

  return (
    <div className="space-y-6">
      {/* Pending Registrations */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Pending Registrations ({pendingRegs.length})</h2>
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

      {/* Approved Registrations */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Approved Registrations ({regs.length})</h2>
          <button onClick={()=>exportCSV(rows, 'registrations.csv')} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Event</th>
              <th className="text-left px-3 py-2">Student</th>
              <th className="text-left px-3 py-2">Time</th>
              <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.eventTitle}</td>
                  <td className="px-3 py-2">{r.studentId}</td>
                  <td className="px-3 py-2">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Approved</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
