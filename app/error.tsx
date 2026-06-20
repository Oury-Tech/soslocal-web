'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Détecte une erreur de chargement de chunk (build périmé après déploiement). */
function isChunkError(e?: Error & { name?: string }): boolean {
  const s = `${e?.name ?? ''} ${e?.message ?? ''}`
  return (
    /ChunkLoadError/i.test(s) ||
    /Loading chunk [\w-]+ failed/i.test(s) ||
    /Loading CSS chunk/i.test(s) ||
    /Failed to fetch dynamically imported module/i.test(s) ||
    /error loading dynamically imported module/i.test(s)
  )
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Après un nouveau déploiement, un onglet ouvert référence des fragments JS
  // qui n'existent plus → la navigation échoue. On recharge UNE fois pour
  // récupérer le nouveau build (garde anti-boucle de 12 s).
  useEffect(() => {
    if (!isChunkError(error)) return
    try {
      const KEY = 'sos-chunk-reload-at'
      const last = Number(sessionStorage.getItem(KEY) || 0)
      if (Date.now() - last < 12_000) return
      sessionStorage.setItem(KEY, String(Date.now()))
    } catch { /* sessionStorage indisponible : on recharge quand même */ }
    window.location.reload()
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 mesh-bg">
      <div className="text-center max-w-md">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold">Oups, une erreur !</h1>
        <p className="mt-3 text-muted-foreground">
          Quelque chose s'est mal passé. Vous pouvez réessayer ou revenir à l'accueil.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <pre className="mt-4 p-3 rounded-lg bg-muted text-xs text-left overflow-auto max-h-40">
            {error.message}
          </pre>
        )}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="accent" size="lg" onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg">
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
