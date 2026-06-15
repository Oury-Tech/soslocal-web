'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils/cn'

/**
 * Construit le lien « entrer en contact ». Parcourir le catalogue est libre,
 * mais contacter un artisan exige une connexion : si l'utilisateur n'est pas
 * authentifié, on l'envoie vers /login avec un returnTo qui le ramènera
 * directement sur le formulaire de demande pré-rempli (artisan + service).
 */
export function buildContactHref(opts: {
  authenticated: boolean
  technicianId?: number
  serviceId?: number
}): string {
  const params = new URLSearchParams()
  if (opts.technicianId != null) params.set('technician', String(opts.technicianId))
  if (opts.serviceId != null) params.set('service', String(opts.serviceId))
  const qs = params.toString()
  const target = `/beneficiaire/nouvelle${qs ? `?${qs}` : ''}`
  return opts.authenticated ? target : `/login?returnTo=${encodeURIComponent(target)}`
}

interface Props {
  technicianId?: number
  serviceId?: number
  label?: string
  className?: string
  variant?: 'primary' | 'outline'
  fullWidth?: boolean
  withIcon?: boolean
}

/**
 * Bouton réutilisable « Contacter l'artisan » avec garde d'authentification.
 * Le rendu attend le montage client pour lire l'état d'auth persistant
 * (évite tout décalage d'hydratation).
 */
export function ContactArtisanButton({
  technicianId,
  serviceId,
  label = 'Entrer en contact',
  className,
  variant = 'primary',
  fullWidth = false,
  withIcon = true,
}: Props) {
  const [mounted, setMounted] = useState(false)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  useEffect(() => setMounted(true), [])

  const href = buildContactHref({
    authenticated: mounted && isAuthenticated,
    technicianId,
    serviceId,
  })

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5',
        variant === 'primary'
          ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-soft'
          : 'border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] hover:bg-[rgb(var(--muted))]',
        fullWidth && 'w-full',
        className,
      )}
    >
      {withIcon && <MessageCircle className="h-4 w-4" />}
      {label}
    </Link>
  )
}
