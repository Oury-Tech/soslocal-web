// app/(dashboard)/beneficiaire/demandes/[id]/page.tsx
'use client'

import { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Filter, FileText, MapPin, Clock, Star, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge, Spinner, Avatar } from '@/components/ui/badge'
import { useRequests } from '@/hooks/queries/useRequests'
import { formatGNF, formatRelative, getInitials } from '@/lib/utils/format'
import type { ServiceRequest, RequestStatus } from '@/types'
import { cn } from '@/lib/utils/cn'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; variant: any }> = {
  pending:     { label: 'En attente',  color: 'bg-amber-500',   variant: 'warning' },
  matching:    { label: 'Matching…',   color: 'bg-blue-500',    variant: 'primary' },
  accepted:    { label: 'Acceptée',    color: 'bg-blue-500',    variant: 'primary' },
  in_progress: { label: 'En cours',    color: 'bg-accent-500',  variant: 'accent'  },
  completed:   { label: 'Terminée',    color: 'bg-green-500',   variant: 'success' },
  cancelled:   { label: 'Annulée',     color: 'bg-gray-500',    variant: 'default' },
  failed:      { label: 'Échec',       color: 'bg-red-500',     variant: 'danger'  },
}

export default function MesDemandesPage({ params }: PageProps) {
  const { id } = use(params) // ← use() au lieu de await car 'use client'
  
  const { data: requests = [], isLoading } = useRequests()
  
  // Note: id est disponible si besoin pour filtrer une demande spécifique
  // Pour l'instant on affiche toutes les demandes

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

      {/* Stats - reste identique */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: requests.length, color: 'brand' },
          { label: 'En cours', value: requests.filter(r => ['pending','accepted','in_progress'].includes(r.status)).length, color: 'accent' },
          { label: 'Terminées', value: requests.filter(r => r.status === 'completed').length, color: 'green' },
          { label: 'Dépensé', value: formatGNF(requests.filter(r => r.final_price).reduce((s, r) => s + (r.final_price || 0), 0)), color: 'amber' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['Toutes', 'En cours', 'Terminées', 'Annulées'].map((label, i) => (
          <button
            key={label}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              i === 0 ? 'bg-brand-700 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Aucune demande pour le moment</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Commencez par créer votre première demande de dépannage.
          </p>
          <Link href="/beneficiaire/nouvelle">
            <Button variant="accent">
              <Plus className="h-4 w-4" />
              Nouvelle demande
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req, i) => (
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
  const status = STATUS_CONFIG[req.status]

  return (
    <Card className="p-5 hover:shadow-soft-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
          {req.service?.icon || '🔧'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
            <h3 className="font-semibold truncate">{req.title}</h3>
            <Badge variant={status.variant}>
              <span className={cn('h-1.5 w-1.5 rounded-full', status.color, req.status === 'in_progress' && 'animate-pulse')} />
              {status.label}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{req.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {req.reference_number}
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

          {req.technician && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar fallback={getInitials(req.technician.name)} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{req.technician.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {req.technician.rating.toFixed(1)} · {req.technician.profession}
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