import { useState } from 'react'
import { submitFeedback } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function Feedback() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [ok, setOk] = useState('')

  const send = async (e) => {
    e.preventDefault()
    setOk('')
    if (!message.trim()) return
    await submitFeedback({ studentId: user.id, message: message.trim() })
    setMessage('')
    setOk('Thanks for your feedback!')
  }

  return (
    <div className="bg-white border rounded-lg p-4 max-w-xl">
      <h2 className="font-semibold mb-2">Submit Feedback</h2>
      {ok && <div className="mb-2 p-2 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">{ok}</div>}
      <form onSubmit={send} className="space-y-3">
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={5} placeholder="Share your ideas to improve clubs and events..." className="w-full border rounded p-2"/>
        <div className="text-right">
          <button className="px-4 py-2 bg-brand-600 text-white rounded">Send</button>
        </div>
      </form>
    </div>
  )
}
