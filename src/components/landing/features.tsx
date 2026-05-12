'use client'

import { motion } from 'framer-motion'
import {
  MapPin, Zap, MessageCircle, CreditCard, Star, Shield,
  Clock, Users, BarChart3, Bell, Smartphone, Map,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const FEATURES = [
  {
    icon: MapPin,
    title: 'Géolocalisation précise',
    description: 'Trouvez l\'artisan le plus proche en temps réel grâce à PostGIS et au GPS continu. Carte interactive de Conakry avec mise à jour à chaque seconde.',
    color: 'brand',
  },
  {
    icon: Zap,
    title: 'Matching instantané',
    description: 'Algorithme intelligent multicritères : distance, note moyenne, expérience et disponibilité. Notification aux 3 meilleurs candidats en quelques secondes.',
    color: 'accent',
  },
  {
    icon: MessageCircle,
    title: 'Chat temps réel',
    description: 'Messagerie WebSocket intégrée avec photos, documents et indicateurs de lecture. Communiquez directement avec votre artisan avant et pendant l\'intervention.',
    color: 'purple',
  },
  {
    icon: CreditCard,
    title: 'Paiement Mobile Money',
    description: 'Orange Money, MTN MoMo, carte bancaire ou espèces. Choisissez votre mode de paiement préféré, sécurisé et adapté au contexte guinéen.',
    color: 'green',
  },
  {
    icon: Shield,
    title: 'Artisans certifiés',
    description: 'Tous les professionnels sont validés par le programme Allô Maître du MEATFP. Vérification d\'identité, contrôle des compétences et formation continue.',
    color: 'blue',
  },
  {
    icon: Star,
    title: 'Notation multicritères',
    description: 'Évaluation post-intervention sur 5 dimensions : qualité, professionnalisme, ponctualité, communication et rapport qualité-prix. Transparence totale.',
    color: 'amber',
  },
  {
    icon: Bell,
    title: 'Notifications push',
    description: 'Restez informé en temps réel via Firebase Cloud Messaging : nouvelle mission, arrivée de l\'artisan, validation du paiement, demande d\'évaluation.',
    color: 'rose',
  },
  {
    icon: BarChart3,
    title: 'Tableau de bord pro',
    description: 'Pour les opérateurs Allô Maître : supervision en temps réel des interventions, statistiques détaillées, validation des artisans et rapports d\'activité.',
    color: 'indigo',
  },
  {
    icon: Smartphone,
    title: 'Apps mobile + web',
    description: 'Disponible sur Android, iOS et navigateur web. Code de base unique React Native + Next.js pour une expérience cohérente sur tous les supports.',
    color: 'teal',
  },
]

const colorMap: Record<string, string> = {
  brand:  'from-brand-500 to-brand-700 shadow-brand-500/30',
  accent: 'from-accent-500 to-accent-700 shadow-accent-500/30',
  purple: 'from-purple-500 to-purple-700 shadow-purple-500/30',
  green:  'from-green-500 to-green-700 shadow-green-500/30',
  blue:   'from-blue-500 to-blue-700 shadow-blue-500/30',
  amber:  'from-amber-500 to-amber-700 shadow-amber-500/30',
  rose:   'from-rose-500 to-rose-700 shadow-rose-500/30',
  indigo: 'from-indigo-500 to-indigo-700 shadow-indigo-500/30',
  teal:   'from-teal-500 to-teal-700 shadow-teal-500/30',
}

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 relative">
      <div className="container-app">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="primary" className="mb-4">
            <Zap className="h-3.5 w-3.5" />
            Fonctionnalités complètes
          </Badge>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">
            Tout ce qu'il faut pour <span className="gradient-text">digitaliser</span> vos services techniques
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-balance">
            Une plateforme complète, conçue spécifiquement pour le programme Allô Maître et adaptée
            aux réalités du contexte guinéen.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="group relative"
            >
              <div className="relative h-full p-6 rounded-2xl bg-card border border-border hover:border-accent-500/50 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[feature.color]} shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
