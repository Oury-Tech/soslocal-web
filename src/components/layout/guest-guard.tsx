'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { tokenStorage } from '@/lib/auth/token'

// Accueil par rôle — doit rester aligné avec auth-guard ROLE_HOME.
const ROLE_HOME: Record<string, string> = {
  client: '/beneficiaire',
  technician: '/artisan',
  operator: '/operateur',
  admin: '/operateur',
}

// Pages d'authentification réservées aux visiteurs non connectés.
// (verify-email/reset-password restent accessibles même connecté : flux légitimes.)
const GUEST_ONLY = ['/login', '/register']

/** Destination interne sûre depuis ?returnTo= (anti open-redirect). */
function getSafeReturnTo(): string | null {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('returnTo')
  if (!raw) return null
  let path: string
  try {
    path = decodeURIComponent(raw)
  } catch {
    return null
  }
  if (!path.startsWith('/') || path.startsWith('//')) return null
  if (path === '/login' || path === '/register') return null
  return path
}

/**
 * GuestGuard — empêche le ping-pong entre l'accueil et l'auth.
 * Un utilisateur déjà connecté qui ouvre /login ou /register est renvoyé
 * vers son tableau de bord (ou vers ?returnTo= si présent et sûr).
 * La session persistée est revalidée auprès du backend avant toute redirection,
 * pour ne pas rediriger sur la foi d'un token expiré.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, loadUser } = useAuthStore()
  const [ready, setReady] = useState(false)

  // Revalidation initiale de session — une seule fois au montage.
  useEffect(() => {
    let active = true
    const hasToken = tokenStorage.hasTokens()
    const persistedAuth = useAuthStore.getState().isAuthenticated
    if (!hasToken && !persistedAuth) {
      setReady(true)
      return
    }
    loadUser().finally(() => {
      if (active) setReady(true)
    })
    return () => {
      active = false
    }
  }, [loadUser])

  // Redirection — uniquement APRÈS la revalidation, et seulement sur les pages invité.
  useEffect(() => {
    if (!ready) return
    if (!isAuthenticated || !user) return
    if (!GUEST_ONLY.includes(pathname ?? '')) return
    const dest = getSafeReturnTo() || ROLE_HOME[user.role] || '/beneficiaire'
    router.replace(dest)
  }, [ready, isAuthenticated, user, pathname, router])

  return <>{children}</>
}
