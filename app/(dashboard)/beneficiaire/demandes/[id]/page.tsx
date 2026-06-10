'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Clock, Star, Phone, MessageCircle,
  CheckCircle2, AlertCircle, Navigation, Wrench, User,
  FileText, Calendar, CreditCard, X,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useRequest, useCancelRequest } from '@/hooks/queries/useRequests'
import { useTechnician } from '@/hooks/queries/useTechnicians'
import { useCreateDispute } from '@/hooks/queries/usePayments'
import { ReviewForm } from '@/components/features/reviews/ReviewForm'
import { Modal } from '@/components/ui/Modal'
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
  matched:     { label: 'Recherche…',  variant: 'primary', color: 'bg-blue-500'   },
  accepted:    { label: 'Acceptée',    variant: 'primary', color: 'bg-blue-500'   },
  in_progress: { label: 'En cours',   variant: 'accent',  color: 'bg-accent-500' },
  completed:   { label: 'Terminée',   variant: 'success', color: 'bg-green-500'  },
  cancelled:   { label: 'Annulée',    variant: 'default', color: 'bg-gray-500'   },
  rejected:    { label: 'Refusée',    variant: 'danger',  color: 'bg-red-500'    },
  expired:     { label: 'Expirée',    variant: 'danger',  color: 'bg-red-400'    },
}

const PRIORITY_CONFIG = {
  normal:    { label: '🟢 Normale',  cls: '' },
  high:      { label: '🟡 Élevée',   cls: '' },
  emergency: { label: '🔴 Urgence',  cls: '' },
}

