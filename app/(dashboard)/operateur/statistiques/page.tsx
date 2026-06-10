'use client'

import {
  BarChart3, TrendingUp, Users, Star, Download, Activity, Inbox,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatGNF } from '@/lib/utils/format'
import { useOperatorStatistics } from '@/hooks/queries/useOperator'

const TOOLTIP_STYLE = {
  backgroundColor: 'rgb(var(--card))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '0.75rem',
}

function ChartCard({
  title, badge, badgeVariant = 'primary', empty, hasData, children,
}: {
  title: string
  badge: string
  badgeVariant?: any
  empty: string
  hasData: boolean
  children: React.ReactNode
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">{title}</h2>
        <Badge variant={badgeVariant}>{badge}</Badge>
      </div>
      {hasData ? children : (
        <div className="h-[300px] flex flex-col items-center justify-center text-center gap-2">
          <Inbox className="h-9 w-9 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{empty}</p>
        </div>
      )}
    </Card>
  )
}

export default function StatistiquesPage() {
  const { data, isLoading } = useOperatorStatistics()

  const kpis = data?.kpis
  const topServices = data?.top_services ?? []
  const zones = data?.zones ?? []
  const monthlyTrend = data?.monthly_trend ?? []
  const satisfaction = data?.satisfaction ?? []

  function exportReport() {
    const rows: string[] = ['Service;Missions;CA (GNF)']
    topServices.forEach((s) => rows.push(`${s.service};${s.missions};${Math.round(s.ca)}`))
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `soslocal-statistiques-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const kpiCards = [
    { label: 'Missions totales', value: kpis ? kpis.total_missions.toLocaleString('fr-FR') : '—', icon: BarChart3 },
    { label: 'Nouveaux utilisateurs (mois)', value: kpis ? kpis.new_users.toLocaleString('fr-FR') : '—', icon: Users },
    { label: 'CA total', value: kpis ? (kpis.total_revenue_label || formatGNF(kpis.total_revenue)) : '—', icon: TrendingUp },
    { label: 'Note moyenne', value: kpis ? `${kpis.avg_rating.toFixed(1)}/5` : '—', sub: kpis ? `Sur ${kpis.total_reviews} évaluations` : '', icon: Star },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Statistiques</h1>
          <p className="text-muted-foreground mt-1">
            Analyse de l'activité · données en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="accent" className="gap-1">
            <Activity className="h-3 w-3" /> Temps réel
          </Badge>
          <Button variant="outline" size="md" onClick={exportReport} disabled={topServices.length === 0}>
            <Download className="h-4 w-4" />
            Exporter (CSV)
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((s) => (
          <Card key={s.label} className="p-5">
            <s.icon className="h-5 w-5 text-muted-foreground mb-2" />
            {isLoading ? (
              <div className="h-7 w-20 bg-muted rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-bold tabular-nums">{s.value}</div>
            )}
            <div className="text-xs text-muted-foreground">{s.label}</div>
            {s.sub && <div className="text-xs mt-1 text-muted-foreground font-medium">{s.sub}</div>}
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          title="Top services"
          badge={`${topServices.length} catégorie${topServices.length > 1 ? 's' : ''}`}
          empty="Aucune mission enregistrée pour le moment."
          hasData={!isLoading && topServices.length > 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topServices} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="service" type="category" className="text-xs" width={100} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => v.toLocaleString('fr-FR')} />
              <Bar dataKey="missions" fill="#00A99D" radius={[0, 8, 8, 0]} name="Missions" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Performance par commune"
          badge={`${zones.length} commune${zones.length > 1 ? 's' : ''}`}
          empty="Pas encore de données géolocalisées."
          hasData={!isLoading && zones.length > 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zones}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="centre" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <Bar dataKey="missions" fill="#1A3F7A" radius={[8, 8, 0, 0]} name="Missions" />
              <Bar dataKey="artisans" fill="#00A99D" radius={[8, 8, 0, 0]} name="Artisans" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Évolution mensuelle"
          badge="6 derniers mois"
          badgeVariant="success"
          empty="Historique insuffisant."
          hasData={!isLoading && monthlyTrend.length > 0}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <Line type="monotone" dataKey="missions" stroke="#1A3F7A" strokeWidth={3} dot={{ r: 4 }} name="Missions" />
              <Line type="monotone" dataKey="newUsers" stroke="#00A99D" strokeWidth={3} dot={{ r: 4 }} name="Nouveaux utilisateurs" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Satisfaction multicritères"
          badge="Notes réelles"
          badgeVariant="accent"
          empty="Aucune évaluation détaillée pour le moment."
          hasData={!isLoading && satisfaction.some((s) => s.value > 0)}
        >
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={satisfaction}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="metric" className="text-xs" />
              <PolarRadiusAxis angle={90} domain={[0, 5]} className="text-xs" />
              <Radar name="Note" dataKey="value" stroke="#00A99D" fill="#00A99D" fillOpacity={0.4} strokeWidth={2} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
