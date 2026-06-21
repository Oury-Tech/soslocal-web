'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useAllTechnicians } from '@/hooks/queries/useTechnicians'
import { PublicTechnicianCard } from '@/components/marketplace/PublicTechnicianCard'
import { SectionHeader } from '@/components/landing/section-header'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Bloc « artisans vérifiés en vedette » : preuve humaine forte sur la landing.
 * Données 100 % réelles (useAllTechnicians) — classées par note puis par
 * nombre d'avis. Masqué tant qu'aucun artisan réel n'est disponible.
 */
export function FeaturedArtisans() {
  const { data: technicians = [], isLoading } = useAllTechnicians()

  const featured = [...technicians]
    .sort(
      (a, b) =>
        (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0) ||
        (b.rating ?? 0) - (a.rating ?? 0) ||
        (b.total_reviews ?? 0) - (a.total_reviews ?? 0),
    )
    .slice(0, 4)

  if (!isLoading && featured.length === 0) return null

  return (
    <section id="artisans" className="py-24 lg:py-32 scroll-mt-20">
      <div className="container-app">
        <SectionHeader
          eyebrow="Des artisans, pas des inconnus"
          title={<>Des professionnels{' '}<span className="text-brand-500">vérifiés près de vous</span></>}
          description="Chaque artisan est validé par notre équipe. Découvrez quelques profils actifs à Conakry."
          className="mb-14 lg:mb-16"
        />

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((tech) => (
              <PublicTechnicianCard key={tech.id} tech={tech} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/artisans"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] font-semibold text-sm hover:bg-[rgb(var(--muted))] hover:-translate-y-0.5 transition-all duration-200"
          >
            Voir tous les artisans
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
