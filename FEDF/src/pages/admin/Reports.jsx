import { useEffect, useMemo, useRef, useState } from 'react'
import { db, listEvents, listRegistrations, exportCSV } from '../../services/api'

export default function Reports() {
  const [events, setEvents] = useState([])
  const [regs, setRegs] = useState([])
  const printRef = useRef()

  useEffect(()=>{ listEvents().then(setEvents); listRegistrations().then(setRegs) },[])

  const summary = useMemo(() => {
    const byEvent = events.map(e => ({
      event: e.title,
      attendees: e.attendees?.length || 0,
      capacity: e.capacity || 0,
    }))
    const totals = {
      totalEvents: events.length,
      totalRegistrations: regs.length,
      avgAttendance: Math.round((events.reduce((a,e)=>a+(e.attendees?.length||0),0)/(events.length||1))*10)/10,
    }
    return { byEvent, totals }
  }, [events, regs])

  const downloadExcel = () => {
    exportCSV(summary.byEvent, 'event-summary.csv')
  }
  const printPDF = () => {
    // Simple print of the summary card; for real PDFs integrate a lib like jsPDF later.
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4" ref={printRef}>
        <h2 className="font-semibold mb-2">Analytics</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <Stat label="Total Events" value={summary.totals.totalEvents} />
          <Stat label="Total Registrations" value={summary.totals.totalRegistrations} />
          <Stat label="Avg Attendance" value={summary.totals.avgAttendance} />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-3 py-2">Event</th>
                <th className="text-left px-3 py-2">Attendees</th>
                <th className="text-left px-3 py-2">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {summary.byEvent.map((r,i) => (
                <tr key={i}>
                  <td className="px-3 py-2">{r.event}</td>
                  <td className="px-3 py-2">{r.attendees}</td>
                  <td className="px-3 py-2">{r.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={downloadExcel} className="px-3 py-2 border rounded text-sm">Export Excel (CSV)</button>
        <button onClick={printPDF} className="px-3 py-2 border rounded text-sm">Export PDF (Print)</button>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
