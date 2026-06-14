'use client'

// ============================================================
// SOSLocal Web — Page de paiement autonome /payment/[id]
// Miroir fidèle du flux mobile (jobilink-mobile/app/payment/[id].tsx) :
//   • Onglets de méthode : Mobile Money / Carte / Espèces
//   • Grille opérateurs (Orange / MTN / Moov / Wave)
//   • Saisie du numéro +224
//   • Modale USSD + polling du statut (5 s, timeout 3 min)
//   • Carte → redirection Djomy
//   • Espèces → confirmé ensuite par le technicien
// 100 % backend réel (Djomy en mode sandbox tant que la clé n'est pas fournie).
// ============================================================

import { use, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Smartphone, CreditCard, Banknote,
  Phone, Info, CheckCircle2, XCircle, Loader2, X, Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatGNF } from '@/lib/utils/format'
import { useRequest } from '@/hooks/queries/useRequests'
import {
  useInitiateMobileMoney,
  useInitiateCard,
  useConfirmCash,
  usePaymentByRequest,
  fetchPaymentStatus,
} from '@/hooks/queries/usePayments'
import type {
  DjomyInitiateResponse,
  PaymentStatus,
  MobileMoneyOperator,
} from '@/types'

const POLL_INTERVAL_MS = 3_000
const POLL_TIMEOUT_MS   = 180_000
// Délai avant la sortie automatique de la modale une fois le paiement confirmé
// (l'utilisateur n'a rien à cliquer : on l'emmène vers la demande / l'avis).
const AUTO_EXIT_MS      = 1_500

type Method = 'mobile_money' | 'card' | 'cash'

interface Operator {
  key:   MobileMoneyOperator
  name:  string
  color: string
  icon:  string
}

const OPERATORS: Operator[] = [
  { key: 'orange', name: 'Orange Money', color: '#FF6600', icon: 'O' },
  { key: 'mtn',    name: 'MTN MoMo',     color: '#FFCC00', icon: 'M' },
  { key: 'moov',   name: 'Moov Money',   color: '#0066CC', icon: 'V' },
  { key: 'wave',   name: 'Wave',         color: '#1AC8DB', icon: 'W' },
]

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('224')) return `+${digits}`
  return `+224${digits}`
}

