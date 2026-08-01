import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '../components/PageHeader'
import { Avatar } from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useChatSocket } from '../hooks/useChatSocket'
import { usePageEntrance } from '../hooks/usePageEntrance'
import { chatApi, collaborationApi } from '../lib/endpoints'
import { formatClockTime, formatDayLabel } from '../lib/time'
import type { ChatMessageResponse, PageResponse } from '../lib/types'
import './Chat.css'

interface ConversationSummary {
  conversationId: number
  otherUserId: number
  otherName: string
  ideaTitle: string | null
  updatedAt: string
}

export function Chat() {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const ref = usePageEntrance<HTMLDivElement>()

  const parsedId = conversationId ? Number(conversationId) : NaN
  const activeId = Number.isFinite(parsedId) ? parsedId : null

  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // A conversation exists for every accepted collaboration request, so the inbox is
  // built from both directions of the request list rather than a dedicated endpoint.
  const receivedQuery = useQuery({
    queryKey: ['requests', 'received', 'chat'],
    queryFn: () => collaborationApi.received(0, 100),
  })
  const sentQuery = useQuery({
    queryKey: ['requests', 'sent', 'chat'],
    queryFn: () => collaborationApi.sent(0, 100),
  })

  const conversations = useMemo<ConversationSummary[]>(() => {
    const all = [...(receivedQuery.data?.content ?? []), ...(sentQuery.data?.content ?? [])]
    const byId = new Map<number, ConversationSummary>()

    for (const req of all) {
      if (req.status !== 'ACCEPTED' || req.conversationId == null) continue
      const iAmSender = req.senderId === user?.id
      byId.set(req.conversationId, {
        conversationId: req.conversationId,
        otherUserId: iAmSender ? req.recipientId : req.senderId,
        otherName: iAmSender ? req.recipientName : req.senderName,
        ideaTitle: req.ideaTitle,
        updatedAt: req.updatedAt,
      })
    }

    return [...byId.values()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  }, [receivedQuery.data, sentQuery.data, user?.id])

  const active = conversations.find((c) => c.conversationId === activeId) ?? null
  const listLoading = receivedQuery.isLoading || sentQuery.isLoading

  const messagesQuery = useQuery({
    queryKey: ['chat', activeId],
    queryFn: () => chatApi.messages(activeId as number),
    enabled: activeId != null,
  })

  const messages = messagesQuery.data?.content ?? []

  // Used by both the socket and the send mutation; deduping by id means a message that
  // arrives twice (once as the POST response, once over the socket) only renders once.
  const appendMessage = useCallback(
    (message: ChatMessageResponse) => {
      queryClient.setQueryData<PageResponse<ChatMessageResponse>>(['chat', activeId], (prev) => {
        if (!prev) return prev
        if (prev.content.some((m) => m.id === message.id)) return prev
        return { ...prev, content: [...prev.content, message] }
      })
    },
    [queryClient, activeId],
  )

  const socketStatus = useChatSocket(activeId, appendMessage)

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatApi.send(activeId as number, content),
    onSuccess: (message) => {
      setDraft('')
      // The socket normally delivers this too; appending here keeps sending working
      // even while the socket is reconnecting.
      appendMessage(message)
    },
    onError: (err) => showToast(err instanceof Error ? err.message : 'Could not send message', 'error'),
  })

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, activeId])

  function handleSend() {
    const content = draft.trim()
    if (!content || activeId == null || sendMutation.isPending) return
    sendMutation.mutate(content)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div ref={ref} className="chat-page">
      <PageHeader
        eyebrow="Messages"
        title="Your conversations"
        subtitle="A chat opens automatically whenever a collaboration request is accepted."
      />

      <div className={`chat-layout reveal${activeId != null ? ' has-active' : ''}`}>
        {/* ---- Conversation list ---- */}
        <aside className="chat-sidebar glass">
          {listLoading && (
            <div className="chat-list">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 62 }} />
              ))}
            </div>
          )}

          {!listLoading && conversations.length === 0 && (
            <div className="chat-empty-list">
              <p>No conversations yet.</p>
              <p className="chat-empty-hint">
                Accept a request on the <Link to="/requests">Requests</Link> page and a chat will appear here.
              </p>
            </div>
          )}

          <div className="chat-list">
            {conversations.map((c) => (
              <button
                key={c.conversationId}
                type="button"
                className={`chat-list-item${c.conversationId === activeId ? ' active' : ''}`}
                onClick={() => navigate(`/chat/${c.conversationId}`)}
              >
                <Avatar firstName={c.otherName.split(' ')[0]} lastName={c.otherName.split(' ')[1]} size={38} />
                <span className="chat-list-text">
                  <span className="chat-list-name">{c.otherName}</span>
                  <span className="chat-list-sub">{c.ideaTitle ? `re: ${c.ideaTitle}` : 'Collaboration'}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* ---- Thread ---- */}
        <section className="chat-thread glass">
          {activeId == null && (
            <div className="chat-placeholder">
              <h3>Pick a conversation</h3>
              <p>Choose someone on the left to see your messages.</p>
            </div>
          )}

          {activeId != null && messagesQuery.isError && (
            <div className="chat-placeholder">
              <h3>Can&rsquo;t open this conversation</h3>
              <p>It may not exist, or you may not be part of it.</p>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/chat')}>
                Back to messages
              </button>
            </div>
          )}

          {activeId != null && !messagesQuery.isError && (
            <>
              <header className="chat-thread-head">
                <button
                  type="button"
                  className="chat-back"
                  onClick={() => navigate('/chat')}
                  aria-label="Back to conversations"
                >
                  ←
                </button>
                <Avatar
                  firstName={active?.otherName.split(' ')[0]}
                  lastName={active?.otherName.split(' ')[1]}
                  size={36}
                />
                <div className="chat-thread-who">
                  {active ? (
                    <Link to={`/profiles/${active.otherUserId}`} className="chat-thread-name">
                      {active.otherName}
                    </Link>
                  ) : (
                    <span className="chat-thread-name">Conversation</span>
                  )}
                  {active?.ideaTitle && <span className="chat-thread-idea">re: {active.ideaTitle}</span>}
                </div>
                <span className={`chat-status chat-status-${socketStatus}`}>
                  {socketStatus === 'connected' ? 'Live' : socketStatus === 'connecting' ? 'Connecting…' : 'Offline'}
                </span>
              </header>

              <div className="chat-messages" ref={scrollRef}>
                {messagesQuery.isLoading && (
                  <div className="chat-loading">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="skeleton" style={{ height: 44, width: i % 2 ? '55%' : '42%' }} />
                    ))}
                  </div>
                )}

                {!messagesQuery.isLoading && messages.length === 0 && (
                  <p className="chat-no-messages">
                    No messages yet — say hello to {active?.otherName.split(' ')[0] ?? 'them'}.
                  </p>
                )}

                {messages.map((msg, i) => {
                  const mine = msg.senderId === user?.id
                  const prev = messages[i - 1]
                  const newDay =
                    !prev || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString()

                  return (
                    <div key={msg.id}>
                      {newDay && <div className="chat-day mono">{formatDayLabel(msg.createdAt)}</div>}
                      <div className={`chat-bubble-row${mine ? ' mine' : ''}`}>
                        <div className={`chat-bubble${mine ? ' mine' : ''}`}>
                          <p>{msg.content}</p>
                          <span className="chat-time">{formatClockTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="chat-composer">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message…"
                  rows={1}
                  aria-label="Message"
                />
                <button
                  type="button"
                  className="btn btn-primary chat-send"
                  onClick={handleSend}
                  disabled={!draft.trim() || sendMutation.isPending}
                >
                  {sendMutation.isPending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
