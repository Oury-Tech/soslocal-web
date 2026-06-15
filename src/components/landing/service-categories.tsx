'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Flame } from 'lucide-react'
import { useServices } from '@/hooks/queries/useServices'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Grille « parcourir par métier » façon vitrine retail : tuiles compactes à
 * icône, point d'entrée visuel rapide vers chaque service. Données réelles
 * (useServices), ouverture directe sur la fiche service.
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
    .slice(0, 12)

  if (!isLoading && items.length === 0) return null

  return (
    <section className="py-14 lg:py-20 bg-[rgb(var(--card))] border-y border-[rgb(var(--border))]">
      <div className="container-app">
        {/* En-tête */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[rgb(var(--fg))]">
              Que recherchez-vous&nbsp;?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[rgb(var(--muted-fg))]">
              Choisissez un métier pour voir les artisans certifiés disponibles près de vous.
            </p>
          </div>
          <Link
            href="/services"
            className="group hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300 whitespace-nowrap hover:gap-2.5 transition-all"
          >
            Tout voir
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Tuiles */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
            {items.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (idx % 6) * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/services/${s.slug}`}
                  className="group relative flex flex-col items-center justify-center gap-2.5 h-full py-5 px-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-center transition-all duration-200 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-soft hover:-translate-y-1"
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
              </motion.div>
            ))}
          </div>
        )}

        <Link
          href="/services"
          className="sm:hidden mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-sm font-semibold text-brand-600 dark:text-brand-300"
        >
          Tout voir
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
