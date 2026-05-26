'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { tokenStorage } from '@/lib/auth/token'

export type WSMessage =
  | { type: 'location_update'; technician_id: number; latitude: number; longitude: number }
  | { type: 'request_status'; request_id: number; status: string }
  /* Backend sends "message" (not "chat_message") for new chat messages */
  | { type: 'message'; id: number; chat_room_id: number; sender_id: number; content: string; created_at: string }
  | { type: 'notification'; title: string; body: string }
  /* Backend sends sender_id (not user_id) for typing events */
  | { type: 'typing'; sender_id: number; sender_name: string }
  | { type: 'read'; room_id: number; reader_id: number }
  | { type: 'presence'; user_id: number; is_online: boolean }
  | { type: string; [key: string]: unknown }

interface UseWebSocketOptions {
  url?: string | null
  onMessage?: (msg: WSMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (err: Event) => void
  autoReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket({
  url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  onMessage,
  onOpen,
  onClose,
  onError,
  autoReconnect = true,
  reconnectInterval = 1000,
  maxReconnectAttempts = 5,
}: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

  const connect = useCallback(() => {
    if (!url) return
    if (isMockMode) {
      // En mode mock, on simule la connexion sans vraiment se connecter
      setIsConnected(true)
      onOpen?.()
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const token = tokenStorage.getAccessToken()
    if (!token) {
      setError('Pas de token d\'authentification')
      return
    }

    try {
      const wsUrl = `${url}?token=${encodeURIComponent(token)}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        onOpen?.()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSMessage
          onMessage?.(data)
        } catch (err) {
          console.error('Erreur parsing message WS:', err)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        onClose?.()

        // Reconnexion avec back-off exponentiel
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current)
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      ws.onerror = (event) => {
        setError('Erreur de connexion WebSocket')
        onError?.(event)
      }
    } catch (err: any) {
      setError(err.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoReconnect, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  const send = useCallback((message: WSMessage | object) => {
    if (isMockMode) {
      // En mode mock, on simule l'envoi
      console.log('[MOCK WS] Send:', message)
      return true
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [isMockMode])

  useEffect(() => {
    connect()
    return () => disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { isConnected, error, send, disconnect, reconnect: connect }
}
