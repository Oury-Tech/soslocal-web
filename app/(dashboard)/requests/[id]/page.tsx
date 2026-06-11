'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Route générique /requests/[id] utilisée par les liens de notification du backend.
 * Redirige vers la vue détaillée propre au rôle de l'utilisateur.
 */
export default function RequestRedirectPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const role = useAuthStore((s) => s.user?.role)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    switch (role) {
      case 'technician':
        router.replace(`/artisan/missions/${id}`)
        break
      case 'operator':
      case 'admin':
        router.replace('/operateur/moderation')
        break
      case 'client':
      default:
        router.replace(`/beneficiaire/demandes/${id}`)
        break
    }
  }, [id, role, isAuthenticated, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" role="status" aria-live="polite">
      <Spinner />
      <p className="text-muted-foreground text-sm">Redirection…</p>
    </div>
  )
}
