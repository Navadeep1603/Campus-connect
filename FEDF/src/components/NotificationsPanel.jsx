import { useEffect, useState } from 'react'
import { listNotifications, markNotificationRead } from '../services/apiRouter'
import { useAuth } from '../contexts/AuthContext'

export default function NotificationsPanel() {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    let alive = true
    const load = async () => {
      const n = await listNotifications(user?.id)
      if (alive) setItems(n)
    }
    load()
    const t = setInterval(load, 5000)
    return () => { alive = false; clearInterval(t) }
  }, [user?.id])

  const markRead = async (id) => {
    await markNotificationRead(id)
    setItems(prev => prev.map(x => x.id === id ? { ...x, read: true } : x))
  }

  return (
    <div className="bg-white border rounded-lg">
      <div className="px-4 py-2 border-b font-medium">Notifications</div>
      <div className="divide-y max-h-80 overflow-y-auto">
        {items.length === 0 && <div className="p-4 text-sm text-gray-500">No notifications</div>}
        {items.map(n => (
          <div key={n.id} className={`px-4 py-3 text-sm ${n.read ? 'text-gray-500' : 'text-gray-800'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>{n.message}</div>
              {!n.read && <button onClick={()=>markRead(n.id)} className="text-brand-700 hover:underline">Mark read</button>}
            </div>
            <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
