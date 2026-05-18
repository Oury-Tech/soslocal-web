'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, FileText, MapPin, Clock, Star, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge, Spinner, Avatar } from '@/components/ui/badge'
import { useRequests } from '@/hooks/queries/useRequests'
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
  cancelled:   { label: 'Annulée',     color: 'bg-gray-500',    variant: 'default' },
  rejected:    { label: 'Refusée',     color: 'bg-red-500',     variant: 'danger'  },
  expired:     { label: 'Expirée',     color: 'bg-red-400',     variant: 'danger'  },
}

export default function MesDemandesPage() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const { data: requests = [], isLoading } = useRequests()

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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Mes demandes</h1>
          <p className="text-muted-foreground mt-1">Historique de toutes vos interventions.</p>
        </div>
        <Link href="/beneficiaire/nouvelle">
          <Button variant="accent" size="md">
            <Plus className="h-4 w-4" />
            Nouvelle demande
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: requests.length },
          { label: 'En cours',  value: requests.filter((r) => ['pending','matched','accepted','in_progress'].includes(r.status)).length },
          { label: 'Terminées', value: requests.filter((r) => r.status === 'completed').length },
          { label: 'Dépensé',   value: formatGNF(totalSpent) },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
          </Card>
        ))}
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
              filter === f.v ? 'bg-brand-700 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {filter === 'all' ? 'Aucune demande pour le moment' : 'Aucune demande dans cette catégorie'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {filter === 'all' && 'Commencez par créer votre première demande de dépannage.'}
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
            >
              <RequestCard req={req} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function RequestCard({ req }: { req: ServiceRequest }) {
  const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending

  // Support both nested objects (mock) and flat fields (backend API)
  const techName   = req.technician?.name    ?? req.technician_name
  const techRating = req.technician?.rating  ?? req.technician_rating ?? 0
  const techProf   = (req.technician as any)?.profession
  const refLabel   = req.reference_number    ?? `#${req.id}`
  const serviceIcon = (req.service as any)?.icon
    ?? SERVICES.find(s => s.id === req.service_id)?.icon
    ?? '🔧'

  return (
    <Card className="p-5 hover:shadow-soft-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
          {serviceIcon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
            <h3 className="font-semibold truncate">{req.title}</h3>
            <Badge variant={status.variant}>
              <span className={cn(
                'h-1.5 w-1.5 rounded-full',
                status.color,
                req.status === 'in_progress' && 'animate-pulse'
              )} />
              {status.label}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{req.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {refLabel}
            </span>
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
                  <Link href={`/chat/${req.id}`}>
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
