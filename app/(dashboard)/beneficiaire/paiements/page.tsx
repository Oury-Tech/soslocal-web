'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Download, Smartphone, CreditCard, Banknote, Landmark, Trash2, Receipt, Wallet, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, Spinner } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/StatCard'
import { Modal } from '@/components/ui/Modal'
import { usePaymentHistory, useDeletePayment } from '@/hooks/queries/usePayments'
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
  const deletePayment = useDeletePayment()
  const [toDelete, setToDelete] = useState<number | null>(null)

  async function handleDelete() {
    if (toDelete == null) return
    try {
      await deletePayment.mutateAsync(toDelete)
      toast.success('Paiement supprimé')
    } catch (err: any) {
      toast.error('Suppression impossible', {
        description: err?.response?.data?.detail || err?.message || 'Erreur inattendue',
      })
    } finally {
      setToDelete(null)
    }
  }

  const list = payments ?? []
  const totalPaid = list
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + (p.total_amount ?? p.amount ?? 0), 0)
  const pendingCount = list.filter((p) => p.status === 'pending' || p.status === 'processing').length

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        icon={Receipt}
        title="Mes paiements"
        description="Historique et reçus de vos prestations."
      />

      {/* Récapitulatif */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          label="Total payé"
          value={formatGNF(totalPaid)}
          icon={Wallet}
          tone="success"
          loading={isLoading}
          delay={0}
        />
        <StatCard
          label="En attente"
          value={pendingCount}
          icon={Clock}
          tone="warning"
          loading={isLoading}
          delay={0.05}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:gap-4">
              <div className="h-11 w-11 flex-shrink-0 rounded-xl bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded-xl bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded-xl bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
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
                <Card className="p-4 flex items-center gap-3 sm:gap-4 transition-all hover:shadow-soft-lg hover:border-brand-300 dark:hover:border-brand-700">
                  <div className="h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-brand-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold break-words">{formatGNF(p.total_amount ?? p.amount)}</span>
                      <Badge variant={STATUS_VARIANT[p.status]}>{PAYMENT_STATUS_LABELS[p.status]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {PAYMENT_METHOD_LABELS[p.method]}
                      {p.provider && PAYMENT_PROVIDER_LABELS[p.provider]
                        ? ` · ${PAYMENT_PROVIDER_LABELS[p.provider]}`
                        : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(p.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Link
                      href={`/beneficiaire/demandes/${p.request_id}`}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Voir la demande
                    </Link>
                    {p.status === 'completed' && p.receipt_url && (
                      <a
                        href={p.receipt_url}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Download className="h-3.5 w-3.5" /> Reçu
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setToDelete(p.id)}
                      className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                      aria-label="Supprimer ce paiement"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Supprimer
                    </button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal open={toDelete != null} onClose={() => setToDelete(null)} title="Supprimer le paiement" size="sm">
        <p className="text-sm text-muted-foreground">
          Voulez-vous vraiment supprimer ce paiement de votre historique ? Cette action est définitive.
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
            disabled={deletePayment.isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors inline-flex items-center gap-2"
          >
            {deletePayment.isPending && <Spinner className="h-4 w-4" />}
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  )
}
