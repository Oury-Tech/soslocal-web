'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Star, CheckCircle2, Clock, UserCheck, UserX,
  Award, AlertCircle, RefreshCw, Users, Wifi, WifiOff, XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge, Avatar } from '@/components/ui/badge'
import { useAdminTechnicians } from '@/hooks/queries/useTechnicians'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

type FilterTab = 'all' | 'pending' | 'approved'

export default function ArtisansAdminPage() {
  const { data: technicians = [], refetch, isLoading, isError, error } = useAdminTechnicians()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [revokingId, setRevokingId] = useState<number | null>(null)

  const pending  = technicians.filter((t) => !t.is_verified)
  const approved = technicians.filter((t) => t.is_verified)

  const displayed = (tab === 'pending' ? pending : tab === 'approved' ? approved : technicians)
    .filter((t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.profession ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.email ?? '').toLowerCase().includes(search.toLowerCase())
    )

  async function handleApprove(techId: number, techName: string) {
    setApprovingId(techId)
    try {
      await apiClient.patch(API.ADMIN_TECHNICIAN_VERIFY(techId), { is_verified: true })
      toast.success(`${techName} a été approuvé — il peut maintenant accéder à la plateforme.`)
      refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Erreur lors de l\'approbation.')
    } finally {
      setApprovingId(null)
    }
  }

  async function handleRevoke(techId: number, techName: string) {
    setRevokingId(techId)
    try {
      await apiClient.patch(API.ADMIN_TECHNICIAN_VERIFY(techId), { is_verified: false })
      toast.success(`Accès de ${techName} révoqué.`)
      refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Erreur lors de la révocation.')
    } finally {
      setRevokingId(null)
    }
  }

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all',      label: 'Tous',       count: technicians.length },
    { key: 'pending',  label: 'En attente', count: pending.length },
    { key: 'approved', label: 'Approuvés',  count: approved.length },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Gestion des artisans</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Validation et supervision des artisans de la plateforme.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',       value: technicians.length,                                icon: Users,       color: 'text-brand-500',  bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'En ligne',    value: technicians.filter((t) => t.is_online).length,    icon: Wifi,        color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Disponibles', value: technicians.filter((t) => t.is_available).length, icon: UserCheck,   color: 'text-accent-500',  bg: 'bg-accent-50 dark:bg-accent-900/20' },
          { label: 'En attente',  value: pending.length,                                   icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
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

      {/* Error alert */}
      {isError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-red-800 dark:text-red-200">
              Impossible de charger les artisans
            </span>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              {(error as any)?.response?.data?.detail ?? (error as any)?.message ?? 'Erreur réseau — le backend est peut-être en train de démarrer.'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-semibold text-red-700 dark:text-red-300 hover:underline whitespace-nowrap"
          >
            Réessayer →
          </button>
        </div>
      )}

      {/* Pending alert */}
      {pending.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              {pending.length} artisan{pending.length > 1 ? 's' : ''} en attente d'approbation
            </span>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Ces artisans ne peuvent pas accéder à la plateforme tant qu'ils ne sont pas approuvés.
            </p>
          </div>
          <button
            onClick={() => setTab('pending')}
            className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline whitespace-nowrap"
          >
            Voir la liste →
          </button>
        </div>
      )}

      {/* Tabs + Recherche */}
      <Card className="p-4 space-y-3">
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                tab === t.key
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                tab === t.key
                  ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300'
                  : 'bg-muted-foreground/20 text-muted-foreground'
              )}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Rechercher par nom, profession, email…"
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
                <th className="text-left font-semibold px-4 py-3">Artisan</th>
                <th className="text-left font-semibold px-4 py-3 hidden md:table-cell">Profession</th>
                <th className="text-left font-semibold px-4 py-3 hidden lg:table-cell">Note</th>
                <th className="text-left font-semibold px-4 py-3 hidden sm:table-cell">Présence</th>
                <th className="text-left font-semibold px-4 py-3 hidden sm:table-cell">Statut</th>
                <th className="text-right font-semibold px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4" colSpan={6}>
                      <div className="h-12 bg-muted rounded-xl animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">
                      {search ? `Aucun résultat pour « ${search} »` : 'Aucun artisan trouvé'}
                    </p>
                    {search && (
                      <button onClick={() => setSearch('')} className="mt-2 text-xs text-brand-500 hover:underline">
                        Effacer la recherche
                      </button>
                    )}
                  </td>
                </tr>
              ) : displayed.map((tech, i) => (
                <motion.tr
                  key={tech.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Artisan */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar fallback={getInitials(tech.name)} size="md" />
                        <span className={cn(
                          'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card',
                          tech.is_online ? 'bg-green-500' : 'bg-gray-400'
                        )} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm truncate">{tech.name}</span>
                          {tech.is_verified && (
                            <Award className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{tech.email || '—'}</div>
                        {tech.phone && (
                          <div className="text-xs text-muted-foreground">{tech.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Profession */}
                  <td className="px-4 py-4 text-sm hidden md:table-cell">
                    <div className="font-medium">{tech.profession || 'Artisan'}</div>
                    {tech.hourly_rate ? (
                      <div className="text-xs text-muted-foreground">{formatGNF(tech.hourly_rate)}/h</div>
                    ) : null}
                  </td>

                  {/* Note */}
                  <td className="px-4 py-4 hidden lg:table-cell">
                    {tech.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-sm tabular-nums">{tech.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({tech.total_reviews})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pas encore noté</span>
                    )}
                  </td>

                  {/* Présence */}
                  <td className="px-4 py-4 hidden sm:table-cell">
                    {tech.is_online ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                        <Wifi className="h-3.5 w-3.5" />
                        En ligne
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <WifiOff className="h-3.5 w-3.5" />
                        Hors ligne
                      </div>
                    )}
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-4 hidden sm:table-cell">
                    {tech.is_verified ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Approuvé
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1">
                        <Clock className="h-3 w-3" />
                        En attente
                      </Badge>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-4 text-right">
                    {!tech.is_verified ? (
                      <Button
                        variant="accent"
                        size="sm"
                        className="text-xs"
                        loading={approvingId === tech.id}
                        onClick={() => handleApprove(tech.id, tech.name)}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Approuver</span>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        loading={revokingId === tech.id}
                        onClick={() => handleRevoke(tech.id, tech.name)}
                      >
                        <UserX className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Révoquer</span>
                      </Button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!isLoading && displayed.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {displayed.length} artisan{displayed.length > 1 ? 's' : ''} affiché{displayed.length > 1 ? 's' : ''}
            {technicians.length !== displayed.length && ` sur ${technicians.length} au total`}
          </div>
        )}
      </Card>
    </div>
  )
}
