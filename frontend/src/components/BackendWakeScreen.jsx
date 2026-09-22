import React from 'react'

export default function BackendWakeScreen({ retry, checking }) {
  return (
    <main className="wake-screen">
      <div className="wake-grid" aria-hidden="true" />
      <div className="wake-orbit wake-orbit-one" aria-hidden="true" />
      <div className="wake-orbit wake-orbit-two" aria-hidden="true" />
      <section className="wake-panel" aria-live="polite">
        <div className="wake-mark" aria-hidden="true">
          <span className="wake-track" />
          <span className="wake-train">◆</span>
        </div>
        <p className="wake-kicker">RAILMUTUAL NETWORK</p>
        <h1>Waking up the railway desk</h1>
        <p className="wake-copy">
          The service is starting after a quiet spell. Your workspace will appear automatically when the connection is ready.
        </p>
        <div className="wake-status">
          <span className="wake-pulse" />
          {checking ? 'Checking the connection...' : 'Waiting for the backend to respond...'}
        </div>
        <button type="button" onClick={retry} className="wake-retry" disabled={checking}>
          {checking ? 'Checking...' : 'Try again'}
        </button>
      </section>
    </main>
  )
}
