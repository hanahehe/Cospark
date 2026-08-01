import { useEffect, useRef, useState } from 'react'
import { Client, type IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { resolveWsUrl, tokenStore } from '../lib/api'
import type { ChatMessageResponse } from '../lib/types'

export type SocketStatus = 'connecting' | 'connected' | 'offline'

/**
 * Keeps a STOMP connection open for one conversation and calls `onMessage` for every
 * message the server broadcasts to it.
 *
 * The JWT goes on the STOMP CONNECT frame rather than the HTTP handshake, because a
 * browser can't set headers on a WebSocket handshake — the backend's
 * WebSocketAuthInterceptor reads it from there and also checks that this user actually
 * belongs to the conversation before allowing the subscription.
 */
export function useChatSocket(
  conversationId: number | null,
  onMessage: (message: ChatMessageResponse) => void,
): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>('offline')

  // Held in a ref so a re-render with a new callback doesn't tear down the connection.
  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (conversationId == null) {
      setStatus('offline')
      return
    }

    const token = tokenStore.getAccessToken()
    if (!token) {
      setStatus('offline')
      return
    }

    setStatus('connecting')

    const client = new Client({
      webSocketFactory: () => new SockJS(resolveWsUrl()) as never,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setStatus('connected')
        client.subscribe(`/topic/chat/${conversationId}`, (frame: IMessage) => {
          try {
            onMessageRef.current(JSON.parse(frame.body) as ChatMessageResponse)
          } catch {
            // A frame we can't parse isn't worth breaking the stream over.
          }
        })
      },
      onWebSocketClose: () => setStatus('offline'),
      onStompError: () => setStatus('offline'),
    })

    client.activate()

    return () => {
      void client.deactivate()
      setStatus('offline')
    }
  }, [conversationId])

  return status
}
