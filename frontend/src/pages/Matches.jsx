import React, { useEffect, useState } from 'react'
import { API } from '../api/axios'

export default function Matches() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // fetch current user's profile, then recommend matches
        const me = await API.get('/profiles/me')
        const profileId = me.data._id
        const res = await API.get(`/matches/recommend/${profileId}`)
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!data) return <div>No matches</div>

  return (
    <div>
      <h2 className="text-lg font-semibold">Matches</h2>
      <div className="space-y-3 mt-4">
        {data.data.map((m) => (
          <div key={m.profile._id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{m.profile.fullName}</div>
                <div className="text-sm text-gray-500">{m.profile.currentStation} → {m.profile.desiredStation}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{m.score}%</div>
                <div className="text-sm text-gray-500">{m.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
