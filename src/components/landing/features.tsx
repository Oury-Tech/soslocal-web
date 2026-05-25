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
    title: 'Artisans certifiés MEATFP',
    description: 'Tous les professionnels sont validés par le programme Allô Maître du MEATFP.',
    color: 'bg-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Tableau de bord opérateur',
    description: 'Supervision temps réel, statistiques détaillées et validation des artisans pour les centres Allô Maître.',
    color: 'bg-rose-500',
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-28">
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
            Avantages
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.625rem] font-extrabold leading-tight tracking-tight text-[rgb(var(--fg))]">
            Pourquoi{' '}
            <span className="gradient-text">SOSLocal</span>{' '}
            pour votre dépannage ?
          </h2>
          <p className="mt-4 text-base text-[rgb(var(--muted-fg))] leading-relaxed">
            Une plateforme conçue pour le programme Allô Maître, adaptée aux réalités du contexte guinéen.
          </p>
        </motion.div>

        {/* Grille de 6 cartes */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.07 }}
            >
              <div className="h-full p-6 rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:shadow-brand-500/8 hover:-translate-y-0.5 transition-all duration-200">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.color} shadow-md mb-4`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-base text-[rgb(var(--fg))] mb-2">{feature.title}</h3>
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
