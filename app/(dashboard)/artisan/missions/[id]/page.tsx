'use client'

import { use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Clock, Star, Phone, MessageCircle,
  CheckCircle2, AlertCircle, Navigation, Wrench, User,
  FileText, Calendar, CreditCard,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useRequest, useAcceptRequest, useCancelRequest } from '@/hooks/queries/useRequests'
import { formatGNF, formatRelative, formatDateTime, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { DynamicMap } from '@/components/maps/dynamic-map'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { RequestStatus } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_CONFIG: Record<RequestStatus, { label: string; variant: any; color: string }> = {
  pending:     { label: 'En attente',  variant: 'warning', color: 'bg-amber-500'  },
  matched:     { label: 'Matching…',   variant: 'primary', color: 'bg-blue-500'   },
  accepted:    { label: 'Acceptée',    variant: 'primary', color: 'bg-blue-500'   },
  in_progress: { label: 'En cours',    variant: 'accent',  color: 'bg-accent-500' },
  completed:   { label: 'Terminée',    variant: 'success', color: 'bg-green-500'  },
  cancelled:   { label: 'Annulée',     variant: 'default', color: 'bg-gray-500'   },
  rejected:    { label: 'Refusée',     variant: 'danger',  color: 'bg-red-500'    },
  expired:     { label: 'Expirée',     variant: 'danger',  color: 'bg-red-400'    },
}

export default function MissionDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router  = useRouter()

  const { data: request, isLoading, error } = useRequest(id)
  const acceptMutation = useAcceptRequest()
  const cancelMutation = useCancelRequest()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !request) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg">Mission introuvable</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Cette mission n'existe pas ou vous n'y avez pas accès.
        </p>
        <Link href="/artisan/missions">
          <Button variant="outline"><ArrowLeft className="h-4 w-4" /> Retour aux missions</Button>
        </Link>
      </Card>
    )
  }

  const status     = STATUS_CONFIG[request.status]
  const canAccept  = request.status === 'pending' || request.status === 'matched'
  const canStart   = request.status === 'accepted'
  const canFinish  = request.status === 'in_progress'
  const isActive   = ['accepted', 'in_progress'].includes(request.status)

  const pos = { lat: request.latitude, lng: request.longitude }

  async function handleAccept() {
    try {
      await acceptMutation.mutateAsync(request!.id)
      toast.success('Mission acceptée !')
    } catch {
      toast.error('Impossible d\'accepter cette mission.')
    }
  }

  async function handleCancel() {
    try {
      await cancelMutation.mutateAsync({ id: request!.id })
      toast.success('Mission annulée.')
      router.push('/artisan/missions')
    } catch {
      toast.error('Impossible d\'annuler.')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/artisan/missions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Missions
          </Button>
        </Link>
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm font-medium truncate">{request.reference_number}</span>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-accent-700 p-6 sm:p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-400/30 rounded-full filter blur-3xl animate-blob" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{request.service?.icon || '🔧'}</span>
              <Badge
                variant={status.variant}
                className="bg-white/20 border-white/30 text-white text-xs"
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', status.color, request.status === 'in_progress' && 'animate-pulse')} />
                {status.label}
              </Badge>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">{request.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-brand-100 text-sm">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {request.reference_number}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatRelative(request.created_at)}
              </span>
              {request.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {request.address}
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-extrabold">
              {formatGNF(request.estimated_price || 0)}
            </div>
            <div className="text-brand-200 text-xs mt-0.5">Prix estimé</div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-accent-600" />
              Détail de l'intervention
            </h2>
            <p className="text-muted-foreground leading-relaxed">{request.description}</p>

            {request.service && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <span className="text-2xl">{request.service.icon}</span>
                <div>
                  <div className="font-semibold text-sm">{request.service.name}</div>
                  <div className="text-xs text-muted-foreground">{request.service.category}</div>
                </div>
                {request.service.estimated_price_min && (
                  <div className="ml-auto text-right">
                    <div className="text-sm font-bold text-accent-700 dark:text-accent-300">
                      {formatGNF(request.service.estimated_price_min)} – {formatGNF(request.service.estimated_price_max || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Fourchette habituelle</div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Carte de localisation */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <Navigation className="h-5 w-5 text-accent-600" />
                Localisation
              </h2>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pos.lat},${pos.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4" />
                  Itinéraire
                </Button>
              </a>
            </div>
            <div className="h-64">
              <DynamicMap userPosition={pos} technicians={[]} />
            </div>
            {request.address && (
              <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                {request.address}
              </div>
            )}
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent-600" />
              Chronologie
            </h2>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {[
                  { label: 'Demande créée',   time: request.created_at,   done: true },
                  { label: 'Mission acceptée', time: request.accepted_at,  done: !!request.accepted_at },
                  { label: 'Intervention démarrée', time: request.started_at, done: !!request.started_at },
                  { label: 'Terminée',         time: request.completed_at, done: !!request.completed_at },
                ].map((step) => (
                  <div key={step.label} className="flex items-start gap-4 pl-8 relative">
                    <div className={cn(
                      'absolute left-1.5 top-1 h-3 w-3 rounded-full border-2',
                      step.done ? 'bg-accent-600 border-accent-600' : 'bg-card border-border'
                    )} />
                    <div>
                      <div className={cn('text-sm font-medium', !step.done && 'text-muted-foreground')}>
                        {step.label}
                      </div>
                      {step.time && (
                        <div className="text-xs text-muted-foreground">{formatDateTime(step.time)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Client info */}
          {request.client && (
            <Card className="p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-accent-600" />
                Client
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar fallback={getInitials(request.client.name)} size="md" />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{request.client.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{request.client.phone}</div>
                </div>
              </div>
              {isActive && (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/chat/${request.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <MessageCircle className="h-4 w-4" />
                      Chat
                    </Button>
                  </Link>
                  <a href={`tel:${request.client.phone}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Phone className="h-4 w-4" />
                      Appeler
                    </Button>
                  </a>
                </div>
              )}
            </Card>
          )}

          {/* Prix */}
          <Card className="p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-accent-600" />
              Paiement
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prix estimé</span>
                <span className="font-bold">{formatGNF(request.estimated_price || 0)}</span>
              </div>
              {request.final_price && (
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-medium">Prix final</span>
                  <span className="font-bold text-accent-700 dark:text-accent-300">{formatGNF(request.final_price)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-5 space-y-2">
            <h3 className="font-bold mb-3">Actions</h3>

            {canAccept && (
              <Button
                variant="accent"
                size="md"
                className="w-full"
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? <Spinner className="h-4 w-4" /> : (
                  <><CheckCircle2 className="h-4 w-4" /> Accepter la mission</>
                )}
              </Button>
            )}

            {canStart && (
              <Button variant="accent" size="md" className="w-full">
                <Navigation className="h-4 w-4" />
                Démarrer l'intervention
              </Button>
            )}

            {canFinish && (
              <Button variant="accent" size="md" className="w-full">
                <CheckCircle2 className="h-4 w-4" />
                Marquer comme terminée
              </Button>
            )}

            {(canAccept || isActive) && (
              <Button
                variant="destructive"
                size="md"
                className="w-full"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? <Spinner className="h-4 w-4" /> : 'Refuser / Annuler'}
              </Button>
            )}

            {request.status === 'completed' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">Mission terminée avec succès</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
