'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const FAQS = [
  {
    q: 'SOSLocal est-il disponible partout en Guinée ?',
    a: 'Pour la phase pilote, SOSLocal est disponible dans les cinq communes de Conakry (Kaloum, Dixinn, Matam, Ratoma, Matoto). Une extension progressive est prévue vers Kankan, Labé, N\'Zérékoré, Kindia et Boké en 2026-2027.',
  },
  {
    q: 'Comment sont sélectionnés les artisans ?',
    a: 'Tous les artisans inscrits sur SOSLocal sont vérifiés et approuvés par notre équipe. Ils ont fourni leurs documents d\'identité et de qualification, et bénéficient d\'un suivi continu via le système d\'évaluation des bénéficiaires.',
  },
  {
    q: 'Quelles sont les méthodes de paiement disponibles ?',
    a: 'Trois méthodes sont disponibles : Mobile Money (Orange Money et MTN MoMo), carte bancaire (Visa/Mastercard via Stripe) et paiement en espèces directement à l\'artisan. Le paiement Mobile Money est privilégié car le plus adapté au contexte guinéen.',
  },
  {
    q: 'Combien coûte l\'utilisation de SOSLocal ?',
    a: 'L\'application est entièrement gratuite pour les bénéficiaires. Pour les artisans, une commission modérée de 10 % est prélevée sur chaque intervention finalisée, ce qui finance la maintenance de la plateforme et les services associés. Aucun frais d\'abonnement n\'est demandé.',
  },
  {
    q: 'Que se passe-t-il en cas de problème avec un artisan ?',
    a: 'Vous pouvez signaler tout problème via le bouton "Signaler" dans l\'application. L\'équipe SOSLocal étudie chaque signalement sous 48h ouvrées. Les artisans recevant des évaluations négatives répétées peuvent voir leur accès suspendu.',
  },
  {
    q: 'Comment puis-je devenir artisan partenaire ?',
    a: 'Créez votre compte en sélectionnant le rôle "Artisan". Notre équipe examinera votre profil et vous donnera accès à la plateforme après vérification. Vous recevrez une notification dès validation.',
  },
  {
    q: 'Mes données personnelles sont-elles protégées ?',
    a: 'Absolument. SOSLocal applique les meilleures pratiques de sécurité : chiffrement des mots de passe (bcrypt), authentification JWT, communications HTTPS, hébergement sécurisé. Vos données ne sont jamais partagées avec des tiers à des fins commerciales.',
  },
  {
    q: 'L\'application fonctionne-t-elle hors ligne ?',
    a: 'Pour les fonctionnalités principales (création de demande, suivi GPS, chat), une connexion Internet est nécessaire. Cependant, la consultation de votre historique et de votre profil reste accessible hors ligne. Un mode hors ligne complet est en cours de développement.',
  },
]

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 lg:py-32">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">
            Vos questions, <span className="gradient-text">nos réponses</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-balance">
            Tout ce que vous devez savoir sur la plateforme SOSLocal.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={cn(
                  'card overflow-hidden transition-all duration-300',
                  isOpen ? 'border-accent-500/50 shadow-soft-lg' : 'hover:border-border/80'
                )}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 p-5 lg:p-6 text-left"
                >
                  <span className="font-semibold text-base lg:text-lg pr-2">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300',
                      isOpen && 'rotate-180 text-accent-600'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 lg:px-6 pb-5 lg:pb-6 text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
