import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/PageHeader'
import { TagInput } from '../components/TagInput'
import { Avatar } from '../components/Avatar'
import { profileApi } from '../lib/endpoints'
import { useToast } from '../context/ToastContext'
import { usePageEntrance } from '../hooks/usePageEntrance'
import type { Availability, ProfileUpdateRequest } from '../lib/types'
import './Profile.css'

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'WEEKENDS', label: 'Weekends' },
  { value: 'EXPLORING', label: 'Just exploring' },
]

const EMPTY_FORM: ProfileUpdateRequest = {
  firstName: '',
  lastName: '',
  bio: '',
  headline: '',
  location: '',
  timezone: '',
  availability: 'FULL_TIME',
  linkedinUrl: '',
  portfolioUrl: '',
  yearsExperience: 0,
  skills: [],
  interests: [],
}

export function Profile() {
  const ref = usePageEntrance<HTMLDivElement>()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const profileQuery = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.me })
  const [form, setForm] = useState<ProfileUpdateRequest>(EMPTY_FORM)
  const [hydrated, setHydrated] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profileQuery.data && !hydrated) {
      const p = profileQuery.data
      setForm({
        firstName: p.firstName,
        lastName: p.lastName,
        bio: p.bio ?? '',
        headline: p.headline ?? '',
        location: p.location ?? '',
        timezone: p.timezone ?? '',
        availability: p.availability,
        linkedinUrl: p.linkedinUrl ?? '',
        portfolioUrl: p.portfolioUrl ?? '',
        yearsExperience: p.yearsExperience ?? 0,
        skills: p.skills,
        interests: p.interests,
      })
      setHydrated(true)
    }
  }, [profileQuery.data, hydrated])

  const saveMutation = useMutation({
    mutationFn: (body: ProfileUpdateRequest) => profileApi.update(body),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile', 'me'], updated)
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      showToast('Profile saved', 'success')
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Could not save profile', 'error'),
  })

  const avatarMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile', 'me'], updated)
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      showToast('Profile photo updated', 'success')
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Could not upload photo', 'error'),
  })

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be 5MB or smaller', 'error')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Image must be JPEG, PNG, or WebP', 'error')
      return
    }
    avatarMutation.mutate(file)
  }

  function update<K extends keyof ProfileUpdateRequest>(key: K, value: ProfileUpdateRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  if (profileQuery.isLoading) {
    return (
      <div ref={ref}>
        <PageHeader eyebrow="Profile" title="Your profile" subtitle="Loading your details…" />
        <div className="skeleton reveal" style={{ height: 400 }} />
      </div>
    )
  }

  return (
    <div ref={ref}>
      <PageHeader
        eyebrow="Profile"
        title="Your profile"
        subtitle="This is what other founders see when your profile shows up in a match."
      />

      <div className="profile-avatar-row glass reveal">
        <button
          type="button"
          className="profile-avatar-btn"
          onClick={() => avatarInputRef.current?.click()}
          disabled={avatarMutation.isPending}
          aria-label="Change profile photo"
        >
          <Avatar avatarUrl={profileQuery.data?.avatarUrl} firstName={form.firstName} lastName={form.lastName} size={88} />
          <span className="profile-avatar-overlay">{avatarMutation.isPending ? 'Uploading…' : 'Change photo'}</span>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={handleAvatarChange}
        />
        <div>
          <p className="profile-avatar-name">
            {form.firstName} {form.lastName}
          </p>
          <p className="profile-avatar-hint">JPEG, PNG, or WebP — up to 5MB.</p>
        </div>
      </div>

      <form className="profile-form glass reveal" onSubmit={handleSubmit}>
        <div className="profile-grid">
          <div className="field">
            <label htmlFor="firstName">First name</label>
            <input id="firstName" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="lastName">Last name</label>
            <input id="lastName" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
          </div>
        </div>

        <div className="field">
          <label htmlFor="headline">Headline</label>
          <input
            id="headline"
            value={form.headline}
            onChange={(e) => update('headline', e.target.value)}
            placeholder="Full-stack engineer turned founder"
          />
        </div>

        <div className="field">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            rows={4}
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            placeholder="Tell other founders about your background and what you're looking for…"
          />
        </div>

        <div className="profile-grid">
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Berlin, Germany" />
          </div>
          <div className="field">
            <label htmlFor="timezone">Timezone</label>
            <input id="timezone" value={form.timezone} onChange={(e) => update('timezone', e.target.value)} placeholder="CET" />
          </div>
        </div>

        <div className="profile-grid">
          <div className="field">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              value={form.availability}
              onChange={(e) => update('availability', e.target.value as Availability)}
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="yearsExperience">Years of experience</label>
            <input
              id="yearsExperience"
              type="number"
              min={0}
              value={form.yearsExperience}
              onChange={(e) => update('yearsExperience', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="profile-grid">
          <div className="field">
            <label htmlFor="linkedinUrl">LinkedIn</label>
            <input id="linkedinUrl" value={form.linkedinUrl} onChange={(e) => update('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/…" />
          </div>
          <div className="field">
            <label htmlFor="portfolioUrl">Portfolio</label>
            <input id="portfolioUrl" value={form.portfolioUrl} onChange={(e) => update('portfolioUrl', e.target.value)} placeholder="https://…" />
          </div>
        </div>

        <TagInput label="Skills" values={form.skills ?? []} onChange={(v) => update('skills', v)} placeholder="React, Go, product design…" />
        <TagInput label="Interests" values={form.interests ?? []} onChange={(v) => update('interests', v)} placeholder="Fintech, climate, dev tools…" />

        <button type="submit" className="btn btn-primary profile-save" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      {profileQuery.data && profileQuery.data.endorsements.length > 0 && (
        <section className="profile-endorsements reveal">
          <h2>Endorsements</h2>
          <div className="endorsement-list">
            {profileQuery.data.endorsements.map((e) => (
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
