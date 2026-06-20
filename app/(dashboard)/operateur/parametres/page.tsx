'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  SlidersHorizontal, Download, Percent, Building2, Mail, Phone,
  Coins, Wallet, Save, Loader2, FileSpreadsheet,
  Settings2, ChevronRight, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import {
  usePlatformSettings, useUpdatePlatformSettings,
  useExportableEntities, downloadEntityCsv,
  type PlatformSettings,
} from '@/hooks/queries/useAdmin'

// ─── Sections (sous-navigation verticale, façon console d'administration) ──────
type SectionKey = 'identity' | 'finance' | 'operations' | 'export'

const SECTIONS: {
  key: SectionKey
  label: string
  icon: typeof Building2
  title: string
  description: string
}[] = [
  { key: 'identity',   label: 'Identité',     icon: Building2,        title: 'Identité de la plateforme', description: 'Coordonnées publiques et devise par défaut' },
  { key: 'finance',    label: 'Finance',      icon: Wallet,           title: 'Finance',                   description: 'Commission et seuil de versement' },
  { key: 'operations', label: 'Exploitation', icon: SlidersHorizontal, title: 'Exploitation',            description: 'Comportements globaux de la plateforme' },
  { key: 'export',     label: 'Export',       icon: Download,         title: 'Export de données',         description: 'Téléchargement CSV pour analyse ou archivage' },
]

