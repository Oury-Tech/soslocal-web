'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Wrench, ShieldCheck, Check, ArrowRight, Star } from 'lucide-react'

const AUDIENCES = [
  {
    icon: Users,
    title: 'Bénéficiaires',
    subtitle: 'Particuliers et entreprises',
    description: 'Faites-vous dépanner rapidement par des artisans certifiés, en toute confiance.',
    benefits: [
      'Artisan trouvé en moins de 30 secondes',
      'Suivi GPS en temps réel',
      'Paiement sécurisé Mobile Money',
      'Évaluations transparentes',
    ],
    cta: 'Trouver un artisan',
    href: '/register?role=client',
    featured: false,
  },
  {
    icon: Wrench,
    title: 'Artisans',
    subtitle: 'Plombiers, électriciens, mécaniciens…',
    description: 'Recevez des missions qualifiées dans votre zone et développez votre activité.',
    benefits: [
      'Missions ciblées selon vos compétences',
      'Aucune prospection commerciale',
      'Versements rapides Mobile Money',
      'Visibilité via les évaluations',
    ],
    cta: 'Devenir artisan partenaire',
    href: '/register?role=technician',
    featured: true,
  },
  {
    icon: ShieldCheck,
    title: 'Opérateurs',
    subtitle: 'Gestionnaires & coordinateurs',
    description: 'Supervisez l\'écosystème, validez les artisans et générez des rapports.',
    benefits: [
      'Supervision en temps réel',
      'Validation des certifications',
      'Statistiques par centre',
      'Export de rapports détaillés',
    ],
    cta: 'Espace opérateur',
    href: '/login',
    featured: false,
  },
]

export function Audience() {
  return (
    <section id="audience" className="py-24 lg:py-32 scroll-mt-20">
      <div className="container-app">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/40 uppercase tracking-widest mb-4">
            Pour qui
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.625rem] font-extrabold leading-[1.15] tracking-tight text-[rgb(var(--fg))] text-balance">
            Une plateforme pour{' '}
            <span className="gradient-text">trois acteurs</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[rgb(var(--muted-fg))] text-balance">
            SOSLocal connecte bénéficiaires, artisans et opérateurs de façon transparente.
          </p>
        </motion.div>

        {/* Cartes — style pricing SalesRadar */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-7 items-start pt-4">
          {AUDIENCES.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`relative ${item.featured ? 'lg:-mt-4' : ''}`}
            >
              {item.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-brand-500">
                    <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                    Le plus populaire
                  </span>
                </div>
              )}

              <div
                className={`h-full rounded-3xl p-7 lg:p-8 border-2 transition-all duration-300 hover:-translate-y-1 ${
                  item.featured
                    ? 'border-transparent bg-brand-500 text-white shadow-2xl shadow-brand-500/30 hover:shadow-glow-lg'
                    : 'border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-soft hover:shadow-soft-lg hover:border-brand-300 dark:hover:border-brand-700'
                }`}
              >
                {/* Icône */}
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl mb-5 ${
                  item.featured
                    ? 'bg-white/20'
                    : 'bg-brand-50 dark:bg-brand-900/40'
                }`}>
                  <item.icon className={`h-6 w-6 ${item.featured ? 'text-white' : 'text-brand-500'}`} />
                </div>

                <h3 className={`font-extrabold text-xl mb-0.5 ${item.featured ? 'text-white' : 'text-[rgb(var(--fg))]'}`}>
                  {item.title}
                </h3>
                <p className={`text-xs font-medium mb-3 ${item.featured ? 'text-white/70' : 'text-brand-500'}`}>
                  {item.subtitle}
                </p>
                <p className={`text-sm mb-6 leading-relaxed ${item.featured ? 'text-white/80' : 'text-[rgb(var(--muted-fg))]'}`}>
                  {item.description}
                </p>

                {/* Séparateur */}
                <div className={`h-px mb-5 ${item.featured ? 'bg-white/20' : 'bg-[rgb(var(--border))]'}`} />

                {/* Avantages */}
                <ul className="space-y-2.5 mb-7">
                  {item.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2.5 text-sm">
                      <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${item.featured ? 'text-white' : 'text-brand-500'}`} />
                      <span className={item.featured ? 'text-white/90' : 'text-[rgb(var(--fg))]'}>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={item.href}>
                  <span className={`group/cta flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 cursor-pointer ${
                    item.featured
                      ? 'bg-white text-brand-700 shadow-lg'
                      : 'bg-brand-500 text-white shadow-soft hover:shadow-glow'
                  }`}>
                    {item.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
