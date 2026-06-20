'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, MapPin, Clock, MessageCircle, CheckCircle2, Check, X, ListChecks, Hourglass, Loader, CheckCheck } from 'lucide-react'
import { ServiceIcon, ServiceTag } from '@/lib/utils/service-icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Avatar } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/StatCard'
import { useMyJobs } from '@/hooks/queries/useRequests'
import { useStartRequest, useCompleteRequest } from '@/hooks/queries/useRequests'
import { formatGNF, formatRelative, getInitials } from '@/lib/utils/format'
import { SERVICES } from '@/lib/mock-data'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

type FilterKey = 'all' | 'pending' | 'active' | 'completed'

// L'artisan n'est pas propriétaire des demandes : il ne peut pas les supprimer
// côté serveur. On masque donc localement les missions « archivées » (par appareil)
// pour désencombrer la liste, sans toucher aux données partagées.
const DISMISSED_KEY = 'soslocal:artisan:dismissed-missions'

function loadDismissed(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number') : []
  } catch {
    return []
  }
}

function saveDismissed(ids: number[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids))
  } catch {
    /* quota / indisponible : silencieux */
  }
}

export default function MissionsPage() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const { data: jobs = [], isLoading } = useMyJobs()
  const startReq    = useStartRequest()
  const completeReq = useCompleteRequest()

  // Missions archivées localement (masquées de la liste).
  const [dismissed, setDismissed] = useState<number[]>([])
  useEffect(() => { setDismissed(loadDismissed()) }, [])

  const dismiss = useCallback((id: number) => {
    setDismissed((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      saveDismissed(next)
      return next
    })
    toast.success('Mission archivée', {
      action: {
        label: 'Annuler',
        onClick: () => setDismissed((prev) => {
          const next = prev.filter((x) => x !== id)
          saveDismissed(next)
          return next
        }),
      },
    })
  }, [])

  const filtered = jobs.filter((r) => {
    if (dismissed.includes(r.id)) return false
    if (filter === 'pending')   return r.status === 'pending' || r.status === 'matched'
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

  const totalJobs     = jobs.length
  const pendingJobs   = jobs.filter((r) => r.status === 'pending' || r.status === 'matched').length
  const activeJobs    = jobs.filter((r) => r.status === 'accepted' || r.status === 'in_progress').length
  const completedJobs = jobs.filter((r) => r.status === 'completed').length

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Mes missions"
        description="Suivez l'évolution de vos interventions en temps réel."
        icon={Wrench}
      />

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total"      value={totalJobs}     icon={ListChecks} tone="brand"   loading={isLoading} />
        <StatCard label="En attente" value={pendingJobs}   icon={Hourglass}  tone="warning" loading={isLoading} delay={0.05} />
        <StatCard label="En cours"   value={activeJobs}    icon={Loader}     tone="accent"  loading={isLoading} delay={0.1} />
        <StatCard label="Terminées"  value={completedJobs} icon={CheckCheck} tone="success" loading={isLoading} delay={0.15} />
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
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              filter === f.v
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-muted text-[rgb(var(--muted-fg))] hover:bg-muted/70 hover:text-[rgb(var(--fg))]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-muted animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/5 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
            <Wrench className="h-7 w-7 text-brand-500" />
          </div>
          <h3 className="font-semibold text-lg mt-4 mb-1 text-[rgb(var(--fg))]">Aucune mission trouvée</h3>
          <p className="text-sm text-[rgb(var(--muted-fg))]">
            Activez votre disponibilité pour recevoir de nouvelles missions.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
          {filtered.map((req, i) => {
            // Support both nested (mock) and flat (backend) fields
            const clientName = req.client?.name ?? req.client_name ?? 'Client'
            const serviceSlug = (req.service as any)?.slug
              ?? SERVICES.find(s => s.id === req.service_id)?.slug
            const serviceName = (req.service as any)?.name
              ?? SERVICES.find(s => s.id === req.service_id)?.name

            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(req.id) }}
                  title="Archiver cette mission"
                  aria-label="Archiver cette mission"
                  className="absolute top-2 right-2 z-10 h-8 w-8 inline-flex items-center justify-center rounded-full bg-card/80 backdrop-blur text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <Link href={`/artisan/missions/${req.id}`}>
                <Card className="p-5 hover:shadow-soft-lg transition-all cursor-pointer hover:border-brand-300 dark:hover:border-brand-700">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                      <ServiceIcon slug={serviceSlug} name={serviceName} className="h-6 w-6 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1 pr-8">
                        <h3 className="font-semibold truncate min-w-0">{req.title}</h3>
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
                          {req.status === 'completed'   && (
                            <span className="inline-flex items-center gap-1">
                              <Check className="h-3 w-3" aria-hidden /> Terminée
                            </span>
                          )}
                          {req.status === 'cancelled'   && 'Annulée'}
                        </Badge>
                      </div>

                      {(serviceSlug || serviceName) && (
                        <div className="mb-2">
                          <ServiceTag slug={serviceSlug} name={serviceName} size="sm" />
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{req.description}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar fallback={getInitials(clientName)} size="sm" />
                          <span className="text-sm font-medium truncate">{clientName}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-semibold text-accent-700 dark:text-accent-300">
                            {formatGNF(req.final_price ?? req.estimated_price ?? 0)}
                          </div>
                          {req.status === 'accepted' && (
                            <Button
                              variant="accent"
                              size="sm"
                              loading={startReq.isPending}
                              onClick={(e) => { e.preventDefault(); handleStart(req.id) }}
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
                              onClick={(e) => { e.preventDefault(); handleComplete(req.id) }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Terminer
                            </Button>
                          )}
                          <Link href={`/chat/${req.id}`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                </Link>
              </motion.div>
            )
          })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
