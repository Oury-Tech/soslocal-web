'use client'

import { motion } from 'framer-motion'
import { Smartphone, Search, Wrench, Star } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: Smartphone,
    title: 'Décrivez votre besoin',
    description: 'Indiquez le type de service, ajoutez une photo et confirmez votre position GPS.',
    duration: '~30 secondes',
  },
  {
    num: '02',
    icon: Search,
    title: 'L\'artisan est trouvé',
    description: 'L\'algorithme identifie les meilleurs artisans certifiés à proximité et les notifie.',
    duration: '< 5 secondes',
  },
  {
    num: '03',
    icon: Wrench,
    title: 'Suivi en temps réel',
    description: 'Suivez l\'arrivée sur la carte et communiquez via le chat intégré.',
    duration: 'Selon mission',
  },
  {
    num: '04',
    icon: Star,
    title: 'Payez et évaluez',
    description: 'Réglez via Mobile Money et notez l\'artisan pour aider la communauté.',
    duration: '~1 minute',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[rgb(var(--card))]">
      <div className="container-app">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block text-sm font-semibold text-brand-500 uppercase tracking-widest mb-3">
            En 4 étapes simples
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.625rem] font-extrabold leading-tight tracking-tight text-[rgb(var(--fg))]">
            Votre dépannage,{' '}
            <span className="gradient-text">en quelques minutes</span>
          </h2>
          <p className="mt-4 text-base text-[rgb(var(--muted-fg))]">
            Un processus simple, pensé pour la rapidité et la transparence.
          </p>
        </motion.div>

        {/* Étapes */}
        <div className="relative">
          {/* Ligne de connexion desktop */}
          <div
            className="hidden lg:block absolute top-[3.25rem] left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px"
            style={{ background: 'linear-gradient(to right, #3B37E9, #7C3AED, #00A99D, #3B37E9)' }}
            aria-hidden
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.12 }}
              >
                <div className="relative h-full p-6 rounded-2xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  {/* Numéro fond */}
                  <span
                    className="absolute -top-2 -right-1 text-6xl font-extrabold leading-none select-none pointer-events-none"
                    style={{ color: 'rgba(59,55,233,0.07)' }}
                    aria-hidden
                  >
                    {step.num}
                  </span>

                  {/* Icône */}
                  <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md shadow-brand-500/30 mb-4">
                    <step.icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold text-base text-[rgb(var(--fg))] mb-2">{step.title}</h3>
                  <p className="text-sm text-[rgb(var(--muted-fg))] leading-relaxed mb-4">
                    {step.description}
                  </p>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/40 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
                    {step.duration}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
