'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { WsConnectionState, WsEvent } from '@/types'
import { tokenStorage } from '@/lib/auth/token'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws'
const isMock  = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

const PING_INTERVAL_MS   = 25_000
const RECONNECT_BASE_MS  = 1_000
const RECONNECT_MAX_MS   = 30_000
const RECONNECT_MAX_TRIES = 8

interface WsState {
  connectionState: WsConnectionState
  socket:          WebSocket | null
  lastEvent:       WsEvent | null

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
