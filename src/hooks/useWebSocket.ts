'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { tokenStorage } from '@/lib/auth/token'
import { resolveWsUrl } from '@/lib/api/base-url'

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
  url = resolveWsUrl(),
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
  const manualCloseRef = useRef(false)
  // Keepalive : sans trafic, un proxy (Cloudflare/Envoy) ferme la WS au bout
  // de ~100 s, ce qui coupe le « typing »/présence. Un ping périodique la garde
  // ouverte. Le backend ignore proprement les types inconnus.
  const pingRef = useRef<NodeJS.Timeout | null>(null)

  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

  // Les callbacks sont gardés dans des refs : ainsi le gestionnaire onmessage
  // appelle TOUJOURS la dernière version (pas de closure périmée), même si la
  // socket a été ouverte plusieurs rendus plus tôt.
  const onMessageRef = useRef(onMessage)
  const onOpenRef = useRef(onOpen)
  const onCloseRef = useRef(onClose)
  const onErrorRef = useRef(onError)
  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])
  useEffect(() => { onOpenRef.current = onOpen }, [onOpen])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  const connect = useCallback(() => {
    if (!url) return
    if (isMockMode) {
      // En mode mock, on simule la connexion sans vraiment se connecter
      setIsConnected(true)
      onOpenRef.current?.()
      return
    }

    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) return

    const token = tokenStorage.getAccessToken()
    if (!token) {
      setError('Pas de token d\'authentification')
      return
    }

    manualCloseRef.current = false

    try {
      const wsUrl = `${url}?token=${encodeURIComponent(token)}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        if (pingRef.current) clearInterval(pingRef.current)
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try { ws.send(JSON.stringify({ type: 'ping' })) } catch { /* noop */ }
          }
        }, 25_000)
        onOpenRef.current?.()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSMessage
          onMessageRef.current?.(data)
        } catch (err) {
          console.error('Erreur parsing message WS:', err)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        if (pingRef.current) { clearInterval(pingRef.current); pingRef.current = null }
        onCloseRef.current?.()

        // Reconnexion avec back-off exponentiel (sauf fermeture volontaire)
        if (!manualCloseRef.current && autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current)
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      ws.onerror = (event) => {
        setError('Erreur de connexion WebSocket')
        onErrorRef.current?.(event)
      }
    } catch (err: any) {
      setError(err.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, autoReconnect, reconnectInterval, maxReconnectAttempts, isMockMode])

  const disconnect = useCallback(() => {
    manualCloseRef.current = true
    if (pingRef.current) { clearInterval(pingRef.current); pingRef.current = null }
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

  // (Re)connexion dès que l'URL devient disponible ou change (ex. la room est
  // résolue de façon asynchrone après le montage). Sans cette dépendance, la
  // socket ne se connectait jamais sur une navigation directe → pas de temps
  // réel tant qu'on ne rechargeait pas la page.
  useEffect(() => {
    reconnectAttemptsRef.current = 0
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { isConnected, error, send, disconnect, reconnect: connect }
}
