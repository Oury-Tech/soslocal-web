'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Users, UserPlus, ShieldCheck, ShieldAlert, Ban, Play, Pause,
  AlertTriangle, RefreshCw, Phone, Mail, CheckCircle2, Loader2, Pencil, Trash2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge, Avatar } from '@/components/ui/badge'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import { getInitials, formatDate } from '@/lib/utils/format'
import { formatPhoneDisplay, normalizePhone, isValidGuineaPhone, findDuplicatePhones } from '@/lib/utils/phone'
import {
  useAdminUsers, useUpdateUserRole, useSetUserStatus, useCreateUser,
  useUpdateUser, useDeleteUser,
  FULL_USER_LISTING_AVAILABLE,
} from '@/hooks/queries/useAdminUsers'
import { Info } from 'lucide-react'
import { passwordSchema } from '@/lib/validation/password'
import type { User, UserRole, AccountStatus } from '@/types'

const ROLE_LABELS: Record<UserRole, string> = {
  client: 'Bénéficiaire', technician: 'Artisan', operator: 'Opérateur', admin: 'Administrateur',
}
const ROLE_VARIANT: Record<UserRole, any> = {
  client: 'primary', technician: 'accent', operator: 'warning', admin: 'danger',
}
const STATUS_LABELS: Record<AccountStatus, string> = {
  active: 'Actif', suspended: 'Suspendu', banned: 'Banni',
}
const STATUS_VARIANT: Record<AccountStatus, any> = {
  active: 'success', suspended: 'warning', banned: 'danger',
}

const ROLE_FILTERS: ('all' | UserRole)[] = ['all', 'client', 'technician', 'operator', 'admin']

function statusOf(u: User): AccountStatus {
  return u.account_status ?? (u.is_active ? 'active' : 'suspended')
}

