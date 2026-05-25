'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Home, Eye, Sparkles, Clock, Wrench, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRequest } from '@/hooks/queries/useRequests'
import { cn } from '@/lib/utils/cn'

interface PageProps {
  params: Promise<{ id: string }>
}

const TIMELINE_STEPS = [
  { label: 'Demande créée',           sub: 'Votre demande a bien été enregistrée',  icon: CheckCircle2, done: true  },
  { label: 'Recherche d'un artisan',  sub: 'Notification envoyée aux artisans proches', icon: Sparkles,  done: false },
  { label: 'Artisan assigné',         sub: 'Un artisan accepte votre demande',       icon: Star,         done: false },
  { label: 'Intervention en cours',   sub: 'L'artisan se rend chez vous',            icon: Wrench,       done: false },
]

export default function SuccesPage({ params }: PageProps) {
  const { id } = use(params)
  const router  = useRouter()
  const { data: request } = useRequest(id)

  const [counter, setCounter] = useState(10)

  useEffect(() => {
    if (counter <= 0) {
      router.push(`/beneficiaire/demandes/${id}`)
      return
    }
    const t = setTimeout(() => setCounter((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [counter, id, router])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md space-y-6">

        {/* Animated icon */}
        <div className="relative flex items-center justify-center h-40">
          {/* Radar rings */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-brand-400/40"
              initial={{ width: 64, height: 64, opacity: 0.8 }}
              animate={{ width: 64 + i * 56, height: 64 + i * 56, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
            />
          ))}
          {/* Check circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
            className="relative z-10 h-20 w-20 rounded-full bg-brand-500 flex items-center justify-center shadow-lg"
          >
            <CheckCircle2 className="h-10 w-10 text-white" />
          </motion.div>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h1 className="font-display text-3xl font-extrabold mb-2">Demande envoyée !</h1>
          <p className="text-muted-foreground">
            {request?.reference_number
              ? `Réf. ${request.reference_number} — `
              : ''}
            Votre demande a été transmise aux artisans disponibles à proximité.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Ce qui se passe maintenant
            </p>
            <div className="space-y-4">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                      step.done
                        ? 'bg-brand-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {step.done
                        ? <CheckCircle2 className="h-4 w-4" />
                        : <Clock className="h-4 w-4" />
                      }
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={cn('w-0.5 h-4 mt-1', step.done ? 'bg-brand-400' : 'bg-border')} />
                    )}
                  </div>
                  <div className="pt-1 min-w-0">
                    <p className={cn('text-sm font-semibold', !step.done && 'text-muted-foreground')}>{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Link href={`/beneficiaire/demandes/${id}`}>
            <Button variant="accent" size="md" className="w-full">
              <Eye className="h-4 w-4" />
              Suivre ma demande
            </Button>
          </Link>
          <Link href="/beneficiaire">
            <Button variant="outline" size="md" className="w-full">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            Redirection automatique dans <span className="font-semibold text-brand-500">{counter}s</span>
          </p>
        </motion.div>

      </div>
    </div>
  )
}
