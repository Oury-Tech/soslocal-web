'use client'

import {
  BarChart3, TrendingUp, Users, Star, Download, Activity, Inbox,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/StatCard'
import { PageHeader } from '@/components/ui/page-header'
import { SectionCard } from '@/components/ui/section-card'
import { formatGNF } from '@/lib/utils/format'
import { useOperatorStatistics } from '@/hooks/queries/useOperator'

const TOOLTIP_STYLE = {
  backgroundColor: 'rgb(var(--card))',
  border: '1px solid rgb(var(--border))',
  borderRadius: '0.75rem',
}

function ChartSection({
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
    <SectionCard
      title={title}
      action={<Badge variant={badgeVariant}>{badge}</Badge>}
    >
      {hasData ? children : (
        <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-center">
          <Inbox className="h-9 w-9 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{empty}</p>
        </div>
      )}
    </SectionCard>
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
    { label: 'Missions totales', value: kpis ? kpis.total_missions.toLocaleString('fr-FR') : '—', icon: BarChart3, tone: 'brand' as const },
    { label: 'Nouveaux utilisateurs (mois)', value: kpis ? kpis.new_users.toLocaleString('fr-FR') : '—', icon: Users, tone: 'accent' as const },
    { label: 'CA total', value: kpis ? (kpis.total_revenue_label || formatGNF(kpis.total_revenue)) : '—', icon: TrendingUp, tone: 'success' as const },
    { label: 'Note moyenne', value: kpis ? `${kpis.avg_rating.toFixed(1)}/5` : '—', sub: kpis ? `Sur ${kpis.total_reviews} évaluations` : '', icon: Star, tone: 'warning' as const },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={BarChart3}
        title="Statistiques"
        description="Analyse de l'activité · données en temps réel"
      >
        <Badge variant="accent" className="gap-1">
          <Activity className="h-3 w-3" /> Temps réel
        </Badge>
        <Button variant="outline" size="md" onClick={exportReport} disabled={topServices.length === 0}>
          <Download className="h-4 w-4" />
          Exporter (CSV)
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            sub={s.sub}
            icon={s.icon}
            tone={s.tone}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSection
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
              <Bar dataKey="missions" fill="#1ABCCC" radius={[0, 8, 8, 0]} name="Missions" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection
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
              <Bar dataKey="missions" fill="#0078FF" radius={[8, 8, 0, 0]} name="Missions" />
              <Bar dataKey="artisans" fill="#1ABCCC" radius={[8, 8, 0, 0]} name="Artisans" />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection
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
              <Line type="monotone" dataKey="missions" stroke="#0078FF" strokeWidth={3} dot={{ r: 4 }} name="Missions" />
              <Line type="monotone" dataKey="newUsers" stroke="#1ABCCC" strokeWidth={3} dot={{ r: 4 }} name="Nouveaux utilisateurs" />
            </LineChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection
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
              <Radar name="Note" dataKey="value" stroke="#1ABCCC" fill="#1ABCCC" fillOpacity={0.4} strokeWidth={2} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>
    </div>
  )
}
