'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { SectionHeader } from '@/components/landing/section-header'

const TESTIMONIALS = [
  {
    name: 'Aïssatou Bah',
    role: 'Bénéficiaire · Kaloum',
    initials: 'AB',
    rating: 5,
    text: 'Fuite d\'eau un dimanche soir : un plombier certifié était chez moi en moins de 20 minutes. Je suivais son trajet en direct, du jamais vu à Conakry.',
  },
  {
    name: 'Ibrahima Camara',
    role: 'Plombier certifié · Matoto',
    initials: 'IC',
    rating: 5,
    text: 'Avant, je passais des heures à chercher des clients. Maintenant les demandes proches arrivent sur mon téléphone, et le paiement Mobile Money tombe directement. C\'est carré.',
  },
  {
    name: 'Fatoumata Diallo',
    role: 'Bénéficiaire · Matam',
    initials: 'FD',
    rating: 5,
    text: 'J\'ai pu comparer les tarifs avant de choisir, et l\'artisan était vraiment vérifié. Tout était transparent du début à la fin.',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-[rgb(var(--card))]">
      <div className="container-app">
        <SectionHeader
          eyebrow="Ils nous font confiance"
          icon={Star}
          title={<>Des dépannages réussis,{' '}<span className="text-brand-500">tous les jours.</span></>}
          description="Bénéficiaires et artisans partagent leur expérience à Conakry."
          className="mb-14 lg:mb-16"
        />

        {/* Cartes avis */}
        <div className="grid gap-5 lg:gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full flex flex-col p-6 lg:p-7 rounded-2xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] shadow-soft"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-brand-500/15" aria-hidden />

              {/* Note */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-[rgb(var(--fg))] leading-relaxed mb-6">« {t.text} »</p>

              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[rgb(var(--border))]">
                <div className="h-11 w-11 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" aria-hidden>
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-[rgb(var(--fg))] truncate">{t.name}</div>
                  <div className="text-xs text-[rgb(var(--muted-fg))] truncate">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
