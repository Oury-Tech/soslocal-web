'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, ArrowRight, ShieldCheck, MapPin, Navigation, Check, TrendingDown } from 'lucide-react'
import { SmartSearch } from '@/components/marketplace/SmartSearch'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      <div className="container-app relative">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">

          {/* LEFT — Texte */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6"
          >
            {/* Titre — style Springfield : noir massif + une ligne d'accent bleue */}
            <h1 className="text-balance text-[2.6rem] sm:text-5xl lg:text-[3.4rem] xl:text-[3.9rem] font-extrabold leading-[1.04] tracking-tight text-[rgb(var(--fg))]">
              Un artisan certifié, suivi en temps réel,{' '}
              <span className="text-brand-500">au même endroit.</span>
            </h1>

            <p className="text-lg text-[rgb(var(--muted-fg))] leading-relaxed max-w-lg text-balance">
              Plomberie, électricité, mécanique — trouvez l'artisan certifié le plus
              proche à Conakry, suivez son arrivée sur la carte et payez via Mobile Money.
            </p>

            {/* Recherche intelligente — point d'entrée principal */}
            <div className="pt-1 max-w-xl">
              <SmartSearch size="hero" />
            </div>

            {/* Accès rapides */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/services">
                <span className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all duration-200 shadow-soft hover:-translate-y-0.5 cursor-pointer">
                  Parcourir les services
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link href="/artisans">
                <span className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-[rgb(var(--fg))] font-semibold text-sm hover:bg-[rgb(var(--muted))] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  Voir les artisans
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
                      className="h-7 w-7 rounded-full bg-brand-500 border-2 border-[rgb(var(--bg))] flex items-center justify-center text-white text-[10px] font-bold"
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

          {/* RIGHT — Carte designée (mockup de suivi en temps réel) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* Plaque décorative plate */}
            <div
              className="absolute -inset-x-4 -bottom-6 top-10 -z-10 rounded-[2rem] bg-accent-100 dark:bg-accent-900/30 rotate-2"
              aria-hidden
            />

            {/* Carte principale */}
            <div className="relative bg-[rgb(var(--card))] rounded-3xl ring-1 ring-[rgb(var(--border))] shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden p-4">
              {/* En-tête */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="flex items-center gap-2 flex-1">
                  <MapPin className="h-4 w-4 text-brand-500" aria-hidden />
                  <span className="font-bold text-sm text-[rgb(var(--fg))]">SOSLocal</span>
                  <span className="text-xs text-[rgb(var(--muted-fg))]">· Conakry</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  En ligne
                </div>
              </div>

              {/* Carte stylisée */}
              <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-[#E9EEF4] dark:bg-[#0e1726]">
                <svg
                  viewBox="0 0 600 380"
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid slice"
                  role="img"
                  aria-label="Carte de Conakry montrant le trajet de l'artisan en temps réel"
                >
                  {/* Fond */}
                  <rect width="600" height="380" className="fill-[#E9EEF4] dark:fill-[#0e1726]" />

                  {/* Mer (presqu'île de Conakry) */}
                  <path d="M0,300 Q90,318 132,380 L0,380 Z" className="fill-[#CFE6EF] dark:fill-[#102a33]" />
                  <path d="M600,0 L600,84 Q512,58 470,0 Z" className="fill-[#CFE6EF] dark:fill-[#102a33]" />

                  {/* Parc */}
                  <rect x="356" y="252" width="126" height="86" rx="16" className="fill-[#DCE8DA] dark:fill-[#16241c]" />

                  {/* Blocs / quartiers */}
                  <g className="fill-[#DBE2EC] dark:fill-[#16202f]">
                    <rect x="40" y="36" width="72" height="50" rx="9" />
                    <rect x="152" y="92" width="62" height="56" rx="9" />
                    <rect x="250" y="38" width="82" height="46" rx="9" />
                    <rect x="430" y="58" width="72" height="56" rx="9" />
                    <rect x="58" y="178" width="64" height="62" rx="9" />
                    <rect x="248" y="270" width="74" height="56" rx="9" />
                    <rect x="500" y="168" width="74" height="58" rx="9" />
                    <rect x="158" y="300" width="60" height="50" rx="9" />
                  </g>

                  {/* Routes */}
                  <g className="stroke-white dark:stroke-[#223149]" strokeLinecap="round" fill="none">
                    <line x1="-20" y1="122" x2="620" y2="122" strokeWidth="10" />
                    <line x1="-20" y1="232" x2="620" y2="232" strokeWidth="10" />
                    <line x1="132" y1="-20" x2="132" y2="400" strokeWidth="10" />
                    <line x1="340" y1="-20" x2="340" y2="400" strokeWidth="10" />
                    <line x1="480" y1="-20" x2="480" y2="400" strokeWidth="10" />
                    <line x1="-20" y1="338" x2="620" y2="70" strokeWidth="14" />
                  </g>

                  {/* Trajet — casing blanc + ligne de marque */}
                  <path
                    d="M150,300 C 240,300 252,210 332,205 S 432,158 455,120"
                    fill="none"
                    className="stroke-white dark:stroke-[#0e1726]"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M150,300 C 240,300 252,210 332,205 S 432,158 455,120"
                    fill="none"
                    stroke="#0078FF"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="0.1 18"
                  >
                    <animate attributeName="stroke-dashoffset" values="0;-18" dur="0.9s" repeatCount="indefinite" />
                  </path>

                  {/* Point de départ (vous) */}
                  <circle cx="150" cy="300" r="11" fill="#FFFFFF" />
                  <circle cx="150" cy="300" r="6" fill="#0078FF" />

                  {/* Marqueur artisan — pastille animée */}
                  <circle cx="455" cy="120" r="20" fill="#1ABCCC" opacity="0.3">
                    <animate attributeName="r" values="20;40;20" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="455" cy="120" r="23" fill="#FFFFFF" />
                  <circle cx="455" cy="120" r="19" fill="#0078FF" />
                  <text x="455" y="126" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700" fontFamily="inherit">MK</text>
                </svg>

                {/* Puce « Mission acceptée » (haut gauche) */}
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-[rgb(var(--card))] rounded-full pl-1.5 pr-3 py-1 shadow-lg ring-1 ring-[rgb(var(--border))]">
                  <span className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold text-[rgb(var(--fg))]">Mission acceptée</span>
                </div>

                {/* Puce ETA (haut droite) */}
                <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-[rgb(var(--card))] rounded-full pl-1.5 pr-3 py-1 shadow-lg ring-1 ring-[rgb(var(--border))]">
                  <span className="h-5 w-5 rounded-full bg-accent-500 flex items-center justify-center">
                    <Navigation className="h-3 w-3 text-white" aria-hidden />
                  </span>
                  <span className="text-xs font-medium text-[rgb(var(--fg))]">Arrivée <strong>~8 min</strong></span>
                </div>
              </div>

              {/* Ligne artisan */}
              <div className="mt-3 flex items-center gap-3 px-1">
                <div className="h-11 w-11 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" aria-hidden>
                  MK
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[rgb(var(--fg))] text-sm truncate">Mohamed Keïta</div>
                  <div className="text-xs text-[rgb(var(--muted-fg))] flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    4.9 · Plombier · 1,2 km
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/40 px-2.5 py-1 rounded-full flex-shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                  En route
                </span>
              </div>
            </div>

            {/* Badge superposé — délai moyen (bas gauche) */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -left-5 bottom-24 bg-[rgb(var(--card))] rounded-2xl p-3.5 shadow-xl ring-1 ring-[rgb(var(--border))]"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-accent-500 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="h-4 w-4 text-white" aria-hidden />
                </div>
                <div>
                  <div className="text-[10px] text-[rgb(var(--muted-fg))]">Délai moyen</div>
                  <div className="text-lg font-extrabold text-[rgb(var(--fg))] leading-none">~30s</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
