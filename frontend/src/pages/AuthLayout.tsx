import type { ReactNode } from 'react'
import { usePageEntrance } from '../hooks/usePageEntrance'
import { Logo } from '../components/Logo'
import './Auth.css'

const CHIPS = [
  { className: 'chip1', label: 'Founder' },
  { className: 'chip2', label: 'Mentor' },
  { className: 'chip3', label: 'Investor' },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  const ref = usePageEntrance<HTMLDivElement>()

  return (
    <div className="auth-screen" ref={ref}>
      <div className="auth-panel-left">
        <Logo size={23} className="auth-logo reveal" />

        <div className="auth-quote reveal">
          <span className="mark">&ldquo;</span>
          <h2>
            Every great venture begins with the <em>right connection.</em>
          </h2>
          <p className="who mono">CoSpark — Startup Collaboration Platform</p>
        </div>

        <div className="auth-circuit reveal" aria-hidden="true">
          {CHIPS.map((chip) => (
            <div key={chip.label} className={`node-chip ${chip.className}`}>
              <span className="ic" />
              {chip.label}
            </div>
          ))}
        </div>

        <p className="auth-foot reveal">Connecting founders, mentors, investors &amp; builders.</p>
      </div>

      <div className="auth-panel-right">
        <div className="auth-form-card reveal">{children}</div>
      </div>
    </div>
  )
}
