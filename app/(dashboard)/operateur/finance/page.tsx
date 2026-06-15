'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Percent, Wallet, RotateCcw, Loader2, Send, Check, CreditCard, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Spinner } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils/cn'
import { formatGNF, formatRelative } from '@/lib/utils/format'
import { toast } from 'sonner'
import {
  useCommissionRate, useSetCommissionRate,
  usePayouts, usePendingPayouts, useTriggerPayout,
  useRefunds,
} from '@/hooks/queries/useBackOffice'
import { useAdminPayments } from '@/hooks/queries/usePayments'

type Tab = 'payments' | 'commission' | 'payouts' | 'refunds'

const TABS: { key: Tab; label: string; icon: typeof Percent }[] = [
  { key: 'payments',   label: 'Paiements', icon: CreditCard },
  { key: 'commission', label: 'Commission', icon: Percent },
  { key: 'payouts',    label: 'Versements', icon: Wallet },
  { key: 'refunds',    label: 'Remboursements', icon: RotateCcw },
]

const PAYMENT_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  completed: 'success',
  pending: 'warning',
  processing: 'warning',
  failed: 'danger',
  cancelled: 'danger',
  refunded: 'danger',
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
  cash: 'Espèces',
}

function AllPaymentsTab() {
  const { data, isLoading, isFetching, refetch } = useAdminPayments()

  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} /> Actualiser
          </Button>
        </div>
        <EmptyState icon="wallet" title="Aucun paiement" desc="Les transactions de la plateforme apparaîtront ici." />
      </div>
    )
  }

  const total = data
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.total_amount ?? p.amount ?? 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Card className="px-4 py-3 flex-1 min-w-[140px]">
          <p className="text-xs text-muted-foreground">Total encaissé</p>
          <p className="font-display text-xl font-extrabold text-brand-600">{formatGNF(total)}</p>
        </Card>
        <Card className="px-4 py-3 flex-1 min-w-[120px]">
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="font-display text-xl font-extrabold">{data.length}</p>
        </Card>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 ml-auto">
          <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} /> Actualiser
        </Button>
      </div>

      <div className="space-y-2">
        {data.map((p) => (
          <Card key={p.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{formatGNF(p.total_amount ?? p.amount ?? 0)}</span>
                <Badge variant={PAYMENT_STATUS_VARIANT[p.status] ?? 'default'}>{p.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {PAYMENT_METHOD_LABEL[p.method] ?? p.method}
                {p.provider && ` · ${p.provider.replace(/_/g, ' ')}`}
                {p.request_id != null && ` · Demande #${p.request_id}`}
              </p>
              {p.transaction_id && <p className="text-xs text-muted-foreground font-mono">{p.transaction_id}</p>}
            </div>
            {p.created_at && (
              <span className="text-xs text-muted-foreground flex-shrink-0">{formatRelative(p.created_at)}</span>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

function CommissionTab() {
  const { data, isLoading } = useCommissionRate()
  const save = useSetCommissionRate()
  const [percent, setPercent] = useState<string>('')

  const current = data?.percent ?? 0
  const value = percent === '' ? String(current) : percent

  function submit() {
    const n = Number(value)
    if (Number.isNaN(n) || n < 0 || n > 100) { toast.error('Entrez un pourcentage entre 0 et 100.'); return }
    save.mutate(n, { onSuccess: () => { toast.success('Taux de commission mis à jour'); setPercent('') } })
  }

  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>

  return (
    <Card className="p-6 max-w-md">
      <h3 className="font-semibold mb-1">Taux de commission plateforme</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Part prélevée par SOS Local sur chaque mission. Taux actuel : <span className="font-semibold text-foreground">{current}%</span>
      </p>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1.5 text-gray-900">Nouveau taux (%)</label>
          <input
            type="number" min={0} max={100} step={0.5} value={value}
            onChange={(e) => setPercent(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <Button variant="accent" size="md" onClick={submit} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
        </Button>
      </div>
    </Card>
  )
}

function PayoutsTab() {
  const { data: pending, isLoading: loadingPending } = usePendingPayouts()
  const { data: history, isLoading: loadingHistory } = usePayouts()
  const trigger = useTriggerPayout()

  function pay(technicianId: number, name?: string | null) {
    if (!confirm(`Verser les commissions en attente à ${name ?? 'ce technicien'} ?`)) return
    trigger.mutate(
      { technicianId },
      {
        onSuccess: (p) => toast.success(`Versement de ${formatGNF(p.amount)} effectué`),
        onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Versement impossible.'),
      },
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Commissions en attente</h3>
        {loadingPending ? (
          <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
        ) : !pending || pending.length === 0 ? (
          <EmptyState icon="check" title="Aucun versement en attente" desc="Tous les techniciens sont à jour." />
        ) : (
          <div className="space-y-2">
            {pending.map((p) => (
              <Card key={p.technician_id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.technician_name ?? `Technicien #${p.technician_id}`}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatGNF(p.amount)} · {p.commissions_count} commission(s)
                  </p>
                </div>
                <Button variant="accent" size="sm" onClick={() => pay(p.technician_id, p.technician_name)} disabled={trigger.isPending}>
                  <Send className="h-3.5 w-3.5" /> Verser
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-3">Historique des versements</h3>
        {loadingHistory ? (
          <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
        ) : !history || history.length === 0 ? (
          <EmptyState icon="wallet" title="Aucun versement" desc="Les versements effectués apparaîtront ici." />
        ) : (
          <div className="space-y-2">
            {history.map((p) => (
              <Card key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatGNF(p.amount)}</span>
                    <Badge variant={p.status === 'completed' ? 'success' : 'warning'}>{p.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">{p.payout_reference}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.technician_name ?? `Technicien #${p.technician_id}`}
                    {p.created_at && ` · ${formatRelative(p.created_at)}`}
                  </p>
                </div>
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RefundsTab() {
  const { data: refunds, isLoading } = useRefunds()
  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
  if (!refunds || refunds.length === 0) return <EmptyState icon="rotate" title="Aucun remboursement" desc="Les remboursements émis apparaîtront ici." />

  return (
    <div className="space-y-2">
      {refunds.map((r) => (
        <Card key={r.id} className="p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatGNF(r.refund_amount ?? 0)}</span>
              <Badge variant={r.status === 'refunded' ? 'danger' : 'warning'}>
                {r.status === 'refunded' ? 'Total' : 'Partiel'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{r.payment_reference}</p>
            {r.refund_reason && <p className="text-xs text-muted-foreground italic">« {r.refund_reason} »</p>}
            {r.refunded_at && <p className="text-xs text-muted-foreground">{formatRelative(r.refunded_at)}</p>}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('payments')

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Finance &amp; Promo</h1>
        <p className="text-muted-foreground mt-1">Commission, versements aux techniciens et remboursements.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-muted w-full sm:w-fit overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'payments' && <AllPaymentsTab />}
        {tab === 'commission' && <CommissionTab />}
        {tab === 'payouts' && <PayoutsTab />}
        {tab === 'refunds' && <RefundsTab />}
      </motion.div>
    </div>
  )
}
