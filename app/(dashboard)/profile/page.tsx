'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
  User, Mail, Phone, MapPin, Camera, Save, Shield,
  Bell, LogOut, Award, Loader2, SlidersHorizontal,
  FileText, CreditCard, Map, Wrench, Star, Wallet,
  LayoutDashboard, Users, ScrollText, Lock,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, Badge } from '@/components/ui/badge'
import { SectionCard } from '@/components/ui/section-card'
import { QuickLinkCard } from '@/components/ui/QuickLinkCard'
import { useAuthStore } from '@/stores/auth.store'
import { useUploadAvatar } from '@/hooks/queries/useUpload'
import { getInitials } from '@/lib/utils/format'

const ROLE_LABELS: Record<string, string> = {
  client: 'Bénéficiaire',
  technician: 'Artisan certifié',
  operator: 'Opérateur Allô Maître',
  admin: 'Administrateur',
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, updateProfile } = useAuthStore()
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // L'administrateur n'a pas de page profil : son identité est gérée en interne.
  // On le renvoie vers son back-office plutôt que d'exposer une page vide.
  useEffect(() => {
    if (user?.role === 'admin') router.replace('/operateur')
  }, [user?.role, router])

  // Accès rapides adaptés au rôle (style HealthSecure) — navigation directe
  // vers les destinations les plus utiles du compte courant.
  const QUICK_LINKS: Record<string, { icon: typeof User; title: string; description: string; href: string; tone: 'brand' | 'accent' | 'success' | 'warning' }[]> = {
    client: [
      { icon: FileText,   title: 'Mes demandes',  description: 'Suivi de vos interventions',   href: '/beneficiaire/demandes',  tone: 'brand'   },
      { icon: CreditCard, title: 'Paiements',     description: 'Factures et règlements',       href: '/beneficiaire/paiements', tone: 'success' },
      { icon: Map,        title: 'Carte',         description: 'Artisans autour de vous',      href: '/beneficiaire/carte',     tone: 'accent'  },
      { icon: Bell,       title: 'Notifications', description: 'Alertes et messages',          href: '/notifications',          tone: 'warning' },
      { icon: Lock,       title: 'Sécurité',      description: 'Mot de passe et e-mail',       href: '/parametres?section=securite', tone: 'brand' },
    ],
    technician: [
      { icon: Wrench, title: 'Mes missions',  description: 'Interventions en cours', href: '/artisan/missions', tone: 'brand'   },
      { icon: Wallet, title: 'Revenus',       description: 'Gains et historique',    href: '/artisan/revenus',  tone: 'success' },
      { icon: Star,   title: 'Avis',          description: 'Retours de vos clients', href: '/artisan/avis',     tone: 'warning' },
      { icon: Bell,   title: 'Notifications', description: 'Alertes et messages',    href: '/notifications',    tone: 'accent'  },
      { icon: Lock,   title: 'Sécurité',      description: 'Mot de passe et e-mail', href: '/parametres?section=securite', tone: 'brand' },
    ],
    operator: [
      { icon: LayoutDashboard, title: 'Tableau de bord', description: "Vue d'ensemble",        href: '/operateur',              tone: 'brand'   },
      { icon: Users,           title: 'Utilisateurs',    description: 'Gestion des comptes',   href: '/operateur/utilisateurs', tone: 'accent'  },
      { icon: Wallet,          title: 'Finance',         description: 'Paiements et promos',   href: '/operateur/finance',      tone: 'success' },
      { icon: ScrollText,      title: "Journal d'audit", description: 'Activité et sécurité',  href: '/operateur/admin',        tone: 'warning' },
    ],
  }
  const quickLinks = QUICK_LINKS[user?.role ?? 'client'] ?? QUICK_LINKS.client

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
  })
  const [saving, setSaving] = useState(false)

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

  // Évite un flash de contenu pendant la redirection de l'administrateur.
  if (user?.role === 'admin') return null

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Identity header — avatar + name + role, with logout always reachable */}
      <SectionCard bodyClassName="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="relative flex-shrink-0 mx-auto sm:mx-0">
            <Avatar
              src={user?.avatar_url}
              fallback={getInitials(user?.name)}
              size="xl"
              className="h-20 w-20 text-2xl ring-2 ring-border"
            />
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
              aria-label="Changer la photo de profil"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-soft hover:bg-brand-600 transition-colors disabled:opacity-60"
            >
              {uploadAvatar.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Camera className="h-4 w-4" />}
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="font-display text-2xl font-extrabold truncate">{user?.name}</h1>
            <div className="flex items-center justify-center sm:justify-start flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
              {user?.role === 'technician' && <Award className="h-4 w-4 text-brand-500" />}
              <span>{ROLE_LABELS[user?.role ?? 'client']}</span>
              {user?.is_email_verified && (
                <Badge variant="success" className="text-[10px]">
                  <Shield className="h-2.5 w-2.5" />
                  Vérifié
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors sm:self-center sm:flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </SectionCard>

      {/* Accès rapide — raccourcis adaptés au rôle (style HealthSecure) */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Accès rapide</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map((q, i) => (
            <QuickLinkCard
              key={q.href}
              icon={q.icon}
              title={q.title}
              description={q.description}
              href={q.href}
              tone={q.tone}
              delay={i * 0.05}
            />
          ))}
        </div>
      </section>

      {/* Informations personnelles — identité du compte (la sécurité, les
          notifications et la confidentialité vivent désormais dans Paramètres). */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <SectionCard
          title="Informations personnelles"
          icon={User}
          action={
            <Link
              href="/parametres"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-300 hover:underline"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Paramètres
            </Link>
          }
        >
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
              helperText="Modifiable depuis Paramètres › Sécurité."
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
            <label className="block mb-1.5 text-sm font-medium text-[rgb(var(--fg))]">Bio (optionnel)</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Parlez-nous un peu de vous…"
              className="w-full px-4 py-3 rounded-lg bg-card dark:bg-muted border border-border text-[rgb(var(--fg))] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-colors"
            />
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={resetForm} disabled={saving}>Annuler</Button>
            <Button variant="accent" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </Button>
          </div>
        </SectionCard>
      </motion.div>
    </div>
  )
}
