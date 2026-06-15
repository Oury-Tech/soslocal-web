'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useServices } from '@/hooks/queries/useServices'
import { ServiceCard } from '@/components/marketplace/ServiceCard'
import { Carousel } from '@/components/ui/Carousel'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Carrousel des services les plus demandés (données réelles + photos). Tri :
 * mis en avant, puis popularité, puis volume de demandes.
 */
export function FeaturedServices() {
  const { data: services = [], isLoading } = useServices()

  const featured = [...services]
    .filter((s) => s.is_active !== false)
    .sort(
      (a, b) =>
        (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) ||
        (b.popularity_score ?? 0) - (a.popularity_score ?? 0) ||
        (b.total_requests ?? 0) - (a.total_requests ?? 0),
    )
    .slice(0, 10)

  if (!isLoading && featured.length === 0) return null

  return (
    <section className="py-16 lg:py-24">
      <div className="container-app">
        {/* En-tête */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-300 uppercase tracking-[0.2em] mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Les plus demandés
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--fg))]">
              Services prêts à intervenir
            </h2>
          </div>
          <Link
            href="/services"
            className="group hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300 whitespace-nowrap hover:gap-2.5 transition-all"
          >
            Tout voir
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Carrousel */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-[17rem] flex-shrink-0 rounded-2xl" />
            ))}
          </div>
        ) : (
          <Carousel itemClassName="w-[16rem] sm:w-[17rem]" ariaLabel="Services les plus demandés">
            {featured.map((s) => (
              <ServiceCard key={s.id} service={s} withPhoto className="h-full w-full" />
            ))}
          </Carousel>
        )}
      </div>
    </section>
  )
}
