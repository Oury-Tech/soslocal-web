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
  FileText, Download, Hash, Calendar, Wallet, Camera, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatGNF } from '@/lib/utils/format'
import { useRequest, useConfirmPrice } from '@/hooks/queries/useRequests'
import {
  useInitiateMobileMoney,
  useInitiateCard,
  useConfirmCash,
  useUploadCashProof,
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
// En mode simulation (sandbox Djomy), on garantit la confirmation du paiement
// en ≤ 8 s même si le backend met du temps à se synchroniser : passé ce délai
// on bascule l'écran sur le reçu. En réel ce filet de sécurité ne s'applique pas.
const SANDBOX_CONFIRM_MS = 8_000

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
  const uploadCashProof = useUploadCashProof()
  const confirmPrice = useConfirmPrice()

  // Form state
  const [method, setMethod]     = useState<Method>('mobile_money')
  const [operator, setOperator] = useState<MobileMoneyOperator>('orange')
  const [phone, setPhone]       = useState('')
  const [phoneErr, setPhoneErr] = useState('')
  // Espèces : photo de preuve choisie par le client (reçu / billets).
  const [cashProofFile, setCashProofFile] = useState<File | null>(null)
  const [cashProofPreview, setCashProofPreview] = useState<string | null>(null)

  // Polling / modale
  const [pendingOpen, setPendingOpen] = useState(false)
  const [pendingData, setPendingData] = useState<DjomyInitiateResponse | null>(null)
  const [pollStatus, setPollStatus]   = useState<PaymentStatus | null>(null)
  const [elapsed, setElapsed]         = useState(0)
  // Méthode réellement utilisée + horodatage de confirmation → reçu.
  const [paidMethod, setPaidMethod]   = useState<Method>('mobile_money')
  const [paidAt, setPaidAt]           = useState<Date | null>(null)

  const pollTimer    = useRef<ReturnType<typeof setInterval> | null>(null)
  const tickTimer    = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sandboxRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef   = useRef(0)

  const markPaid = useCallback(() => {
    setPollStatus('completed')
    setPaidAt(new Date())
  }, [])

  const stopPolling = useCallback(() => {
    if (pollTimer.current)  { clearInterval(pollTimer.current);  pollTimer.current  = null }
    if (tickTimer.current)  { clearInterval(tickTimer.current);  tickTimer.current  = null }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current);  timeoutRef.current = null }
    if (sandboxRef.current) { clearTimeout(sandboxRef.current);  sandboxRef.current = null }
  }, [])

  useEffect(() => () => stopPolling(), [stopPolling])

  const startPolling = useCallback((paymentId: number, sandbox = false) => {
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
          markPaid()
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

    // Filet de sécurité simulation : on garantit le reçu en ≤ 8 s.
    if (sandbox) {
      sandboxRef.current = setTimeout(() => {
        stopPolling()
        markPaid()
      }, SANDBOX_CONFIRM_MS)
    }

    timeoutRef.current = setTimeout(() => {
      stopPolling()
      setPollStatus('failed')
    }, POLL_TIMEOUT_MS)
  }, [stopPolling, markPaid])

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
  const loading =
    initMM.isPending || initCard.isPending || confirmCash.isPending || uploadCashProof.isPending
  // Prix indicatif : l'artisan a prévenu que le montant peut évoluer. Le client
  // doit confirmer le montant avant de pouvoir payer.
  const needsPriceConfirm = !!req?.price_may_vary && !req?.price_confirmed_by_client

  function handlePickCashProof(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setCashProofFile(file)
    setCashProofPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
  }

  async function handleConfirmPrice() {
    try {
      await confirmPrice.mutateAsync({ id: requestId })
      toast.success('Montant confirmé', {
        description: 'Vous pouvez maintenant procéder au paiement.',
      })
    } catch (err: any) {
      toast.error('Erreur', {
        description: err?.response?.data?.detail || err?.message || 'Confirmation impossible',
      })
    }
  }

  async function handlePay() {
    if (needsPriceConfirm) {
      toast.error('Confirmez d’abord le montant', {
        description: 'Le montant peut varier : merci de le confirmer avant de payer.',
      })
      return
    }
    if (method === 'mobile_money') {
      if (!phone.trim()) { setPhoneErr('Entrez votre numéro'); return }
      if (!validatePhone(phone)) { setPhoneErr('Numéro invalide (8 à 12 chiffres)'); return }
      setPhoneErr('')
    }
    if (method === 'cash' && !cashProofFile) {
      toast.error('Photo de preuve requise', {
        description: 'Ajoutez une photo (reçu / billets) prouvant le paiement en espèces.',
      })
      return
    }

    try {
      if (method === 'mobile_money') {
        const res = await initMM.mutateAsync({
          request_id: requestId,
          phone_number: formatPhone(phone),
          operator,
          amount,
        })
        setPaidMethod('mobile_money')
        setPendingData(res)
        setPollStatus(null)
        setPendingOpen(true)
        startPolling(res.payment_id, !!res.sandbox)
      } else if (method === 'card') {
        const res = await initCard.mutateAsync({ request_id: requestId, amount })
        if (res.redirect_url) {
          // Mode réel : ouvrir le checkout carte Djomy puis sonder le statut.
          window.open(res.redirect_url, '_blank', 'noopener')
          setPaidMethod('card')
          setPendingData(res)
          setPollStatus(null)
          setPendingOpen(true)
          startPolling(res.payment_id, !!res.sandbox)
        } else if (res.sandbox) {
          // Mode sandbox (sans clé Djomy) : pas de page de checkout réelle. On
          // affiche l'attente et on sonde le statut, qui basculera « completed ».
          setPaidMethod('card')
          setPendingData(res)
          setPollStatus(null)
          setPendingOpen(true)
          startPolling(res.payment_id, true)
        } else {
          toast.error("Lien de paiement carte indisponible")
        }
      } else {
        // Espèces : on enregistre le paiement puis on envoie la photo de preuve.
        // Le paiement passe « en attente de validation » ; l'artisan vérifie la
        // preuve puis confirme la réception depuis son application.
        await confirmCash.mutateAsync({ request_id: requestId, amount })
        await uploadCashProof.mutateAsync({ request_id: requestId, file: cashProofFile! })
        toast.success('Preuve envoyée', {
          description: "L'artisan va vérifier votre preuve puis confirmer la réception.",
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

  // ── Reçu de paiement (plein écran) ───────────────────────────────
  // Dès que le paiement est confirmé, on remplace le formulaire par un reçu,
  // exactement comme le ticket reçu après un dépôt Orange Money / Maxit.
  if (isSuccess) {
    const methodLabel =
      paidMethod === 'mobile_money' ? (op?.name ?? 'Mobile Money')
      : paidMethod === 'card'       ? 'Carte bancaire'
      :                               'Espèces'
    const ref =
      pendingData?.transaction_ref
      ?? (pendingData?.payment_id ? `SOS-${pendingData.payment_id}` : '—')
    const when = (paidAt ?? new Date()).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card className="overflow-hidden p-0">
          {/* Bandeau « payé » */}
          <div className="bg-green-500 px-6 py-8 text-center text-white">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold">Paiement réussi</h2>
            <p className="mt-1 text-sm text-white/90">Votre reçu est disponible ci-dessous</p>
            <p className="mt-4 text-3xl font-extrabold tabular-nums">{formatGNF(amount)}</p>
          </div>

          {/* Détail du reçu */}
          <div className="space-y-px bg-border">
            <ReceiptRow icon={FileText} label="Service" value={req.service?.name || req.service_name || req.title} />
            {(req.technician?.name || req.technician_name) && (
              <ReceiptRow icon={Star} label="Technicien" value={req.technician?.name || req.technician_name!} />
            )}
            <ReceiptRow icon={Wallet} label="Méthode" value={methodLabel} />
            {paidMethod === 'mobile_money' && pendingData?.phone_number && (
              <ReceiptRow icon={Phone} label="Numéro" value={pendingData.phone_number} />
            )}
            <ReceiptRow icon={Hash} label="Référence" value={ref} mono />
            <ReceiptRow icon={Calendar} label="Date" value={when} />
          </div>

          {/* Actions */}
          <div className="space-y-2 p-5">
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => { stopPolling(); router.replace(`/beneficiaire/demandes/${id}?review=1`) }}
            >
              <Star className="h-5 w-5" />
              Noter l'artisan
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => { window.print() }}
            >
              <Download className="h-5 w-5" />
              Télécharger le reçu
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => { stopPolling(); router.replace(`/beneficiaire/demandes/${id}`) }}
            >
              Voir ma demande
            </Button>
          </div>
        </Card>
      </div>
    )
  }

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
        <div className="flex justify-between gap-3 text-sm">
          <span className="text-muted-foreground flex-shrink-0">Service</span>
          <span className="font-medium text-[rgb(var(--fg))] min-w-0 text-right break-words">{req.service?.name || req.service_name || req.title}</span>
        </div>
        {(req.technician?.name || req.technician_name) && (
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground flex-shrink-0">Technicien</span>
            <span className="font-medium text-[rgb(var(--fg))] min-w-0 text-right break-words">{req.technician?.name || req.technician_name}</span>
          </div>
        )}
        <div className="border-t border-border pt-3 flex justify-between items-center gap-3">
          <span className="font-bold text-[rgb(var(--fg))] flex-shrink-0">Total à payer</span>
          <span className="text-xl font-extrabold text-brand-600 text-right">{formatGNF(amount)}</span>
        </div>
        {req.price_may_vary && (
          <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            L'artisan a indiqué que ce montant est indicatif et peut évoluer selon le travail réellement constaté.
          </p>
        )}
      </Card>

      {/* Prix indicatif : confirmation obligatoire avant paiement */}
      {needsPriceConfirm && (
        <Card className="p-5 space-y-3 border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-900/10">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-[rgb(var(--fg))]">Confirmez le montant</h3>
              <p className="text-sm text-muted-foreground">
                Le montant <span className="font-bold">{formatGNF(amount)}</span> peut varier selon le travail.
                Confirmez-le pour débloquer le paiement.
              </p>
            </div>
          </div>
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            onClick={handleConfirmPrice}
            loading={confirmPrice.isPending}
          >
            <CheckCircle2 className="h-5 w-5" />
            Je confirme {formatGNF(amount)}
          </Button>
        </Card>
      )}

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
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
            <Banknote className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Remettez <span className="font-bold">{formatGNF(amount)}</span> en main propre au technicien,
              puis ajoutez une <span className="font-bold">photo de preuve</span> (reçu ou billets).
              L'artisan vérifiera la preuve et confirmera la réception.
            </p>
          </div>

          <p className="text-xs font-semibold tracking-wider text-muted-foreground">PHOTO DE PREUVE (OBLIGATOIRE)</p>
          <label
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-colors text-center',
              cashProofFile ? 'border-green-400 bg-green-50/50 dark:bg-green-900/10' : 'border-border hover:border-brand-300 bg-muted',
            )}
          >
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePickCashProof} />
            {cashProofPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cashProofPreview} alt="Aperçu de la preuve" className="max-h-48 max-w-full rounded-xl object-contain" />
            ) : (
              <>
                <Camera className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Prendre / choisir une photo</span>
              </>
            )}
          </label>
          {cashProofFile && (
            <button
              type="button"
              onClick={() => { setCashProofFile(null); setCashProofPreview((p) => { if (p) URL.revokeObjectURL(p); return null }) }}
              className="text-xs text-red-500 hover:underline inline-flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Retirer la photo
            </button>
          )}
        </div>
      )}

      {/* CTA */}
      <Button
        variant="accent"
        size="lg"
        className="w-full"
        onClick={handlePay}
        loading={loading}
        disabled={needsPriceConfirm}
      >
        {method === 'mobile_money' ? <Phone className="h-5 w-5" /> : method === 'card' ? <CreditCard className="h-5 w-5" /> : <Banknote className="h-5 w-5" />}
        {method === 'cash' ? 'Envoyer la preuve' : `Payer ${formatGNF(amount)}`}
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

            <Button variant="outline" size="lg" className="w-full" onClick={closePending}>
              {isFailed ? 'Fermer' : <><X className="h-4 w-4" /> Annuler</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Ligne de détail d'un reçu (icône + libellé + valeur). */
function ReceiptRow({
  icon: Icon, label, value, mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-card px-5 py-3.5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
        <Icon className="h-4 w-4 flex-shrink-0" />
        {label}
      </span>
      <span className={cn('text-sm font-semibold text-[rgb(var(--fg))] text-right min-w-0 break-words', mono && 'font-mono text-xs')}>
        {value}
      </span>
    </div>
  )
}