function TechnicianInfo({ technicianId, requestId }: { technicianId: number; requestId: number }) {
  const { data: tech, isLoading } = useTechnician(technicianId)

  if (isLoading) return (
    <Card className="p-5">
      <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </Card>
  )

  if (!tech) return null

  return (
    <Card className="p-5">
      <h3 className="font-bold mb-3 flex items-center gap-2 text-[rgb(var(--fg))]">
        <User className="h-4 w-4 text-brand-500" />
        Votre artisan
      </h3>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-shrink-0">
          {tech.avatar_url ? (
            <img src={tech.avatar_url} className="h-12 w-12 rounded-full object-cover" alt={tech.name} />
          ) : (
            <Avatar fallback={getInitials(tech.name)} size="md" />
          )}
          {tech.is_available && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold truncate text-[rgb(var(--fg))]">{tech.name}</span>
            {tech.is_verified && <Badge variant="primary" className="text-[10px] px-1.5 py-0">✓</Badge>}
          </div>
          <div className="text-xs text-muted-foreground">{tech.profession}</div>
          <div className="flex items-center gap-2 mt-0.5 text-xs">
            <span className="flex items-center gap-0.5 text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-semibold">{tech.rating.toFixed(1)}</span>
            </span>
            <span className="text-muted-foreground">({tech.total_reviews} avis)</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/chat/${requestId}`}>
          <Button variant="outline" size="sm" className="w-full">
            <MessageCircle className="h-4 w-4" />
            Chat
          </Button>
        </Link>
        {tech.phone && (
          <a href={`tel:${tech.phone}`}>
            <Button variant="outline" size="sm" className="w-full">
              <Phone className="h-4 w-4" />
              Appeler
            </Button>
          </a>
        )}
      </div>
    </Card>
  )
}

export default function DemandePage({ params }: PageProps) {
  const { id } = use(params)
  const requestId = Number(id)
  const router = useRouter()

  const { data: req, isLoading, error } = useRequest(requestId)
  const cancelMutation = useCancelRequest()
  const createDispute  = useCreateDispute()

  const [showReview, setShowReview] = useState(false)
  const [showDispute, setShowDispute] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !req) {
    return (
      <Card className="p-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg">Demande introuvable</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          Cette demande n'existe pas ou vous n'y avez pas accès.
        </p>
        <Link href="/beneficiaire/demandes">
          <Button variant="outline"><ArrowLeft className="h-4 w-4" /> Retour aux demandes</Button>
        </Link>
      </Card>
    )
  }

  const status    = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending
  const canCancel = ['pending', 'matched', 'accepted'].includes(req.status)
  const canReview = req.status === 'completed'
  const isActive  = ['accepted', 'in_progress'].includes(req.status)
  const payableAmount = req.final_price ?? req.estimated_price ?? 0
  const isPaid    = Boolean(req.is_paid)
  const canPay    = req.status === 'completed' && payableAmount > 0 && !isPaid

  const technicianId: number | null =
    req.technician_id != null ? Number(req.technician_id) : null

  const pos = req.latitude && req.longitude
    ? { lat: req.latitude, lng: req.longitude }
    : null

  async function handleCancel() {
    try {
      await cancelMutation.mutateAsync({ id: requestId })
      toast.success('Demande annulée.')
      router.push('/beneficiaire/demandes')
    } catch {
      toast.error('Impossible d\'annuler.')
    }
  }

  async function handleDispute() {
    if (disputeReason.trim().length < 5) { toast.error('Décrivez le motif du litige.'); return }
    try {
      await createDispute.mutateAsync({
        payment_id: req?.payment_id ?? 0,
        request_id: requestId,
        reason: disputeReason.trim(),
      })
      toast.success('Litige ouvert. Notre équipe vous recontactera.')
      setShowDispute(false)
      setDisputeReason('')
    } catch {
      toast.error("Impossible d'ouvrir le litige.")
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/beneficiaire/demandes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Demandes
          </Button>
        </Link>
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm font-medium truncate">
          {req.reference_number ?? `#${req.id}`}
        </span>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{(req.service as any)?.icon || '🔧'}</span>
              <Badge variant={status.variant}>
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  status.color,
                  req.status === 'in_progress' && 'animate-pulse'
                )} />
                {status.label}
              </Badge>
              {req.priority && req.priority !== 'normal' && (
                <Badge variant={req.priority === 'emergency' ? 'danger' : 'warning'} className="text-[10px]">
                  <AlertCircle className="h-2.5 w-2.5" />
                  {req.priority === 'emergency' ? 'Urgence' : 'Élevée'}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--fg))]">{req.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[rgb(var(--muted-fg))] text-sm">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {req.reference_number ?? `#${req.id}`}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatRelative(req.created_at)}
              </span>
              {req.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {req.address}
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-extrabold text-[rgb(var(--fg))]">
              {formatGNF(req.final_price ?? req.estimated_price ?? 0)}
            </div>
            <div className="text-[rgb(var(--muted-fg))] text-xs mt-0.5">
              {req.final_price ? 'Prix final' : 'Prix estimé'}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-brand-500" />
              Détail de la demande
            </h2>
            <p className="text-muted-foreground leading-relaxed">{req.description}</p>

            {req.service && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <span className="text-2xl">{(req.service as any).icon}</span>
                <div>
                  <div className="font-semibold text-sm">{(req.service as any).name}</div>
                  <div className="text-xs text-muted-foreground">{(req.service as any).category}</div>
                </div>
                {(req.service as any).estimated_price_min && (
                  <div className="ml-auto text-right">
                    <div className="text-sm font-bold text-accent-700 dark:text-accent-300">
                      {formatGNF((req.service as any).estimated_price_min)} – {formatGNF((req.service as any).estimated_price_max || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Fourchette habituelle</div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Carte de localisation */}
          {pos && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-brand-500" />
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
              <div className="h-56">
                <DynamicMap userPosition={pos} technicians={[]} />
              </div>
              {req.address && (
                <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {req.address}
                </div>
              )}
            </Card>
          )}

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-500" />
              Suivi de la demande
            </h2>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {[
                  { label: 'Demande envoyée',         time: req.created_at,   done: true },
                  { label: 'Artisan trouvé',           time: req.accepted_at,  done: !!req.accepted_at },
                  { label: 'Intervention démarrée',   time: req.started_at,   done: !!req.started_at  },
                  { label: 'Mission terminée',         time: req.completed_at, done: !!req.completed_at },
                ].map((step) => (
                  <div key={step.label} className="flex items-start gap-4 pl-8 relative">
                    <div className={cn(
                      'absolute left-1.5 top-1 h-3 w-3 rounded-full border-2',
                      step.done ? 'bg-brand-500 border-brand-500' : 'bg-card border-border'
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

          {/* Avis (modale inline) */}
          {canReview && showReview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">Laisser un avis</h2>
                  <button onClick={() => setShowReview(false)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {technicianId !== null && (
                  <ReviewForm
                    requestId={requestId}
                    technicianId={technicianId}
                    onSuccess={() => { toast.success('Avis envoyé, merci !'); setShowReview(false) }}
                  />
                )}
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Artisan info */}
          {technicianId !== null && (
            <TechnicianInfo technicianId={technicianId} requestId={requestId} />
          )}

          {/* Prix */}
          <Card className="p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-500" />
              Paiement
            </h3>
            <div className="space-y-2 text-sm">
              {req.estimated_price != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix estimé</span>
                  <span className="font-bold">{formatGNF(req.estimated_price)}</span>
                </div>
              )}
              {req.final_price != null && (
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="font-medium">Prix final</span>
                  <span className="font-bold text-accent-700 dark:text-accent-300">{formatGNF(req.final_price)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-5 space-y-2">
            <h3 className="font-bold mb-3">Actions</h3>

            {isActive && technicianId !== null && (
              <Link href={`/chat/${req.id}`} className="block">
                <Button variant="accent" size="md" className="w-full">
                  <MessageCircle className="h-4 w-4" />
                  Contacter l'artisan
                </Button>
              </Link>
            )}

            {canPay && (
              <Link href={`/payment/${req.id}`} className="block">
                <Button variant="accent" size="md" className="w-full">
                  <CreditCard className="h-4 w-4" />
                  Payer la prestation
                </Button>
              </Link>
            )}

            {isPaid && (
              <>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Prestation payée</span>
                </div>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => setShowDispute(true)}
                >
                  <AlertCircle className="h-4 w-4" />
                  Ouvrir un litige
                </Button>
              </>
            )}

            {canReview && !showReview && (
              <Button
                variant="accent"
                size="md"
                className="w-full"
                onClick={() => setShowReview(true)}
              >
                <Star className="h-4 w-4" />
                Laisser un avis
              </Button>
            )}

            {canCancel && (
              <Button
                variant="destructive"
                size="md"
                className="w-full"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? <Spinner className="h-4 w-4" /> : 'Annuler la demande'}
              </Button>
            )}

            {req.status === 'completed' && !showReview && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">Intervention terminée</span>
              </div>
            )}

            {req.status === 'cancelled' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted text-muted-foreground">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Demande annulée</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modale de litige */}
      <Modal open={showDispute} onClose={() => setShowDispute(false)} title="Ouvrir un litige" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Expliquez le problème rencontré avec cette prestation. Notre équipe examinera votre demande.
          </p>
          <textarea
            rows={4}
            placeholder="Décrivez le motif du litige…"
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none"
          />
          <Button
            variant="accent"
            size="md"
            className="w-full"
            onClick={handleDispute}
            loading={createDispute.isPending}
          >
            Envoyer le litige
          </Button>
        </div>
      </Modal>
    </div>
  )
}
