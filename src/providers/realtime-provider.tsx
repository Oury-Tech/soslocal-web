'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWsStore, useWsConnectedSeq } from '@/stores/ws.store'
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

  return (
    <>
      <WsReconciler />
      <ChunkReloadGuard />
      {children}
    </>
  )
}

/**
 * Réconciliation à chaque (re)connexion WS. À chaque ouverture de la socket
 * (connexion initiale ou reconnexion après une coupure : veille, perte réseau,
 * redémarrage serveur), on revalide TOUT le cache : les requêtes actives se
 * rechargent depuis la source de vérité, ce qui rattrape n'importe quel
 * évènement manqué — sans rechargement manuel.
 *
 * Composant dédié pour isoler ses re-rendus (sur `connectedSeq`) de l'hôte de
 * `useWsNotifications`, afin de ne pas re-déclencher ses toasts.
 */
function WsReconciler() {
  const qc = useQueryClient()
  const connectedSeq = useWsConnectedSeq()
  const lastSeq = useRef(0)
  useEffect(() => {
    if (connectedSeq === 0 || connectedSeq === lastSeq.current) return
    lastSeq.current = connectedSeq
    qc.invalidateQueries()
  }, [connectedSeq, qc])
  return null
}

/**
 * Garde anti « This page couldn't load ». Après un nouveau déploiement, un
 * onglet déjà ouvert référence des fragments JS (chunks) qui n'existent plus :
 * la navigation côté client échoue tant qu'on ne recharge pas. On détecte ces
 * erreurs de chargement de chunk et on recharge UNE fois automatiquement pour
 * récupérer le nouveau build (garde anti-boucle de 12 s).
 */
function ChunkReloadGuard() {
  useEffect(() => {
    const KEY = 'sos-chunk-reload-at'

    const isChunkError = (s?: string | null) =>
      !!s && (
        /ChunkLoadError/i.test(s) ||
        /Loading chunk [\w-]+ failed/i.test(s) ||
        /Loading CSS chunk/i.test(s) ||
        /Failed to fetch dynamically imported module/i.test(s) ||
        /error loading dynamically imported module/i.test(s) ||
        /'?text\/html'? is not a valid JavaScript MIME type/i.test(s)
      )

    const recover = () => {
      try {
        const last = Number(sessionStorage.getItem(KEY) || 0)
        // Anti-boucle : si on a déjà rechargé il y a < 12 s, ne pas réessayer.
        if (Date.now() - last < 12_000) return
        sessionStorage.setItem(KEY, String(Date.now()))
      } catch { /* sessionStorage indisponible : on recharge quand même */ }
      window.location.reload()
    }

    const onError = (e: ErrorEvent) => {
      if (isChunkError(e.message) || isChunkError((e.error as Error | undefined)?.name) ||
          isChunkError((e.error as Error | undefined)?.message)) {
        recover()
      }
    }
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as { name?: string; message?: string } | undefined
      if (isChunkError(r?.name) || isChunkError(r?.message)) recover()
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
