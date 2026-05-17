import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { API } from '../api/axios'

export default function Navigation({ isAuthenticated, account, onLogout }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [requestCount, setRequestCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)

  useEffect(() => {
    async function loadHeaderCounts() {
      if (!isAuthenticated) {
        setRequestCount(0)
        setMatchCount(0)
        return
      }

      try {
        const [requestsRes, matchesRes] = await Promise.all([
          API.get('/requests'),
          API.get('/matches')
        ])

        const requests = Array.isArray(requestsRes.data) ? requestsRes.data : []
        const matches = Array.isArray(matchesRes.data) ? matchesRes.data : []

        setRequestCount(requests.length)
        setMatchCount(matches.length)
      } catch (_err) {
        setRequestCount(0)
        setMatchCount(0)
      }
    }

    loadHeaderCounts()
  }, [isAuthenticated, location.pathname])

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Find Matches', requireAuth: true },
    { path: '/requests', label: 'Requests', requireAuth: true, count: requestCount },
    { path: '/matches', label: 'My Matches', requireAuth: true, count: matchCount },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-blue-600">
            <span className="text-2xl">🚂</span>
            RailMutual
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              if (item.requireAuth && !isAuthenticated) return null
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition ${
                    isActive(item.path)
                      ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{item.label}</span>
                    {typeof item.count === 'number' && (
                      <span className="inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold leading-none">
                        {item.count}
                      </span>
                    )}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-100 hover:bg-blue-200 transition text-sm font-medium"
                  title="Edit profile"
                >
                  <span className="text-lg">👤</span>
                  <span className="hidden sm:inline text-xs max-w-[100px] truncate">
                    {account?.user?.name || 'Account'}
                  </span>
                </Link>
                <button
                  onClick={onLogout}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            {navItems.map((item) => {
              if (item.requireAuth && !isAuthenticated) return null
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 px-4 ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{item.label}</span>
                    {typeof item.count === 'number' && (
                      <span className="inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold leading-none">
                        {item.count}
                      </span>
                    )}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
