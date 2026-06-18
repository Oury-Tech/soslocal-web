'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  SlidersHorizontal, Download, Percent, Building2, Mail, Phone,
  Coins, Wallet, Save, Loader2, Database, FileSpreadsheet, Wrench,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import {
  usePlatformSettings, useUpdatePlatformSettings,
  useExportableEntities, downloadEntityCsv,
  type PlatformSettings,
} from '@/hooks/queries/useAdmin'

type Tab = 'general' | 'export'

const TABS: { key: Tab; label: string; icon: typeof Download }[] = [
  { key: 'general', label: 'Général',          icon: SlidersHorizontal },
  { key: 'export',  label: 'Export de données', icon: Download },
]

// ─── Champ texte réutilisable ────────────────────────────────────────────────
function Field({
  label, icon, value, onChange, type = 'text', suffix, placeholder,
}: {
  label: string
  icon: typeof Mail
  value: string | number
  onChange: (v: string) => void
  type?: string
  suffix?: string
  placeholder?: string
}) {
  const Icon = icon
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full pl-9 pr-12 py-2.5 rounded-lg border border-border bg-card text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>
        )}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-accent-600' : 'bg-muted'
      )}
    >
      <span className={cn(
        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0'
      )} />
    </button>
  )
}

// ─── Onglet Général ──────────────────────────────────────────────────────────
function GeneralTab() {
  const { data, isLoading } = usePlatformSettings()
  const update = useUpdatePlatformSettings()
  const [form, setForm] = useState<PlatformSettings | null>(null)

  useEffect(() => { if (data) setForm(data) }, [data])

  if (isLoading || !form) {
    return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
  }

  const set = (patch: Partial<PlatformSettings>) => setForm({ ...form, ...patch })

  const TOGGLES: { key: keyof PlatformSettings; label: string; desc: string }[] = [
    { key: 'maintenance_mode',        label: 'Mode maintenance',          desc: 'Désactive temporairement l’accès à la plateforme' },
    { key: 'allow_new_registrations', label: 'Inscriptions ouvertes',     desc: 'Autorise la création de nouveaux comptes' },
    { key: 'auto_assign_requests',    label: 'Attribution automatique',   desc: 'Affecte les demandes aux artisans les plus proches' },
    { key: 'review_moderation',       label: 'Modération des avis',       desc: 'Les avis sont vérifiés avant publication' },
  ]

  function save() {
    if (!form) return
    update.mutate(
      {
        platform_name:           form.platform_name,
        support_email:           form.support_email,
        support_phone:           form.support_phone,
        default_currency:        form.default_currency,
        commission_percent:      form.commission_percent,
        min_payout_amount:       form.min_payout_amount,
        maintenance_mode:        form.maintenance_mode,
        allow_new_registrations: form.allow_new_registrations,
        auto_assign_requests:    form.auto_assign_requests,
        review_moderation:       form.review_moderation,
      },
      {
        onSuccess: () => toast.success('Réglages enregistrés'),
        onError:   () => toast.error('Échec de l’enregistrement'),
      },
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-brand-500" />
          <h2 className="font-bold text-lg">Identité de la plateforme</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom de la plateforme" icon={Building2} value={form.platform_name} onChange={(v) => set({ platform_name: v })} />
          <Field label="Devise par défaut" icon={Coins} value={form.default_currency} onChange={(v) => set({ default_currency: v.toUpperCase() })} />
          <Field label="Email de support" icon={Mail} type="email" value={form.support_email} onChange={(v) => set({ support_email: v })} />
          <Field label="Téléphone de support" icon={Phone} value={form.support_phone} onChange={(v) => set({ support_phone: v })} placeholder="+224 ..." />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-accent-600" />
          <h2 className="font-bold text-lg">Finance</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Taux de commission" icon={Percent} type="number" suffix="%"
            value={form.commission_percent}
            onChange={(v) => set({ commission_percent: Number(v) })}
          />
          <Field
            label="Versement minimum" icon={Coins} type="number" suffix={form.default_currency}
            value={form.min_payout_amount}
            onChange={(v) => set({ min_payout_amount: Number(v) })}
          />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="h-4 w-4 text-brand-500" />
          <h2 className="font-bold text-lg">Exploitation</h2>
        </div>
        <div className="space-y-0">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
              </div>
              <Toggle checked={Boolean(form[t.key])} onChange={() => set({ [t.key]: !form[t.key] } as Partial<PlatformSettings>)} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="accent" onClick={save} loading={update.isPending}>
          <Save className="h-4 w-4" /> Enregistrer les réglages
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Onglet Export ───────────────────────────────────────────────────────────
function ExportTab() {
  const { data: entities, isLoading } = useExportableEntities()
  const [busy, setBusy] = useState<string | null>(null)

  async function handleExport(entity: string, label: string) {
    setBusy(entity)
    try {
      await downloadEntityCsv(entity)
      toast.success(`Export « ${label} » téléchargé`)
    } catch {
      toast.error('Échec de l’export')
    } finally {
      setBusy(null)
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-5 flex items-start gap-3 bg-brand-50/50 dark:bg-brand-900/10 border-brand-100 dark:border-brand-800/30">
        <Database className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold">Export des données au format CSV</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Téléchargez les données de la plateforme pour analyse ou archivage. Les colonnes sensibles
            (mots de passe, jetons) sont automatiquement exclues.
          </p>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        {entities?.map((e) => (
          <Card key={e.entity} className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{e.label}</p>
                <p className="text-xs text-muted-foreground">
                  {e.count === null ? '—' : `${e.count.toLocaleString('fr-FR')} enregistrement${e.count > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={() => handleExport(e.entity, e.label)}
              disabled={busy !== null || e.count === 0}
            >
              {busy === e.entity ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              CSV
            </Button>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}

export default function PlatformSettingsPage() {
  const [tab, setTab] = useState<Tab>('general')

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Réglages plateforme</h1>
        <p className="text-muted-foreground mt-1">Configuration globale et export des données.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-muted w-full sm:w-fit overflow-x-auto no-scrollbar">
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

      {tab === 'general' && <GeneralTab />}
      {tab === 'export' && <ExportTab />}
    </div>
  )
}
