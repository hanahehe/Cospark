import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/PageHeader'
import { collaborationApi } from '../lib/endpoints'
import { useToast } from '../context/ToastContext'
import { usePageEntrance } from '../hooks/usePageEntrance'
import './Requests.css'

export function Requests() {
  const ref = usePageEntrance<HTMLDivElement>([])
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'received' | 'sent'>('received')

  const requestsQuery = useQuery({
    queryKey: ['requests', tab],
    queryFn: () => (tab === 'received' ? collaborationApi.received() : collaborationApi.sent()),
  })

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'accept' | 'reject' }) =>
      action === 'accept' ? collaborationApi.accept(id) : collaborationApi.reject(id),
    onSuccess: (_, variables) => {
      showToast(variables.action === 'accept' ? 'Request accepted' : 'Request declined', 'success')
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Could not update request', 'error'),
  })

  return (
    <div ref={ref}>
      <PageHeader eyebrow="Requests" title="Collaboration requests" subtitle="Manage the connections you've sent and received." />

      <div className="tabs reveal request-tabs">
        <button type="button" className={`tab-btn ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>
          Received
        </button>
        <button type="button" className={`tab-btn ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
          Sent
        </button>
      </div>

      {requestsQuery.isLoading && (
        <div className="request-full-list reveal">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100 }} />
          ))}
        </div>
      )}

      {requestsQuery.data?.content.length === 0 && (
        <p className="dashboard-empty reveal">{tab === 'received' ? "You haven't received any requests yet." : "You haven't sent any requests yet."}</p>
      )}

      <div className="request-full-list">
        {requestsQuery.data?.content.map((req) => (
          <div key={req.id} className="request-full-card glass card-interactive">
            <Link to={`/profiles/${tab === 'received' ? req.senderId : req.recipientId}`} className="request-full-main">
              <strong>{tab === 'received' ? req.senderName : req.recipientName}</strong>
              {req.ideaTitle && <span className="request-idea-tag">re: {req.ideaTitle}</span>}
              {req.message && <p className="request-full-message">{req.message}</p>}
            </Link>
            <div className="request-full-side">
              <span className={`request-status status-${req.status.toLowerCase()}`}>{req.status}</span>
              {req.status === 'ACCEPTED' && req.conversationId != null && (
                <Link to={`/chat/${req.conversationId}`} className="btn btn-ghost request-chat-link">
                  Open chat
                </Link>
              )}
              {tab === 'received' && req.status === 'PENDING' && (
                <div className="request-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={respondMutation.isPending}
                    onClick={() => respondMutation.mutate({ id: req.id, action: 'accept' })}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={respondMutation.isPending}
                    onClick={() => respondMutation.mutate({ id: req.id, action: 'reject' })}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
