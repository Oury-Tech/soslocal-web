'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wrench, MapPin, Clock, MessageCircle, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useMyJobs } from '@/hooks/queries/useRequests'
import { useStartRequest, useCompleteRequest } from '@/hooks/queries/useRequests'
import { formatGNF, formatRelative, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

type FilterKey = 'all' | 'pending' | 'active' | 'completed'

export default function MissionsPage() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const { data: jobs = [], isLoading } = useMyJobs()
  const startReq    = useStartRequest()
  const completeReq = useCompleteRequest()

  const filtered = jobs.filter((r) => {
    if (filter === 'pending')   return r.status === 'pending' || r.status === 'matching'
    if (filter === 'active')    return r.status === 'accepted' || r.status === 'in_progress'
    if (filter === 'completed') return r.status === 'completed'
    return true
  })

  async function handleStart(id: number) {
    try {
      await startReq.mutateAsync(id)
      toast.success('Intervention démarrée !')
    } catch {
      toast.error('Impossible de démarrer la mission.')
    }
  }

  async function handleComplete(id: number) {
    try {
      await completeReq.mutateAsync({ id })
      toast.success('Mission terminée avec succès !')
    } catch {
      toast.error('Impossible de terminer la mission.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Mes missions</h1>
        <p className="text-muted-foreground mt-1">Suivez l'évolution de vos interventions en temps réel.</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {([
          { v: 'all',       label: 'Toutes'     },
          { v: 'pending',   label: 'En attente' },
          { v: 'active',    label: 'En cours'   },
          { v: 'completed', label: 'Terminées'  },
        ] as const).map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              filter === f.v ? 'bg-brand-700 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Aucune mission trouvée</h3>
          <p className="text-sm text-muted-foreground">
            Activez votre disponibilité pour recevoir de nouvelles missions.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => {
            // Support both nested (mock) and flat (backend) fields
            const clientName = req.client?.name ?? req.client_name ?? 'Client'
            const refLabel   = req.reference_number ?? `#${req.id}`
            const serviceIcon = (req.service as any)?.icon ?? '🔧'

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5 hover:shadow-soft-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                      {serviceIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold truncate">{req.title}</h3>
                        <Badge
                          variant={
                            req.status === 'completed'   ? 'success' :
                            req.status === 'in_progress' ? 'accent'  :
                            req.status === 'cancelled'   ? 'default' : 'primary'
                          }
                        >
                          {req.status === 'pending'     && 'En attente'}
                          {req.status === 'accepted'    && 'Acceptée'}
                          {req.status === 'in_progress' && 'En cours'}
                          {req.status === 'completed'   && '✓ Terminée'}
                          {req.status === 'cancelled'   && 'Annulée'}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{req.description}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{refLabel}</span>
                        {req.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {req.address}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelative(req.created_at)}
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Avatar fallback={getInitials(clientName)} size="sm" />
                          <span className="text-sm font-medium">{clientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-accent-700 dark:text-accent-300">
                            {formatGNF(req.final_price ?? req.estimated_price ?? 0)}
                          </div>
                          {req.status === 'accepted' && (
                            <Button
                              variant="accent"
                              size="sm"
                              loading={startReq.isPending}
                              onClick={() => handleStart(req.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Démarrer
                            </Button>
                          )}
                          {req.status === 'in_progress' && (
                            <Button
                              variant="accent"
                              size="sm"
                              loading={completeReq.isPending}
                              onClick={() => handleComplete(req.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Terminer
                            </Button>
                          )}
                          <Link href={`/chat/${req.id}`}>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
