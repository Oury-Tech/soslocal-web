'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { WsConnectionState, WsEvent, WsArtisanLocation } from '@/types'
import { tokenStorage } from '@/lib/auth/token'
import { resolveApiUrl } from '@/lib/api/base-url'

/**
 * Base WebSocket dérivée de l'API REST (source de vérité unique du backend).
 * Ex. https://host/api/v1 → wss://host. Les endpoints WS sont ensuite montés
 * sous /api/v1/... (ex. /api/v1/realtime/ws/notifications), comme le chat.
 */
const WS_URL = resolveApiUrl().replace(/^http/, 'ws').replace(/\/api\/v1$/, '')
const isMock  = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

const PING_INTERVAL_MS   = 25_000
const RECONNECT_BASE_MS  = 1_000
const RECONNECT_MAX_MS   = 30_000
const RECONNECT_MAX_TRIES = 8

interface WsState {
  connectionState: WsConnectionState
  socket:          WebSocket | null
  lastEvent:       WsEvent | null
  /** Dernière position GPS live d'un artisan (mission en cours). */
  lastLocation:    WsArtisanLocation | null
  /** Identifiants des utilisateurs actuellement en ligne (présence globale). */
  onlineUsers:     number[]

  connect:            (channel: string) => void
  disconnect:         () => void
  send:               (event: WsEvent | object) => boolean
  setConnectionState: (state: WsConnectionState) => void
}

function backoff(attempt: number): number {
  return Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS)
}

export const useWsStore = create<WsState>()(
  devtools(
    (set, get) => {
      let pingTimer:      ReturnType<typeof setInterval>  | null = null
      let reconnectTimer: ReturnType<typeof setTimeout>   | null = null
      let attempts = 0
      let currentChannel = ''

      function clearTimers() {
        if (pingTimer)      { clearInterval(pingTimer);   pingTimer      = null }
        if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
      }

      function startPing(ws: WebSocket) {
        pingTimer = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }))
          }
        }, PING_INTERVAL_MS)
      }

      function doConnect(channel: string) {
        if (isMock) {
          set({ connectionState: 'connected' }, false, 'ws/mock-connected')
          return
        }

        const token = tokenStorage.getAccessToken()
        if (!token) {
          set({ connectionState: 'error' }, false, 'ws/no-token')
          return
        }

        const url = `${WS_URL}/${channel}?token=${encodeURIComponent(token)}`
        const ws  = new WebSocket(url)

        set({ connectionState: 'connecting', socket: ws }, false, 'ws/connecting')

        ws.onopen = () => {
          attempts = 0
          set({ connectionState: 'connected', socket: ws }, false, 'ws/connected')
          startPing(ws)
        }

        ws.onmessage = (e) => {
          try {
            const event: WsEvent = JSON.parse(e.data)
            if (event.type === 'pong') return
            // Position live de l'artisan → canal dédié pour la carte de suivi.
            if (event.type === 'artisan_location'
                && event.request_id != null
                && event.lat != null && event.lng != null) {
              set({
                lastLocation: {
                  request_id:    event.request_id,
                  technician_id: event.technician_id ?? 0,
                  lat:           event.lat,
                  lng:           event.lng,
                },
              }, false, 'ws/artisan_location')
              return
            }
            // Présence globale : on tient à jour l'ensemble des utilisateurs en
            // ligne pour les points verts (liste + en-tête de conversation).
            if (event.type === 'presence' && event.user_id != null) {
              const prev = get().onlineUsers
              const has  = prev.includes(event.user_id)
              const next = event.is_online
                ? (has ? prev : [...prev, event.user_id])
                : prev.filter((id) => id !== event.user_id)
              set({ onlineUsers: next, lastEvent: event }, false, 'ws/presence')
              return
            }
            set({ lastEvent: event }, false, `ws/event:${event.type}`)
          } catch { /* ignore malformed */ }
        }

        ws.onclose = (ev) => {
          clearTimers()
          set({ connectionState: 'disconnected', socket: null }, false, 'ws/disconnected')

          if (!ev.wasClean && attempts < RECONNECT_MAX_TRIES) {
            const delay = backoff(attempts++)
            reconnectTimer = setTimeout(() => doConnect(currentChannel), delay)
          }
        }

        ws.onerror = () => {
          set({ connectionState: 'error' }, false, 'ws/error')
        }
      }

      return {
        connectionState: 'disconnected',
        socket:          null,
        lastEvent:       null,
        lastLocation:    null,
        onlineUsers:     [],

        connect: (channel) => {
          currentChannel = channel
          attempts = 0
          clearTimers()
          get().socket?.close()
          doConnect(channel)
        },

        disconnect: () => {
          attempts = RECONNECT_MAX_TRIES
          clearTimers()
          get().socket?.close()
          set({ connectionState: 'disconnected', socket: null }, false, 'ws/disconnect')
        },

        send: (event) => {
          if (isMock) return true
          const { socket } = get()
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(event))
            return true
          }
          return false
        },

        setConnectionState: (connectionState) =>
          set({ connectionState }, false, 'ws/setState'),
      }
    },
    { name: 'WsStore' }
  )
)

/**
 * Présence temps réel d'un utilisateur (ou `undefined` si on ne sait pas).
 * `true`/`false` dès qu'un évènement `presence` a été reçu pour cet utilisateur ;
 * sinon `undefined` → le composant retombe sur la valeur initiale de l'API.
 */
export function useIsUserOnline(userId?: number): boolean | undefined {
  return useWsStore((s) =>
    userId == null ? undefined : s.onlineUsers.includes(userId) ? true : undefined
  )
}

/**
 * Position GPS live de l'artisan pour une demande donnée (ou `null`).
 * Alimentée par les évènements `artisan_location` du WebSocket temps réel.
 */
export function useLiveArtisanPosition(requestId?: number) {
  return useWsStore((s) =>
    s.lastLocation && s.lastLocation.request_id === requestId ? s.lastLocation : null
  )
}

/**
 * Publie en continu la position GPS de l'artisan sur le WebSocket temps réel
 * tant que la mission est active. Le backend relaie au client la position via
 * un évènement `artisan_location`.
 *
 * @param requestId  Identifiant de la demande/mission en cours.
 * @param active     `true` uniquement pendant une mission active (accepted/in_progress).
 */
export function useArtisanLocationPublisher(requestId?: number, active = false) {
  const send = useWsStore((s) => s.send)

  useEffect(() => {
    if (!active || !requestId) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        send({
          type:       'location',
          request_id: requestId,
          lat:        position.coords.latitude,
          lng:        position.coords.longitude,
        })
      },
      () => { /* permission refusée ou indisponible : silencieux */ },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [requestId, active, send])
}
