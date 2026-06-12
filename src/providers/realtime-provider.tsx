'use client'

import { useEffect } from 'react'
import { useWsStore } from '@/stores/ws.store'
import { useAuthStore } from '@/stores/auth.store'
import { useWsNotifications } from '@/hooks/useNotifications'

/** Canal WS global par utilisateur (monté sous /api/v1 comme le chat). */
const NOTIFICATIONS_CHANNEL = 'api/v1/realtime/ws/notifications'

/**
 * Connecte une unique WebSocket temps réel dès que l'utilisateur est
 * authentifié, et la ferme à la déconnexion. Pousse instantanément les
 * changements de statut de demande + la position live des artisans.
 *
 * Monté une seule fois à la racine — `useWsNotifications` consomme les
 * évènements (toasts + invalidation des caches React Query).
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const connect = useWsStore((s) => s.connect)
  const disconnect = useWsStore((s) => s.disconnect)

  // Branche les toasts + invalidations sur les évènements entrants.
  useWsNotifications()

  useEffect(() => {
    if (!isAuthenticated) return
    connect(NOTIFICATIONS_CHANNEL)
    return () => disconnect()
  }, [isAuthenticated, connect, disconnect])

  return <>{children}</>
}
