'use client'

import { motion } from 'framer-motion'
import { Smartphone, Search, Wrench, Star, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const STEPS = [
  {
    num: '01',
    icon: Smartphone,
    title: 'Décrivez votre besoin',
    description: 'En quelques tapes, indiquez le type de service (plomberie, électricité, mécanique…), ajoutez des photos et confirmez votre position GPS.',
    duration: '~30 secondes',
  },
  {
    num: '02',
    icon: Search,
    title: 'Le système trouve votre artisan',
    description: 'Notre algorithme PostGIS identifie les artisans certifiés à proximité, calcule un score multicritères et notifie les 3 meilleurs candidats.',
    duration: '< 5 secondes',
  },
  {
    num: '03',
    icon: Wrench,
    title: 'L\'artisan intervient',
    description: 'Suivez l\'arrivée de votre artisan en temps réel sur la carte. Communiquez par chat intégré et bénéficiez d\'une intervention rapide et professionnelle.',
    duration: 'Selon mission',
  },
  {
    num: '04',
    icon: Star,
    title: 'Payez et évaluez',
    description: 'Réglez via Mobile Money, carte bancaire ou espèces. Notez l\'artisan sur 5 critères pour aider la communauté à choisir les meilleurs professionnels.',
    duration: '~1 minute',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative bg-muted/30">
      <div className="container-app">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="accent" className="mb-4">
            <ArrowRight className="h-3.5 w-3.5" />
            En 4 étapes simples
          </Badge>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">
            Votre dépannage, <span className="gradient-text">en quelques minutes</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-balance">
            Un processus pensé pour la simplicité, la rapidité et la transparence.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-brand-300 via-accent-500 to-brand-300" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative"
              >
                <div className="relative card p-6 lg:p-8 hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  {/* Number background */}
                  <span className="absolute -top-3 -right-3 text-7xl lg:text-8xl font-display font-extrabold text-brand-100 dark:text-brand-900/40 leading-none -z-0 select-none">
                    {step.num}
                  </span>

                  <div className="relative">
                    {/* Icon */}
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-glow mb-4">
                      <step.icon className="h-7 w-7" />
                    </div>

                    <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {step.description}
                    </p>

                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-700 dark:text-accent-300 bg-accent-100 dark:bg-accent-900/40 px-2.5 py-1 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-600 animate-pulse" />
                      {step.duration}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
