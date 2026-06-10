'use client'

import { motion } from 'framer-motion'
import { MapPin, Zap, MessageCircle, CreditCard, Shield, BarChart3 } from 'lucide-react'

const FEATURES = [
  {
    icon: MapPin,
    title: 'Géolocalisation temps réel',
    description: 'Trouvez l\'artisan certifié le plus proche sur la carte interactive de Conakry.',
    color: 'bg-brand-500',
  },
  {
    icon: Zap,
    title: 'Matching instantané',
    description: 'Notre algorithme notifie les 3 meilleurs candidats en moins de 5 secondes.',
    color: 'bg-violet-500',
  },
  {
    icon: MessageCircle,
    title: 'Chat intégré',
    description: 'Communiquez directement avec votre artisan par messagerie avant et pendant l\'intervention.',
    color: 'bg-sky-500',
  },
  {
    icon: CreditCard,
    title: 'Paiement Mobile Money',
    description: 'Orange Money, MTN MoMo ou espèces — le paiement adapté au contexte guinéen.',
    color: 'bg-emerald-500',
  },
  {
    icon: Shield,
    title: 'Artisans vérifiés',
    description: 'Chaque artisan est vérifié et approuvé par notre équipe avant d\'accéder à la plateforme.',
    color: 'bg-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Tableau de bord opérateur',
    description: 'Supervision en temps réel, statistiques détaillées et validation des artisans.',
    color: 'bg-rose-500',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 scroll-mt-20">
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
            Avantages
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.625rem] font-extrabold leading-[1.15] tracking-tight text-[rgb(var(--fg))] text-balance">
            Pourquoi{' '}
            <span className="gradient-text">SOSLocal</span>{' '}
            pour votre dépannage ?
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[rgb(var(--muted-fg))] leading-relaxed text-balance">
            Une plateforme conçue pour le dépannage rapide, adaptée aux réalités du contexte guinéen.
          </p>
        </motion.div>

        {/* Grille de 6 cartes */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <div className="h-full p-6 lg:p-7 rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-soft hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} shadow-md mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-[rgb(var(--fg))] mb-2">{feature.title}</h3>
                <p className="text-sm text-[rgb(var(--muted-fg))] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
