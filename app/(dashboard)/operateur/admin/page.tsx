'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldAlert, Tag, ScrollText, Check, Ban, Trash2, AlertTriangle, Plus, Loader2,
  ShieldCheck, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge, Spinner } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { SectionCard } from '@/components/ui/section-card'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils/cn'
import { formatGNF, formatRelative } from '@/lib/utils/format'
import { toast } from 'sonner'
import {
  useReports, useResolveReport, useActivityLogs,
  useAdminPromoCodes, useCreatePromoCode,
} from '@/hooks/queries/useAdmin'
import type { ModerationAction, ReportTargetType, PromoCodeType } from '@/types'

type Tab = 'reports' | 'promos' | 'logs'

const TABS: { key: Tab; label: string; icon: typeof Tag }[] = [
  { key: 'reports', label: 'Signalements', icon: ShieldAlert },
  { key: 'promos',  label: 'Codes promo',  icon: Tag },
  { key: 'logs',    label: "Journal d'activité", icon: ScrollText },
]

const TARGET_LABELS: Record<ReportTargetType, string> = {
  review: 'Avis', message: 'Message', user: 'Utilisateur', request: 'Demande',
}

function ReportsTab() {
  const { data: reports, isLoading } = useReports()
  const resolve = useResolveReport()
  const pending = reports?.filter((r) => r.status === 'pending') ?? []

  function act(id: number, action: ModerationAction, label: string) {
    resolve.mutate({ id, action }, { onSuccess: () => toast.success(label) })
  }

  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
  if (pending.length === 0) return <EmptyState icon="shield-check" title="Aucun signalement" desc="Tout est sous contrôle." />

  return (
    <div className="space-y-3">
      {pending.map((r) => (
        <SectionCard key={r.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="warning">{TARGET_LABELS[r.target_type]}</Badge>
                <span className="text-xs text-muted-foreground">{formatRelative(r.created_at)}</span>
              </div>
              <p className="font-semibold text-sm text-[rgb(var(--fg))]">{r.reason}</p>
              {r.excerpt && <p className="text-sm text-muted-foreground italic mt-1">« {r.excerpt} »</p>}
              {r.reporter_name && <p className="text-xs text-muted-foreground mt-1">Signalé par {r.reporter_name}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => act(r.id, 'warning', 'Avertissement envoyé')}>
              <AlertTriangle className="h-3.5 w-3.5" /> Avertir
            </Button>
            <Button variant="outline" size="sm" onClick={() => act(r.id, 'delete', 'Contenu supprimé')}>
              <Trash2 className="h-3.5 w-3.5" /> Supprimer
            </Button>
            <Button variant="destructive" size="sm" onClick={() => act(r.id, 'ban', 'Compte banni')}>
              <Ban className="h-3.5 w-3.5" /> Bannir
            </Button>
            <Button variant="ghost" size="sm" onClick={() => act(r.id, 'dismiss', 'Signalement rejeté')}>
              <Check className="h-3.5 w-3.5" /> Ignorer
            </Button>
          </div>
        </SectionCard>
      ))}
    </div>
  )
}

function PromosTab() {
  const { data: promos, isLoading } = useAdminPromoCodes()
  const create = useCreatePromoCode()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<{ code: string; type: PromoCodeType; value: number }>({ code: '', type: 'percentage', value: 10 })

  function submit() {
    if (form.code.trim().length < 3) { toast.error('Code trop court.'); return }
    create.mutate(
      { code: form.code.trim().toUpperCase(), type: form.type, value: Number(form.value), is_active: true },
      { onSuccess: () => { toast.success('Code promo créé'); setOpen(false); setForm({ code: '', type: 'percentage', value: 10 }) } }
    )
  }

  return (
    <div className="space-y-4">
      <SectionCard
        title="Codes promo"
        description="Réductions appliquées au moment du paiement."
        icon={Tag}
        action={
          <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nouveau code
          </Button>
        }
        flush
      >
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
        ) : promos && promos.length > 0 ? (
          <div className="divide-y divide-border">
            {promos.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[rgb(var(--fg))]">{p.code}</span>
                    <Badge variant={p.is_active ? 'success' : 'default'}>{p.is_active ? 'Actif' : 'Inactif'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.type === 'percentage' ? `${p.value}% de réduction` : `${formatGNF(p.value)} de réduction`}
                    {typeof p.used_count === 'number' && ` · ${p.used_count} utilisations`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-10">
            <EmptyState icon="tag" title="Aucun code promo" desc="Créez votre premier code de réduction." />
          </div>
        )}
      </SectionCard>

      <Modal open={open} onClose={() => setOpen(false)} title="Créer un code promo" size="sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="promo-code" className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Code</label>
            <Input
              id="promo-code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="PROMO2026"
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="promo-type" className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Type</label>
              <select
                id="promo-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as PromoCodeType })}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              >
                <option value="percentage">Pourcentage</option>
                <option value="fixed">Montant fixe</option>
              </select>
            </div>
            <div>
              <label htmlFor="promo-value" className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">{form.type === 'percentage' ? 'Réduction (%)' : 'Montant (GNF)'}</label>
              <Input
                id="promo-value"
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button variant="accent" size="md" className="w-full" onClick={submit} disabled={create.isPending}>
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer le code'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function LogsTab() {
  const { data: logs, isLoading } = useActivityLogs()
  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>

  if (!logs || logs.length === 0) {
    return <EmptyState icon="activity" title="Aucune activité" desc="Le journal est vide pour le moment." />
  }

  return (
    <SectionCard title="Journal d'activité" description="Dernières actions sur la plateforme." icon={ScrollText} flush>
      <div className="divide-y divide-border">
        {logs.map((l) => (
          <div key={l.id} className="flex items-center gap-3 px-5 py-4">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <ScrollText className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm flex-1 text-[rgb(var(--fg))]">
              <span className="font-medium">{l.actor_name}</span> {l.action}
              {l.target && <span className="font-medium"> {l.target}</span>}
            </p>
            <span className="text-xs text-muted-foreground flex-shrink-0">{formatRelative(l.created_at)}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export default function AdminConsolePage() {
  const [tab, setTab] = useState<Tab>('reports')

  const { data: reports } = useReports()
  const { data: promos } = useAdminPromoCodes()
  const { data: logs } = useActivityLogs()

  const pendingReports = reports?.filter((r) => r.status === 'pending').length ?? 0
  const activePromos = promos?.filter((p) => p.is_active).length ?? 0
  const logCount = logs?.length ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Console d'administration"
        description="Modération, codes promo et journal d'activité."
        icon={ShieldCheck}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Signalements en attente" value={pendingReports} icon={ShieldAlert} tone={pendingReports > 0 ? 'warning' : 'success'} />
        <StatCard label="Codes promo actifs" value={activePromos} icon={Tag} tone="accent" />
        <StatCard label="Entrées au journal" value={logCount} icon={Activity} tone="brand" />
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-muted w-full sm:w-fit overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
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
        {tab === 'reports' && <ReportsTab />}
        {tab === 'promos' && <PromosTab />}
        {tab === 'logs' && <LogsTab />}
      </motion.div>
    </div>
  )
}
