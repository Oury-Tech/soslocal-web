'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wrench, Star, Zap, ArrowRight } from 'lucide-react'
import { DynamicMap } from '@/components/maps/dynamic-map'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-20 lg:pt-20 lg:pb-28">
      {/* Fond subtil */}
      <div
        className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full blur-3xl opacity-30 dark:opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,55,233,0.08) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="container-app relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT — Texte */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge disponibilité */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-medium mb-7"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Artisans disponibles maintenant à Conakry
            </motion.div>

            {/* Titre — style SalesRadar avec icône inline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[3.25rem] xl:text-[3.75rem] font-extrabold leading-[1.1] tracking-tight"
            >
              Trouvez{' '}
              <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-500 mx-1 align-middle flex-shrink-0 shadow-lg">
                <Wrench className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </span>
              {' '}votre artisan
              <br />
              <span className="gradient-text">certifié</span>, en quelques minutes.
            </motion.h1>

            {/* Sous-titre court */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-lg text-[rgb(var(--muted-fg))] leading-relaxed max-w-lg"
            >
              Plomberie, électricité, mécanique — connectez-vous aux artisans
              les plus proches, suivez leur arrivée en temps réel et payez via Mobile Money.
            </motion.p>

            {/* Boutons CTA */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/register">
                <span className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-full bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/25 cursor-pointer">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link href="#how-it-works">
                <span className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3.5 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] font-semibold text-sm hover:bg-[rgb(var(--muted))] transition-colors cursor-pointer">
                  Voir comment ça marche
                </span>
              </Link>
            </motion.div>

            {/* Indicateurs de confiance */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 flex flex-wrap items-center gap-6 text-sm text-[rgb(var(--muted-fg))]"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D'].map((l) => (
                    <div
                      key={l}
                      className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 border-2 border-[rgb(var(--bg))] flex items-center justify-center text-white text-[10px] font-bold"
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <span>
                  <strong className="text-[rgb(var(--fg))]">130+</strong> artisans certifiés
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1"><strong className="text-[rgb(var(--fg))]">4.8/5</strong> satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span><strong className="text-[rgb(var(--fg))]">9 centres</strong> à Conakry</span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT — Mockup de l'app */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Ombre légère derrière la carte */}
            <div className="absolute inset-0 -m-4 rounded-3xl opacity-10 dark:opacity-5 pointer-events-none bg-brand-500 blur-2xl" aria-hidden />

            {/* Carte principale — style SalesRadar */}
            <div className="relative bg-[rgb(var(--card))] rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden p-5 lg:p-6 animate-float">

              {/* En-tête de l'app mockup */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[rgb(var(--border))]">
                <div className="h-8 w-8 rounded-xl bg-brand-500 flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-sm text-[rgb(var(--fg))]">SOSLocal</span>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  En ligne
                </div>
              </div>

              {/* Vraie carte Leaflet — Conakry */}
              <div className="relative h-52 sm:h-64 rounded-2xl overflow-hidden">
                <DynamicMap
                  center={[9.5370, -13.6785]}
                  zoom={13}
                  className="h-full w-full"
                />
              </div>

              {/* Carte artisan */}
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
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold flex-shrink-0">
                    <Zap className="h-3 w-3" />
                    8 min
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Carte flottante — Confirmation */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute -right-3 top-10 sm:-right-10 sm:top-16 bg-[rgb(var(--card))] rounded-2xl p-3 shadow-xl border border-[rgb(var(--border))] animate-float hidden sm:block"
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

            {/* Carte flottante — Délai */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="absolute -left-3 bottom-14 sm:-left-10 bg-[rgb(var(--card))] rounded-2xl p-3.5 shadow-xl border border-[rgb(var(--border))] hidden sm:block"
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
