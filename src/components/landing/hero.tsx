'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, ArrowRight, ShieldCheck, Wrench, Zap, Car } from 'lucide-react'
import { SmartSearch } from '@/components/marketplace/SmartSearch'
import { MapShowcase } from '@/components/landing/map-showcase'

const POPULAR_SEARCHES = [
  { label: 'Plomberie', q: 'plomberie' },
  { label: 'Électricité', q: 'électricité' },
  { label: 'Climatisation', q: 'climatisation' },
  { label: 'Mécanique', q: 'mécanique' },
]

const COMMUNES = ['Kaloum', 'Dixinn', 'Matam', 'Ratoma', 'Matoto']

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Halo décoratif plat, très discret (pas de dégradé) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-brand-50/60 dark:bg-brand-900/10"
        aria-hidden
      />

      <div className="container-app relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Colonne texte */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Titre — noir massif + une ligne d'accent bleue */}
            <h1 className="text-balance text-[2.5rem] sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.05] tracking-tight text-[rgb(var(--fg))]">
              Un artisan certifié, suivi en temps réel,{' '}
              <span className="text-brand-500">au même endroit.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-[rgb(var(--muted-fg))] leading-relaxed text-balance">
              Plomberie, électricité, mécanique — trouvez l&apos;artisan certifié le
              plus proche à Conakry, suivez son arrivée et payez via Mobile Money.
            </p>

            {/* Recherche intelligente — l'action principale */}
            <div className="mt-8 w-full max-w-xl">
              <SmartSearch size="hero" />

              <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm">
                <span className="text-[rgb(var(--muted-fg))] font-medium">Populaire&nbsp;:</span>
                {POPULAR_SEARCHES.map((s) => (
                  <Link
                    key={s.q}
                    href={`/services?q=${encodeURIComponent(s.q)}`}
                    className="px-3 py-1.5 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] font-medium hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Accès rapides */}
            <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
              <Link href="/services">
                <span className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all duration-200 shadow-soft hover:-translate-y-0.5 cursor-pointer">
                  Parcourir les services
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link href="/artisans">
                <span className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] font-semibold text-sm hover:bg-[rgb(var(--muted))] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  Voir les artisans
                </span>
              </Link>
            </div>

            {/* Indicateurs de confiance */}
            <div className="mt-9 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-[rgb(var(--muted-fg))]">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    { Icon: Wrench, bg: 'bg-brand-500' },
                    { Icon: Zap, bg: 'bg-accent-500' },
                    { Icon: Car, bg: 'bg-brand-600' },
                  ].map(({ Icon, bg }, i) => (
                    <div
                      key={i}
                      className={`h-7 w-7 rounded-full ${bg} border-2 border-[rgb(var(--bg))] flex items-center justify-center text-white`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </div>
                  ))}
                </div>
                <span><strong className="text-[rgb(var(--fg))]">130+</strong> artisans</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1"><strong className="text-[rgb(var(--fg))]">4.8/5</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-500" />
                <span>Artisans <strong className="text-[rgb(var(--fg))]">vérifiés</strong></span>
              </div>
            </div>

            {/* Couverture — communes de Conakry */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1.5 text-xs text-[rgb(var(--muted-fg))]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[rgb(var(--fg))]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Disponible à Conakry
              </span>
              <span aria-hidden className="text-[rgb(var(--border))]">·</span>
              {COMMUNES.map((c, i) => (
                <span key={c} className="inline-flex items-center gap-2">
                  {c}
                  {i < COMMUNES.length - 1 && (
                    <span aria-hidden className="text-[rgb(var(--border))]">·</span>
                  )}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Colonne visuelle — vitrine carte temps réel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block lg:pl-4"
          >
            <MapShowcase />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
