'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Wrench, TrendingUp, Activity, Star, MapPin,
  AlertCircle, CheckCircle2,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/StatCard'
import { PageHeader } from '@/components/ui/page-header'
import { SectionCard } from '@/components/ui/section-card'
import { DynamicMap } from '@/components/maps/dynamic-map'
import { CONAKRY_CENTER } from '@/lib/constants'
import { formatGNF } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  useOperatorStats,
  useOperatorChart,
  useInterventionStatus,
  useOperatorActivity,
  useOperatorAlerts,
} from '@/hooks/queries/useOperator'
import { useAllTechnicians } from '@/hooks/queries/useTechnicians'
import { useOnlinePresence } from '@/hooks/queries/usePresence'
import { useOnlineCount, useOnlineUserIds } from '@/stores/ws.store'

const TOOLTIP_STYLE = {
  backgroundColor: 'rgb(var(--card))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '0.75rem',
}

export default function OperateurDashboard() {
  const { data: stats, isLoading: statsLoading } = useOperatorStats()
  const { data: chartData = [], isLoading: chartLoading } = useOperatorChart()
  const { data: interventionStatus = [] } = useInterventionStatus()
  const { data: activity = [], isLoading: activityLoading } = useOperatorActivity()
  const { data: alerts = [], isLoading: alertsLoading } = useOperatorAlerts()
  const { data: technicians = [] } = useAllTechnicians()

  // Présence GLOBALE temps réel : instantané initial + évènements WS `presence`.
  const presence = useOnlinePresence()
  const onlineCount = useOnlineCount()
  const onlineIds = useOnlineUserIds()
  const onlineSet = useMemo(() => new Set(onlineIds), [onlineIds])
  // Tant que l'instantané n'est pas arrivé, on retombe sur la valeur API.
  const artisansOnline = presence.isSuccess
    ? technicians.filter((t) => onlineSet.has(t.id)).length
    : technicians.filter((t) => t.is_online).length

  const kpis = [
    {
      label: 'Artisans actifs',
      value: statsLoading ? '—' : stats?.activeArtisans ?? 0,
      sub: statsLoading ? '' : `+${stats?.newArtisansThisMonth ?? 0} ce mois`,
      icon: Users,
      tone: 'brand' as const,
    },
    {
      label: 'Missions actives',
      value: statsLoading ? '—' : stats?.activeMissions ?? 0,
      sub: 'En temps réel',
      icon: Wrench,
      tone: 'accent' as const,
    },
    {
      label: 'CA du mois',
      value: statsLoading ? '—' : (stats?.monthRevenueLabel || formatGNF(stats?.monthRevenue ?? 0)),
      sub: 'Cumul depuis 1er mai',
      icon: TrendingUp,
      tone: 'success' as const,
    },
    {
      label: 'Satisfaction',
      value: statsLoading ? '—' : `${(stats?.satisfaction ?? 0).toFixed(1)}/5`,
      sub: statsLoading ? '' : `${stats?.totalReviews ?? 0} évaluations`,
      icon: Star,
      tone: 'warning' as const,
      delta: !statsLoading && (stats?.satisfactionTrend ?? 0) > 0
        ? { value: `+${stats?.satisfactionTrend}`, direction: 'up' as const }
        : undefined,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={Activity}
        title="Tableau de bord"
        description="Vue d'ensemble de l'écosystème SOSLocal · Conakry"
      >
        {/* Compteur de présence GLOBALE temps réel (pastille sobre, sans ping) */}
        <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2 dark:border-green-800 dark:bg-green-900/20">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-sm font-bold tabular-nums text-green-700 dark:text-green-300">{onlineCount}</span>
          <span className="text-xs text-green-700/80 dark:text-green-300/80">en ligne</span>
        </div>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <StatCard
              label={stat.label}
              value={stat.value}
              sub={stat.sub}
              icon={stat.icon}
              tone={stat.tone}
              delta={stat.delta}
              loading={statsLoading}
            />
          </motion.div>
        ))}
      </div>

      {/* Carte temps réel + Statut interventions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            icon={MapPin}
            title="Vue temps réel · Conakry"
            description={`${artisansOnline} artisan${artisansOnline > 1 ? 's' : ''} en ligne`}
            action={
              <Badge variant="accent" className="gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Live
              </Badge>
            }
            flush
          >
            <div className="h-[400px]">
              <DynamicMap technicians={technicians} userPosition={CONAKRY_CENTER} />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Statut des interventions" description="Cumul depuis 1er mai 2026">
          {interventionStatus.length === 0 ? (
            <div className="h-[200px] animate-pulse rounded-xl bg-muted/40" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={interventionStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {interventionStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 space-y-2">
            {interventionStatus.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-[rgb(var(--fg))]">{s.name}</span>
                </div>
                <span className="font-bold tabular-nums text-[rgb(var(--fg))]">{s.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Évolution 7 jours */}
      <SectionCard
        icon={TrendingUp}
        title="Évolution sur 7 jours"
        description="Missions et chiffre d'affaires"
      >
        {chartLoading ? (
          <div className="h-[300px] animate-pulse rounded-xl bg-muted/40" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number, name: string) => name === 'revenus' ? formatGNF(v) : v}
              />
              <Legend />
              <Line yAxisId="left"  type="monotone" dataKey="missions" stroke="#0078FF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} name="Missions" />
              <Line yAxisId="right" type="monotone" dataKey="revenus"  stroke="#1ABCCC" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} name="Revenus"  />
            </LineChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* Alertes + Activité récente */}
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard
          icon={AlertCircle}
          title="Alertes"
          action={!alertsLoading && alerts.length > 0 ? <Badge variant="warning">{alerts.length} nouvelles</Badge> : undefined}
        >
          {alertsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucune alerte en cours.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                  <div className={cn('mt-1.5 h-2 w-2 flex-shrink-0 rounded-full',
                    alert.type === 'warning' ? 'bg-amber-500' :
                    alert.type === 'success' ? 'bg-green-500' : 'bg-brand-500'
                  )} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[rgb(var(--fg))]">{alert.title}</div>
                    <div className="truncate text-xs text-[rgb(var(--muted-fg))]">{alert.sub}</div>
                    <div className="mt-0.5 text-xs text-[rgb(var(--muted-fg))]">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard icon={CheckCircle2} title="Activité récente">
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucune activité récente.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30">
                    <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[rgb(var(--fg))]">{act.title}</div>
                    <div className="truncate text-xs text-[rgb(var(--muted-fg))]">{act.sub}</div>
                    <div className="mt-0.5 text-xs text-[rgb(var(--muted-fg))]">{act.time}</div>
                  </div>
                  {act.amount && (
                    <div className="whitespace-nowrap text-xs font-bold text-brand-600 dark:text-brand-300">
                      +{formatGNF(act.amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
