'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Navigation, Smartphone, Headphones } from 'lucide-react'

const ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Artisans vérifiés',
    desc: 'Identité et compétences contrôlées avant l\'accès à la plateforme.',
    tone: 'brand' as const,
  },
  {
    icon: Navigation,
    title: 'Suivi en temps réel',
    desc: 'Visualisez l\'arrivée de votre artisan sur la carte, minute par minute.',
    tone: 'accent' as const,
  },
  {
    icon: Smartphone,
    title: 'Paiement Mobile Money',
    desc: 'Orange Money, MTN MoMo ou espèces — réglez en toute simplicité.',
    tone: 'brand' as const,
  },
  {
    icon: Headphones,
    title: 'Support 7j/7',
    desc: 'Une équipe à Conakry, joignable en français à tout moment.',
    tone: 'accent' as const,
  },
]

export function TrustStrip() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container-app">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {ITEMS.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-4 p-5 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <span
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white ${
                  item.tone === 'brand' ? 'bg-brand-500' : 'bg-accent-500'
                }`}
              >
                <item.icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-[rgb(var(--fg))]">{item.title}</h3>
                <p className="text-xs text-[rgb(var(--muted-fg))] leading-relaxed mt-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
