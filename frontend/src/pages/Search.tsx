import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/PageHeader'
import { Avatar } from '../components/Avatar'
import { collaborationApi, profileApi } from '../lib/endpoints'
import { useToast } from '../context/ToastContext'
import { usePageEntrance } from '../hooks/usePageEntrance'
import type { Availability, ProfileResponse } from '../lib/types'
import './Search.css'

const AVAILABILITY_OPTIONS: { value: Availability | ''; label: string }[] = [
  { value: '', label: 'Any availability' },
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'WEEKENDS', label: 'Weekends' },
  { value: 'EXPLORING', label: 'Just exploring' },
]

export function Search() {
  const ref = usePageEntrance<HTMLDivElement>([])
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ skill: '', interest: '', availability: '' as Availability | '', location: '' })
  const [applied, setApplied] = useState(filters)

  const resultsQuery = useQuery({
    queryKey: ['profiles', 'search', applied],
    queryFn: () =>
      profileApi.search({
        skill: applied.skill || undefined,
        interest: applied.interest || undefined,
        availability: applied.availability || undefined,
        location: applied.location || undefined,
      }),
  })

  const sendMutation = useMutation({
    mutationFn: (recipientId: number) => collaborationApi.send({ recipientId, message: "Hi — I'd love to connect and see if we'd work well together." }),
    onSuccess: () => {
      showToast('Request sent', 'success')
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Could not send request', 'error'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApplied(filters)
  }

  return (
    <div ref={ref}>
      <PageHeader eyebrow="Search" title="Find your co-founder" subtitle="Filter the directory by skill, interest, availability, or location." />

      <form className="search-filters glass reveal" onSubmit={handleSubmit}>
        <input
          value={filters.skill}
          onChange={(e) => setFilters((f) => ({ ...f, skill: e.target.value }))}
          placeholder="Skill (e.g. React)"
        />
        <input
          value={filters.interest}
          onChange={(e) => setFilters((f) => ({ ...f, interest: e.target.value }))}
          placeholder="Interest (e.g. fintech)"
        />
        <select
          value={filters.availability}
          onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value as Availability | '' }))}
        >
          {AVAILABILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          value={filters.location}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
          placeholder="Location"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {resultsQuery.isLoading && (
        <div className="search-grid reveal">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 190 }} />
          ))}
        </div>
      )}

      {resultsQuery.data?.content.length === 0 && (
        <p className="dashboard-empty reveal">No one matches those filters yet — try widening your search.</p>
      )}

      <div className="search-grid">
        {resultsQuery.data?.content.map((profile: ProfileResponse) => (
          <div key={profile.userId} className="search-card glass card-interactive">
            <Link to={`/profiles/${profile.userId}`} className="search-card-head">
              <Avatar avatarUrl={profile.avatarUrl} firstName={profile.firstName} lastName={profile.lastName} size={44} />
              <div>
                <h3>
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="search-headline">{profile.headline || profile.availability.replace('_', ' ').toLowerCase()}</p>
              </div>
            </Link>
            {profile.location && <p className="search-location mono">{profile.location}</p>}
            {profile.bio && <p className="search-bio">{profile.bio}</p>}
            {profile.skills.length > 0 && (
              <div className="search-chips">
                {profile.skills.slice(0, 5).map((s) => (
                  <span key={s} className="search-chip">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <button
              type="button"
              className="btn btn-ghost search-connect"
              disabled={sendMutation.isPending}
              onClick={() => sendMutation.mutate(profile.userId)}
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
