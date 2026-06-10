'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Smartphone, CreditCard, Banknote, Landmark } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, Spinner } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePaymentHistory } from '@/hooks/queries/usePayments'
import { formatGNF, formatDateTime } from '@/lib/utils/format'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PROVIDER_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/utils/payment'
import type { PaymentMethod, PaymentStatus } from '@/types'

const METHOD_ICONS: Record<PaymentMethod, typeof Smartphone> = {
  mobile_money: Smartphone,
  card: CreditCard,
  cash: Banknote,
  bank_transfer: Landmark,
}

const STATUS_VARIANT: Record<PaymentStatus, any> = {
  pending: 'warning',
  processing: 'primary',
  completed: 'success',
  failed: 'danger',
  refunded: 'default',
  cancelled: 'default',
}

export default function PaiementsPage() {
  const { data: payments, isLoading } = usePaymentHistory()

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Mes paiements</h1>
        <p className="text-muted-foreground mt-1">Historique et reçus de vos prestations.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : !payments || payments.length === 0 ? (
        <EmptyState
          icon="receipt"
          title="Aucun paiement"
          desc="Vos paiements apparaîtront ici après vos prestations."
        />
      ) : (
        <div className="space-y-3">
          {payments.map((p, i) => {
            const Icon = METHOD_ICONS[p.method]
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="p-4 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-brand-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatGNF(p.total_amount)}</span>
                      <Badge variant={STATUS_VARIANT[p.status]}>{PAYMENT_STATUS_LABELS[p.status]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {PAYMENT_METHOD_LABELS[p.method]} · {PAYMENT_PROVIDER_LABELS[p.provider]}
                      {p.transaction_id && ` · ${p.transaction_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(p.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Link
                      href={`/beneficiaire/demandes/${p.request_id}`}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Demande #{p.request_id}
                    </Link>
                    {p.status === 'completed' && (
                      <a
                        href={p.receipt_url ?? '#'}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Download className="h-3.5 w-3.5" /> Reçu
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
