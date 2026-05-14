import React, { useState } from 'react'
import { API, setAccess } from '../api/axios'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()

  async function handle(e) {
    e.preventDefault()
    try {
      const res = await API.post('/auth/register', { name, mobile, password })
      setAccess(res.data.access)
      nav('/')
    } catch (err) {
      alert('Register failed')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={handle} className="space-y-4">
        <input className="w-full p-2 border" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full p-2 border" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        <input className="w-full p-2 border" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-green-600 text-white p-2 rounded">Register</button>
      </form>
    </div>
  )
}
