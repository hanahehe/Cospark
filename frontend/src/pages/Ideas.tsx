import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/PageHeader'
import { collaborationApi, ideaApi } from '../lib/endpoints'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageEntrance } from '../hooks/usePageEntrance'
import type { IdeaCreateRequest, IdeaResponse, IdeaStage } from '../lib/types'
import './Ideas.css'

const STAGE_OPTIONS: IdeaStage[] = ['IDEA', 'VALIDATION', 'MVP', 'GROWTH']

const EMPTY_IDEA: IdeaCreateRequest = {
  title: '',
  domain: '',
  description: '',
  stage: 'IDEA',
  equityOffered: '',
  roleExpectations: '',
}

function toDraft(idea: IdeaResponse): IdeaCreateRequest {
  return {
    title: idea.title,
    domain: idea.domain,
    description: idea.description,
    stage: idea.stage,
    equityOffered: idea.equityOffered ?? '',
    roleExpectations: idea.roleExpectations ?? '',
  }
}

export function Ideas() {
  const ref = usePageEntrance<HTMLDivElement>([])
  const { user } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<IdeaCreateRequest>(EMPTY_IDEA)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const ideasQuery = useQuery({
    queryKey: ['ideas', tab],
    queryFn: () => (tab === 'all' ? ideaApi.list() : ideaApi.mine()),
  })

  const saveMutation = useMutation({
    mutationFn: () => (editingId != null ? ideaApi.update(editingId, draft) : ideaApi.create(draft)),
    onSuccess: () => {
      showToast(editingId != null ? 'Idea updated' : 'Idea posted', 'success')
      closeForm()
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Could not save idea', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ideaApi.remove(id),
    onSuccess: () => {
      showToast('Idea deleted', 'success')
      setConfirmDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : 'Could not delete idea', 'error')
      setConfirmDeleteId(null)
    },
  })

  const requestMutation = useMutation({
    mutationFn: ({ ownerId, ideaId, title }: { ownerId: number; ideaId: number; title: string }) =>
      collaborationApi.send({ recipientId: ownerId, ideaId, message: `Hi — I'm interested in "${title}", let's talk.` }),
    onSuccess: () => {
      showToast('Request sent', 'success')
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Could not send request', 'error'),
  })

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setDraft(EMPTY_IDEA)
  }

  function startEdit(idea: IdeaResponse) {
    setEditingId(idea.id)
    setDraft(toDraft(idea))
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    saveMutation.mutate()
  }

  return (
    <div ref={ref}>
      <PageHeader
        eyebrow="Startup Ideas"
        title="Ideas looking for co-founders"
        subtitle="Browse open ideas or post your own to attract the right collaborators."
        action={
          <button type="button" className="btn btn-primary" onClick={() => (showForm ? closeForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : 'Post an idea'}
          </button>
        }
      />

      {showForm && (
        <form className="idea-form glass reveal" onSubmit={handleSubmit}>
          <span className="mono idea-form-eyebrow">{editingId != null ? 'Editing idea' : 'New idea'}</span>
          <div className="idea-form-grid">
            <div className="field">
              <label htmlFor="ideaTitle">Title</label>
              <input id="ideaTitle" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} required />
            </div>
            <div className="field">
              <label htmlFor="ideaDomain">Domain</label>
              <input
                id="ideaDomain"
                value={draft.domain}
                onChange={(e) => setDraft((d) => ({ ...d, domain: e.target.value }))}
                placeholder="Fintech, climate, dev tools…"
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ideaDescription">Description</label>
            <textarea
              id="ideaDescription"
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              required
            />
          </div>
          <div className="idea-form-grid">
            <div className="field">
              <label htmlFor="ideaStage">Stage</label>
              <select id="ideaStage" value={draft.stage} onChange={(e) => setDraft((d) => ({ ...d, stage: e.target.value as IdeaStage }))}>
                {STAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ideaEquity">Equity offered</label>
              <input
                id="ideaEquity"
                value={draft.equityOffered}
                onChange={(e) => setDraft((d) => ({ ...d, equityOffered: e.target.value }))}
                placeholder="e.g. 10-20%"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ideaRoles">Roles you need</label>
            <input
              id="ideaRoles"
              value={draft.roleExpectations}
              onChange={(e) => setDraft((d) => ({ ...d, roleExpectations: e.target.value }))}
              placeholder="e.g. Technical co-founder with backend experience"
            />
          </div>
          <div className="idea-form-actions">
            {editingId != null && (
              <button type="button" className="btn btn-ghost" onClick={closeForm}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : editingId != null ? 'Save changes' : 'Post idea'}
            </button>
          </div>
        </form>
      )}

      <div className="tabs reveal idea-tabs">
        <button type="button" className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          All ideas
        </button>
        <button type="button" className={`tab-btn ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>
          My ideas
        </button>
      </div>

      {ideasQuery.isLoading && (
        <div className="idea-list reveal">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 140 }} />
          ))}
        </div>
      )}

      {ideasQuery.data?.content.length === 0 && (
        <p className="dashboard-empty reveal">{tab === 'mine' ? "You haven't posted an idea yet." : 'No ideas posted yet.'}</p>
      )}

      <div className="idea-list">
        {ideasQuery.data?.content.map((idea) => {
          const isOwner = idea.ownerId === user?.id
          const confirmingDelete = confirmDeleteId === idea.id
          return (
            <div key={idea.id} className="idea-card glass card-interactive">
              <div className="idea-card-head">
                <div>
                  <span className={`stage-badge stage-${idea.stage.toLowerCase()}`}>{idea.stage}</span>
                  <h3>{idea.title}</h3>
                  <p className="idea-domain mono">{idea.domain}</p>
                </div>
                {idea.equityOffered && <span className="idea-equity">{idea.equityOffered}</span>}
              </div>
              <p className="idea-description">{idea.description}</p>
              {idea.roleExpectations && <p className="idea-roles">Looking for: {idea.roleExpectations}</p>}
              <div className="idea-footer">
                <Link to={`/profiles/${idea.ownerId}`} className="idea-owner">
                  by {idea.ownerName}
                </Link>

                {!isOwner && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={requestMutation.isPending}
                    onClick={() => requestMutation.mutate({ ownerId: idea.ownerId, ideaId: idea.id, title: idea.title })}
                  >
                    Request to collaborate
                  </button>
                )}

                {isOwner && !confirmingDelete && (
                  <div className="idea-owner-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => startEdit(idea)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-ghost idea-delete-btn" onClick={() => setConfirmDeleteId(idea.id)}>
                      Delete
                    </button>
                  </div>
                )}

                {isOwner && confirmingDelete && (
                  <div className="idea-owner-actions">
                    <span className="idea-confirm-text">Delete this idea?</span>
                    <button type="button" className="btn btn-ghost" onClick={() => setConfirmDeleteId(null)}>
                      No
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary idea-confirm-yes"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(idea.id)}
                    >
                      {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
