'use client'

import Link from 'next/link'
import { ArrowRight, Flame } from 'lucide-react'
import { useServices } from '@/hooks/queries/useServices'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Grille « parcourir par métier » : grandes tuiles à icône, le bloc signature
 * d'une marketplace de services. Données réelles (useServices).
 */
export function ServiceCategories() {
  const { data: services = [], isLoading } = useServices()

  const items = [...services]
    .filter((s) => s.is_active !== false)
    .sort(
      (a, b) =>
        (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) ||
        (b.popularity_score ?? 0) - (a.popularity_score ?? 0),
    )
    .slice(0, 8)

  if (!isLoading && items.length === 0) return null

  return (
    <section className="py-16 lg:py-20 bg-[rgb(var(--card))] border-y border-[rgb(var(--border))]">
      <div className="container-app">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
              Nos services
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--fg))]">
              Que recherchez-vous&nbsp;?
            </h2>
          </div>
          <Link
            href="/services"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300 whitespace-nowrap hover:gap-2.5 transition-all"
          >
            Tout voir
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="group relative flex flex-col gap-3 h-full p-5 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] transition-all duration-200 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-soft hover:-translate-y-1"
              >
                {s.is_emergency && (
                  <span
                    className="absolute top-3 right-3 inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    title="Service d'urgence 24/7"
                  >
                    <Flame className="h-2.5 w-2.5" />
                    24/7
                  </span>
                )}

                <span className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center transition-colors group-hover:bg-brand-500 group-hover:text-white">
                  <ServiceIcon slug={s.slug} name={s.name} className="h-6 w-6" />
                </span>

                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[rgb(var(--fg))] leading-tight">
                    {s.name}
                  </h3>
                  {s.short_description && (
                    <p className="mt-1 text-xs text-[rgb(var(--muted-fg))] leading-snug line-clamp-2">
                      {s.short_description}
                    </p>
                  )}
                </div>

                <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-[rgb(var(--muted-fg))] group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                  Voir les artisans
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
