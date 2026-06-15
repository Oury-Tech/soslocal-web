'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useServices } from '@/hooks/queries/useServices'
import { ServiceCard } from '@/components/marketplace/ServiceCard'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Vitrine des services les plus demandés sur la page d'accueil. Reprend les
 * données réelles du catalogue (useServices) et la carte « vendeuse »
 * ServiceCard. Tri : mis en avant, puis popularité, puis volume de demandes.
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
    .slice(0, 8)

  if (!isLoading && featured.length === 0) return null

  return (
    <section className="py-24 lg:py-32">
      <div className="container-app">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-12"
        >
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-300 uppercase tracking-[0.2em] mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Les plus demandés
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.625rem] font-extrabold leading-[1.15] tracking-tight text-[rgb(var(--fg))] text-balance">
              Des services prêts à{' '}
              <span className="text-brand-500">intervenir près de chez vous.</span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[rgb(var(--muted-fg))] leading-relaxed text-balance">
              Parcourez librement le catalogue, comparez les tarifs et découvrez les artisans
              certifiés disponibles. La mise en relation se fait après connexion.
            </p>
          </div>

          <Link
            href="/services"
            className="group inline-flex items-center gap-2 self-start sm:self-auto px-5 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] font-semibold text-sm hover:bg-[rgb(var(--muted))] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
          >
            Tous les services
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Grille */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: (idx % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <ServiceCard service={s} className="h-full" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
