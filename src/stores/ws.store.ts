'use client'

// ============================================================
// SOSLocal — WebSocket Store (Zustand)
// Gestion de la connexion temps réel
// ============================================================

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { WsConnectionState, WsEvent } from '@/types'

interface WsState {
  connectionState: WsConnectionState
  socket:          WebSocket | null
  lastEvent:       WsEvent | null

  connect:    (requestId: string) => void
  disconnect: () => void
  send:       (event: WsEvent) => void
  setConnectionState: (state: WsConnectionState) => void
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws'

export const useWsStore = create<WsState>()(
  devtools(
    (set, get) => ({
      connectionState: 'disconnected',
      socket:          null,
      lastEvent:       null,

      connect: (requestId: string) => {
        const token = typeof window !== 'undefined'
          ? sessionStorage.getItem('soslocal_access')
          : null

        if (!token) return

        const ws = new WebSocket(`${WS_URL}/requests/${requestId}?token=${token}`)

        set({ connectionState: 'connecting' }, false, 'ws/connecting')

        ws.onopen = () =>
          set({ connectionState: 'connected', socket: ws }, false, 'ws/connected')

        ws.onmessage = (e) => {
          try {
            const event: WsEvent = JSON.parse(e.data)
            set({ lastEvent: event }, false, `ws/event:${event.type}`)
          } catch { /* ignore malformed messages */ }
        }

        ws.onclose = () =>
          set({ connectionState: 'disconnected', socket: null }, false, 'ws/disconnected')

        ws.onerror = () =>
          set({ connectionState: 'error' }, false, 'ws/error')
      },

      disconnect: () => {
        get().socket?.close()
        set({ connectionState: 'disconnected', socket: null }, false, 'ws/disconnect')
      },

      send: (event) => {
        const { socket } = get()
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(event))
        }
      },

      setConnectionState: (connectionState) =>
        set({ connectionState }, false, 'ws/setState'),
    }),
    { name: 'WsStore' }
  )
)
