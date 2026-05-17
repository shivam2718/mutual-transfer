import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MyMatches from './pages/MyMatches'
import OAuthCallback from './pages/OAuthCallback'
import ProfileForm from './pages/ProfileForm'
import SearchMatches from './pages/SearchMatches'
import ProfileView from './pages/ProfileView'
import RequestsPage from './pages/RequestsPage'
import { API, getAccess, setAccess } from './api/axios'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccess())
  const [account, setAccount] = useState(null)
  const [loadingAccount, setLoadingAccount] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isPublicLoginRoute = !isAuthenticated && (location.pathname === '/' || location.pathname === '/login')

  useEffect(() => {
    // Keep header auth state in sync after login/oauth redirects.
    setIsAuthenticated(!!getAccess())
  }, [location.pathname, location.search])

  useEffect(() => {
    async function fetchAccount() {
      if (!getAccess()) {
        setAccount(null)
        return
      }
      setLoadingAccount(true)
      try {
        const res = await API.get('/auth/me')
        setAccount(res.data)
      } catch (e) {
        setAccount(null)
      } finally {
        setLoadingAccount(false)
      }
    }
    fetchAccount()
  }, [isAuthenticated, location.pathname, location.search])

  async function handleLogout() {
    try {
      await API.post('/auth/logout')
    } catch (e) {
      // Even if API logout fails, clear local access token for client logout.
    } finally {
      setAccess(null)
      setIsAuthenticated(false)
      setAccount(null)
      navigate('/')
    }
  }

  if (isPublicLoginRoute) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navigation 
        isAuthenticated={isAuthenticated}
        account={account}
        onLogout={handleLogout}
      />
      
      <main className="max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<Home account={account} loadingAccount={loadingAccount} isAuthenticated={isAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/profile/:id" element={<ProfileView />} />
          <Route path="/search" element={<SearchMatches />} />
          <Route path="/matches" element={<MyMatches />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
        </Routes>
      </main>
    </div>
  )
}
