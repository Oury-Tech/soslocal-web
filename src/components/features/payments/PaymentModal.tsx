'use client'

import { useState } from 'react'
import { Smartphone, CreditCard, Banknote, Landmark, Check, Tag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { formatGNF } from '@/lib/utils/format'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PROVIDER_LABELS,
  PROVIDERS_BY_METHOD,
  applyPromo,
} from '@/lib/utils/payment'
import { useInitiatePayment, useValidatePromo } from '@/hooks/queries/usePayments'
import type { PaymentMethod, PaymentProvider, PromoCode } from '@/types'

const METHOD_ICONS: Record<PaymentMethod, typeof Smartphone> = {
  mobile_money: Smartphone,
  card: CreditCard,
  cash: Banknote,
  bank_transfer: Landmark,
}

const METHODS: PaymentMethod[] = ['mobile_money', 'card', 'cash', 'bank_transfer']

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  requestId: number
  amount: number
  onSuccess?: () => void
}

export function PaymentModal({ open, onClose, requestId, amount, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('mobile_money')
  const [provider, setProvider] = useState<PaymentProvider>('orange_money')
  const [phone, setPhone] = useState('')
  const [promoInput, setPromoInput] = useState('')
  const [promo, setPromo] = useState<PromoCode | null>(null)

  const initiate = useInitiatePayment()
  const validatePromo = useValidatePromo()

  const { discount, total } = applyPromo(amount, promo)
  const needsPhone = method === 'mobile_money'

  function selectMethod(m: PaymentMethod) {
    setMethod(m)
    setProvider(PROVIDERS_BY_METHOD[m][0])
  }

  async function handlePromo() {
    if (!promoInput.trim()) return
    try {
      const code = await validatePromo.mutateAsync(promoInput.trim())
      setPromo(code)
      toast.success('Code promo appliqué')
    } catch (err: any) {
      setPromo(null)
      toast.error(err?.message || 'Code promo invalide')
    }
  }

  async function handlePay() {
    if (needsPhone && phone.trim().length < 8) {
      toast.error('Saisissez un numéro Mobile Money valide.')
      return
    }
    try {
      await initiate.mutateAsync({
        request_id: requestId,
        method,
        provider,
        phone: needsPhone ? phone.trim() : undefined,
        promo_code: promo?.code,
      })
      toast.success('Paiement effectué avec succès !')
      onSuccess?.()
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Le paiement a échoué')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Payer la prestation" size="md">
      <div className="space-y-5">
        {/* Méthode */}
        <div>
          <p className="text-sm font-medium mb-2 text-gray-900">Méthode de paiement</p>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => {
              const Icon = METHOD_ICONS[m]
              const active = method === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMethod(m)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm font-medium transition-all',
                    active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-700 hover:border-brand-300'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {PAYMENT_METHOD_LABELS[m]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Fournisseur */}
        {PROVIDERS_BY_METHOD[method].length > 1 && (
          <div>
            <p className="text-sm font-medium mb-2 text-gray-900">Opérateur</p>
            <div className="flex flex-wrap gap-2">
              {PROVIDERS_BY_METHOD[method].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
                    provider === p ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-200 text-gray-700 hover:border-brand-300'
                  )}
                >
                  {PAYMENT_PROVIDER_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Téléphone Mobile Money */}
        {needsPhone && (
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Numéro {PAYMENT_PROVIDER_LABELS[provider]}</label>
            <input
              type="tel"
              inputMode="tel"
              placeholder="+224 6XX XX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
        )}

        {/* Code promo */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-900">Code promo (optionnel)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="BIENVENUE10"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                disabled={!!promo}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 disabled:bg-gray-50"
              />
            </div>
            {promo ? (
              <Button variant="outline" size="md" onClick={() => { setPromo(null); setPromoInput('') }}>
                Retirer
              </Button>
            ) : (
              <Button variant="outline" size="md" onClick={handlePromo} disabled={validatePromo.isPending}>
                {validatePromo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Appliquer'}
              </Button>
            )}
          </div>
          {promo && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-green-600">
              <Check className="h-3.5 w-3.5" /> {promo.code} appliqué
            </p>
          )}
        </div>

        {/* Récapitulatif */}
        <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Montant</span>
            <span>{formatGNF(amount)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Réduction</span>
              <span>− {formatGNF(discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
            <span>Total à payer</span>
            <span>{formatGNF(total)}</span>
          </div>
        </div>

        <Button variant="accent" size="lg" className="w-full" onClick={handlePay} loading={initiate.isPending}>
          Payer {formatGNF(total)}
        </Button>
      </div>
    </Modal>
  )
}
