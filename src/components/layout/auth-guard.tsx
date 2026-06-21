'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { tokenStorage } from '@/lib/auth/token'
import { Spinner } from '@/components/ui/badge'

// Routes accessible par rôle
const ROLE_HOME: Record<string, string> = {
  client:     '/beneficiaire',
  technician: '/artisan',
  operator:   '/operateur',
  admin:      '/operateur',
}

function getRoleHome(role?: string) {
  return role ? (ROLE_HOME[role] ?? '/') : '/login'
}

// Sous-routes /operateur réservées à l'ADMIN (administration complète).
// L'opérateur n'a que la supervision + la modération.
const ADMIN_ONLY_ROUTES = [
  '/operateur/utilisateurs',
  '/operateur/catalogue',
  '/operateur/finance',
  '/operateur/contenu',
  '/operateur/admin',
]

function isRouteAllowed(role: string | undefined, pathname: string | null): boolean {
  if (!pathname || !role) return true
  // Shared routes — accessible by all roles
  if (
    pathname.startsWith('/chat') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/parametres') ||
    pathname.startsWith('/notifications')
  ) return true

  if (role === 'client')     return !pathname.startsWith('/artisan') && !pathname.startsWith('/operateur')
  if (role === 'technician') return !pathname.startsWith('/beneficiaire') && !pathname.startsWith('/operateur')
  if (role === 'operator') {
    if (pathname.startsWith('/beneficiaire') || pathname.startsWith('/artisan')) return false
    // Bloquer les modules d'administration réservés à l'admin
    if (ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r))) return false
    return true
  }
  if (role === 'admin') return !pathname.startsWith('/beneficiaire') && !pathname.startsWith('/artisan')
  return true
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, technicianApproved, loadUser } = useAuthStore()
  // `ready` = la vérification initiale de session est terminée (succès OU échec).
  // Tant qu'elle n'est pas finie, on n'autorise AUCUNE redirection : c'est ce qui
  // évite l'éjection prématurée vers /login pendant que GET /me est en cours.
  const [ready, setReady] = useState(false)

  // Vérification initiale de session — une seule fois au montage.
  useEffect(() => {
    let active = true
    const hasToken = tokenStorage.hasTokens()
    const persistedAuth = useAuthStore.getState().isAuthenticated
    // Aucun token et aucune session persistée → déconnecté, pas besoin d'appeler /me.
    if (!hasToken && !persistedAuth) {
      setReady(true)
      return
    }
    // Token (ou session persistée à revalider) → on confirme via le backend.
    loadUser().finally(() => {
      if (active) setReady(true)
    })
    return () => {
      active = false
    }
  }, [loadUser])

  // Redirections — uniquement APRÈS la vérification initiale.
  useEffect(() => {
    if (!ready) return

    if (!isAuthenticated || !user) {
      const returnTo =
        pathname && pathname !== '/login' ? `?returnTo=${encodeURIComponent(pathname)}` : ''
      router.replace(`/login${returnTo}`)
      return
    }

    // Artisan non approuvé → écran d'attente (sauf s'il y est déjà).
    if (user.role === 'technician' && technicianApproved === false) {
      if (pathname !== '/artisan/en-attente') router.replace('/artisan/en-attente')
      return
    }

    // Artisan approuvé qui resterait sur l'écran d'attente → renvoyé à l'accueil.
    if (user.role === 'technician' && technicianApproved === true && pathname === '/artisan/en-attente') {
      router.replace('/artisan')
      return
    }

    // Role-based route protection
    if (!isRouteAllowed(user.role, pathname)) {
      router.replace(getRoleHome(user.role))
    }
  }, [ready, isAuthenticated, user, technicianApproved, pathname, router])

  // Tant que la session n'est pas confirmée (ou en cours de redirection) → écran de chargement.
  if (!ready || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Chargement…</p>
        </div>
      </div>
    )
  }

  // Artisan non approuvé : on laisse s'afficher l'écran d'attente, on bloque le reste.
  if (user.role === 'technician' && technicianApproved === false) {
    if (pathname === '/artisan/en-attente') return <>{children}</>
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Redirection…</p>
        </div>
      </div>
    )
  }

  // Block render while redirecting for wrong role
  if (!isRouteAllowed(user.role, pathname)) return null

  return <>{children}</>
}
