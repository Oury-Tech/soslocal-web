'use client'

import Link from 'next/link'
import { Star, Clock, ArrowRight, Flame, TrendingUp } from 'lucide-react'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { formatGNF } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { Service } from '@/types'

function formatDuration(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null
  if (minutes < 60) return `~${minutes} min`
  const h = Math.round((minutes / 60) * 10) / 10
  return `~${h} h`
}

/**
 * Carte service « vendeuse » : icône, prix « à partir de », durée estimée,
 * badges (populaire / urgence 24/7) et note moyenne. Cliquer ouvre la page
 * détail du service avec ses artisans.
 */
export function ServiceCard({ service, className }: { service: Service; className?: string }) {
  const from = service.estimated_price_min
  const duration = formatDuration(service.average_duration)
  const popular = service.is_featured || (service.total_requests ?? 0) >= 20

  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        'group relative flex flex-col gap-3 p-5 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] transition-all duration-200 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-soft hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Badges (haut droite) */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
        {service.is_emergency && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <Flame className="h-3 w-3" />
            Urgence 24/7
          </span>
        )}
        {popular && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300">
            <TrendingUp className="h-3 w-3" />
            Populaire
          </span>
        )}
      </div>

      <span className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
        <ServiceIcon slug={service.slug} name={service.name} className="h-6 w-6" />
      </span>

      <div>
        <h3 className="font-bold text-[rgb(var(--fg))] leading-tight">{service.name}</h3>
        <p className="text-xs text-[rgb(var(--muted-fg))] mt-0.5 line-clamp-2">
          {service.short_description || service.description || service.category}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-3 flex-wrap text-xs text-[rgb(var(--muted-fg))]">
        {typeof service.average_rating === 'number' && service.average_rating > 0 && (
          <span className="inline-flex items-center gap-0.5 font-semibold text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            {service.average_rating.toFixed(1)}
          </span>
        )}
        {duration && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {duration}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between pt-2 border-t border-[rgb(var(--border))]">
        <div>
          {from != null ? (
            <>
              <span className="block text-[10px] uppercase tracking-wide text-[rgb(var(--muted-fg))]">À partir de</span>
              <span className="text-lg font-extrabold text-[rgb(var(--fg))] leading-none">{formatGNF(from)}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-[rgb(var(--muted-fg))]">Sur devis</span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300 group-hover:gap-2 transition-all">
          Voir
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
