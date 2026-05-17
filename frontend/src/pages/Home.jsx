import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API } from '../api/axios'

export default function Home({ account, loadingAccount, isAuthenticated }) {
  const [showSteps, setShowSteps] = useState(false)
  const [requestCount, setRequestCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)

  const profileComplete =
    account?.profile?.fullName &&
    account?.profile?.currentStation &&
    account?.profile?.desiredStation

  const steps = [
    { n: '01', title: 'Complete Profile', body: 'Add your posting, zone, and where you want to go.' },
    { n: '02', title: 'Search & Discover', body: 'Filter employees with matching transfer interests.' },
    { n: '03', title: 'Send a Request', body: 'Initiate a mutual request with a personalised note.' },
    { n: '04', title: 'Connect & Finalise', body: 'Co-ordinate with your match to close the transfer.' },
  ]

  useEffect(() => {
    async function loadCounts() {
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

    loadCounts()
  }, [isAuthenticated])

  const cards = [
    { to: '/search', label: 'Find Matches', sub: 'Search employees whose desired station matches yours.', cta: 'Start Searching', accent: '#16a34a' },
    { to: '/requests', label: 'Manage Requests', sub: 'Accept, reject, or withdraw transfer requests anytime.', cta: 'View Requests', accent: '#ea580c', count: requestCount },
    { to: '/matches', label: 'My Matches', sub: "Employees you've found a mutual match with.", cta: 'See Matches', accent: '#7c3aed', count: matchCount },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .rh * { box-sizing: border-box; margin: 0; padding: 0; }

        .rh {
          font-family: 'DM Sans', sans-serif;
          color: #1a1a1a;
          height: 100vh;
          width: 100vw;
          max-width: 100vw;
          margin: 0;
          margin-left: calc(-50vw + 50%);
          overflow: hidden;
          background: #fafaf9;
          display: flex;
          flex-direction: column;
        }

        /* ── thin topbar just for the button ── */
        .rh-topbar {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 20px 36px;
          flex-shrink: 0;
          position: relative;
        }

        /* ── how it works button ── */
        .rh-hiw-wrap {
          position: relative;
          z-index: 100;
        }

        .rh-hiw-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1d4ed8;
          background: #dbeafe;
          border: 1px solid #bfdbfe;
          border-radius: 7px;
          padding: 7px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s, border-color 0.15s;
          user-select: none;
        }

        .rh-hiw-btn:hover {
          background: #bfdbfe;
          border-color: #93c5fd;
        }

        .rh-hiw-btn svg {
          transition: transform 0.2s;
        }

        .rh-hiw-btn.open svg {
          transform: rotate(180deg);
        }

        .rh-hiw-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 280px;
          background: #fff;
          border: 1px solid #e0e7ff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(37,99,235,0.10);
          opacity: 0;
          pointer-events: none;
          transform: translateY(-6px);
          transition: opacity 0.18s, transform 0.18s;
        }

        .rh-hiw-dropdown.visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        .rh-dropdown-step {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid #f0f0ee;
          align-items: flex-start;
        }

        .rh-dropdown-step:last-child { border-bottom: none; }

        .rh-dropdown-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          padding-top: 3px;
        }

        .rh-dropdown-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
          flex-shrink: 0;
        }

        .rh-dropdown-line {
          width: 1.5px;
          flex: 1;
          background: #dbeafe;
          margin-top: 4px;
          min-height: 20px;
        }

        .rh-dropdown-step:last-child .rh-dropdown-line { display: none; }

        .rh-dropdown-num {
          font-family: 'DM Serif Display', serif;
          font-size: 15px;
          color: #2563eb;
          line-height: 1;
          margin-bottom: 2px;
        }

        .rh-dropdown-text h4 {
          font-size: 12px;
          font-weight: 600;
          color: #111;
          margin-bottom: 2px;
        }

        .rh-dropdown-text p {
          font-size: 11px;
          color: #666;
          line-height: 1.5;
          font-weight: 300;
        }

        /* ── main content ── */
        .rh-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 28px 36px 24px;
          gap: 20px;
          overflow: hidden;
        }

        /* ── alert ── */
        .rh-alert {
          padding: 10px 14px;
          border-left: 3px solid #2563eb;
          background: #eff6ff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rh-alert h4 {
          font-size: 12px;
          font-weight: 600;
          color: #1e3a8a;
          display: inline;
        }

        .rh-alert span {
          font-size: 11px;
          color: #3b5cc4;
          margin-left: 6px;
        }

        .rh-alert a {
          font-size: 11px;
          font-weight: 600;
          color: #2563eb;
          text-decoration: none;
          border-bottom: 1px solid currentColor;
          margin-left: 6px;
        }

        /* ── hero ── */
        .rh-hero { text-align: center; }

        .rh-hero h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 60px;
          line-height: 1.06;
          letter-spacing: -0.02em;
          margin-bottom: 10px;
          color: #111;
        }

        .rh-hero h1 em {
          font-style: italic;
          color: #2563eb;
        }

        .rh-hero p {
          font-size: 13px;
          color: #555;
          line-height: 1.65;
          font-weight: 300;
          max-width: 380px;
          margin: 0 auto;
        }

        /* ── cards ── */
        .rh-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid #e5e5e3;
          border-radius: 10px;
          overflow: hidden;
        }

        .rh-card {
          background: #fff;
          padding: 48px 38px;
          border-right: 1px solid #e5e5e3;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: background 0.15s;
          text-decoration: none;
          color: inherit;
          min-height: 240px;
        }

        .rh-card:last-child { border-right: none; }
        .rh-card:hover { background: #f8f8f7; }

        .rh-card-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-bottom: 4px;
        }

        .rh-card-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .rh-card h3 {
          font-family: 'DM Serif Display', serif;
          font-size: 24px;
          color: #111;
        }

        .rh-card-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 7px;
          border-radius: 999px;
          background: #111827;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          flex-shrink: 0;
        }

        .rh-card p {
          font-size: 13px;
          color: #666;
          line-height: 1.65;
          font-weight: 400;
          flex: 1;
        }

        .rh-card-cta {
          font-size: 13px;
          font-weight: 600;
          border-bottom: 1px solid currentColor;
          width: fit-content;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .rh {
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }

          .rh-topbar {
            padding: 16px 18px;
          }

          .rh-main {
            padding: 18px;
            overflow: visible;
            gap: 16px;
          }

          .rh-hero h1 {
            font-size: 40px;
          }

          .rh-cards {
            grid-template-columns: 1fr;
          }

          .rh-card {
            border-right: none;
            border-bottom: 1px solid #e5e5e3;
            min-height: 190px;
            padding: 28px 22px;
          }

          .rh-card:last-child {
            border-bottom: none;
          }

          .rh-bottom {
            flex-direction: column;
            align-items: stretch;
          }
        }

        /* ── bottom bar ── */
        .rh-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .rh-bottom p {
          font-size: 11px;
          color: #888;
          line-height: 1.55;
          font-weight: 300;
          max-width: 320px;
        }

        .rh-cta {
          display: inline-block;
          padding: 12px 24px;
          background: #1a1a1a;
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          border-radius: 8px;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s;
        }

        .rh-cta:hover { background: #333; }
      `}</style>

      <div className="rh">

        {/* Topbar — only the how it works button lives here */}
        <div className="rh-topbar">
          <div
            className="rh-hiw-wrap"
            onMouseEnter={() => setShowSteps(true)}
            onMouseLeave={() => setShowSteps(false)}
          >
            <button className={`rh-hiw-btn${showSteps ? ' open' : ''}`}>
              How it works
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4L6 8L10 4" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className={`rh-hiw-dropdown${showSteps ? ' visible' : ''}`}>
              {steps.map((s, i) => (
                <div className="rh-dropdown-step" key={s.n}>
                  <div className="rh-dropdown-left">
                    <div className="rh-dropdown-dot" />
                    {i < steps.length - 1 && <div className="rh-dropdown-line" />}
                  </div>
                  <div>
                    <div className="rh-dropdown-num">{s.n}</div>
                    <div className="rh-dropdown-text">
                      <h4>{s.title}</h4>
                      <p>{s.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content — dimensions unchanged */}
        <div className="rh-main">

          {/* Alert */}
          {!profileComplete && (
            <div className="rh-alert">
              <div>
                <h4>Complete your profile</h4>
                <span>
                  {loadingAccount
                    ? 'Loading your profile…'
                    : 'Fill in your details to appear in search results.'}
                </span>
                {!loadingAccount && <Link to="/profile">Set up →</Link>}
              </div>
            </div>
          )}

          {/* Hero */}
          <div className="rh-hero">
            <h1>
              Move closer to<br />
              <em>what matters.</em>
            </h1>
            <p>
              Connect with Indian Railway employees looking for mutual transfers
              — transparently, fairly, and with zero paperwork chaos.
            </p>
          </div>

          {/* Feature cards */}
          <div className="rh-cards">
            {cards.map((c) => (
              <Link to={c.to} className="rh-card" key={c.to}>
                <div className="rh-card-dot" style={{ background: c.accent }} />
                <div className="rh-card-title">
                  <h3>{c.label}</h3>
                  {typeof c.count === 'number' && <span className="rh-card-count">{c.count}</span>}
                </div>
                <p>{c.sub}</p>
                <span className="rh-card-cta" style={{ color: c.accent }}>{c.cta} →</span>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="rh-bottom">
            <p>No middlemen, no confusion — just transparent peer-to-peer matching across zones and stations.</p>
            <Link to="/search" className="rh-cta">Find matches now →</Link>
          </div>

        </div>
      </div>
    </>
  )
}