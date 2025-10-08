import { useState } from 'react'
import { pushNotification } from '../../services/api'

export default function Announcements() {
  const [message, setMessage] = useState('')
  const send = () => {
    if (!message.trim()) return
    pushNotification('all', message.trim())
    setMessage('')
    alert('Announcement sent to all users (mock).')
  }
  return (
    <div className="bg-white border rounded-lg p-4">
      <h2 className="font-semibold mb-2">Announcements</h2>
      <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4} placeholder="Write an announcement..." className="w-full border rounded p-2"/>
      <div className="mt-2 text-right">
        <button onClick={send} className="px-4 py-2 bg-brand-600 text-white rounded">Send</button>
      </div>
    </div>
  )
}
