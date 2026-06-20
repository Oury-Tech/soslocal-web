'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { useWsStore } from '@/stores/ws.store'

interface PresenceSnapshot {
  online_user_ids: number[]
  count: number
}

/**
 * Charge l'instantané de présence (réservé aux superviseurs) et l'injecte dans
 * le store WS. Les variations ensuite arrivent en temps réel via les évènements
 * `presence` du WebSocket global, qui invalide ['realtime','presence'] et
 * recharge cet instantané (voir useWsNotifications) — plus aucun polling.
 *
 * À n'appeler que pour un admin/opérateur : l'endpoint renvoie 403 sinon.
 */
export function useOnlinePresence(enabled = true) {
  const setOnlineUsers = useWsStore((s) => s.setOnlineUsers)

  const query = useQuery<number[]>({
    queryKey: ['realtime', 'presence'],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<PresenceSnapshot>(API.REALTIME_PRESENCE)
      return Array.isArray(data?.online_user_ids) ? data.online_user_ids : []
    },
    staleTime: 15_000,
  })

  useEffect(() => {
    if (query.data) setOnlineUsers(query.data)
  }, [query.data, setOnlineUsers])

  return query
}
