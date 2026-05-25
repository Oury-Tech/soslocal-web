'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  User, Mail, Phone, MapPin, Camera, Save, Shield,
  Bell, Lock, Globe, LogOut, Trash2, Award,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
import { getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

const TABS = [
  { id: 'profile',       label: 'Profil',          icon: User },
  { id: 'security',      label: 'Sécurité',        icon: Lock },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'preferences',   label: 'Préférences',     icon: Globe },
] as const

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [tab, setTab] = useState<typeof TABS[number]['id']>('profile')
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: '',
    bio: '',
  })

  const [notifSettings, setNotifSettings] = useState({
    push: true,
    missionEmails: true,
    urgentSms: true,
    newsletter: false,
    marketing: false,
  })

  const handleSave = () => {
    toast.success('Profil mis à jour avec succès !')
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
        {/* Side nav */}
        <Card className="p-3 h-fit lg:sticky lg:top-24">
          <nav className="space-y-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors',
                  tab === t.id ? 'bg-brand-500 text-white' : 'text-foreground hover:bg-muted'
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
            <hr className="my-2 border-border" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </nav>
        </Card>

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
                      <Avatar fallback={getInitials(user?.name)} size="xl" className="ring-4 ring-card h-24 w-24 text-2xl" />
                      <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-accent-600 text-white flex items-center justify-center shadow-soft hover:bg-accent-700 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold">{user?.name}</h2>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {user?.role === 'technician' && <Award className="h-4 w-4 text-accent-600" />}
                        <span className="capitalize">
                          {user?.role === 'client'      && 'Bénéficiaire'}
                          {user?.role === 'technician'  && 'Artisan certifié'}
                          {user?.role === 'operator'    && 'Opérateur Allô Maître'}
                          {user?.role === 'admin'       && 'Administrateur'}
                        </span>
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
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <Input
                    label="Téléphone"
                    icon={<Phone className="h-4 w-4" />}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <Input
                    label="Ville"
                    icon={<MapPin className="h-4 w-4" />}
                    placeholder="Conakry, Guinée"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
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
                  <Button variant="ghost">Annuler</Button>
                  <Button variant="accent" onClick={handleSave}>
                    <Save className="h-4 w-4" />
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
                <h3 className="font-bold text-lg mb-4">Changer le mot de passe</h3>
                <div className="space-y-4">
                  <Input type="password" label="Mot de passe actuel" icon={<Lock className="h-4 w-4" />} />
                  <Input type="password" label="Nouveau mot de passe" icon={<Lock className="h-4 w-4" />} />
                  <Input type="password" label="Confirmer le nouveau mot de passe" icon={<Lock className="h-4 w-4" />} />
                </div>
                <Button variant="accent" className="mt-4">
                  <Save className="h-4 w-4" />
                  Mettre à jour
                </Button>
              </Card>

              <Card className="p-6 border-red-200 dark:border-red-900/50">
                <h3 className="font-bold text-lg mb-2 text-red-600">Zone dangereuse</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  La suppression du compte est définitive. Toutes vos données seront effacées.
                </p>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  Supprimer mon compte
                </Button>
              </Card>
            </motion.div>
          )}

          {tab === 'notifications' && (
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Notifications</h3>
              <div className="space-y-0">
                {([
                  { key: 'push',          label: 'Notifications push (mobile)', desc: "Recevoir les notifications dans l'app mobile" },
                  { key: 'missionEmails', label: 'Emails de mission',           desc: 'Nouvelle mission, mise à jour, finalisation'  },
                  { key: 'urgentSms',     label: "SMS d'urgence",               desc: 'En cas de mission urgente uniquement'          },
                  { key: 'newsletter',    label: 'Newsletter mensuelle',        desc: 'Statistiques et actualités SOSLocal'           },
                  { key: 'marketing',     label: 'Notifications marketing',     desc: 'Offres spéciales et nouveautés'                },
                ] as const).map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{n.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifSettings[n.key]}
                      onClick={() => setNotifSettings((prev) => ({ ...prev, [n.key]: !prev[n.key] }))}
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4',
                        notifSettings[n.key] ? 'bg-brand-500' : 'bg-muted'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        notifSettings[n.key] ? 'translate-x-5' : 'translate-x-0'
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
