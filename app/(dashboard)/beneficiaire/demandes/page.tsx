'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, FileText, MapPin, Clock, Star, MessageCircle, Trash2, ListChecks, Loader2, CheckCircle2, Wallet } from 'lucide-react'
import { ServiceIcon, ServiceTag } from '@/lib/utils/service-icons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge, Spinner, Avatar } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/StatCard'
import { Modal } from '@/components/ui/Modal'
import { useRequests, useDeleteRequest } from '@/hooks/queries/useRequests'
import { formatGNF, formatRelative, getInitials } from '@/lib/utils/format'
import { SERVICES } from '@/lib/mock-data'
import type { ServiceRequest, RequestStatus } from '@/types'
import { cn } from '@/lib/utils/cn'

type FilterKey = 'all' | 'active' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; variant: any }> = {
  pending:     { label: 'En attente',  color: 'bg-amber-500',   variant: 'warning' },
  matched:     { label: 'Recherche…',  color: 'bg-blue-500',    variant: 'primary' },
  accepted:    { label: 'Acceptée',    color: 'bg-blue-500',    variant: 'primary' },
  in_progress: { label: 'En cours',    color: 'bg-accent-500',  variant: 'accent'  },
  completed:   { label: 'Terminée',    color: 'bg-green-500',   variant: 'success' },
  cancelled:   { label: 'Annulée',     color: 'bg-muted-foreground', variant: 'default' },
  rejected:    { label: 'Refusée',     color: 'bg-red-500',     variant: 'danger'  },
  expired:     { label: 'Expirée',     color: 'bg-red-400',     variant: 'danger'  },
}

/** Une demande active (engagée avec un artisan) doit d'abord être annulée. */
const NON_DELETABLE: RequestStatus[] = ['accepted', 'in_progress']

export default function MesDemandesPage() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const { data: requests = [], isLoading } = useRequests()
  const deleteRequest = useDeleteRequest()
  const [toDelete, setToDelete] = useState<ServiceRequest | null>(null)

  async function handleDelete() {
    if (!toDelete) return
    try {
      await deleteRequest.mutateAsync(toDelete.id)
      toast.success('Demande supprimée')
    } catch (err: any) {
      toast.error('Suppression impossible', {
        description: err?.response?.data?.detail || err?.message || 'Erreur inattendue',
      })
    } finally {
      setToDelete(null)
    }
  }

  const filtered = requests.filter((r) => {
    if (filter === 'active')    return ['pending', 'matched', 'accepted', 'in_progress'].includes(r.status)
    if (filter === 'completed') return r.status === 'completed'
    if (filter === 'cancelled') return ['cancelled', 'rejected', 'expired'].includes(r.status)
    return true
  })

  const totalSpent = requests
    .filter((r) => r.final_price)
    .reduce((s, r) => s + (r.final_price ?? 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={FileText}
        title="Mes demandes"
        description="Historique de toutes vos interventions."
      >
        <Link href="/beneficiaire/nouvelle">
          <Button variant="accent" size="md">
            <Plus className="h-4 w-4" />
            Nouvelle demande
          </Button>
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={requests.length}
          icon={ListChecks}
          tone="brand"
          loading={isLoading}
          delay={0}
        />
        <StatCard
          label="En cours"
          value={requests.filter((r) => ['pending','matched','accepted','in_progress'].includes(r.status)).length}
          icon={Loader2}
          tone="accent"
          loading={isLoading}
          delay={0.05}
        />
        <StatCard
          label="Terminées"
          value={requests.filter((r) => r.status === 'completed').length}
          icon={CheckCircle2}
          tone="success"
          loading={isLoading}
          delay={0.1}
        />
        <StatCard
          label="Dépensé"
          value={formatGNF(totalSpent)}
          icon={Wallet}
          tone="neutral"
          loading={isLoading}
          delay={0.15}
        />
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {([
          { v: 'all',       label: 'Toutes'    },
          { v: 'active',    label: 'En cours'  },
          { v: 'completed', label: 'Terminées' },
          { v: 'cancelled', label: 'Annulées'  },
        ] as const).map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              filter === f.v ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded-xl bg-muted animate-pulse" />
                  <div className="h-3 w-full rounded-xl bg-muted animate-pulse" />
                  <div className="h-3 w-2/3 rounded-xl bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
            <FileText className="h-7 w-7 text-brand-500" />
          </div>
          <h3 className="mb-1.5 font-semibold text-lg">
            {filter === 'all' ? 'Aucune demande pour le moment' : 'Aucune demande dans cette catégorie'}
          </h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            {filter === 'all'
              ? 'Commencez par créer votre première demande de dépannage.'
              : 'Changez de filtre pour voir vos autres demandes.'}
          </p>
          {filter === 'all' && (
            <Link href="/beneficiaire/nouvelle">
              <Button variant="accent">
                <Plus className="h-4 w-4" />
                Nouvelle demande
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <Link href={`/beneficiaire/demandes/${req.id}`}>
                <RequestCard req={req} deletable={!NON_DELETABLE.includes(req.status)} />
              </Link>
              {!NON_DELETABLE.includes(req.status) && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setToDelete(req) }}
                  className="absolute top-3 right-3 z-10 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Supprimer la demande"
                  title="Supprimer la demande"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Supprimer la demande" size="sm">
        <p className="text-sm text-muted-foreground">
          Voulez-vous vraiment supprimer{' '}
          <span className="font-semibold text-[rgb(var(--fg))]">{toDelete?.title}</span> ? Cette action est définitive.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setToDelete(null)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteRequest.isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors inline-flex items-center gap-2"
          >
            {deleteRequest.isPending && <Spinner className="h-4 w-4" />}
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  )
}

function RequestCard({ req, deletable = false }: { req: ServiceRequest; deletable?: boolean }) {
  const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending

  // Support both nested objects (mock) and flat fields (backend API)
  const techName   = req.technician?.name    ?? req.technician_name
  const techRating = req.technician?.rating  ?? req.technician_rating ?? 0
  const techProf   = (req.technician as any)?.profession
  const serviceSlug = (req.service as any)?.slug
    ?? SERVICES.find(s => s.id === req.service_id)?.slug
  const serviceName = (req.service as any)?.name
    ?? SERVICES.find(s => s.id === req.service_id)?.name

  return (
    <Card className="p-5 hover:shadow-soft-lg transition-all cursor-pointer hover:border-brand-300 dark:hover:border-brand-700">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
          <ServiceIcon slug={serviceSlug} name={serviceName} className="h-6 w-6 text-brand-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className={cn('flex items-start justify-between gap-2 flex-wrap mb-1', deletable && 'pr-9')}>
            <h3 className="font-semibold truncate">{req.title}</h3>
            <Badge variant={status.variant}>
              <span className={cn('h-1.5 w-1.5 rounded-full', status.color)} />
              {status.label}
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
              <span className="flex items-center gap-1 min-w-0 max-w-full">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{req.address}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelative(req.created_at)}
            </span>
          </div>

          {techName && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar fallback={getInitials(techName)} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{techName}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {techRating.toFixed(1)}
                    {techProf && ` · ${techProf}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {req.final_price && (
                  <div className="text-sm font-semibold text-accent-700 dark:text-accent-300">
                    {formatGNF(req.final_price)}
                  </div>
                )}
                {(req.status === 'in_progress' || req.status === 'accepted') && (
                  <Link href={`/chat/${req.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
