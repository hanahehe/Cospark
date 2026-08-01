import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/Avatar'
import { collaborationApi, matchApi, notificationApi, profileApi } from '../lib/endpoints'
import { usePageEntrance } from '../hooks/usePageEntrance'
import './Dashboard.css'

export function Dashboard() {
  const { user } = useAuth()
  const ref = usePageEntrance<HTMLDivElement>()

  const profileQuery = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.me })
  const matchesQuery = useQuery({ queryKey: ['matches'], queryFn: () => matchApi.recommendations(6) })
  const receivedQuery = useQuery({
    queryKey: ['requests', 'received'],
    queryFn: () => collaborationApi.received(0, 5),
  })
  const unreadQuery = useQuery({ queryKey: ['notifications', 'unread'], queryFn: notificationApi.unreadCount })

  const skillCount = profileQuery.data?.skills.length ?? 0
  const pendingRequests = receivedQuery.data?.content.filter((r) => r.status === 'PENDING').length ?? 0

  return (
    <div ref={ref} className="dashboard">
      <header className="dashboard-header reveal">
        <span className="mono dashboard-eyebrow">Dashboard</span>
        <h1>Welcome back, {user?.firstName}</h1>
        <p>Here&rsquo;s what&rsquo;s happening with your matches and requests.</p>
      </header>

      <div className="dashboard-stats">
        <StatCard label="Skills on profile" value={skillCount} />
        <StatCard label="Pending requests" value={pendingRequests} />
        <StatCard label="Unread notifications" value={unreadQuery.data ?? 0} />
        <StatCard label="Plan" value={user?.subscriptionTier ?? 'FREE'} />
      </div>

      <section className="dashboard-section reveal">
        <div className="dashboard-section-head">
          <h2>Top matches for you</h2>
          <Link to="/search" className="dashboard-link">
            See all →
          </Link>
        </div>

        {matchesQuery.isLoading && <p className="dashboard-empty">Finding your best matches…</p>}
        {matchesQuery.data?.length === 0 && (
          <p className="dashboard-empty">
            No matches yet — add skills and interests to your profile to get recommendations.
          </p>
        )}

        <div className="match-grid">
          {matchesQuery.data?.map((m) => (
            <div key={m.profile.userId} className="match-card glass">
              <div className="match-card-head">
                <Link to={`/profiles/${m.profile.userId}`} className="match-card-identity">
                  <Avatar avatarUrl={m.profile.avatarUrl} firstName={m.profile.firstName} lastName={m.profile.lastName} size={40} />
                  <div>
                    <h3>
                      {m.profile.firstName} {m.profile.lastName}
                    </h3>
                    <p className="match-headline">
                      {m.profile.headline || m.profile.availability.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                </Link>
                <div className="match-score">{Math.round(m.score * 100)}%</div>
              </div>
              <p className="match-summary">{m.summary}</p>
              {m.breakdown.sharedSkills.length > 0 && (
                <div className="match-chips">
                  {m.breakdown.sharedSkills.slice(0, 4).map((s) => (
                    <span key={s} className="match-chip">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section reveal">
        <div className="dashboard-section-head">
          <h2>Recent collaboration requests</h2>
          <Link to="/requests" className="dashboard-link">
            See all →
          </Link>
        </div>

        {receivedQuery.data?.content.length === 0 && <p className="dashboard-empty">No requests yet.</p>}

        <div className="request-list">
          {receivedQuery.data?.content.map((r) => (
            <div key={r.id} className="request-row glass">
              <Link to={`/profiles/${r.senderId}`} className="request-row-identity">
                <strong>{r.senderName}</strong>
                <p className="request-message">
                  {r.message || (r.ideaTitle ? `Interested in ${r.ideaTitle}` : 'Wants to collaborate')}
                </p>
              </Link>
              <span className={`request-status status-${r.status.toLowerCase()}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-card glass reveal">
      <span className="stat-value">{value}</span>
      <span className="stat-label mono">{label}</span>
    </div>
  )
}
