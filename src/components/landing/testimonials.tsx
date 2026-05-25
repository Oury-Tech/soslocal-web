'use client'

import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const TESTIMONIALS = [
  {
    name: 'Aïssatou Bah',
    role: 'Bénéficiaire · Kaloum',
    avatar: 'AB',
    rating: 5,
    quote:
      'J\'avais une fuite d\'eau urgente un dimanche soir. En 3 minutes via SOSLocal, un plombier était à ma porte. Service rapide, transparent et le paiement Orange Money est ultra simple.',
  },
  {
    name: 'Ibrahima Camara',
    role: 'Plombier certifié · Matoto',
    avatar: 'IC',
    rating: 5,
    quote:
      'Avant, je passais des heures à chercher des clients. Maintenant, les demandes arrivent directement sur mon téléphone selon ma zone. Ça a multiplié mon activité par 3 en deux mois.',
  },
  {
    name: 'Fatoumata Diallo',
    role: 'Cheffe d\'entreprise · Dixinn',
    avatar: 'FD',
    rating: 5,
    quote:
      'Pour notre PME, savoir qu\'on a accès à des artisans vérifiés à n\'importe quelle heure, c\'est une tranquillité d\'esprit énorme. La transparence du système d\'évaluation rassure vraiment.',
  },
  {
    name: 'Mohamed Keita',
    role: 'Électricien certifié · Ratoma',
    avatar: 'MK',
    rating: 5,
    quote:
      'L\'application est très simple, même pour ceux qui ne sont pas très à l\'aise avec le numérique. Les versements Mobile Money arrivent sous 24h, pas de paperasse, pas d\'attente.',
  },
  {
    name: 'Dr Mariam Touré',
    role: 'Coordinatrice SOSLocal',
    avatar: 'MT',
    rating: 5,
    quote:
      'Le tableau de bord opérateur me donne une visibilité totale sur les interventions en temps réel. Les données collectées vont nous servir à améliorer la formation professionnelle en Guinée.',
  },
  {
    name: 'Sékou Sylla',
    role: 'Mécanicien · Matam',
    avatar: 'SS',
    rating: 5,
    quote:
      'Le système d\'évaluation valorise enfin le sérieux. Mes clients voient mes notes et mes interventions passées : c\'est devenu un vrai CV numérique pour mon activité.',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-muted/30">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="primary" className="mb-4">
            <Quote className="h-3.5 w-3.5" />
            Ils nous font confiance
          </Badge>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">
            <span className="gradient-text">Témoignages</span> de nos utilisateurs
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-balance">
            Bénéficiaires, artisans et coordinateurs partagent leur expérience SOSLocal.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
              className="card p-6 lg:p-8 hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-brand-100 dark:text-brand-900/50" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-foreground leading-relaxed mb-6">"{t.quote}"</p>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