// ─── Champ texte réutilisable ────────────────────────────────────────────────
function Field({
  label, icon, value, onChange, type = 'text', suffix, placeholder, hint,
}: {
  label: string
  icon: typeof Mail
  value: string | number
  onChange: (v: string) => void
  type?: string
  suffix?: string
  placeholder?: string
  hint?: string
}) {
  const Icon = icon
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full pl-9 pr-12 py-2.5 rounded-lg border border-border bg-card text-[rgb(var(--fg))]',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
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

// ─── Coquille de section : en-tête (icône + titre + Enregistrer) + corps ───────
function SectionShell({
  icon: Icon, title, description, onSave, saving, children,
}: {
  icon: typeof Building2
  title: string
  description: string
  onSave?: () => void
  saving?: boolean
  children: React.ReactNode
}) {
  return (
    <motion.section
      key={title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
            <Icon className="h-5 w-5 text-brand-500" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-[rgb(var(--fg))] truncate">{title}</h2>
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
        </div>
        {onSave && (
          <Button variant="accent" size="sm" onClick={onSave} loading={saving} className="flex-shrink-0">
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        )}
      </div>
      <div className="p-5 space-y-7">{children}</div>
    </motion.section>
  )
}

// ─── Libellé de groupe (style console : majuscules, discret) ───────────────────
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

export default function PlatformSettingsPage() {
  const [active, setActive] = useState<SectionKey>('identity')

  const { data, isLoading } = usePlatformSettings()
  const update = useUpdatePlatformSettings()
  const [form, setForm] = useState<PlatformSettings | null>(null)
  useEffect(() => { if (data) setForm(data) }, [data])

  const set = (patch: Partial<PlatformSettings>) =>
    setForm((prev) => (prev ? { ...prev, ...patch } : prev))

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

  const TOGGLES: { key: keyof PlatformSettings; label: string; desc: string }[] = [
    { key: 'maintenance_mode',        label: 'Mode maintenance',        desc: 'Désactive temporairement l’accès à la plateforme.' },
    { key: 'allow_new_registrations', label: 'Inscriptions ouvertes',   desc: 'Autorise la création de nouveaux comptes.' },
    { key: 'auto_assign_requests',    label: 'Attribution automatique', desc: 'Affecte les demandes aux artisans les plus proches.' },
    { key: 'review_moderation',       label: 'Modération des avis',     desc: 'Les avis sont vérifiés avant publication.' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Réglages plateforme"
        description="Configuration globale et export des données."
        icon={Settings2}
      >
        {active !== 'export' && (
          <Button variant="accent" size="md" onClick={save} loading={update.isPending} disabled={!form}>
            <Save className="h-4 w-4" /> Sauvegarder
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        {/* Sous-navigation des sections */}
        <aside className="lg:sticky lg:top-6 h-fit">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-soft">
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sections</p>
            <nav className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col lg:overflow-visible">
              {SECTIONS.map((s) => {
                const on = active === s.key
                return (
                  <button
                    key={s.key}
                    onClick={() => setActive(s.key)}
                    className={cn(
                      'group flex flex-shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors lg:w-full',
                      on
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'text-[rgb(var(--fg))] hover:bg-muted',
                    )}
                  >
                    <s.icon className={cn('h-[18px] w-[18px] flex-shrink-0', on ? 'text-brand-500' : 'text-muted-foreground')} />
                    <span className="flex-1 whitespace-nowrap text-left">{s.label}</span>
                    <ChevronRight className={cn('hidden h-4 w-4 lg:block', on ? 'text-brand-400 opacity-100' : 'opacity-0')} />
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Panneau de la section active */}
        <div>
          {isLoading || !form ? (
            <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
          ) : active === 'identity' ? (
            <SectionShell icon={Building2} title="Identité de la plateforme" description="Coordonnées publiques et devise par défaut" onSave={save} saving={update.isPending}>
              <Group label="Coordonnées publiques">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nom de la plateforme" icon={Building2} value={form.platform_name} onChange={(v) => set({ platform_name: v })} />
                  <Field label="Devise par défaut" icon={Coins} value={form.default_currency} onChange={(v) => set({ default_currency: v.toUpperCase() })} />
                  <Field label="Email de support" icon={Mail} type="email" value={form.support_email} onChange={(v) => set({ support_email: v })} />
                  <Field label="Téléphone de support" icon={Phone} value={form.support_phone} onChange={(v) => set({ support_phone: v })} placeholder="+224 ..." />
                </div>
              </Group>
            </SectionShell>
          ) : active === 'finance' ? (
            <SectionShell icon={Wallet} title="Finance" description="Commission et seuil de versement" onSave={save} saving={update.isPending}>
              <Group label="Commission & versements">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Taux de commission" icon={Percent} type="number" suffix="%"
                    value={form.commission_percent}
                    onChange={(v) => set({ commission_percent: Number(v) })}
                    hint="Part prélevée par SOSLocal sur chaque intervention payée."
                  />
                  <Field
                    label="Versement minimum" icon={Coins} type="number" suffix={form.default_currency}
                    value={form.min_payout_amount}
                    onChange={(v) => set({ min_payout_amount: Number(v) })}
                    hint="Solde requis avant déclenchement d’un versement artisan."
                  />
                </div>
              </Group>
            </SectionShell>
          ) : active === 'operations' ? (
            <SectionShell icon={SlidersHorizontal} title="Exploitation" description="Comportements globaux de la plateforme" onSave={save} saving={update.isPending}>
              <Group label="Disponibilité & flux">
                <div className="divide-y divide-border rounded-xl border border-border">
                  {TOGGLES.map((t) => (
                    <div key={t.key} className="flex items-center justify-between gap-4 px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[rgb(var(--fg))]">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                      </div>
                      <Toggle checked={Boolean(form[t.key])} onChange={() => set({ [t.key]: !form[t.key] } as Partial<PlatformSettings>)} />
                    </div>
                  ))}
                </div>
              </Group>
            </SectionShell>
          ) : (
            <ExportSection />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section Export ──────────────────────────────────────────────────────────
function ExportSection() {
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

  return (
    <SectionShell icon={Download} title="Export de données" description="Téléchargement CSV pour analyse ou archivage">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
          <ShieldCheck className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[rgb(var(--fg))]">Données protégées</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Les colonnes sensibles (mots de passe, jetons) sont automatiquement exclues des fichiers exportés.
          </p>
        </div>
      </div>

      <Group label="Jeux de données">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {entities?.map((e) => (
              <div key={e.entity} className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-[rgb(var(--fg))]">{e.label}</p>
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
              </div>
            ))}
          </div>
        )}
      </Group>
    </SectionShell>
  )
}
