'use client'

import Link from 'next/link'
import { Star, ShieldCheck, MapPin, Briefcase } from 'lucide-react'
import { Avatar } from '@/components/ui/badge'
import { useIsUserOnline } from '@/stores/ws.store'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { Technician } from '@/types'

function distanceLabel(km?: number): string | null {
  if (km == null) return null
  if (km < 1) return 'À deux pas'
  if (km < 3) return 'Tout près'
  if (km < 7) return 'À proximité'
  if (km < 15) return 'Près de vous'
  return 'Dans votre zone'
}

/**
 * Carte artisan publique (navigable sans connexion). Cliquer ouvre le profil
 * public ; le contact réel reste protégé par l'authentification (sur le profil).
 * La pastille « en ligne » se met à jour en temps réel via le store WS.
 */
export function PublicTechnicianCard({
  tech,
  className,
}: {
  tech: Technician & { distance_km?: number }
  className?: string
}) {
  const liveOnline = useIsUserOnline(tech.id)
  const online = liveOnline ?? tech.is_online
  const dist = distanceLabel(tech.distance_km)

  return (
    <Link
      href={`/artisans/${tech.id}`}
      className={cn(
        'group flex flex-col gap-3 p-5 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] transition-all duration-200 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-soft hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {tech.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tech.avatar_url} alt={tech.name} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <Avatar fallback={getInitials(tech.name)} size="lg" />
          )}
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-[rgb(var(--card))] transition-colors',
              online ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600',
            )}
            aria-label={online ? 'En ligne' : 'Hors ligne'}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[rgb(var(--fg))] truncate">{tech.name}</span>
            {tech.is_verified && <ShieldCheck className="h-4 w-4 text-brand-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-[rgb(var(--muted-fg))] truncate flex items-center gap-1 mt-0.5">
            <Briefcase className="h-3 w-3" />
            {tech.profession || 'Artisan'}
          </p>
          <div className="flex items-center gap-2 text-xs mt-1.5">
            <span className="inline-flex items-center gap-0.5 font-semibold text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              {tech.rating > 0 ? tech.rating.toFixed(1) : '—'}
            </span>
            <span className="text-[rgb(var(--muted-fg))]">
              {tech.total_reviews} avis · {tech.total_jobs_completed} missions
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-[rgb(var(--border))]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {dist && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgb(var(--muted))] text-[rgb(var(--muted-fg))]">
              <MapPin className="h-2.5 w-2.5" />
              {dist}
            </span>
          )}
          <span
            className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full',
              tech.is_available
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-fg))]',
            )}
          >
            {tech.is_available ? 'Disponible' : 'Occupé'}
          </span>
        </div>
        {tech.hourly_rate ? (
          <span className="text-sm font-bold text-accent-600 dark:text-accent-300 flex-shrink-0">
            {formatGNF(tech.hourly_rate)}<span className="text-xs font-medium text-[rgb(var(--muted-fg))]">/h</span>
          </span>
        ) : null}
      </div>
    </Link>
  )
}
