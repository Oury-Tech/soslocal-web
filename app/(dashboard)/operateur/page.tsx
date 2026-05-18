'use client'

import { motion } from 'framer-motion'
import {
  Users, Wrench, TrendingUp, Activity, Star, MapPin,
  AlertCircle, CheckCircle2, ArrowUpRight,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DynamicMap } from '@/components/maps/dynamic-map'
import { CONAKRY_CENTER } from '@/lib/constants'
import { formatGNF } from '@/lib/utils/format'
import {
  useOperatorStats,
  useOperatorChart,
  useInterventionStatus,
  useOperatorActivity,
  useOperatorAlerts,
} from '@/hooks/queries/useOperator'
import { useAllTechnicians } from '@/hooks/queries/useTechnicians'

export default function OperateurDashboard() {
  const { data: stats, isLoading: statsLoading } = useOperatorStats()
  const { data: chartData = [], isLoading: chartLoading } = useOperatorChart()
  const { data: interventionStatus = [] } = useInterventionStatus()
  const { data: activity = [], isLoading: activityLoading } = useOperatorActivity()
  const { data: alerts = [], isLoading: alertsLoading } = useOperatorAlerts()
  const { data: technicians = [] } = useAllTechnicians()

  const kpis = [
    {
      label: 'Artisans actifs',
      value: statsLoading ? '—' : stats?.activeArtisans ?? 0,
      sub: statsLoading ? '' : `+${stats?.newArtisansThisMonth} ce mois`,
      icon: Users,
      color: 'from-brand-500 to-brand-700',
      trend: '+10%',
    },
    {
      label: 'Missions actives',
      value: statsLoading ? '—' : stats?.activeMissions ?? 0,
      sub: 'En temps réel',
      icon: Wrench,
      color: 'from-accent-500 to-accent-700',
      trend: 'Live',
    },
    {
      label: 'CA du mois',
      value: statsLoading ? '—' : stats?.monthRevenueLabel ?? '',
      sub: 'Cumul depuis 1er mai',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      trend: '+15%',
    },
    {
      label: 'Satisfaction',
      value: statsLoading ? '—' : `${stats?.satisfaction}/5`,
      sub: statsLoading ? '' : `${stats?.totalReviews} évaluations`,
      icon: Star,
      color: 'from-amber-500 to-orange-600',
      trend: statsLoading ? '' : `+${stats?.satisfactionTrend}`,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-4 w-4 text-accent-600 animate-pulse" />
          <span className="text-xs font-semibold text-accent-700 dark:text-accent-300">SUPERVISION TEMPS RÉEL</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de l'écosystème SOSLocal · Programme Allô Maître
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5 relative overflow-hidden">
              <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} opacity-10`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  {stat.trend && (
                    <Badge variant="success" className="text-[10px]">
                      <ArrowUpRight className="h-2.5 w-2.5" />
                      {stat.trend}
                    </Badge>
                  )}
                </div>
                {statsLoading ? (
                  <>
                    <div className="h-7 w-20 bg-muted rounded animate-pulse mb-1" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Carte temps réel + Statut interventions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent-600" />
                  Vue temps réel · Conakry
                </h2>
                <p className="text-xs text-muted-foreground">
                  {technicians.filter((t) => t.is_online).length} artisans en ligne
                </p>
              </div>
              <Badge variant="accent" className="animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                LIVE
              </Badge>
            </div>
            <div className="h-[400px]">
              <DynamicMap technicians={technicians} userPosition={CONAKRY_CENTER} />
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="font-bold mb-1">Statut des interventions</h2>
          <p className="text-xs text-muted-foreground mb-4">Cumul depuis 1er mai 2026</p>
          {interventionStatus.length === 0 ? (
            <div className="h-[200px] bg-muted/40 rounded-xl animate-pulse" />
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-2 mt-2">
            {interventionStatus.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span>{s.name}</span>
                </div>
                <span className="font-bold tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Évolution 7 jours */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold">Évolution sur 7 jours</h2>
            <p className="text-xs text-muted-foreground">Missions et chiffre d'affaires</p>
          </div>
        </div>
        {chartLoading ? (
          <div className="h-[300px] bg-muted/40 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '0.75rem',
                }}
                formatter={(v: number, name: string) => name === 'revenus' ? formatGNF(v) : v}
              />
              <Legend />
              <Line yAxisId="left"  type="monotone" dataKey="missions" stroke="#1A3F7A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} name="Missions" />
              <Line yAxisId="right" type="monotone" dataKey="revenus"  stroke="#00A99D" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} name="Revenus"  />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Alertes + Activité récente */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Alertes
            </h3>
            {!alertsLoading && alerts.length > 0 && (
              <Badge variant="warning">{alerts.length} nouvelles</Badge>
            )}
          </div>

          {alertsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.type === 'warning' ? 'bg-amber-500' :
                    alert.type === 'success' ? 'bg-green-500' : 'bg-brand-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{alert.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{alert.sub}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent-600" />
              Activité récente
            </h3>
          </div>

          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-accent-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{act.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{act.sub}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{act.time}</div>
                  </div>
                  {act.amount && (
                    <div className="text-xs font-bold text-accent-700 dark:text-accent-300 whitespace-nowrap">
                      +{formatGNF(act.amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
