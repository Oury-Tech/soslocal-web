'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Bell, ShieldCheck, CreditCard, Mail,
  Lock, Smartphone, Save, Plus, Settings, Trash2, Info, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { SectionCard } from '@/components/ui/section-card'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { passwordSchema } from '@/lib/validation/password'
import { PasswordChecklist } from '@/components/features/auth/PasswordChecklist'
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
  DEFAULT_NOTIF_PREFS,
  type NotificationPrefs,
} from '@/hooks/useNotifications'

type Section = 'securite' | 'notifications' | 'confidentialite' | 'paiement'

const SECTIONS: { key: Section; label: string; icon: typeof Bell }[] = [
  { key: 'securite',        label: 'Sécurité',        icon: Lock        },
  { key: 'notifications',   label: 'Notifications',   icon: Bell        },
  { key: 'confidentialite', label: 'Confidentialité', icon: ShieldCheck },
  { key: 'paiement',        label: 'Paiement',        icon: CreditCard  },
]

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0 disabled:opacity-60',
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

export default function ParametresPage() {
  const router = useRouter()
  const { user, changePassword, changeEmail, deleteAccount, updateLocation } = useAuthStore()
  const [section, setSection] = useState<Section>('securite')

  // Deep-link : /parametres?section=securite (ou #securite) ouvre directement le
  // bon onglet — garantit qu'un lien « Modifier mot de passe » atterrit toujours
  // sur la section Sécurité, jamais ailleurs.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const fromQuery = new URLSearchParams(window.location.search).get('section')
    const fromHash = window.location.hash.replace('#', '')
    const target = (fromQuery || fromHash) as Section
    if (target && SECTIONS.some((s) => s.key === target)) setSection(target)
  }, [])

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' })
  const [emailSaving, setEmailSaving] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [locating, setLocating] = useState(false)

  // Les comptes de gestion ne peuvent pas s'auto-supprimer (cohérent backend).
  const canSelfDelete = user?.role !== 'admin' && user?.role !== 'operator'

  // Préférences de notification — serveur (cohérentes web ↔ mobile).
  const { data: notifPrefs = DEFAULT_NOTIF_PREFS } = useNotificationPrefs()
  const updatePrefs = useUpdateNotificationPrefs()
  const togglePref = (key: keyof NotificationPrefs) =>
    updatePrefs.mutate({ [key]: !notifPrefs[key] })

  const [privacy, setPrivacy] = useState({
    profilVisible:     true,
    localisation:      true,
    historiqueVisible: false,
  })

  async function handlePwdSave() {
    if (!pwd.current || !pwd.next) { toast.error('Remplissez tous les champs.'); return }
    const valid = passwordSchema.safeParse(pwd.next)
    if (!valid.success) { toast.error(valid.error.issues[0].message); return }
    if (pwd.next !== pwd.confirm)  { toast.error('Les mots de passe ne correspondent pas.'); return }
    setSavingPwd(true)
    try {
      await changePassword(pwd.current, pwd.next)
      toast.success('Mot de passe mis à jour !')
      setPwd({ current: '', next: '', confirm: '' })
    } catch (err: any) {
      toast.error(err?.message || 'Impossible de changer le mot de passe')
    } finally {
      setSavingPwd(false)
    }
  }

  async function handleChangeEmail() {
    const next = emailForm.newEmail.trim().toLowerCase()
    if (!next || !emailForm.password) {
      toast.error('Veuillez saisir le nouvel e-mail et votre mot de passe.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
      toast.error('Adresse e-mail invalide.')
      return
    }
    if (next === (user?.email || '').toLowerCase()) {
      toast.error("C'est déjà votre adresse e-mail actuelle.")
      return
    }
    setEmailSaving(true)
    try {
      await changeEmail(next, emailForm.password)
      toast.success('Adresse e-mail modifiée avec succès !')
      setEmailForm({ newEmail: '', password: '' })
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      toast.error(
        Array.isArray(detail) ? detail.map((e: any) => e.msg).join(', ') : detail || "Échec de la modification de l'e-mail."
      )
    } finally {
      setEmailSaving(false)
    }
  }

  async function handleDeleteAccount() {
    if (!canSelfDelete) return
    const confirmed = window.confirm(
      'Cette action est définitive. Voulez-vous vraiment supprimer votre compte ?'
    )
    if (!confirmed) return
    setDeleting(true)
    try {
      await deleteAccount()
      toast.success('Votre compte a été supprimé.')
      router.push('/')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      toast.error(
        Array.isArray(detail) ? detail.map((e: any) => e.msg).join(', ') : detail || 'Échec de la suppression.'
      )
      setDeleting(false)
    }
  }

  function handleUpdateLocation() {
    if (!('geolocation' in navigator)) { toast.error('Géolocalisation non supportée.'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await updateLocation(pos.coords.latitude, pos.coords.longitude)
          toast.success('Position mise à jour')
        } catch { toast.error('Échec de la mise à jour') }
        finally { setLocating(false) }
      },
      () => { toast.error('Accès à la position refusé'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Paramètres"
        description="Gérez vos préférences et la sécurité de votre compte."
        icon={Settings}
      />

      <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-start">
        {/* Nav latérale — empilée en haut sur mobile, sticky sur desktop */}
        <nav className="flex lg:flex-col gap-1 p-1.5 rounded-2xl border border-border bg-card shadow-soft w-full lg:w-52 flex-shrink-0 lg:sticky lg:top-24 overflow-x-auto no-scrollbar">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={cn(
                'flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left whitespace-nowrap',
                section === s.key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-[rgb(var(--fg))] hover:bg-muted'
              )}
            >
              <s.icon className="h-4 w-4 flex-shrink-0" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Contenu */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ── SÉCURITÉ ─────────────────────────────────── */}
          {section === 'securite' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <SectionCard title="Changer l'adresse e-mail" icon={Mail}>
                <p className="text-sm text-muted-foreground mb-4">
                  Actuelle : <span className="font-medium text-[rgb(var(--fg))]">{user?.email}</span>
                </p>
                <div className="space-y-4">
                  <Input
                    type="email"
                    label="Nouvelle adresse e-mail"
                    icon={<Mail className="h-4 w-4" />}
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    placeholder="nouvel.email@exemple.com"
                  />
                  <Input
                    type="password"
                    label="Votre mot de passe (confirmation)"
                    icon={<Lock className="h-4 w-4" />}
                    value={emailForm.password}
                    onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                    helperText="Requis pour confirmer le changement d'e-mail."
                  />
                </div>
                <Button variant="accent" className="mt-4" onClick={handleChangeEmail} disabled={emailSaving}>
                  {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Mettre à jour l'e-mail
                </Button>
              </SectionCard>

              <SectionCard title="Changer le mot de passe" icon={Lock}>
                <div className="space-y-4">
                  <Input
                    type="password"
                    label="Mot de passe actuel"
                    icon={<Lock className="h-4 w-4" />}
                    value={pwd.current}
                    onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                  />
                  <Input
                    type="password"
                    label="Nouveau mot de passe"
                    icon={<Lock className="h-4 w-4" />}
                    value={pwd.next}
                    onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                  />
                  <PasswordChecklist value={pwd.next} />
                  <Input
                    type="password"
                    label="Confirmer le nouveau mot de passe"
                    icon={<Lock className="h-4 w-4" />}
                    value={pwd.confirm}
                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  />
                </div>
                <Button variant="accent" className="mt-4" onClick={handlePwdSave} loading={savingPwd}>
                  <Save className="h-4 w-4" />
                  Mettre à jour
                </Button>
              </SectionCard>

              <SectionCard
                className="border-red-200 dark:border-red-900/50"
                title={<span className="text-red-600 dark:text-red-400">Zone dangereuse</span>}
                icon={Trash2}
              >
                {canSelfDelete ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      La suppression du compte est définitive. Toutes vos données seront effacées.
                    </p>
                    <Button variant="destructive" className="flex-shrink-0" onClick={handleDeleteAccount} disabled={deleting}>
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Supprimer mon compte
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-brand-500" />
                    <p>
                      Les comptes de gestion (administrateur, opérateur) ne peuvent pas être supprimés
                      depuis les paramètres, pour des raisons de sécurité. Contactez un autre administrateur.
                    </p>
                  </div>
                )}
              </SectionCard>
            </motion.div>
          )}

          {/* ── NOTIFICATIONS ────────────────────────────── */}
          {section === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <SectionCard
                title="Préférences de notifications"
                description="Ces préférences sont synchronisées avec l'application mobile."
                icon={Bell}
              >
                <div className="space-y-0">
                  {([
                    { key: 'push_enabled',   label: 'Notifications push',      desc: "Recevoir les notifications dans l'application" },
                    { key: 'email_enabled',  label: 'Notifications par email', desc: 'Recevoir un email pour les événements importants' },
                    { key: 'new_request',    label: 'Nouvelles demandes',      desc: 'Être alerté des nouvelles demandes / missions' },
                    { key: 'request_update', label: 'Suivi des demandes',      desc: 'Acceptation, avancement, finalisation, paiement' },
                    { key: 'messages',       label: 'Messages',                desc: 'Nouveaux messages de chat' },
                    { key: 'promotions',     label: 'Offres & promotions',     desc: 'Offres spéciales et nouveautés SOSLocal' },
                  ] as const).map((n) => (
                    <div key={n.key} className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{n.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                      </div>
                      <Toggle
                        checked={notifPrefs[n.key]}
                        disabled={updatePrefs.isPending}
                        onChange={() => togglePref(n.key)}
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* ── CONFIDENTIALITÉ ──────────────────────────── */}
          {section === 'confidentialite' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <SectionCard title="Confidentialité" icon={ShieldCheck}>
                <div className="space-y-0">
                  {([
                    { key: 'profilVisible',     label: 'Profil public',            desc: 'Votre profil est visible par les autres utilisateurs'   },
                    { key: 'localisation',      label: 'Partage de localisation',  desc: 'Permet aux artisans de vous trouver plus facilement'    },
                    { key: 'historiqueVisible', label: 'Historique visible',       desc: 'Votre historique de demandes est visible'               },
                  ] as const).map((p) => (
                    <div key={p.key} className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{p.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                      </div>
                      <Toggle
                        checked={privacy[p.key]}
                        onChange={() => setPrivacy({ ...privacy, [p.key]: !privacy[p.key] })}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Ma position</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mettez à jour votre géolocalisation pour un meilleur matching.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="flex-shrink-0" onClick={handleUpdateLocation} loading={locating}>
                    Mettre à jour
                  </Button>
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* ── PAIEMENT ─────────────────────────────────── */}
          {section === 'paiement' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <SectionCard title="Méthodes de paiement" icon={CreditCard}>
                <div className="space-y-3 mb-5">
                  {[
                    { method: 'Orange Money', number: '+224 620 *** ***', active: true  },
                    { method: 'MTN MoMo',     number: '+224 660 *** ***', active: false },
                  ].map((pm, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center justify-between gap-3 p-4 rounded-xl border-2 transition-colors',
                        pm.active ? 'border-accent-400 bg-accent-50/50 dark:bg-accent-900/10' : 'border-border'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          pm.active ? 'bg-accent-100 dark:bg-accent-900/30' : 'bg-muted'
                        )}>
                          <Smartphone className={cn('h-5 w-5', pm.active ? 'text-accent-600' : 'text-muted-foreground')} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{pm.method}</p>
                          <p className="text-xs text-muted-foreground truncate">{pm.number}</p>
                        </div>
                      </div>
                      {pm.active ? (
                        <span className="flex-shrink-0 text-xs font-semibold text-accent-700 dark:text-accent-300 bg-accent-100 dark:bg-accent-900/30 px-2 py-1 rounded-full">
                          Par défaut
                        </span>
                      ) : (
                        <button
                          onClick={() => toast.success('Méthode définie par défaut')}
                          className="flex-shrink-0 text-xs text-muted-foreground hover:text-brand-600 font-medium transition-colors"
                        >
                          Définir
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => toast.info('Bientôt disponible')}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-brand-600 border-2 border-dashed border-brand-200 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors w-full justify-center"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une méthode
                </button>
              </SectionCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