function validatePhone(raw: string) {
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 12
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PaymentPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const requestId = Number(id)

  const { data: req, isLoading } = useRequest(requestId)
  const { data: existingPayment } = usePaymentByRequest(requestId)

  const initMM   = useInitiateMobileMoney()
  const initCard = useInitiateCard()
  const confirmCash = useConfirmCash()

  // Form state
  const [method, setMethod]     = useState<Method>('mobile_money')
  const [operator, setOperator] = useState<MobileMoneyOperator>('orange')
  const [phone, setPhone]       = useState('')
  const [phoneErr, setPhoneErr] = useState('')

  // Polling / modale
  const [pendingOpen, setPendingOpen] = useState(false)
  const [pendingData, setPendingData] = useState<DjomyInitiateResponse | null>(null)
  const [pollStatus, setPollStatus]   = useState<PaymentStatus | null>(null)
  const [elapsed, setElapsed]         = useState(0)

  const pollTimer  = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickTimer  = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef = useRef(0)

  const stopPolling = useCallback(() => {
    if (pollTimer.current)  { clearInterval(pollTimer.current);  pollTimer.current  = null }
    if (tickTimer.current)  { clearInterval(tickTimer.current);  tickTimer.current  = null }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current);  timeoutRef.current = null }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  const startPolling = useCallback((paymentId: number) => {
    elapsedRef.current = 0
    setElapsed(0)

    tickTimer.current = setInterval(() => {
      elapsedRef.current += 1
      setElapsed(elapsedRef.current)
    }, 1000)

    const poll = async () => {
      try {
        const res = await fetchPaymentStatus(paymentId)
        if (res.status === 'completed') {
          stopPolling()
          setPollStatus('completed')
        } else if (res.status === 'failed' || res.status === 'cancelled') {
          stopPolling()
          setPollStatus(res.status)
        }
      } catch {
        /* erreurs réseau ignorées pendant le polling */
      }
    }

    // Premier contrôle immédiat (pas d'attente) → en sandbox la confirmation
    // arrive en ~1-2 s ; en réel on enchaîne toutes les 3 s.
    void poll()
    pollTimer.current = setInterval(poll, POLL_INTERVAL_MS)

    timeoutRef.current = setTimeout(() => {
      stopPolling()
      setPollStatus('failed')
    }, POLL_TIMEOUT_MS)
  }, [stopPolling])

  // Sortie automatique dès que le paiement est confirmé : l'utilisateur n'a
  // pas à fermer / annuler la modale lui-même. On l'emmène vers l'avis.
  useEffect(() => {
    if (pollStatus !== 'completed') return
    const t = setTimeout(() => {
      stopPolling()
      router.replace(`/beneficiaire/demandes/${id}?review=1`)
    }, AUTO_EXIT_MS)
    return () => clearTimeout(t)
  }, [pollStatus, id, router, stopPolling])

  const closePending = () => {
    stopPolling()
    const wasCompleted = pollStatus === 'completed'
    setPendingOpen(false)
    setPendingData(null)
    setPollStatus(null)
    setElapsed(0)
    if (wasCompleted) router.replace(`/beneficiaire/demandes/${id}`)
  }

  // Le montant à régler est UNIQUEMENT le prix final fixé par l'artisan après
  // la mission — jamais l'estimation initiale.
  const amount = req?.final_price ?? 0
  const loading = initMM.isPending || initCard.isPending || confirmCash.isPending

  async function handlePay() {
    if (method === 'mobile_money') {
      if (!phone.trim()) { setPhoneErr('Entrez votre numéro'); return }
      if (!validatePhone(phone)) { setPhoneErr('Numéro invalide (8 à 12 chiffres)'); return }
      setPhoneErr('')
    }

    try {
      if (method === 'mobile_money') {
        const res = await initMM.mutateAsync({
          request_id: requestId,
          phone_number: formatPhone(phone),
          operator,
          amount,
        })
        setPendingData(res)
        setPollStatus(null)
        setPendingOpen(true)
        startPolling(res.payment_id)
      } else if (method === 'card') {
        const res = await initCard.mutateAsync({ request_id: requestId, amount })
        if (res.redirect_url) {
          // Mode réel : ouvrir le checkout carte Djomy puis sonder le statut.
          window.open(res.redirect_url, '_blank', 'noopener')
          setPendingData(res)
          setPollStatus(null)
          setPendingOpen(true)
          startPolling(res.payment_id)
        } else if (res.sandbox) {
          // Mode sandbox (sans clé Djomy) : pas de page de checkout réelle. On
          // affiche l'attente et on sonde le statut, qui basculera « completed ».
          setPendingData(res)
          setPollStatus(null)
          setPendingOpen(true)
          startPolling(res.payment_id)
        } else {
          toast.error("Lien de paiement carte indisponible")
        }
      } else {
        await confirmCash.mutateAsync({ request_id: requestId, amount })
        toast.success('Paiement espèces enregistré', {
          description: "En attente de confirmation de l'artisan. Réglez le montant en main propre.",
        })
        setTimeout(() => router.replace(`/beneficiaire/demandes/${id}`), 1200)
      }
    } catch (err: any) {
      toast.error('Erreur de paiement', {
        description: err?.response?.data?.detail || err?.message || 'Erreur inattendue',
      })
    }
  }

  // ── États de chargement / garde-fous ──
  if (isLoading || !req) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // Paiement déjà réglé
  if (existingPayment && existingPayment.status === 'completed') {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="p-10 text-center space-y-4">
          <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold text-[rgb(var(--fg))]">Prestation déjà payée</h2>
          <p className="text-sm text-muted-foreground">
            Cette demande a déjà été réglée ({formatGNF(existingPayment.total_amount || existingPayment.amount)}).
          </p>
          <Button variant="outline" onClick={() => router.replace(`/beneficiaire/demandes/${id}`)}>
            <ArrowLeft className="h-4 w-4" /> Retour à la demande
          </Button>
        </Card>
      </div>
    )
  }

  if (amount <= 0) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="p-10 text-center space-y-4">
          <XCircle className="h-14 w-14 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-[rgb(var(--fg))]">Montant non disponible</h2>
          <p className="text-sm text-muted-foreground">
            Le technicien n'a pas encore défini le prix final de la prestation.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
        </Card>
      </div>
    )
  }

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const timer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  const op = OPERATORS.find((o) => o.key === pendingData?.operator)
  const isSuccess = pollStatus === 'completed'
  const isFailed  = pollStatus === 'failed' || pollStatus === 'cancelled'

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-[rgb(var(--fg))]">Paiement</h1>
      </div>

      {/* Résumé */}
      <Card className="p-5 space-y-3">
        <h3 className="font-semibold text-sm text-[rgb(var(--fg))]">Résumé</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Service</span>
          <span className="font-medium text-[rgb(var(--fg))]">{req.service?.name || req.service_name || req.title}</span>
        </div>
        {(req.technician?.name || req.technician_name) && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Technicien</span>
            <span className="font-medium text-[rgb(var(--fg))]">{req.technician?.name || req.technician_name}</span>
          </div>
        )}
        <div className="border-t border-border pt-3 flex justify-between items-center">
          <span className="font-bold text-[rgb(var(--fg))]">Total à payer</span>
          <span className="text-xl font-extrabold text-brand-600">{formatGNF(amount)}</span>
        </div>
      </Card>

      {/* Méthode */}
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground mb-2">MÉTHODE DE PAIEMENT</p>
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-muted border border-border">
          {([
            { key: 'mobile_money', label: 'Mobile Money', Icon: Smartphone },
            { key: 'card',         label: 'Carte',        Icon: CreditCard },
            { key: 'cash',         label: 'Espèces',      Icon: Banknote },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setMethod(key)}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all',
                method === key ? 'bg-card shadow-sm text-brand-600' : 'text-muted-foreground hover:text-[rgb(var(--fg))]'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Money */}
      {method === 'mobile_money' && (
        <div className="space-y-4">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground">OPÉRATEUR</p>
          <div className="grid grid-cols-2 gap-3">
            {OPERATORS.map((o) => {
              const active = operator === o.key
              return (
                <button
                  key={o.key}
                  onClick={() => setOperator(o.key)}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all bg-card',
                    active ? 'border-current' : 'border-border hover:border-brand-300'
                  )}
                  style={active ? { borderColor: o.color } : undefined}
                >
                  <span
                    className="h-11 w-11 rounded-full flex items-center justify-center text-lg font-extrabold text-white"
                    style={{ backgroundColor: o.color }}
                  >
                    {o.icon}
                  </span>
                  <span
                    className={cn('text-sm', active ? 'font-bold' : 'text-[rgb(var(--fg))]')}
                    style={active ? { color: o.color } : undefined}
                  >
                    {o.name}
                  </span>
                  {active && (
                    <span
                      className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: o.color }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <p className="text-xs font-semibold tracking-wider text-muted-foreground">NUMÉRO DE TÉLÉPHONE</p>
          <div className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-2xl border-2 bg-muted',
            phoneErr ? 'border-red-500' : 'border-border'
          )}>
            <span className="text-xl">🇬🇳</span>
            <span className="text-muted-foreground font-medium">+224</span>
            <input
              type="tel"
              inputMode="tel"
              placeholder="6XX XX XX XX"
              maxLength={12}
              value={phone}
              onChange={(e) => { setPhone(e.target.value); if (phoneErr) setPhoneErr('') }}
              className="flex-1 bg-transparent outline-none text-[rgb(var(--fg))]"
            />
          </div>
          {phoneErr && <p className="text-sm text-red-500 -mt-2">{phoneErr}</p>}

          <div className="flex items-start gap-2 p-3 rounded-2xl bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800">
            <Info className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-brand-700 dark:text-brand-300">
              Un code USSD vous sera communiqué pour confirmer le paiement.
            </p>
          </div>
        </div>
      )}

      {/* Carte */}
      {method === 'card' && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
          <CreditCard className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Vous serez redirigé vers la page sécurisée Djomy pour saisir vos informations de carte.
          </p>
        </div>
      )}

      {/* Espèces */}
      {method === 'cash' && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
          <Banknote className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Remettez <span className="font-bold">{formatGNF(amount)}</span> en main propre au technicien.
            Il confirmera la réception depuis son application.
          </p>
        </div>
      )}

      {/* CTA */}
      <Button variant="accent" size="lg" className="w-full" onClick={handlePay} loading={loading}>
        {method === 'mobile_money' ? <Phone className="h-5 w-5" /> : method === 'card' ? <CreditCard className="h-5 w-5" /> : <Banknote className="h-5 w-5" />}
        Payer {formatGNF(amount)}
      </Button>

      {/* ── Modale d'attente / confirmation ── */}
      {pendingOpen && pendingData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55">
          <div className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 space-y-5 animate-slide-up">
            {isSuccess ? (
              <div className="flex flex-col items-center text-center gap-2 py-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h3 className="text-xl font-extrabold text-[rgb(var(--fg))]">Paiement confirmé !</h3>
                <p className="text-sm text-muted-foreground">Votre paiement a bien été reçu.</p>
              </div>
            ) : isFailed ? (
              <div className="flex flex-col items-center text-center gap-2 py-4">
                <XCircle className="h-16 w-16 text-red-500" />
                <h3 className="text-xl font-extrabold text-red-500">Paiement échoué</h3>
                <p className="text-sm text-muted-foreground">La transaction n'a pas abouti. Réessayez.</p>
              </div>
            ) : (
              <>
                {/* En-tête opérateur */}
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: (op?.color ?? '#0078FF') + '20' }}>
                  <span
                    className="h-12 w-12 rounded-full flex items-center justify-center text-xl font-extrabold text-white"
                    style={{ backgroundColor: op?.color ?? '#0078FF' }}
                  >
                    {op?.icon ? op.icon : <Smartphone className="h-6 w-6" aria-hidden />}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-[rgb(var(--fg))]">{op?.name ?? 'Mobile Money'}</div>
                    <div className="text-sm text-muted-foreground">{pendingData.phone_number}</div>
                  </div>
                </div>

                {/* Code USSD */}
                {pendingData.ussd_code ? (
                  <div className="rounded-2xl bg-muted border border-border p-5 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Composez ce code sur votre téléphone</p>
                    <p className="text-2xl font-extrabold tracking-widest text-[rgb(var(--fg))]">{pendingData.ussd_code}</p>
                    <p className="text-xs text-muted-foreground">Puis suivez les instructions pour confirmer le paiement.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-muted border border-border p-5 text-center space-y-1">
                    <p className="text-sm text-muted-foreground">Vérifiez votre application {op?.name}</p>
                    <p className="text-xs text-muted-foreground">Approuvez la demande de paiement dans votre app {op?.name}.</p>
                  </div>
                )}

                {/* Attente */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/10">
                  <Loader2 className="h-4 w-4 text-brand-600 animate-spin" />
                  <span className="flex-1 text-sm text-brand-700 dark:text-brand-300">En attente de confirmation…</span>
                  <span className="text-sm font-bold text-brand-600 tabular-nums">{timer}</span>
                </div>
              </>
            )}

            {isSuccess ? (
              <div className="space-y-2">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  onClick={() => { stopPolling(); router.replace(`/beneficiaire/demandes/${id}?review=1`) }}
                >
                  <Star className="h-5 w-5" />
                  Noter l'artisan
                </Button>
                <Button variant="ghost" size="lg" className="w-full" onClick={closePending}>
                  Plus tard
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="lg" className="w-full" onClick={closePending}>
                {isFailed ? 'Fermer' : <><X className="h-4 w-4" /> Annuler</>}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
