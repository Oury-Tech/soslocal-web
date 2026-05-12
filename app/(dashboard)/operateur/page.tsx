'use client'

import { motion } from 'framer-motion'
import {
  Users, Wrench, TrendingUp, Activity, Star, MapPin, Clock,
  AlertCircle, CheckCircle2, BarChart3, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DynamicMap } from '@/components/maps/dynamic-map'
import { CONAKRY_CENTER, TECHNICIANS } from '@/lib/mock-data'
import { formatGNF } from '@/lib/utils/format'

const interventionStatus = [
  { name: 'Complétées', value: 1247, color: '#10B981' },
  { name: 'En cours',    value: 38,   color: '#00A99D' },
  { name: 'En attente',  value: 12,   color: '#F59E0B' },
  { name: 'Annulées',    value: 27,   color: '#EF4444' },
]

const evolution7d = [
  { day: 'Lun', missions: 145, revenus: 18500000 },
  { day: 'Mar', missions: 162, revenus: 21300000 },
  { day: 'Mer', missions: 138, revenus: 17800000 },
  { day: 'Jeu', missions: 178, revenus: 23900000 },
  { day: 'Ven', missions: 195, revenus: 26100000 },
  { day: 'Sam', missions: 152, revenus: 19400000 },
  { day: 'Dim', missions: 87,  revenus: 11200000 },
]

export default function OperateurDashboard() {
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
        {[
          { label: 'Artisans actifs',  value: 130, sub: '+12 ce mois',   icon: Users,    color: 'from-brand-500 to-brand-700',   trend: '+10%', up: true },
          { label: 'Missions actives', value: 38,  sub: 'En temps réel', icon: Wrench,   color: 'from-accent-500 to-accent-700', trend: 'Live', up: true },
          { label: 'CA du mois',       value: '138M GNF', sub: 'Cumul depuis 1er mai', icon: TrendingUp, color: 'from-green-500 to-emerald-600', trend: '+15%', up: true },
          { label: 'Satisfaction',     value: '4.8/5', sub: '1247 évaluations',       icon: Star,     color: 'from-amber-500 to-orange-600',  trend: '+0.2', up: true },
        ].map((stat, i) => (
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
                  <Badge variant={stat.up ? 'success' : 'danger'} className="text-[10px]">
                    {stat.up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    {stat.trend}
                  </Badge>
                </div>
                <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Carte temps réel + Graphique status */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent-600" />
                  Vue temps réel · Conakry
                </h2>
                <p className="text-xs text-muted-foreground">{TECHNICIANS.filter(t => t.is_online).length} artisans en ligne</p>
              </div>
              <Badge variant="accent" className="animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                LIVE
              </Badge>
            </div>
            <div className="h-[400px]">
              <DynamicMap technicians={TECHNICIANS} userPosition={CONAKRY_CENTER} />
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="font-bold mb-1">Statut des interventions</h2>
          <p className="text-xs text-muted-foreground mb-4">Cumul depuis 1er mai 2026</p>
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

      {/* Evolution */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold">Évolution sur 7 jours</h2>
            <p className="text-xs text-muted-foreground">Missions et chiffre d'affaires</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolution7d}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="day" className="text-xs" />
            <YAxis yAxisId="left" className="text-xs" />
            <YAxis yAxisId="right" orientation="right" className="text-xs" tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(var(--card))',
                border: '1px solid rgb(var(--border))',
                borderRadius: '0.75rem',
              }}
              formatter={(v: number, name: string) => name === 'revenus' ? formatGNF(v) : v}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="missions" stroke="#1A3F7A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} name="Missions" />
            <Line yAxisId="right" type="monotone" dataKey="revenus" stroke="#00A99D" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} name="Revenus" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Alertes récentes */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Alertes
            </h3>
            <Badge variant="warning">3 nouvelles</Badge>
          </div>
          <div className="space-y-3">
            {[
              { type: 'warning', title: 'Demande sans réponse depuis 15 min', sub: 'SOS-2026-014 · Plomberie · Ratoma', time: 'Il y a 12 min' },
              { type: 'info',    title: 'Nouvel artisan en attente de validation', sub: 'Karim Touré · Électricien', time: 'Il y a 1h' },
              { type: 'success', title: 'Centre Kaloum : objectif mensuel atteint', sub: '150 missions complétées', time: 'Il y a 2h' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
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
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent-600" />
              Activité récente
            </h3>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Mission complétée', sub: 'Mohamed Keita · Fuite réparée', time: 'À l\'instant', amount: 175000 },
              { title: 'Nouvelle évaluation 5★',  sub: 'Aïssatou Bah → Mohamed Keita', time: 'Il y a 5 min' },
              { title: 'Paiement reçu',           sub: 'Orange Money · 120 000 GNF', time: 'Il y a 12 min', amount: 120000 },
              { title: 'Mission acceptée',        sub: 'Fatoumata Bah · Électricité', time: 'Il y a 18 min' },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
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
        </Card>
      </div>
    </div>
  )
}
