'use client'

/**
 * useCall — récupère la salle d'appel Jitsi Meet liée à une conversation.
 *
 * Jitsi Meet est libre et gratuit : aucune clé d'API ni compte n'est requis.
 * Le serveur (`/calls/room`) renvoie un nom de salle déterministe et non
 * devinable ; l'interface d'appel (micro, caméra, raccrocher) est entièrement
 * gérée par l'iframe Jitsi (cf. CallOverlay).
 *
 * La *signalisation* (invitation / acceptation / refus / fin) passe par le
 * WebSocket de chat existant (cf. app/(dashboard)/chat/[roomId]/page.tsx).
 */

import { useCallback, useState } from 'react'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'

export type CallStatus = 'idle' | 'connecting' | 'connected' | 'error'

export interface JitsiRoom {
  domain: string
  roomName: string
  url: string
  userName: string
}

export function useCall() {
  const [status, setStatus] = useState<CallStatus>('idle')
  const [room, setRoom] = useState<JitsiRoom | null>(null)

  const connect = useCallback(async ({ roomId }: { roomId: number }): Promise<boolean> => {
    setStatus('connecting')
    try {
      const { data } = await apiClient.post<{
        domain: string
        room_name: string
        url: string
        user_name: string
      }>(API.CALLS_ROOM, { room_id: roomId })

      setRoom({
        domain: data.domain,
        roomName: data.room_name,
        url: data.url,
        userName: data.user_name,
      })
      setStatus('connected')
      return true
    } catch (err) {
      console.error('[useCall] récupération de la salle échouée :', err)
      setStatus('error')
      setRoom(null)
      return false
    }
  }, [])

  const disconnect = useCallback(() => {
    setRoom(null)
    setStatus('idle')
  }, [])

  return { status, room, connect, disconnect }
}
