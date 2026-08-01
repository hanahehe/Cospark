import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Avatar } from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { collaborationApi, profileApi } from '../lib/endpoints'
import { usePageEntrance } from '../hooks/usePageEntrance'
import './PublicProfile.css'

export function PublicProfile() {
  const { userId } = useParams<{ userId: string }>()
  const numericUserId = Number(userId)
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const ref = usePageEntrance<HTMLDivElement>([numericUserId])
  const [message, setMessage] = useState('')
  const [showComposer, setShowComposer] = useState(false)

  const profileQuery = useQuery({
    queryKey: ['profile', numericUserId],
    queryFn: () => profileApi.byUserId(numericUserId),
    enabled: Number.isFinite(numericUserId) && numericUserId !== user?.id,
  })

  const connectMutation = useMutation({
    mutationFn: () => collaborationApi.send({ recipientId: numericUserId, message: message.trim() || undefined }),
    onSuccess: () => {
      showToast('Request sent', 'success')
      setShowComposer(false)
      setMessage('')
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Could not send request', 'error'),
  })

  if (!Number.isFinite(numericUserId)) {
    return <Navigate to="/search" replace />
  }
  if (numericUserId === user?.id) {
    return <Navigate to="/profile" replace />
  }

  if (profileQuery.isLoading) {
    return (
      <div ref={ref}>
        <div className="skeleton reveal" style={{ height: 320 }} />
      </div>
    )
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div ref={ref} className="public-profile-notfound reveal">
        <h2>Profile not found</h2>
        <p>This person may no longer be on CoSpark.</p>
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    )
  }

  const profile = profileQuery.data

  return (
    <div ref={ref}>
      <button type="button" className="btn btn-ghost public-profile-back reveal" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="public-profile-header glass reveal">
        <Avatar avatarUrl={profile.avatarUrl} firstName={profile.firstName} lastName={profile.lastName} size={96} />
        <div className="public-profile-header-info">
          <h1>
            {profile.firstName} {profile.lastName}
          </h1>
          {profile.headline && <p className="public-profile-headline">{profile.headline}</p>}
          <div className="public-profile-meta mono">
            <span>{profile.availability.replace('_', ' ').toLowerCase()}</span>
            {profile.location && <span>{profile.location}</span>}
            {profile.timezone && <span>{profile.timezone}</span>}
          </div>
        </div>
        <div className="public-profile-actions">
          {!showComposer && (
            <button type="button" className="btn btn-primary" onClick={() => setShowComposer(true)}>
              Connect
            </button>
          )}
          {(profile.linkedinUrl || profile.portfolioUrl) && (
            <div className="public-profile-links">
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              )}
              {profile.portfolioUrl && (
                <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">
                  Portfolio
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {showComposer && (
        <div className="public-profile-composer glass reveal">
          <label htmlFor="connect-message">Message</label>
          <textarea
            id="connect-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${profile.firstName} — I'd love to connect and see if we'd work well together.`}
          />
          <div className="public-profile-composer-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowComposer(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" disabled={connectMutation.isPending} onClick={() => connectMutation.mutate()}>
              {connectMutation.isPending ? 'Sending…' : 'Send request'}
            </button>
          </div>
        </div>
      )}

      {profile.bio && (
        <section className="public-profile-section glass reveal">
          <h2>About</h2>
          <p>{profile.bio}</p>
        </section>
      )}

      {(profile.skills.length > 0 || profile.interests.length > 0) && (
        <section className="public-profile-section glass reveal">
          {profile.skills.length > 0 && (
            <>
              <h2>Skills</h2>
              <div className="public-profile-chips">
                {profile.skills.map((s) => (
                  <span key={s} className="search-chip">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
          {profile.interests.length > 0 && (
            <>
              <h2 style={{ marginTop: profile.skills.length > 0 ? 20 : 0 }}>Interests</h2>
              <div className="public-profile-chips">
                {profile.interests.map((i) => (
                  <span key={i} className="match-chip">
                    {i}
                  </span>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {profile.endorsements.length > 0 && (
        <section className="public-profile-section glass reveal">
          <h2>Endorsements</h2>
          <div className="endorsement-list">
            {profile.endorsements.map((e) => (
              <div key={e.id} className="endorsement-card glass card-interactive">
                <span className="mono endorsement-skill">{e.skill}</span>
                {e.message && <p>{e.message}</p>}
                <span className="endorsement-by">— {e.endorserName}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
