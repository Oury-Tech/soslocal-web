'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Percent, Wallet, RotateCcw, Loader2, Send, Check, CreditCard, RefreshCw, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Spinner } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/StatCard'
import { SectionCard } from '@/components/ui/section-card'
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

const FIELD =
  'w-full px-3 py-2.5 rounded-lg border border-border bg-card text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500'

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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total encaissé" value={formatGNF(total)} icon={Wallet} tone="brand" />
        <StatCard label="Transactions" value={data.length} icon={Receipt} tone="accent" />
      </div>

      <SectionCard
        title="Transactions"
        icon={CreditCard}
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} /> Actualiser
          </Button>
        }
        flush
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Montant</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Méthode</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Référence</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatGNF(p.total_amount ?? p.amount ?? 0)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={PAYMENT_STATUS_VARIANT[p.status] ?? 'default'}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {PAYMENT_METHOD_LABEL[p.method] ?? p.method}
                    {p.provider && ` · ${p.provider.replace(/_/g, ' ')}`}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.transaction_id
                      ? <span className="block font-mono">{p.transaction_id}</span>
                      : <span className="text-muted-foreground/60">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground text-right whitespace-nowrap">
                    {p.created_at ? formatRelative(p.created_at) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
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
    <SectionCard
      title="Taux de commission plateforme"
      description={`Part prélevée par SOS Local sur chaque mission · Taux actuel : ${current}%`}
      icon={Percent}
      className="max-w-md"
    >
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Nouveau taux (%)</label>
          <input
            type="number" min={0} max={100} step={0.5} value={value}
            onChange={(e) => setPercent(e.target.value)}
            className={FIELD}
          />
        </div>
        <Button variant="accent" size="md" onClick={submit} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
        </Button>
      </div>
    </SectionCard>
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
      <SectionCard title="Commissions en attente" icon={Wallet}>
        {loadingPending ? (
          <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
        ) : !pending || pending.length === 0 ? (
          <EmptyState icon="check" title="Aucun versement en attente" desc="Tous les techniciens sont à jour." />
        ) : (
          <div className="space-y-2">
            {pending.map((p) => (
              <div key={p.technician_id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
                <div>
                  <p className="font-semibold text-[rgb(var(--fg))]">{p.technician_name ?? 'Artisan'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatGNF(p.amount)} · {p.commissions_count} commission(s)
                  </p>
                </div>
                <Button variant="accent" size="sm" onClick={() => pay(p.technician_id, p.technician_name)} disabled={trigger.isPending}>
                  <Send className="h-3.5 w-3.5" /> Verser
                </Button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Historique des versements" icon={Receipt} flush>
        {loadingHistory ? (
          <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
        ) : !history || history.length === 0 ? (
          <div className="p-5">
            <EmptyState icon="wallet" title="Aucun versement" desc="Les versements effectués apparaîtront ici." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Montant</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Bénéficiaire</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatGNF(p.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === 'completed' ? 'success' : 'warning'}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="block">{p.technician_name ?? 'Artisan'}</span>
                      <span className="block text-xs font-mono">{p.payout_reference}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-green-500" aria-hidden />
                        {p.created_at ? formatRelative(p.created_at) : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function RefundsTab() {
  const { data: refunds, isLoading } = useRefunds()
  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
  if (!refunds || refunds.length === 0) return <EmptyState icon="rotate" title="Aucun remboursement" desc="Les remboursements émis apparaîtront ici." />

  return (
    <SectionCard title="Remboursements émis" icon={RotateCcw}>
      <div className="space-y-2">
        {refunds.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[rgb(var(--fg))]">{formatGNF(r.refund_amount ?? 0)}</span>
                <Badge variant={r.status === 'refunded' ? 'danger' : 'warning'}>
                  {r.status === 'refunded' ? 'Total' : 'Partiel'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{r.payment_reference}</p>
              {r.refund_reason && <p className="text-xs text-muted-foreground italic">« {r.refund_reason} »</p>}
              {r.refunded_at && <p className="text-xs text-muted-foreground">{formatRelative(r.refunded_at)}</p>}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('payments')

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Finance & Promo"
        description="Commission, versements aux techniciens et remboursements."
        icon={Wallet}
      />

      <div className="flex gap-1 p-1 rounded-xl bg-muted w-full sm:w-fit overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              tab === t.key ? 'bg-card text-[rgb(var(--fg))] shadow-sm' : 'text-muted-foreground hover:text-[rgb(var(--fg))]'
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
