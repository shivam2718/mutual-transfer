import React from 'react'

export default function Login() {
  const features = [
    { icon: '⇄', title: 'Mutual Transfers', desc: 'Find compatible employees for hassle-free station swaps.' },
    { icon: '🗺', title: 'Zone-Wide Network', desc: 'Connect across all Indian Railway zones and divisions.' },
    { icon: '⚡', title: 'Instant Matching', desc: 'Smart algorithms surface the best transfer matches for you.' },
    { icon: '📋', title: 'Track Applications', desc: 'Monitor every step of your transfer request in real time.' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

        .rm-login * { box-sizing: border-box; margin: 0; padding: 0; }
        .rm-login {
          min-height: 100dvh;
          background: #fafaf9;
          font-family: 'DM Sans', sans-serif;
          color: #1a1a1a;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        /* left panel */
        .rm-left {
          background: #111;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px 52px;
          position: relative;
          overflow: hidden;
        }

        .rm-left-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rm-logo-mark {
          width: 36px;
          height: 36px;
          background: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Serif Display', serif;
          font-size: 13px;
          color: #111;
          letter-spacing: -0.02em;
          font-style: italic;
        }
        .rm-logo-text {
          font-family: 'DM Serif Display', serif;
          font-size: 18px;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .rm-left-hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 0 32px;
        }
        .rm-left-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 4px;
          padding: 4px 10px;
          width: fit-content;
          margin-bottom: 24px;
        }
        .rm-left-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(30px, 3.2vw, 44px);
          line-height: 1.08;
          letter-spacing: -0.025em;
          color: #fff;
          margin-bottom: 16px;
        }
        .rm-left-title em {
          font-style: italic;
          color: rgba(255,255,255,0.55);
        }
        .rm-left-desc {
          font-size: 14px;
          font-weight: 300;
          color: rgba(255,255,255,0.4);
          line-height: 1.65;
          max-width: 380px;
          margin-bottom: 36px;
        }

        .rm-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          overflow: hidden;
        }
        .rm-feature {
          background: rgba(255,255,255,0.02);
          padding: 16px 14px;
          transition: background 0.2s;
        }
        .rm-feature:hover { background: rgba(255,255,255,0.05); }
        .rm-feature-icon { font-size: 15px; margin-bottom: 7px; }
        .rm-feature h5 { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.75); margin-bottom: 3px; }
        .rm-feature p  { font-size: 10px; font-weight: 300; color: rgba(255,255,255,0.3); line-height: 1.5; }

        .rm-left-footer {
          font-size: 10px;
          color: rgba(255,255,255,0.18);
          letter-spacing: 0.04em;
        }

        /* right panel */
        .rm-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 52px;
          background: #fff;
        }
        .rm-signin-box {
          width: 100%;
          max-width: 360px;
        }

        .rm-signin-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #bbb;
          margin-bottom: 18px;
        }
        .rm-signin-title {
          font-family: 'DM Serif Display', serif;
          font-size: 30px;
          letter-spacing: -0.02em;
          color: #111;
          margin-bottom: 6px;
        }
        .rm-signin-sub {
          font-size: 13px;
          font-weight: 300;
          color: #999;
          margin-bottom: 36px;
          line-height: 1.5;
        }

        .rm-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .rm-divider-line { flex: 1; height: 1px; background: #ebebea; }
        .rm-divider span {
          font-size: 10px;
          font-weight: 500;
          color: #ccc;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .rm-google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 13px 20px;
          background: #111;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          border-radius: 8px;
          letter-spacing: -0.01em;
          transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
          margin-bottom: 14px;
        }
        .rm-google-btn:hover {
          background: #222;
          transform: translateY(-1px);
          box-shadow: 0 4px 18px rgba(0,0,0,0.12);
        }
        .rm-google-btn:active { transform: translateY(0); }

        .rm-notice {
          padding: 13px 15px;
          background: #f5f5f4;
          border-radius: 8px;
          border-left: 2px solid #d1d5db;
          margin-bottom: 28px;
        }
        .rm-notice p { font-size: 11px; font-weight: 300; color: #888; line-height: 1.6; }
        .rm-notice strong { font-weight: 600; color: #555; }

        .rm-help { font-size: 11px; color: #bbb; text-align: center; }
        .rm-help a { color: #555; text-decoration: none; font-weight: 500; border-bottom: 1px solid #ccc; padding-bottom: 1px; }
        .rm-help a:hover { color: #111; border-color: #111; }

        @media (max-width: 860px) {
          .rm-login { grid-template-columns: 1fr; }
          .rm-left { padding: 32px 28px; min-height: auto; }
          .rm-left-hero { padding: 32px 0 24px; }
          .rm-right { padding: 40px 28px; }
        }
      `}</style>

      <div className="rm-login">
        {/* Left */}
        <div className="rm-left">
          <div className="rm-left-logo">
            <div className="rm-logo-mark">RM</div>
            <span className="rm-logo-text">RailMutual</span>
          </div>

          <div className="rm-left-hero">
            <div className="rm-left-tag">● Official Transfer Portal</div>
            <h1 className="rm-left-title">
              Move closer<br />to <em>what matters.</em>
            </h1>
            <p className="rm-left-desc">
              The dedicated platform for Indian Railway employees to discover, request, and complete mutual transfers — transparently and efficiently.
            </p>
            <div className="rm-features">
              {features.map((f) => (
                <div className="rm-feature" key={f.title}>
                  <div className="rm-feature-icon">{f.icon}</div>
                  <h5>{f.title}</h5>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rm-left-footer">
            © {new Date().getFullYear()} RailMutual · Indian Railways
          </div>
        </div>

        {/* Right */}
        <div className="rm-right">
          <div className="rm-signin-box">
            <div className="rm-signin-eyebrow">Employee Sign-in</div>
            <h2 className="rm-signin-title">Welcome back.</h2>
            <p className="rm-signin-sub">Use your official Railways email to access the portal.</p>

            <div className="rm-divider">
              <div className="rm-divider-line" />
              <span>Continue with</span>
              <div className="rm-divider-line" />
            </div>

            <button
              onClick={async () => {
                try {
                  const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/google`);
                  const data = await res.json();
                  if (data.url) window.open(data.url, '_blank');
                } catch (error) {
                  console.error('Google auth error:', error);
                }
              }}
              className="rm-google-btn"
              style={{ cursor: 'pointer', border: 'none', background: 'none', padding: '0' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <div className="rm-notice">
              <p>
                Access is restricted to verified Indian Railway employees.
                Please use your <strong>official Railways email</strong> address.
              </p>
            </div>

            <div className="rm-help">
              Having trouble? <a href="#">Contact HR Support</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}