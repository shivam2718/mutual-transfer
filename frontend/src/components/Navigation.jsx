import React, { useEffect, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { API } from '../api/axios'
import { FaMountainSun } from 'react-icons/fa6'
import { BsFillCloudMoonFill } from 'react-icons/bs'
import { MdOutlineDirectionsRailwayFilled } from 'react-icons/md'

export default function Navigation({ isAuthenticated, account, onLogout }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    const storedTheme = window.localStorage.getItem('theme')
    if (storedTheme) return storedTheme === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false
  })
  const [requestCount, setRequestCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const adminRef = useRef(null)
  const accountRole = account?.user?.role

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    window.localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])
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
          API.get('/matches'),
        ])
        const requests = Array.isArray(requestsRes.data) ? requestsRes.data : []
        const matches = Array.isArray(matchesRes.data) ? matchesRes.data : []
        setRequestCount(requests.length)
        setMatchCount(matches.length)
      } catch {
        setRequestCount(0)
        setMatchCount(0)
      }
    }
    loadHeaderCounts()
  }, [isAuthenticated, location.pathname])

  useEffect(() => {
    setMobileMenuOpen(false)
    setAdminMenuOpen(false)
  }, [location.pathname])

  // Close admin dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/search', label: 'Find Matches', requireAuth: true },
    { path: '/requests', label: 'Requests', requireAuth: true, count: requestCount },
    { path: '/matches', label: 'My Matches', requireAuth: true, count: matchCount },
  ]

  const adminItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Manage Users' },
    { path: '/admin/requests', label: 'Review Requests' },
  ]

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">


          <div className="flex items-center gap-3 min-w-0">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-900 font-semibold text-base tracking-tight hover:opacity-80 transition-opacity"
            >
              <MdOutlineDirectionsRailwayFilled className="text-xl" />
              <span>RailMutual</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.requireAuth && !isAuthenticated) return null
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-semibold leading-none">
                      {item.count}
                    </span>
                  )}
                </Link>
              )
            })}

            <button
              type="button"
              onClick={() => setIsDarkMode((current) => !current)}
              className="ml-1 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FaMountainSun className="w-4 h-4" /> : <BsFillCloudMoonFill className="w-4 h-4" />}
            </button>

            {/* Admin dropdown */}
            {accountRole === 'admin' && (
              <div className="relative ml-1" ref={adminRef}>
                <button
                  type="button"
                  onClick={() => setAdminMenuOpen((o) => !o)}
                  aria-expanded={adminMenuOpen}
                  aria-haspopup="menu"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    adminMenuOpen
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                  Admin
                  <svg
                    className={`w-3 h-3 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {adminMenuOpen && (
                  <div
                    className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-widest">Admin panel</p>
                    </div>
                    {adminItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setAdminMenuOpen(false)}
                        className={`block px-3 py-2 text-sm transition-colors ${
                          isActive(item.path)
                            ? 'bg-purple-50 text-purple-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        role="menuitem"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Edit profile"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-semibold flex-shrink-0">
                    {getInitials(account?.user?.name)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {account?.user?.name || 'Account'}
                  </span>
                </Link>
                <button
                  onClick={onLogout}
                  className="hidden sm:block text-sm text-gray-400 hover:text-red-500 font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-gray-900 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden flex flex-col gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <span className={`block w-4 h-0.5 bg-gray-600 transition-transform origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block w-4 h-0.5 bg-gray-600 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-4 h-0.5 bg-gray-600 transition-transform origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-0.5">
            {navItems.map((item) => {
              if (item.requireAuth && !isAuthenticated) return null
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-semibold">
                      {item.count}
                    </span>
                  )}
                </Link>
              )
            })}

            {accountRole === 'admin' && (
              <div className="pt-2 mt-1 border-t border-gray-100">
                <p className="px-3 py-1.5 text-[10px] font-semibold text-purple-500 uppercase tracking-widest">Admin panel</p>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            {isAuthenticated && (
              <div className="pt-2 mt-1 border-t border-gray-100">
                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout() }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}