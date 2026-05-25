'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Star, CheckCircle2, AlertCircle, Award, Clock, UserCheck, UserX,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge, Avatar } from '@/components/ui/badge'
import { useAllTechnicians } from '@/hooks/queries/useTechnicians'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { apiClient } from '@/lib/api/axios'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

type FilterTab = 'all' | 'pending' | 'approved'

export default function ArtisansAdminPage() {
  const { data: technicians = [], refetch } = useAllTechnicians()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<FilterTab>('all')
  const [approvingId, setApprovingId] = useState<number | null>(null)

  const pending  = technicians.filter((t) => !t.is_verified)
  const approved = technicians.filter((t) => t.is_verified)

  const displayed = (tab === 'pending' ? pending : tab === 'approved' ? approved : technicians)
    .filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.profession.toLowerCase().includes(search.toLowerCase())
    )

  async function handleApprove(techId: number, techName: string) {
    setApprovingId(techId)
    try {
      // The backend admin sets is_verified via the admin panel.
      // This button guides the operator to take action.
      await apiClient.patch(`/technicians/${techId}/verify`, { is_verified: true })
      toast.success(`${techName} a été approuvé.`)
      refetch()
    } catch {
      toast.error(
        'Approbation directe non disponible. Allez dans le panneau admin backend pour valider cet artisan.',
        { duration: 6000 }
      )
    } finally {
      setApprovingId(null)
    }
  }

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all',      label: 'Tous',          count: technicians.length },
    { key: 'pending',  label: 'En attente',    count: pending.length },
    { key: 'approved', label: 'Approuvés',     count: approved.length },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Gestion des artisans</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Validation et supervision des artisans de la plateforme.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',        value: technicians.length,                                icon: Award,       color: 'text-brand-500' },
          { label: 'En ligne',     value: technicians.filter((t) => t.is_online).length,    icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Disponibles',  value: technicians.filter((t) => t.is_available).length, icon: UserCheck,   color: 'text-accent-500' },
          { label: 'En attente',   value: pending.length,                                   icon: Clock,       color: 'text-amber-500' },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className={cn('h-4 w-4', s.color)} />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
          </Card>
        ))}
      </div>

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
                tab === t.key ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300' : 'bg-muted-foreground/20 text-muted-foreground'
              )}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Rechercher par nom, profession…"
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
                <th className="text-left font-medium px-4 py-3">Artisan</th>
                <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Profession</th>
                <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Note</th>
                <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Statut</th>
                <th className="text-right font-medium px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    Aucun artisan trouvé
                  </td>
                </tr>
              ) : displayed.map((tech, i) => (
                <motion.tr
                  key={tech.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar fallback={getInitials(tech.name)} size="md" />
                        {tech.is_online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-sm truncate">{tech.name}</span>
                          {tech.is_verified && (
                            <Award className="h-3.5 w-3.5 text-accent-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{tech.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm hidden md:table-cell">
                    <div className="font-medium">{tech.profession}</div>
                    {tech.hourly_rate && (
                      <div className="text-xs text-muted-foreground">{formatGNF(tech.hourly_rate)}/h</div>
                    )}
                  </td>

                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-sm tabular-nums">{tech.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({tech.total_reviews})</span>
                    </div>
                  </td>

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
                      <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
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
      </Card>
    </div>
  )
}
