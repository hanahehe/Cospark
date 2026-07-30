import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { subscriptionApi } from '../lib/endpoints'
import { usePageEntrance } from '../hooks/usePageEntrance'
import './Settings.css'

export function Settings() {
  const ref = usePageEntrance<HTMLDivElement>()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const subscriptionQuery = useQuery({ queryKey: ['subscription'], queryFn: subscriptionApi.info })

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const sub = subscriptionQuery.data
  const usagePct = sub ? Math.min(100, Math.round((sub.requestsSentToday / sub.dailyRequestLimit) * 100)) : 0

  return (
    <div ref={ref}>
      <PageHeader eyebrow="Settings" title="Account settings" subtitle="Manage your account and see your plan usage." />

      <div className="settings-section glass reveal">
        <h2>Account</h2>
        <div className="settings-row">
          <span className="mono">Name</span>
          <span>
            {user?.firstName} {user?.lastName}
          </span>
        </div>
        <div className="settings-row">
          <span className="mono">Email</span>
          <span>{user?.email}</span>
        </div>
        <div className="settings-row">
          <span className="mono">Email verified</span>
          <span>{user?.emailVerified ? 'Yes' : 'Not yet — check your inbox'}</span>
        </div>
      </div>

      <div className="settings-section glass reveal">
        <h2>Plan</h2>
        <div className="settings-row">
          <span className="mono">Current plan</span>
          <span className="plan-badge">{user?.subscriptionTier ?? 'FREE'}</span>
        </div>
        {sub && (
          <div className="usage-block">
            <div className="usage-label">
              <span>Collaboration requests today</span>
              <span>
                {sub.requestsSentToday} / {sub.dailyRequestLimit}
              </span>
            </div>
            <div className="usage-bar">
              <div className="usage-bar-fill" style={{ width: `${usagePct}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="settings-section glass reveal settings-danger">
        <h2>Session</h2>
        <p>Sign out of CoSpark on this device.</p>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  )
}
