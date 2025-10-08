import { useEffect, useState } from 'react'
import { db, listClubs } from '../../services/api'

export default function Clubs() {
  const [clubs, setClubs] = useState([])
  useEffect(()=>{ listClubs().then(setClubs) },[])
  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold">Clubs</h2>
        <p className="text-sm text-gray-600">Sample clubs loaded from mock DB. Replace with your CRUD later.</p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clubs.map(c => (
          <div key={c.id} className="bg-white border rounded-lg p-4">
            <div className="text-xs text-gray-500">{c.category}</div>
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-gray-600">Advisor: {c.faculty}</div>
            <p className="text-sm mt-2">{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
