import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePageEntrance } from '../hooks/usePageEntrance'
import './Home.css'

const CHIPS = [
  { label: 'Founder', color: 'var(--spark)' },
  { label: 'Mentor', color: 'var(--wire)' },
  { label: 'Investor', color: 'var(--ember)' },
]

export function Home() {
  const { user, isLoading } = useAuth()
  const ref = usePageEntrance<HTMLDivElement>()

  if (!isLoading && user) return <Navigate to="/dashboard" replace />

  return (
    <div className="home bg-glow" ref={ref}>
      <header className="home-nav reveal">
        <div className="home-logo">
          <span className="dot" />
          CoSpark
        </div>
        <div className="home-nav-actions">
          <Link to="/login" className="btn btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <main className="home-hero">
        <span className="mono reveal home-eyebrow">Startup collaboration platform</span>
        <h1 className="reveal">
          Every great venture begins with the <em>right connection.</em>
        </h1>
        <p className="reveal home-lede">
          CoSpark matches founders with co-founders based on skills, interests, experience, and startup
          domain — so you spend less time searching and more time building.
        </p>
        <div className="reveal home-cta">
          <Link to="/register" className="btn btn-primary">
            Find your co-founder
          </Link>
          <Link to="/login" className="btn btn-ghost">
            I already have an account
          </Link>
        </div>

        <div className="home-chips reveal">
          {CHIPS.map((chip) => (
            <div key={chip.label} className="home-chip glass">
              <span className="ic" style={{ background: chip.color }} />
              {chip.label}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