export default function UtilisateursAdminPage() {
  const { data: users = [], isLoading, refetch, isFetching } = useAdminUsers()
  const updateRole = useUpdateUserRole()
  const setStatus = useSetUserStatus()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)

  const duplicatePhones = useMemo(() => findDuplicatePhones(users), [users])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const qPhone = normalizePhone(search)
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (statusFilter !== 'all' && statusOf(u) !== statusFilter) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        normalizePhone(u.phone).includes(qPhone.replace('+224', '')) ||
        formatPhoneDisplay(u.phone).toLowerCase().includes(q)
      )
    })
  }, [users, search, roleFilter, statusFilter])

  function changeRole(u: User, role: UserRole) {
    if (role === u.role) return
    updateRole.mutate({ id: u.id, role }, {
      onSuccess: () => toast.success(`${u.name} est désormais ${ROLE_LABELS[role]}.`),
      onError: () => toast.error('Échec du changement de rôle.'),
    })
  }

  function changeStatus(u: User, status: AccountStatus, msg: string) {
    setStatus.mutate({ id: u.id, status }, {
      onSuccess: () => toast.success(msg),
      onError: () => toast.error("Échec de la mise à jour du statut."),
    })
  }

  function removeUser(u: User) {
    if (!confirm(`Supprimer définitivement ${u.name} ? Cette action est irréversible.`)) return
    deleteUser.mutate(u.id, {
      onSuccess: () => toast.success(`${u.name} a été supprimé.`),
      onError: (e: any) => toast.error(e?.response?.data?.detail || 'Échec de la suppression.'),
    })
  }

  const counts = {
    total: users.length,
    technicians: users.filter((u) => u.role === 'technician').length,
    suspended: users.filter((u) => statusOf(u) !== 'active').length,
    duplicates: duplicatePhones.size,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tous les comptes : accès, rôles, suspension et vérification.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} /> Actualiser
          </Button>
          <Button variant="accent" size="sm" onClick={() => setShowCreate(true)}>
            <UserPlus className="h-4 w-4" /> Nouvel utilisateur
          </Button>
        </div>
      </div>

      {!FULL_USER_LISTING_AVAILABLE && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              Listing partiel : seuls les artisans sont chargés depuis le backend
            </span>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              L'API ne fournit pas encore <code>GET /admin/users</code>. Les bénéficiaires et opérateurs
              n'apparaîtront pas, et le changement de rôle / suspension nécessite les endpoints admin côté FastAPI.
              Ces actions sont déjà prêtes côté front et fonctionneront dès que l'API les exposera.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total comptes', value: counts.total, icon: Users, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Artisans', value: counts.technicians, icon: ShieldCheck, color: 'text-accent-600', bg: 'bg-accent-50 dark:bg-accent-900/20' },
          { label: 'Bloqués', value: counts.suspended, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Tél. en doublon', value: counts.duplicates, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', s.bg)}>
                <s.icon className={cn('h-4 w-4', s.color)} />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {isLoading ? <div className="h-7 w-10 bg-muted rounded animate-pulse" /> : s.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Alerte doublons téléphone */}
      {counts.duplicates > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-sm font-semibold text-red-800 dark:text-red-200">
              Anomalie : {counts.duplicates} numéro{counts.duplicates > 1 ? 's' : ''} de téléphone partagé{counts.duplicates > 1 ? 's' : ''} par plusieurs comptes
            </span>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              Un numéro doit appartenir à un seul utilisateur. Les comptes concernés sont signalés ci-dessous (badge « Doublon »).
              Corrigez-les en suspendant/fusionnant le compte en trop, puis appliquez la contrainte UNIQUE côté backend.
            </p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                roleFilter === r ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {r === 'all' ? 'Tous les rôles' : ROLE_LABELS[r]}
            </button>
          ))}
          <span className="w-px bg-border mx-1" />
          {(['all', 'active', 'suspended', 'banned'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                statusFilter === s ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {s === 'all' ? 'Tous statuts' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Rechercher par nom, email ou téléphone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground bg-muted/30">
                <th className="text-left font-semibold px-4 py-3">Utilisateur</th>
                <th className="text-left font-semibold px-4 py-3 hidden md:table-cell">Téléphone</th>
                <th className="text-left font-semibold px-4 py-3">Rôle</th>
                <th className="text-left font-semibold px-4 py-3 hidden sm:table-cell">Statut</th>
                <th className="text-left font-semibold px-4 py-3 hidden lg:table-cell">Inscrit</th>
                <th className="text-right font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td className="px-4 py-4" colSpan={6}><div className="h-12 bg-muted rounded-xl animate-pulse" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">Aucun utilisateur trouvé</p>
                  </td>
                </tr>
              ) : filtered.map((u, i) => {
                const st = statusOf(u)
                const isDup = duplicatePhones.has(normalizePhone(u.phone))
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={u.avatar_url} fallback={getInitials(u.name)} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm truncate">{u.name}</span>
                            {u.is_email_verified && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />}
                          </div>
                          <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatPhoneDisplay(u.phone)}
                      </div>
                      {isDup && (
                        <Badge variant="danger" className="text-[10px] mt-1 gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" /> Doublon
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value as UserRole)}
                        disabled={updateRole.isPending}
                        className="text-xs font-medium rounded-lg border border-border bg-card px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      >
                        {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-4 hidden sm:table-cell">
                      <Badge variant={STATUS_VARIANT[st]}>{STATUS_LABELS[st]}</Badge>
                    </td>

                    <td className="px-4 py-4 hidden lg:table-cell text-xs text-muted-foreground">
                      {formatDate(u.created_at)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="text-xs text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                          onClick={() => setEditTarget(u)}>
                          <Pencil className="h-3.5 w-3.5" /><span className="hidden lg:inline">Modifier</span>
                        </Button>
                        {st === 'active' ? (
                          <Button variant="ghost" size="sm" className="text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            onClick={() => changeStatus(u, 'suspended', `${u.name} suspendu.`)}>
                            <Pause className="h-3.5 w-3.5" /><span className="hidden lg:inline">Suspendre</span>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            onClick={() => changeStatus(u, 'active', `${u.name} réactivé.`)}>
                            <Play className="h-3.5 w-3.5" /><span className="hidden lg:inline">Réactiver</span>
                          </Button>
                        )}
                        {st !== 'banned' && (
                          <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => { if (confirm(`Bannir définitivement ${u.name} ?`)) changeStatus(u, 'banned', `${u.name} banni.`) }}>
                            <Ban className="h-3.5 w-3.5" /><span className="hidden lg:inline">Bannir</span>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          disabled={deleteUser.isPending}
                          onClick={() => removeUser(u)}>
                          <Trash2 className="h-3.5 w-3.5" /><span className="hidden lg:inline">Supprimer</span>
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {filtered.length} utilisateur{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
            {users.length !== filtered.length && ` sur ${users.length} au total`}
          </div>
        )}
      </Card>

      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        existingPhones={users.map((u) => u.phone)}
        onCreate={(payload) =>
          createUser.mutateAsync(payload).then(() => {
            toast.success('Utilisateur créé.')
            setShowCreate(false)
          })
        }
        pending={createUser.isPending}
      />

      <EditUserModal
        user={editTarget}
        onClose={() => setEditTarget(null)}
        existingPhones={users.filter((u) => u.id !== editTarget?.id).map((u) => u.phone)}
        existingEmails={users.filter((u) => u.id !== editTarget?.id).map((u) => u.email)}
        onSave={(patch) =>
          updateUser.mutateAsync(patch).then(() => {
            toast.success('Utilisateur mis à jour.')
            setEditTarget(null)
          })
        }
        pending={updateUser.isPending}
      />
    </div>
  )
}

function CreateUserModal({
  open, onClose, existingPhones, onCreate, pending,
}: {
  open: boolean
  onClose: () => void
  existingPhones: (string | undefined)[]
  onCreate: (p: { name: string; email: string; phone: string; role: UserRole; password: string }) => Promise<unknown>
  pending: boolean
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'client' as UserRole, password: '' })

  function submit() {
    if (form.name.trim().length < 2) return toast.error('Nom trop court.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Email invalide.')
    if (!isValidGuineaPhone(form.phone)) return toast.error('Numéro guinéen invalide (ex. +224 6XX XX XX XX).')
    const canonical = normalizePhone(form.phone)
    if (existingPhones.some((p) => normalizePhone(p) === canonical)) {
      return toast.error('Ce numéro est déjà utilisé par un autre compte.')
    }
    if (!passwordSchema.safeParse(form.password).success) {
      return toast.error('Mot de passe : 8+ caractères, 1 maj, 1 min, 1 chiffre.')
    }
    onCreate({ ...form, phone: canonical }).catch((e: any) => toast.error(e?.message || 'Échec de la création.'))
  }

  return (
    <Modal open={open} onClose={onClose} title="Créer un utilisateur" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-900">Nom complet</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Téléphone</label>
            <input type="tel" placeholder="+224 6XX XX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Rôle</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Mot de passe</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
        </div>
        <Button variant="accent" size="md" className="w-full" onClick={submit} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer le compte'}
        </Button>
      </div>
    </Modal>
  )
}

function EditUserModal({
  user, onClose, existingPhones, existingEmails, onSave, pending,
}: {
  user: User | null
  onClose: () => void
  existingPhones: (string | undefined)[]
  existingEmails: (string | undefined)[]
  onSave: (p: { id: number; name: string; email: string; phone: string; role: UserRole }) => Promise<unknown>
  pending: boolean
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'client' as UserRole })

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, phone: user.phone, role: user.role })
    }
  }, [user])

  function submit() {
    if (!user) return
    if (form.name.trim().length < 2) return toast.error('Nom trop court.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Email invalide.')
    if (!isValidGuineaPhone(form.phone)) return toast.error('Numéro guinéen invalide (ex. +224 6XX XX XX XX).')
    const canonical = normalizePhone(form.phone)
    if (existingPhones.some((p) => normalizePhone(p) === canonical)) {
      return toast.error('Ce numéro est déjà utilisé par un autre compte.')
    }
    const emailLower = form.email.trim().toLowerCase()
    if (existingEmails.some((e) => (e ?? '').toLowerCase() === emailLower)) {
      return toast.error('Cet email est déjà utilisé par un autre compte.')
    }
    onSave({ id: user.id, name: form.name.trim(), email: emailLower, phone: canonical, role: form.role })
      .catch((e: any) => toast.error(e?.response?.data?.detail || e?.message || 'Échec de la mise à jour.'))
  }

  return (
    <Modal open={!!user} onClose={onClose} title="Modifier l'utilisateur" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-900">Nom complet</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Téléphone</label>
            <input type="tel" placeholder="+224 6XX XX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-900">Rôle</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30">
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        <Button variant="accent" size="md" className="w-full" onClick={submit} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer les modifications'}
        </Button>
      </div>
    </Modal>
  )
}
