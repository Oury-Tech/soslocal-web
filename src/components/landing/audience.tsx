'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Wrench, ShieldCheck, Check, ArrowRight } from 'lucide-react'

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
    <section id="audience" className="py-20 lg:py-28">
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
            Nos tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.625rem] font-extrabold leading-tight tracking-tight text-[rgb(var(--fg))]">
            Une plateforme pour{' '}
            <span className="gradient-text">trois acteurs</span>
          </h2>
          <p className="mt-4 text-base text-[rgb(var(--muted-fg))]">
            SOSLocal connecte bénéficiaires, artisans et opérateurs de façon transparente.
          </p>
        </motion.div>

        {/* Cartes — style pricing SalesRadar */}
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 items-start">
          {AUDIENCES.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="relative"
            >
              {item.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#3B37E9,#7C3AED)' }}>
                    ⭐ Le plus populaire
                  </span>
                </div>
              )}

              <div
                className={`h-full rounded-3xl p-7 border-2 transition-shadow duration-200 ${
                  item.featured
                    ? 'border-transparent text-white shadow-2xl shadow-brand-500/30'
                    : 'border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:shadow-md'
                }`}
                style={item.featured
                  ? { background: 'linear-gradient(145deg, #3B37E9 0%, #5B57F0 40%, #7C3AED 100%)' }
                  : undefined
                }
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
                  <span className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer ${
                    item.featured
                      ? 'bg-white text-brand-700'
                      : 'bg-brand-500 text-white'
                  }`}>
                    {item.cta}
                    <ArrowRight className="h-4 w-4" />
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
