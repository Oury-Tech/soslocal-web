'use client'

import Link from 'next/link'
import { ArrowRight, Flame } from 'lucide-react'
import { useServices } from '@/hooks/queries/useServices'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { Carousel } from '@/components/ui/Carousel'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Carrousel « parcourir par métier » : tuiles compactes à icône, point d'entrée
 * visuel rapide vers chaque service. Données réelles (useServices).
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

  if (!isLoading && items.length === 0) return null

  return (
    <section className="py-12 lg:py-16 bg-[rgb(var(--card))] border-y border-[rgb(var(--border))]">
      <div className="container-app">
        <div className="flex items-end justify-between gap-4 mb-7">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[rgb(var(--fg))]">
            Que recherchez-vous&nbsp;?
          </h2>
          <Link
            href="/services"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300 whitespace-nowrap hover:gap-2.5 transition-all"
          >
            Tout voir
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-32 flex-shrink-0 rounded-2xl" />
            ))}
          </div>
        ) : (
          <Carousel itemClassName="w-32 sm:w-36" ariaLabel="Métiers disponibles">
            {items.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="group relative flex flex-col items-center justify-center gap-2.5 h-full w-full py-5 px-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-center transition-all duration-200 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-soft hover:-translate-y-1"
              >
                {s.is_emergency && (
                  <span
                    className="absolute top-2 right-2 inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    title="Service d'urgence 24/7"
                  >
                    <Flame className="h-2.5 w-2.5" />
                    24/7
                  </span>
                )}
                <span className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center transition-colors group-hover:bg-brand-500 group-hover:text-white">
                  <ServiceIcon slug={s.slug} name={s.name} className="h-6 w-6" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[rgb(var(--fg))] leading-tight line-clamp-2">
                  {s.name}
                </span>
              </Link>
            ))}
          </Carousel>
        )}
      </div>
    </section>
  )
}
