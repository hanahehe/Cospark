import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/PageHeader'
import { notificationApi } from '../lib/endpoints'
import { timeAgo } from '../lib/time'
import { usePageEntrance } from '../hooks/usePageEntrance'
import './Notifications.css'

export function Notifications() {
  const ref = usePageEntrance<HTMLDivElement>()
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({ queryKey: ['notifications', 'list'], queryFn: () => notificationApi.list(0, 30) })

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const hasUnread = notificationsQuery.data?.content.some((n) => !n.read)

  return (
    <div ref={ref}>
      <PageHeader
        eyebrow="Notifications"
        title="Notifications"
        subtitle="Stay on top of new matches, requests, and updates."
        action={
          hasUnread ? (
            <button type="button" className="btn btn-ghost" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending}>
              Mark all read
            </button>
          ) : undefined
        }
      />

      {notificationsQuery.isLoading && (
        <div className="notification-list reveal">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 72 }} />
          ))}
        </div>
      )}

      {notificationsQuery.data?.content.length === 0 && <p className="dashboard-empty reveal">You're all caught up.</p>}

      <div className="notification-list">
        {notificationsQuery.data?.content.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`notification-row glass card-interactive ${n.read ? '' : 'notification-unread'}`}
            onClick={() => !n.read && markReadMutation.mutate(n.id)}
          >
            <span className="notification-dot" aria-hidden="true" />
            <div className="notification-body">
              <strong>{n.title}</strong>
              {n.body && <p>{n.body}</p>}
            </div>
            <span className="notification-time mono">{timeAgo(n.createdAt)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
