import { useEffect, useState } from 'react'
import { listAchievements } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function Certificates() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  useEffect(()=>{ listAchievements(user.id).then(setItems) }, [user.id])

  const download = (a) => {
    const content = `Certificate of Achievement\n\nThis certifies that ${user.name} has achieved: ${a.title}\n\nDate: ${new Date(a.issueDate).toLocaleDateString()}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const el = document.createElement('a')
    el.href = url
    el.download = `${a.title.replace(/[^a-z0-9]+/ig,'_')}.txt`
    el.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <h2 className="font-semibold mb-3">Certificates & Achievements</h2>
      {items.length === 0 && <div className="text-sm text-gray-600">No achievements yet.</div>}
      <ul className="divide-y">
        {items.map(a => (
          <li key={a.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-gray-600">Issued: {new Date(a.issueDate).toLocaleDateString()}</div>
            </div>
            <button onClick={()=>download(a)} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50">Download</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
