'use client'

import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, Users, MapPin, Clock, Star, Download,
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

const servicesData = [
  { service: 'Plomberie',    missions: 412, ca: 52000000 },
  { service: 'Électricité',  missions: 358, ca: 47800000 },
  { service: 'Mécanique',    missions: 245, ca: 38900000 },
  { service: 'Menuiserie',   missions: 156, ca: 28400000 },
  { service: 'Climatisation', missions: 89,  ca: 21200000 },
  { service: 'Maçonnerie',   missions: 67,  ca: 19500000 },
]

const centresData = [
  { centre: 'Kaloum',     missions: 285, artisans: 22 },
  { centre: 'Dixinn',     missions: 312, artisans: 18 },
  { centre: 'Matam',      missions: 198, artisans: 14 },
  { centre: 'Ratoma',     missions: 245, artisans: 19 },
  { centre: 'Matoto',     missions: 287, artisans: 21 },
]

const radarData = [
  { metric: 'Qualité',         value: 4.8 },
  { metric: 'Professionnalisme', value: 4.7 },
  { metric: 'Ponctualité',     value: 4.5 },
  { metric: 'Communication',   value: 4.9 },
  { metric: 'Rapport qual/prix', value: 4.6 },
]

const monthlyTrend = [
  { month: 'Jan', missions: 845,  newUsers: 67  },
  { month: 'Fév', missions: 1023, newUsers: 89  },
  { month: 'Mar', missions: 1289, newUsers: 124 },
  { month: 'Avr', missions: 1456, newUsers: 156 },
  { month: 'Mai', missions: 1247, newUsers: 178 },
]

export default function StatistiquesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Statistiques</h1>
          <p className="text-muted-foreground mt-1">
            Analyse approfondie de l'activité · Programme Allô Maître
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md">
            <Download className="h-4 w-4" />
            Exporter rapport MEATFP
          </Button>
        </div>
      </div>

      {/* Période */}
      <Card className="p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['7 jours', '30 jours', '3 mois', '6 mois', '1 an', 'Tout'].map((p, i) => (
            <button
              key={p}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                i === 2 ? 'bg-brand-700 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Missions totales',  value: '5 860',   sub: '+18% vs prév. mois', icon: BarChart3 },
          { label: 'Nouveaux utilisateurs', value: '614', sub: '+22% vs prév. mois', icon: Users },
          { label: 'CA total',          value: '687M GNF', sub: '+15% vs prév. mois', icon: TrendingUp },
          { label: 'Note moyenne',      value: '4.7/5',   sub: 'Sur 1247 évaluations', icon: Star },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <s.icon className="h-5 w-5 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold tabular-nums">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-xs mt-1 text-green-600 dark:text-green-400 font-medium">{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Top services</h2>
            <Badge variant="primary">6 catégories</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={servicesData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="service" type="category" className="text-xs" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '0.75rem',
                }}
              />
              <Bar dataKey="missions" fill="#00A99D" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Performance par centre</h2>
            <Badge variant="primary">5 centres Conakry</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={centresData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="centre" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '0.75rem',
                }}
              />
              <Legend />
              <Bar dataKey="missions" fill="#1A3F7A" radius={[8, 8, 0, 0]} name="Missions" />
              <Bar dataKey="artisans" fill="#00A99D" radius={[8, 8, 0, 0]} name="Artisans" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Évolution mensuelle</h2>
            <Badge variant="success">+47% sur 5 mois</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '0.75rem',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="missions"  stroke="#1A3F7A" strokeWidth={3} dot={{ r: 4 }} name="Missions" />
              <Line type="monotone" dataKey="newUsers"  stroke="#00A99D" strokeWidth={3} dot={{ r: 4 }} name="Nouveaux utilisateurs" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Satisfaction multicritères</h2>
            <Badge variant="accent">Score SUS · 88/100</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="metric" className="text-xs" />
              <PolarRadiusAxis angle={90} domain={[0, 5]} className="text-xs" />
              <Radar name="Note" dataKey="value" stroke="#00A99D" fill="#00A99D" fillOpacity={0.4} strokeWidth={2} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '0.75rem',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
