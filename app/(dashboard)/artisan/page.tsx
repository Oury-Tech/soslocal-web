'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Wrench, Wallet, Star, Clock, TrendingUp,
  CheckCircle2, AlertCircle, ArrowRight, Award, MapPin,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
import {
  useArtisanStats,
  usePendingMissions,
  useArtisanWeekEarnings,
  useArtisanMonthEarnings,
} from '@/hooks/queries/useArtisan'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { useToggleAvailability } from '@/hooks/mutations/useAvailability'
import { useAcceptRequest } from '@/hooks/queries/useRequests'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export default function ArtisanDashboard() {
  const { user } = useAuthStore()

  const { data: stats, isLoading: statsLoading, error: statsError } = useArtisanStats()
  const { data: pending = [], isLoading: missionsLoading } = usePendingMissions()
  const { data: weekEarnings = [] } = useArtisanWeekEarnings()
  const { data: monthEarnings = [] } = useArtisanMonthEarnings()

  const toggleAvailability = useToggleAvailability()
  const acceptRequest = useAcceptRequest()

  const isAvailable = stats?.isAvailable ?? true

  // Missions refusées localement : pas d'endpoint backend dédié, on les masque
  // simplement de la liste pour ne plus les voir réapparaître pendant la session.
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const visiblePending = useMemo(
    () => pending.filter((m) => !dismissed.has(m.id)),
    [pending, dismissed]
  )

  function handleDismiss(id: number) {
    setDismissed((prev) => new Set(prev).add(id))
    toast('Mission masquée', { description: "Vous ne verrez plus cette demande." })
  }

  // Revenus réels dérivés des endpoints earnings.
  // Semaine : commence le lundi (index 0). JS getDay() → 0 = dimanche.
  const todayIndex = (new Date().getDay() + 6) % 7
  const todayEarnings = weekEarnings[todayIndex]?.revenus ?? 0
  const todayMissions = weekEarnings[todayIndex]?.missions ?? 0
  const weekTotal = weekEarnings.reduce((sum, d) => sum + (d.revenus ?? 0), 0)
  const weekMissions = weekEarnings.reduce((sum, d) => sum + (d.missions ?? 0), 0)
  // Mois : le dernier élément du tableau correspond au mois courant.
  const monthTotal = monthEarnings.length
    ? monthEarnings[monthEarnings.length - 1]?.revenus ?? 0
    : stats?.monthEarnings ?? 0

  /* Auto-create technician profile for artisans registered before this fix */
  useEffect(() => {
    if (isMock || !statsError || !user) return
    const status = (statsError as any)?.response?.status
    if (status !== 404 && status !== 422) return
    apiClient
      .post(API.TECHNICIAN_PROFILE_CREATE, {
        profession: 'Artisan',
        service_ids: [],
        max_distance_km: 10,
      })
      .then(() => {
        toast.success('Profil artisan créé avec succès.')
      })
      .catch(() => {
        // already exists or other error — ignore
      })
  }, [statsError, user])

  function handleToggle() {
    toggleAvailability.mutate(!isAvailable)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête épuré */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar fallback={getInitials(user?.name)} size="xl" className="ring-2 ring-brand-100 dark:ring-brand-800" />
              {isAvailable && (
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 ring-2 ring-card" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-brand-500" />
                <span className="text-xs text-[rgb(var(--muted-fg))] font-medium">Artisan certifié Allô Maître</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--fg))]">{user?.name}</h1>
              {statsLoading ? (
                <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
              ) : (
                <div className="flex items-center gap-3 text-sm text-[rgb(var(--muted-fg))] mt-1">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {stats?.rating} ({stats?.totalReviews} avis)
                  </span>
                  <span>·</span>
                  <span>{stats?.completionRate}% complétion</span>
                </div>
              )}
            </div>
          </div>

          {/* Toggle disponibilité */}
          <button
            onClick={handleToggle}
            disabled={toggleAvailability.isPending}
            className={cn(
              'flex items-center gap-3 px-5 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap border-2',
              isAvailable
                ? 'bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600 shadow-sm'
                : 'bg-transparent border-[rgb(var(--border))] text-[rgb(var(--muted-fg))] hover:border-brand-300 hover:text-brand-500',
              toggleAvailability.isPending && 'opacity-60 cursor-not-allowed'
            )}
          >
            {toggleAvailability.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <div className={cn('relative h-5 w-9 rounded-full transition-colors', isAvailable ? 'bg-white/30' : 'bg-[rgb(var(--border))]')}>
                <div className={cn(
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all',
                  isAvailable ? 'left-4' : 'left-0.5'
                )} />
              </div>
            )}
            <span>{isAvailable ? 'Disponible' : 'Hors ligne'}</span>
          </button>
        </div>
      </motion.div>

      {/* Revenue stats — icônes plates, pas de dégradés */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="h-10 w-10 rounded-xl bg-muted animate-pulse mb-3" />
              <div className="h-7 w-32 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </Card>
          ))
        ) : (
          [
            { label: "Aujourd'hui",   value: todayEarnings, icon: Wallet,     iconBg: 'bg-green-50 dark:bg-green-900/20',  iconColor: 'text-green-600 dark:text-green-400',  missions: todayMissions },
            { label: 'Cette semaine', value: weekTotal,     icon: TrendingUp, iconBg: 'bg-brand-50 dark:bg-brand-900/20',  iconColor: 'text-brand-500',                      missions: weekMissions },
            { label: 'Ce mois',       value: monthTotal,    icon: Award,      iconBg: 'bg-amber-50 dark:bg-amber-900/20',  iconColor: 'text-amber-600 dark:text-amber-400',  missions: null },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', stat.iconBg)}>
                    <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
                  </div>
                  {stat.missions != null && stat.missions > 0 && (
                    <Badge variant="accent" className="text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {stat.missions} mission{stat.missions > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold tabular-nums text-[rgb(var(--fg))]">{formatGNF(stat.value)}</div>
                <div className="text-xs text-[rgb(var(--muted-fg))]">{stat.label}</div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Missions en attente + Performances */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-[rgb(var(--fg))]">Nouvelles missions</h2>
                <p className="text-xs text-[rgb(var(--muted-fg))]">Acceptez avant que d'autres artisans ne le fassent</p>
              </div>
              {missionsLoading ? (
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              ) : (
                <Badge variant="accent" className={cn(visiblePending.length > 0 && 'animate-pulse')}>
                  {visiblePending.length} en attente
                </Badge>
              )}
            </div>

            {missionsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-border animate-pulse">
                    <div className="h-5 w-48 bg-muted rounded mb-2" />
                    <div className="h-3 w-64 bg-muted rounded mb-3" />
                    <div className="flex justify-between">
                      <div className="h-8 w-28 bg-muted rounded-full" />
                      <div className="h-8 w-20 bg-muted rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visiblePending.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-[rgb(var(--muted-fg))] mx-auto mb-3" />
                <p className="text-sm text-[rgb(var(--muted-fg))]">Aucune nouvelle mission pour le moment</p>
                <p className="text-xs text-[rgb(var(--muted-fg))] mt-1">Restez disponible, vous serez notifié dès qu'une demande arrive</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visiblePending.map((mission) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl border-2 border-border hover:border-brand-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                          <ServiceIcon name={mission.service_name} className="h-5 w-5 text-brand-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate text-[rgb(var(--fg))]">{mission.title}</h3>
                            {mission.priority === 'high' && (
                              <Badge variant="warning" className="text-[10px]">
                                <AlertCircle className="h-2.5 w-2.5" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[rgb(var(--muted-fg))]">
                            <span>{mission.ref}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {mission.distance} km
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {mission.time}
                            </span>
                          </div>
                          <div className="text-xs text-[rgb(var(--muted-fg))] mt-1">{mission.address}</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-brand-600 dark:text-brand-300">
                          {formatGNF(mission.price)}
                        </div>
                        <div className="text-xs text-[rgb(var(--muted-fg))]">Estimé</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Avatar fallback={mission.client.avatar} size="sm" />
                        <span className="text-sm font-medium text-[rgb(var(--fg))]">{mission.client.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={acceptRequest.isPending}
                          onClick={() => handleDismiss(mission.id)}
                        >
                          Refuser
                        </Button>
                        <Button
                          variant="accent"
                          size="sm"
                          disabled={acceptRequest.isPending}
                          onClick={() => acceptRequest.mutate({ id: mission.id })}
                        >
                          {acceptRequest.isPending ? <Spinner className="h-4 w-4" /> : (
                            <>Accepter <ArrowRight className="h-4 w-4" /></>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Performances du jour */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-[rgb(var(--fg))]">
              <CheckCircle2 className="h-5 w-5 text-brand-500" />
              Aujourd'hui
            </h3>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-8 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Missions complétées', value: stats?.completedToday },
                  { label: 'En attente',           value: stats?.pendingMissions },
                  { label: 'Note moyenne',         value: (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {stats?.rating.toFixed(2)}
                    </span>
                  )},
                  { label: 'Taux complétion',      value: <span className="text-brand-600 dark:text-brand-300">{stats?.completionRate}%</span> },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[rgb(var(--muted-fg))]">{row.label}</span>
                    <span className="font-bold tabular-nums text-[rgb(var(--fg))]">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3 text-[rgb(var(--fg))]">Conseils du jour</h3>
            <div className="space-y-2 text-sm">
              {[
                'Activez votre disponibilité pour recevoir des missions',
                'Mettez à jour votre position GPS régulièrement',
                'Répondez vite : les clients aiment la réactivité',
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" aria-hidden />

                  <span className="text-[rgb(var(--muted-fg))]">{tip}</span>
                </div>
              ))}
            </div>
          </Card>

          <Link href="/artisan/revenus">
            <Card className="p-5 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[rgb(var(--fg))]">Voir mes revenus</h3>
                  <p className="text-xs text-[rgb(var(--muted-fg))]">Détails et historique</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[rgb(var(--muted-fg))]" />
              </div>
            </Card>
          </Link>

          <Link href="/artisan/missions">
            <Card className="p-5 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[rgb(var(--fg))]">Toutes mes missions</h3>
                  <p className="text-xs text-[rgb(var(--muted-fg))]">Historique complet</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[rgb(var(--muted-fg))]" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
