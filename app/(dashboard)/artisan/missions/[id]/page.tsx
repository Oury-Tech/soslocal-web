'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Clock, Phone, MessageCircle,
  CheckCircle2, AlertCircle, Navigation, Wrench, User,
  Calendar, CreditCard, X, DollarSign, Flag, Banknote,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import {
  useRequest, useAcceptRequest, useStartRequest,
  useCompleteRequest, useCancelRequest, useSetFinalPrice,
} from '@/hooks/queries/useRequests'
import { usePaymentByRequest, useConfirmCashReceived } from '@/hooks/queries/usePayments'
import { formatGNF, formatRelative, formatDateTime, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { DynamicMap } from '@/components/maps/dynamic-map'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { RequestStatus } from '@/types'
import { useArtisanLocationPublisher } from '@/stores/ws.store'

interface PageProps {
  params: Promise<{ id: string }>
}

/* ─── Inline dialog ─────────────────────────────────────────── */
function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground min-w-0 truncate">{title}</h3>
          <button
            onClick={onClose}
            className="flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  )
}

/* ─── GNF input ─────────────────────────────────────────────── */
function GnfInput({
  label,
  value,
  onChange,
  min = 1000,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  min?: number
}) {
  const num = parseInt(value.replace(/\D/g, ''), 10) || 0
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">GNF</span>
        <input
          type="number"
          inputMode="numeric"
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: 150000"
          className="w-full pl-14 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
      </div>
      {num > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">{formatGNF(num)}</p>
      )}
    </div>
  )
}

