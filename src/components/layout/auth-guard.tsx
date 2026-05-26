'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
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
  if (role === 'operator' || role === 'admin') return !pathname.startsWith('/beneficiaire') && !pathname.startsWith('/artisan')
  return true
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
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

    if (user?.role === 'technician' && technicianApproved === false) {
      router.replace('/artisan/en-attente')
      return
    }

    // Role-based route protection
    if (user && !isRouteAllowed(user.role, pathname)) {
      router.replace(getRoleHome(user.role))
    }
  }, [isAuthenticated, user, technicianApproved, pathname, router])

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

  // Block render while redirecting for wrong role
  if (!isRouteAllowed(user.role, pathname)) return null

  return <>{children}</>
}
