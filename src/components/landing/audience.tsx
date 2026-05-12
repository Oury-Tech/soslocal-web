'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Wrench, ShieldCheck, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const AUDIENCES = [
  {
    icon: Users,
    title: 'Bénéficiaires',
    subtitle: 'Particuliers et entreprises',
    description: 'Faites-vous dépanner rapidement par des artisans certifiés, en toute confiance.',
    benefits: [
      'Trouvez un artisan en moins de 30 secondes',
      'Suivi GPS en temps réel de l\'arrivée',
      'Évaluations transparentes des artisans',
      'Paiement sécurisé Mobile Money',
      'Historique de toutes vos interventions',
    ],
    color: 'brand',
    cta: 'Trouver un artisan',
    href: '/register?role=client',
  },
  {
    icon: Wrench,
    title: 'Artisans certifiés',
    subtitle: 'Plombiers, électriciens, mécaniciens…',
    description: 'Recevez des missions qualifiées dans votre zone et développez votre activité.',
    benefits: [
      'Missions ciblées selon vos compétences',
      'Pas de prospection commerciale',
      'Tarification transparente',
      'Versements rapides Mobile Money',
      'Visibilité accrue grâce aux évaluations',
    ],
    color: 'accent',
    cta: 'Devenir artisan partenaire',
    href: '/register?role=technician',
    featured: true,
  },
  {
    icon: ShieldCheck,
    title: 'Opérateurs Allô Maître',
    subtitle: 'MEATFP & coordinateurs',
    description: 'Supervisez l\'écosystème, validez les artisans et générez des rapports stratégiques.',
    benefits: [
      'Tableau de bord supervision temps réel',
      'Validation des certifications artisans',
      'Statistiques détaillées par centre',
      'Export rapports pour le ministère',
      'Modération du système d\'évaluation',
    ],
    color: 'purple',
    cta: 'Espace opérateur',
    href: '/login',
  },
]

const colorMap: Record<string, { gradient: string; ring: string; text: string }> = {
  brand:  { gradient: 'from-brand-500 to-brand-700',   ring: 'ring-brand-500/20',  text: 'text-brand-700 dark:text-brand-300' },
  accent: { gradient: 'from-accent-500 to-accent-700', ring: 'ring-accent-500/20', text: 'text-accent-700 dark:text-accent-300' },
  purple: { gradient: 'from-purple-500 to-purple-700', ring: 'ring-purple-500/20', text: 'text-purple-700 dark:text-purple-300' },
}

export function Audience() {
  return (
    <section id="audience" className="py-24 lg:py-32 relative">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="primary" className="mb-4">
            <Users className="h-3.5 w-3.5" />
            Pour qui ?
          </Badge>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">
            Une plateforme pour <span className="gradient-text">trois acteurs</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-balance">
            SOSLocal connecte de manière transparente bénéficiaires, artisans et opérateurs Allô Maître.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {AUDIENCES.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative ${item.featured ? 'lg:-mt-4 lg:mb-4' : ''}`}
            >
              {item.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="accent" className="shadow-glow font-bold">
                    ⭐ Plus populaire
                  </Badge>
                </div>
              )}
              <div
                className={`relative h-full p-8 rounded-3xl bg-card border-2 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1 ${
                  item.featured
                    ? 'border-accent-500 ring-4 ring-accent-500/20'
                    : 'border-border'
                }`}
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colorMap[item.color].gradient} text-white shadow-lg mb-6`}>
                  <item.icon className="h-7 w-7" />
                </div>

                <h3 className="font-bold text-2xl mb-1">{item.title}</h3>
                <p className={`text-sm font-medium mb-4 ${colorMap[item.color].text}`}>{item.subtitle}</p>
                <p className="text-muted-foreground mb-6 leading-relaxed">{item.description}</p>

                <ul className="space-y-3 mb-8">
                  {item.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm">
                      <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${colorMap[item.color].text}`} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link href={item.href} className="block">
                  <Button
                    variant={item.featured ? 'accent' : 'outline'}
                    size="md"
                    className="w-full group"
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
