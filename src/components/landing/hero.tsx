'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Zap, ArrowRight, ShieldCheck } from 'lucide-react'
import { DynamicMap } from '@/components/maps/dynamic-map'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-28">
      {/* Décor d'ambiance */}
      <div className="absolute inset-0 -z-10 mesh-bg" aria-hidden />
      <div
        className="absolute -z-10 top-[-6rem] right-[-6rem] h-72 w-72 rounded-full bg-brand-300/20 dark:bg-brand-500/10 blur-3xl animate-blob"
        aria-hidden
      />
      <div
        className="absolute -z-10 bottom-[-4rem] left-[-4rem] h-64 w-64 rounded-full bg-brand-200/30 dark:bg-brand-700/10 blur-3xl animate-blob animation-delay-2000"
        aria-hidden
      />

      <div className="container-app relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT — Texte */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            {/* Badge disponibilité */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-medium w-fit shadow-soft">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Artisans disponibles à Conakry
            </div>

            {/* Titre */}
            <div>
              <h1 className="text-balance text-[2.75rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4.25rem] font-extrabold leading-[1.05] tracking-tight">
                Trouvez votre{' '}
                <span className="gradient-text-animated">artisan certifié</span>{' '}
                en quelques minutes.
              </h1>
              <p className="mt-6 text-lg text-[rgb(var(--muted-fg))] leading-relaxed max-w-md text-balance">
                Plomberie, électricité, mécanique — connectez-vous aux artisans les plus proches et payez via Mobile Money.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <span className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all duration-200 shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 cursor-pointer">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link href="#how-it-works">
                <span className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3.5 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] font-semibold text-sm hover:bg-[rgb(var(--muted))] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  Comment ça marche
                </span>
              </Link>
            </div>

            {/* Indicateurs de confiance */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[rgb(var(--muted-fg))] pt-5 mt-1 border-t border-[rgb(var(--border))]">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C'].map((l) => (
                    <div
                      key={l}
                      className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 border-2 border-[rgb(var(--bg))] flex items-center justify-center text-white text-[10px] font-bold"
                    >
                      {l}
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
          </motion.div>

          {/* RIGHT — App mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden sm:block"
          >
            {/* Carte principale */}
            <div className="relative bg-[rgb(var(--card))] rounded-3xl ring-1 ring-[rgb(var(--border))] shadow-2xl shadow-brand-500/10 dark:shadow-black/50 overflow-hidden p-5 lg:p-6 animate-float">

              {/* En-tête */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[rgb(var(--border))]">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-bold text-sm text-[rgb(var(--fg))]">SOSLocal</span>
                  <span className="text-xs text-[rgb(var(--muted-fg))]">· Conakry</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  En ligne
                </div>
              </div>

              {/* Carte Leaflet */}
              <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden">
                <DynamicMap
                  center={[9.5370, -13.6785]}
                  zoom={13}
                  className="h-full w-full"
                />
              </div>

              {/* Artisan card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="mt-4 p-4 rounded-2xl bg-[rgb(var(--muted))] border border-[rgb(var(--border))]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    MK
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[rgb(var(--fg))] text-sm truncate">Mohamed Keita</div>
                    <div className="text-xs text-[rgb(var(--muted-fg))] flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      4.9 · Plombier · 1.2 km
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold flex-shrink-0">
                    <Zap className="h-3 w-3" />
                    8 min
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating badge — Confirmation */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute -right-4 top-12 bg-[rgb(var(--card))] rounded-2xl p-3 shadow-xl border border-[rgb(var(--border))] animate-float"
              style={{ animationDelay: '1s' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[rgb(var(--fg))]">Mission acceptée !</div>
                  <div className="text-[10px] text-[rgb(var(--muted-fg))]">Arrivée dans ~8 min</div>
                </div>
              </div>
            </motion.div>

            {/* Floating badge — Délai */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="absolute -left-4 bottom-12 bg-[rgb(var(--card))] rounded-2xl p-3.5 shadow-xl border border-[rgb(var(--border))]"
            >
              <div className="text-[10px] text-[rgb(var(--muted-fg))] mb-0.5">Délai moyen</div>
              <div className="text-xl font-extrabold gradient-text">~30s</div>
              <div className="text-[10px] text-green-600 dark:text-green-400 font-medium">↓ 95% vs téléphone</div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