/* ─── Status config ─────────────────────────────────────────── */
const STATUS_CONFIG: Record<RequestStatus, { label: string; variant: any; pulse?: boolean }> = {
  pending:     { label: 'En attente',    variant: 'warning' },
  matched:     { label: 'Matching…',     variant: 'primary', pulse: true },
  accepted:    { label: 'Acceptée',      variant: 'primary' },
  in_progress: { label: 'En cours',      variant: 'accent',  pulse: true },
  completed:   { label: 'Terminée',      variant: 'success' },
  cancelled:   { label: 'Annulée',       variant: 'default' },
  rejected:    { label: 'Refusée',       variant: 'danger' },
  expired:     { label: 'Expirée',       variant: 'danger' },
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function MissionDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router  = useRouter()

  const { data: request, isLoading, error } = useRequest(id)
  const { data: payment } = usePaymentByRequest(id)
  const acceptMutation   = useAcceptRequest()
  const startMutation    = useStartRequest()
  const completeMutation = useCompleteRequest()
  const cancelMutation   = useCancelRequest()
  const setPriceMutation = useSetFinalPrice()
  const confirmCashMutation = useConfirmCashReceived()

  // Dialog states
  const [acceptOpen,   setAcceptOpen]   = useState(false)
  const [startOpen,    setStartOpen]    = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [repriceOpen,  setRepriceOpen]  = useState(false)
  const [cancelOpen,   setCancelOpen]   = useState(false)
  const [cashOpen,     setCashOpen]     = useState(false)

  // Form values for dialogs
  const [finalPrice,   setFinalPrice]   = useState('')
  const [priceMayVary, setPriceMayVary] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Publie la position GPS live de l'artisan tant que la mission est active.
  const missionActive = request?.status === 'accepted' || request?.status === 'in_progress'
  useArtisanLocationPublisher(Number(id), missionActive)

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

  const statusCfg  = STATUS_CONFIG[request.status]
  const canAccept  = request.status === 'pending' || request.status === 'matched'
  const canStart   = request.status === 'accepted'
  const canFinish  = request.status === 'in_progress'
  const isActive   = ['accepted', 'in_progress'].includes(request.status)
  const canCancel  = canAccept || isActive
  // Le prix est fixé à l'acceptation, puis modifiable (négociation) tant que la
  // mission n'est pas payée.
  const canReprice = ['accepted', 'in_progress', 'completed'].includes(request.status) && !request.is_paid
  const hasFinalPrice = !!request.final_price && request.final_price > 0

  // Paiement en espèces : le client a choisi « espèces » → l'artisan doit
  // confirmer la réception en main propre pour que l'état passe à « payé ».
  const cashPending   = payment?.method === 'cash' && payment.status !== 'completed'
  const cashConfirmed = payment?.method === 'cash' && payment.status === 'completed'

  // Chronologie pilotée par le statut réel (gère aussi annulée / refusée / expirée).
  const timelineSteps: { label: string; time?: string | null; state: string }[] = (() => {
    const s = request.status
    if (s === 'cancelled' || s === 'rejected' || s === 'expired') {
      const failLabel =
        s === 'cancelled' ? 'Mission annulée' : s === 'rejected' ? 'Mission refusée' : 'Mission expirée'
      const base = [{ label: 'Demande créée', time: request.created_at, state: 'done' }]
      if (request.accepted_at) base.push({ label: 'Mission acceptée', time: request.accepted_at, state: 'done' })
      base.push({ label: failLabel, time: (request as any).cancelled_at ?? (request as any).updated_at ?? null, state: 'failed' })
      return base
    }
    const raw = [
      { label: 'Demande créée',          time: request.created_at,   done: true },
      { label: 'Mission acceptée',        time: request.accepted_at,  done: !!request.accepted_at },
      { label: 'Intervention démarrée',  time: request.started_at,   done: !!request.started_at },
      { label: 'Terminée',                time: request.completed_at, done: !!request.completed_at },
    ]
    if (s === 'completed') {
      raw.push({ label: 'Paiement réglé', time: (request as any).paid_at ?? null, done: !!request.is_paid })
    }
    const firstPending = raw.findIndex((r) => !r.done)
    return raw.map((r, i) => ({
      label: r.label,
      time: r.time,
      state: r.done ? 'done' : i === firstPending ? 'current' : 'pending',
    }))
  })()

  const pos = { lat: request.latitude, lng: request.longitude }

  /* ─── Handlers ────────────────────────────────────────────── */
  async function doAccept() {
    // L'artisan fixe son prix au moment d'accepter la demande.
    const price = parseInt(finalPrice.replace(/\D/g, ''), 10) || undefined
    if (!price || price < 1000) {
      toast.error('Saisissez votre prix (min. 1 000 GNF)')
      return
    }
    try {
      await acceptMutation.mutateAsync({ id: request!.id, finalPrice: price })
      toast.success(`Mission acceptée ! Prix proposé : ${formatGNF(price)}`)
      setAcceptOpen(false)
      setFinalPrice('')
    } catch {
      toast.error("Impossible d'accepter cette mission.")
    }
  }

  async function doReprice() {
    const price = parseInt(finalPrice.replace(/\D/g, ''), 10) || undefined
    if (!price || price < 1000) {
      toast.error('Saisissez un montant valide (min. 1 000 GNF)')
      return
    }
    try {
      await setPriceMutation.mutateAsync({ id: request!.id, finalPrice: price, priceMayVary })
      toast.success(
        priceMayVary
          ? `Montant indicatif transmis : ${formatGNF(price)} (le client doit confirmer)`
          : `Montant transmis au client : ${formatGNF(price)}`,
      )
      setRepriceOpen(false)
      setFinalPrice('')
      setPriceMayVary(false)
    } catch {
      toast.error('Impossible de mettre à jour le montant.')
    }
  }

  async function doStart() {
    try {
      await startMutation.mutateAsync(request!.id)
      toast.success('Intervention démarrée !')
      setStartOpen(false)
    } catch {
      toast.error('Impossible de démarrer la mission.')
    }
  }

  async function doComplete() {
    // Le prix a déjà été fixé à l'acceptation : on permet seulement de l'ajuster
    // si l'artisan le souhaite, sinon on conserve le montant existant.
    const price = parseInt(finalPrice.replace(/\D/g, ''), 10) || undefined
    try {
      await completeMutation.mutateAsync({ id: request!.id, finalPrice: price })
      toast.success('Mission terminée ! Le client peut régler.')
      setCompleteOpen(false)
    } catch {
      toast.error('Impossible de terminer la mission.')
    }
  }

  async function doConfirmCash() {
    try {
      await confirmCashMutation.mutateAsync(request!.id)
      toast.success('Paiement espèces confirmé ! Le client est marqué comme payé.')
      setCashOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Impossible de confirmer le paiement espèces.")
    }
  }

  async function doCancel() {
    if (cancelReason.trim().length < 5) {
      toast.error('Indiquez une raison (min. 5 caractères)')
      return
    }
    try {
      await cancelMutation.mutateAsync({ id: request!.id, reason: cancelReason.trim() })
      toast.success('Mission annulée.')
      router.push('/artisan/missions')
    } catch {
      toast.error("Impossible d'annuler.")
    }
  }

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/artisan/missions" className="flex-shrink-0">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Missions
            </Button>
          </Link>
          <span className="text-muted-foreground text-sm flex-shrink-0">/</span>
          <span className="text-sm font-medium truncate min-w-0">{request.title}</span>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <ServiceIcon
                  slug={(request.service as any)?.slug}
                  name={(request.service as any)?.name}
                  className="h-7 w-7 text-brand-600 flex-shrink-0"
                />
                <Badge variant={statusCfg.variant}>
                  {statusCfg.pulse && (
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse mr-1" />
                  )}
                  {statusCfg.label}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold break-words">{request.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-muted-foreground text-sm">
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
              {hasFinalPrice ? (
                <>
                  <div className="text-3xl font-extrabold text-accent-700 dark:text-accent-300">
                    {formatGNF(request.final_price!)}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">Montant à régler</div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-muted-foreground">À fixer</div>
                  <div className="text-muted-foreground text-xs mt-0.5">en acceptant</div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <Card className="p-6">
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-accent-600 dark:text-accent-400" />
                Détail de l'intervention
              </h2>
              <p className="text-muted-foreground leading-relaxed">{request.description}</p>

              {request.service && (
                <div className="mt-4 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <span className="h-10 w-10 rounded-lg bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                    <ServiceIcon slug={(request.service as any).slug} name={(request.service as any).name} className="h-5 w-5 text-accent-600 dark:text-accent-400" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{(request.service as any).name}</div>
                    <div className="text-xs text-muted-foreground truncate">{(request.service as any).category}</div>
                  </div>
                  {(request.service as any).estimated_price_min && (
                    <div className="ml-auto text-right">
                      <div className="text-sm font-bold text-accent-700 dark:text-accent-300">
                        {formatGNF((request.service as any).estimated_price_min)} – {formatGNF((request.service as any).estimated_price_max ?? 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Fourchette habituelle</div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Map */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-accent-600 dark:text-accent-400" />
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
                <Calendar className="h-5 w-5 text-accent-600 dark:text-accent-400" />
                Chronologie
              </h2>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-4">
                  {timelineSteps.map((step) => (
                    <div key={step.label} className="flex items-start gap-4 pl-8 relative">
                      <div className={cn(
                        'absolute left-1.5 top-1 h-3 w-3 rounded-full border-2 transition-colors',
                        step.state === 'done'    && 'bg-brand-500 border-brand-500',
                        step.state === 'current' && 'bg-card border-brand-500 ring-2 ring-brand-500/30 animate-pulse',
                        step.state === 'pending' && 'bg-card border-border',
                        step.state === 'failed'  && 'bg-red-500 border-red-500',
                      )} />
                      <div>
                        <div className={cn(
                          'text-sm font-medium',
                          step.state === 'pending' && 'text-muted-foreground',
                          step.state === 'failed'  && 'text-red-600 dark:text-red-400',
                        )}>
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

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Client info */}
            {(request.client || request.client_name) && (
              <Card className="p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                  Client
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    fallback={getInitials(request.client?.name ?? request.client_name ?? 'C')}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {request.client?.name ?? request.client_name ?? 'Client'}
                    </div>
                    {(request.client?.phone ?? request.client_phone) && (
                      <div className="text-xs text-muted-foreground truncate">
                        {request.client?.phone ?? request.client_phone}
                      </div>
                    )}
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
                    <a href={`tel:${request.client?.phone ?? request.client_phone}`}>
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
                <CreditCard className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                Paiement
              </h3>
              <div className="space-y-2 text-sm">
                {!!request.estimated_price && request.estimated_price > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget indicatif</span>
                    <span className="font-medium">{formatGNF(request.estimated_price)}</span>
                  </div>
                )}
                {hasFinalPrice ? (
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="font-semibold">Montant à régler</span>
                    <span className="font-bold text-accent-700 dark:text-accent-300">
                      {formatGNF(request.final_price!)}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Fixez votre prix en acceptant la demande.
                  </p>
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
                  onClick={() => {
                    setFinalPrice(String(request.estimated_price ?? ''))
                    setAcceptOpen(true)
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accepter & fixer le prix
                </Button>
              )}

              {canStart && (
                <Button
                  variant="accent"
                  size="md"
                  className="w-full"
                  onClick={() => setStartOpen(true)}
                >
                  <Navigation className="h-4 w-4" />
                  Démarrer l'intervention
                </Button>
              )}

              {canFinish && (
                <Button
                  variant="accent"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setFinalPrice(String(request.final_price ?? request.estimated_price ?? ''))
                    setCompleteOpen(true)
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Marquer comme terminée
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="destructive"
                  size="md"
                  className="w-full"
                  onClick={() => setCancelOpen(true)}
                >
                  <X className="h-4 w-4" />
                  {canAccept ? 'Refuser la mission' : 'Annuler la mission'}
                </Button>
              )}

              {canReprice && (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setFinalPrice(String(request.final_price ?? ''))
                    setRepriceOpen(true)
                  }}
                >
                  <DollarSign className="h-4 w-4" />
                  {hasFinalPrice ? 'Modifier le montant' : 'Fixer le montant'}
                </Button>
              )}

              {/* Paiement espèces : bouton de confirmation par l'artisan */}
              {cashPending && (
                <Button
                  variant="accent"
                  size="md"
                  className="w-full"
                  onClick={() => setCashOpen(true)}
                >
                  <Banknote className="h-4 w-4" />
                  J'ai reçu le paiement en espèces
                </Button>
              )}

              {cashConfirmed && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                  <Banknote className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Paiement espèces confirmé — client réglé</span>
                </div>
              )}

              {request.status === 'completed' && !cashPending && !cashConfirmed && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {hasFinalPrice
                      ? 'Mission terminée — en attente du paiement client'
                      : 'Mission terminée — fixez le montant à régler'}
                  </span>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* ── Dialog : Accepter (sans prix) ── */}
      <AnimatePresence>
        {acceptOpen && (
          <Dialog open title="Accepter & fixer le prix" onClose={() => setAcceptOpen(false)}>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="font-semibold text-sm truncate">{request.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{request.description}</p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                <CheckCircle2 className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-brand-900 dark:text-brand-100">
                  En acceptant, vous proposez votre prix au client. Il en sera notifié
                  immédiatement et pourra <strong>accepter ou faire une contre-proposition</strong>.
                </p>
              </div>

              <GnfInput
                label="Votre prix (GNF)"
                value={finalPrice}
                onChange={setFinalPrice}
                min={1000}
              />

              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="md"
                  className="flex-1"
                  onClick={() => setAcceptOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="accent"
                  size="md"
                  className="flex-1"
                  loading={acceptMutation.isPending}
                  onClick={doAccept}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accepter
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* ── Dialog : Fixer / renégocier le montant (après mission) ── */}
      <AnimatePresence>
        {repriceOpen && (
          <Dialog
            open
            title={hasFinalPrice ? 'Modifier le montant' : 'Fixer le montant'}
            onClose={() => setRepriceOpen(false)}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-accent-50 dark:bg-accent-900/20">
                <DollarSign className="h-5 w-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-accent-900 dark:text-accent-100">
                  Indiquez (ou ajustez après négociation) le montant que le client doit
                  régler. Il en sera notifié immédiatement.
                </p>
              </div>

              <GnfInput
                label="Montant à régler (GNF)"
                value={finalPrice}
                onChange={setFinalPrice}
                min={1000}
              />

              <label className="flex items-start gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted/50">
                <input
                  type="checkbox"
                  checked={priceMayVary}
                  onChange={(e) => setPriceMayVary(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand-600"
                />
                <span className="text-sm text-[rgb(var(--fg))]">
                  Le montant peut varier selon le travail
                  <span className="block text-xs text-muted-foreground">
                    Le client sera prévenu que ce prix est indicatif et devra le confirmer avant de payer.
                  </span>
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => setRepriceOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="accent"
                  size="md"
                  className="flex-1"
                  loading={setPriceMutation.isPending}
                  onClick={doReprice}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Transmettre
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* ── Dialog : Démarrer ── */}
      <AnimatePresence>
        {startOpen && (
          <Dialog open title="Démarrer l'intervention" onClose={() => setStartOpen(false)}>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                <Navigation className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-brand-900 dark:text-brand-100">
                  Confirmez que vous êtes sur place et prêt à commencer l'intervention.
                </p>
              </div>

              {request.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{request.address}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => setStartOpen(false)}>
                  Pas encore
                </Button>
                <Button
                  variant="accent"
                  size="md"
                  className="flex-1"
                  loading={startMutation.isPending}
                  onClick={doStart}
                >
                  <Flag className="h-4 w-4" />
                  Démarrer
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* ── Dialog : Terminer avec prix final ── */}
      <AnimatePresence>
        {completeOpen && (
          <Dialog open title="Confirmer la fin de mission" onClose={() => setCompleteOpen(false)}>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-accent-50 dark:bg-accent-900/20">
                <CheckCircle2 className="h-5 w-5 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-accent-900 dark:text-accent-100">
                  Confirmez le montant à régler. Vous pouvez l'ajuster ici si besoin&nbsp;;
                  sinon laissez le montant déjà annoncé. Le client pourra ensuite régler.
                </p>
              </div>

              <GnfInput
                label="Montant à régler (GNF)"
                value={finalPrice}
                onChange={setFinalPrice}
                min={1000}
              />

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => setCompleteOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="accent"
                  size="md"
                  className="flex-1"
                  loading={completeMutation.isPending}
                  onClick={doComplete}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmer
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* ── Dialog : Confirmer la réception espèces ── */}
      <AnimatePresence>
        {cashOpen && (
          <Dialog open title="Confirmer le paiement espèces" onClose={() => setCashOpen(false)}>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <Banknote className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-900 dark:text-green-100">
                  Confirmez avoir reçu <strong>{formatGNF(payment?.total_amount ?? payment?.amount ?? request.final_price ?? 0)}</strong> en
                  main propre. Le paiement sera marqué comme réglé côté client.
                </p>
              </div>

              {payment?.cash_proof_url ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground">PREUVE ENVOYÉE PAR LE CLIENT</p>
                  <a href={payment.cash_proof_url} target="_blank" rel="noopener noreferrer" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={payment.cash_proof_url}
                      alt="Preuve de paiement en espèces"
                      className="w-full max-h-64 rounded-xl object-contain border border-border"
                    />
                  </a>
                </div>
              ) : (
                <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  Le client n'a pas encore envoyé de photo de preuve.
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => setCashOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="accent"
                  size="md"
                  className="flex-1"
                  loading={confirmCashMutation.isPending}
                  onClick={doConfirmCash}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmer la réception
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* ── Dialog : Annuler avec raison ── */}
      <AnimatePresence>
        {cancelOpen && (
          <Dialog
            open
            title={canAccept ? 'Refuser la mission' : 'Annuler la mission'}
            onClose={() => setCancelOpen(false)}
          >
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900 dark:text-red-100">
                  Cette action sera communiquée au client. Merci d'indiquer la raison.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Raison (obligatoire)</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Je ne suis pas disponible à cette heure-là…"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                />
                <p className="mt-1 text-xs text-muted-foreground">{cancelReason.length}/300 (min. 5)</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => setCancelOpen(false)}>
                  Retour
                </Button>
                <Button
                  variant="destructive"
                  size="md"
                  className="flex-1"
                  loading={cancelMutation.isPending}
                  onClick={doCancel}
                >
                  <X className="h-4 w-4" />
                  Confirmer
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
