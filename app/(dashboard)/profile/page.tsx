'use client'

import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import {
  User, Mail, Phone, MapPin, Camera, Save, Shield,
  Bell, Lock, Globe, LogOut, Trash2, Award, Loader2, Info,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
import { useUploadAvatar } from '@/hooks/queries/useUpload'
import { getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  useNotificationPrefs,
  useUpdateNotificationPrefs,
  DEFAULT_NOTIF_PREFS,
  type NotificationPrefs,
} from '@/hooks/useNotifications'

const TABS = [
  { id: 'profile',       label: 'Profil',          icon: User },
  { id: 'security',      label: 'Sécurité',        icon: Lock },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'preferences',   label: 'Préférences',     icon: Globe },
] as const

const ROLE_LABELS: Record<string, string> = {
  client: 'Bénéficiaire',
  technician: 'Artisan certifié',
  operator: 'Opérateur Allô Maître',
  admin: 'Administrateur',
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, updateProfile, changePassword, changeEmail, deleteAccount } = useAuthStore()
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<typeof TABS[number]['id']>('profile')

  // Les comptes de gestion ne peuvent pas s'auto-supprimer (cohérent avec le backend).
  const canSelfDelete = user?.role !== 'admin' && user?.role !== 'operator'

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
  })
  const [saving, setSaving] = useState(false)

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [pwdSaving, setPwdSaving] = useState(false)

  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' })
  const [emailSaving, setEmailSaving] = useState(false)

  const [deleting, setDeleting] = useState(false)

  // Préférences de notification — serveur (cohérentes web ↔ mobile)
  const { data: notifPrefs = DEFAULT_NOTIF_PREFS } = useNotificationPrefs()
  const updatePrefs = useUpdateNotificationPrefs()
  const togglePref = (key: keyof NotificationPrefs) =>
    updatePrefs.mutate({ [key]: !notifPrefs[key] })

  const resetForm = () =>
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
    })

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Le nom ne peut pas être vide.')
      return
    }
    setSaving(true)
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        bio: form.bio.trim() || undefined,
      })
      toast.success('Profil mis à jour avec succès !')
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      toast.error(
        Array.isArray(detail) ? detail.map((e: any) => e.msg).join(', ') : detail || 'Échec de la mise à jour.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      toast.error('Veuillez remplir tous les champs.')
      return
    }
    if (pwd.next !== pwd.confirm) {
      toast.error('Les deux mots de passe ne correspondent pas.')
      return
    }
    const strong = pwd.next.length >= 8 && /[a-z]/.test(pwd.next) && /[A-Z]/.test(pwd.next) && /\d/.test(pwd.next)
    if (!strong) {
      toast.error('Le mot de passe doit faire 8 caractères min. avec majuscule, minuscule et chiffre.')
      return
    }
    setPwdSaving(true)
    try {
      await changePassword(pwd.current, pwd.next)
      toast.success('Mot de passe modifié avec succès !')
      setPwd({ current: '', next: '', confirm: '' })
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      toast.error(
        Array.isArray(detail) ? detail.map((e: any) => e.msg).join(', ') : detail || 'Échec de la modification.'
      )
    } finally {
      setPwdSaving(false)
    }
  }

  const handleChangeEmail = async () => {
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

  const handleDeleteAccount = async () => {
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 8 Mo.")
      return
    }
    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success('Photo de profil mise à jour !'),
      onError: () => toast.error("Échec de l'envoi de la photo."),
    })
    e.target.value = ''
  }

  const handleLogout = async () => {
    await logout()
    toast.success('À bientôt !')
    router.push('/')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Mon profil</h1>
        <p className="text-muted-foreground mt-1">Gérez vos informations et préférences.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Side nav — 2×2 grid on mobile, vertical sidebar on desktop */}
        <div className="space-y-3 lg:space-y-0 lg:contents">
          <Card className="p-2 lg:p-3 h-fit lg:sticky lg:top-24">
            <nav className="grid grid-cols-2 lg:flex lg:flex-col gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex items-center gap-2 lg:gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors min-w-0',
                    tab === t.id ? 'bg-brand-500 text-white' : 'text-foreground hover:bg-muted'
                  )}
                >
                  <t.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
              {/* Logout — desktop only, inside the sidebar */}
              <hr className="hidden lg:block my-1 border-border" />
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </nav>
          </Card>

          {/* Logout — mobile only, full-width button below the tabs */}
          <button
            onClick={handleLogout}
            className="lg:hidden w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {tab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Hero card */}
              <Card className="overflow-hidden">
                <div className="h-28 bg-brand-500" />
                <div className="px-6 pb-6">
                  <div className="-mt-12 flex items-end justify-between flex-wrap gap-4">
                    <div className="relative">
                      <Avatar src={user?.avatar_url} fallback={getInitials(user?.name)} size="xl" className="ring-4 ring-card h-24 w-24 text-2xl" />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadAvatar.isPending}
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-accent-600 text-white flex items-center justify-center shadow-soft hover:bg-accent-700 transition-colors disabled:opacity-60"
                      >
                        {uploadAvatar.isPending
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Camera className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold">{user?.name}</h2>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {user?.role === 'technician' && <Award className="h-4 w-4 text-accent-600" />}
                        <span className="capitalize">{ROLE_LABELS[user?.role ?? 'client']}</span>
                        {user?.is_email_verified && (
                          <Badge variant="success" className="text-[10px]">
                            <Shield className="h-2.5 w-2.5" />
                            Vérifié
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Form */}
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Informations personnelles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Nom complet"
                    icon={<User className="h-4 w-4" />}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    value={user?.email || ''}
                    readOnly
                    disabled
                    helperText="Modifiable depuis l'onglet Sécurité."
                  />
                  <Input
                    label="Téléphone"
                    icon={<Phone className="h-4 w-4" />}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <Input
                    label="Adresse"
                    icon={<MapPin className="h-4 w-4" />}
                    placeholder="Conakry, Guinée"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div className="mt-4">
                  <label className="block mb-1.5 text-sm font-medium">Bio (optionnel)</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Parlez-nous un peu de vous…"
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div className="mt-6 flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={resetForm} disabled={saving}>Annuler</Button>
                  <Button variant="accent" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Enregistrer
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {tab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-1">Changer l'adresse e-mail</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Actuelle : <span className="font-medium text-foreground">{user?.email}</span>
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
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Changer le mot de passe</h3>
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
                    helperText="8 caractères min., avec majuscule, minuscule et chiffre."
                  />
                  <Input
                    type="password"
                    label="Confirmer le nouveau mot de passe"
                    icon={<Lock className="h-4 w-4" />}
                    value={pwd.confirm}
                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  />
                </div>
                <Button variant="accent" className="mt-4" onClick={handleChangePassword} disabled={pwdSaving}>
                  {pwdSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Mettre à jour
                </Button>
              </Card>

              <Card className="p-6 border-red-200 dark:border-red-900/50">
                <h3 className="font-bold text-lg mb-2 text-red-600">Zone dangereuse</h3>
                {canSelfDelete ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      La suppression du compte est définitive. Toutes vos données seront effacées.
                    </p>
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Supprimer mon compte
                    </Button>
                  </>
                ) : (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Les comptes de gestion (administrateur, opérateur) ne peuvent pas être supprimés
                      depuis le profil, pour des raisons de sécurité. Contactez un autre administrateur.
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {tab === 'notifications' && (
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-1">Notifications</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Ces préférences sont synchronisées avec l'application mobile.
              </p>
              <div className="space-y-0">
                {([
                  { key: 'push_enabled',   label: 'Notifications push',     desc: "Recevoir les notifications dans l'application" },
                  { key: 'email_enabled',  label: 'Notifications par email', desc: 'Recevoir un email pour les événements importants' },
                  { key: 'new_request',    label: 'Nouvelles demandes',      desc: 'Être alerté des nouvelles demandes / missions' },
                  { key: 'request_update', label: 'Suivi des demandes',      desc: 'Acceptation, avancement, finalisation, paiement' },
                  { key: 'messages',       label: 'Messages',                desc: 'Nouveaux messages de chat' },
                  { key: 'promotions',     label: 'Offres & promotions',     desc: 'Offres spéciales et nouveautés SOSLocal' },
                ] as const).map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{n.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifPrefs[n.key]}
                      disabled={updatePrefs.isPending}
                      onClick={() => togglePref(n.key)}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 disabled:opacity-60',
                        notifPrefs[n.key] ? 'bg-brand-500' : 'bg-muted'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        notifPrefs[n.key] ? 'translate-x-5' : 'translate-x-0'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'preferences' && (
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Préférences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Langue</label>
                  <select className="w-full h-11 px-4 rounded-lg bg-white dark:bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>🇫🇷 Français</option>
                    <option>🇬🇧 English</option>
                    <option>🇬🇳 Peul (bientôt)</option>
                    <option>🇬🇳 Soussou (bientôt)</option>
                    <option>🇬🇳 Malinké (bientôt)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Devise</label>
                  <select className="w-full h-11 px-4 rounded-lg bg-white dark:bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>GNF · Franc Guinéen</option>
                    <option>USD · US Dollar</option>
                    <option>EUR · Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Fuseau horaire</label>
                  <select className="w-full h-11 px-4 rounded-lg bg-white dark:bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>(GMT+0) Conakry</option>
                    <option>(GMT+1) Paris</option>
                  </select>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
