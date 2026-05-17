import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAccess } from '../api/axios'

export default function OAuthCallback() {
  const nav = useNavigate()
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const access = params.get('access')
    if (access) {
      setAccess(access)
    }
    nav('/')
  }, [])
  return <div>Signing you in...</div>
}
