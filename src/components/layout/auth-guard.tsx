'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { Spinner } from '@/components/ui/badge'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, user, technicianApproved, loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  useEffect(() => {
    if (!isAuthenticated && !user) {
      const timer = setTimeout(() => {
        if (!useAuthStore.getState().isAuthenticated) {
          router.replace('/login')
        }
      }, 100)
      return () => clearTimeout(timer)
    }

    // Artisan non approuvé → page d'attente
    if (user?.role === 'technician' && technicianApproved === false) {
      router.replace('/artisan/en-attente')
    }
  }, [isAuthenticated, user, technicianApproved, router])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Chargement…</p>
        </div>
      </div>
    )
  }

  // Bloquer l'accès si artisan en attente d'approbation
  if (user.role === 'technician' && technicianApproved === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Vérification du statut…</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
