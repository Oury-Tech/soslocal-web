'use client'

import { motion } from 'framer-motion'
import { Wallet, TrendingUp, Calendar, Download, Banknote, ArrowUpRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatGNF } from '@/lib/utils/format'

const weekData = [
  { day: 'Lun', revenus: 320000, missions: 3 },
  { day: 'Mar', revenus: 425000, missions: 4 },
  { day: 'Mer', revenus: 180000, missions: 2 },
  { day: 'Jeu', revenus: 510000, missions: 5 },
  { day: 'Ven', revenus: 380000, missions: 4 },
  { day: 'Sam', revenus: 285000, missions: 3 },
  { day: 'Dim', revenus: 50000,  missions: 1 },
]

const monthData = [
  { month: 'Jan', revenus: 4800000 },
  { month: 'Fév', revenus: 5200000 },
  { month: 'Mar', revenus: 6100000 },
  { month: 'Avr', revenus: 7300000 },
  { month: 'Mai', revenus: 8750000 },
]

const recentPayouts = [
  { id: 1, date: '2026-05-10', amount: 175000, mission: 'Fuite d\'eau salle de bain',  client: 'Aïssatou Bah',     method: 'Orange Money', status: 'paid' },
  { id: 2, date: '2026-05-09', amount: 120000, mission: 'Court-circuit prise cuisine', client: 'Mohamed Diallo',   method: 'MTN MoMo',      status: 'paid' },
  { id: 3, date: '2026-05-08', amount: 250000, mission: 'Installation chauffe-eau',   client: 'Mariama Touré',    method: 'Orange Money', status: 'paid' },
  { id: 4, date: '2026-05-07', amount: 95000,  mission: 'Réparation robinet cuisine', client: 'Ibrahima Camara',  method: 'Carte',         status: 'paid' },
  { id: 5, date: '2026-05-06', amount: 180000, mission: 'Débouchage canalisation',    client: 'Fatoumata Sylla',  method: 'Orange Money', status: 'paid' },
]

export default function RevenusPage() {
  const totalMonth = monthData[monthData.length - 1].revenus
  const totalWeek = weekData.reduce((s, d) => s + d.revenus, 0)
  const totalCommissions = totalMonth * 0.15
  const totalNet = totalMonth - totalCommissions

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Revenus</h1>
          <p className="text-muted-foreground mt-1">Suivi détaillé de votre activité financière.</p>
        </div>
        <Button variant="outline" size="md">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Revenus du mois', value: totalMonth, sub: '+15% vs mois dernier', icon: Wallet,   color: 'from-brand-500 to-brand-700' },
          { label: 'Commissions',     value: -totalCommissions, sub: '15% (commission Allô Maître)', icon: Banknote, color: 'from-amber-500 to-orange-600' },
          { label: 'Net à recevoir',  value: totalNet, sub: 'Solde disponible', icon: ArrowUpRight, color: 'from-accent-500 to-accent-700' },
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
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white mb-3`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold tabular-nums">{formatGNF(Math.abs(stat.value))}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                <div className="text-xs mt-1 text-green-600 dark:text-green-400 font-medium">{stat.sub}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cette semaine */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Cette semaine</h2>
            <Badge variant="accent">
              <Calendar className="h-3 w-3" />
              {formatGNF(totalWeek)}
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '0.75rem',
                }}
                formatter={(v: number) => formatGNF(v)}
              />
              <Bar dataKey="revenus" fill="#00A99D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Évolution mensuelle */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Évolution mensuelle</h2>
            <Badge variant="success">
              <TrendingUp className="h-3 w-3" />
              +82% sur 5 mois
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthData}>
              <defs>
                <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A3F7A" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#1A3F7A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '0.75rem',
                }}
                formatter={(v: number) => formatGNF(v)}
              />
              <Area type="monotone" dataKey="revenus" stroke="#1A3F7A" strokeWidth={2} fill="url(#colorRevenus)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Historique */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold">Versements récents</h2>
            <p className="text-xs text-muted-foreground">Les paiements sont versés sur votre Mobile Money sous 24h</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left font-medium px-5 py-3">Date</th>
                <th className="text-left font-medium px-5 py-3">Mission</th>
                <th className="text-left font-medium px-5 py-3 hidden sm:table-cell">Client</th>
                <th className="text-left font-medium px-5 py-3 hidden md:table-cell">Méthode</th>
                <th className="text-right font-medium px-5 py-3">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentPayouts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 text-sm">{new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</td>
                  <td className="px-5 py-3 text-sm font-medium">{p.mission}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground hidden sm:table-cell">{p.client}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <Badge variant="default">{p.method}</Badge>
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-right text-accent-700 dark:text-accent-300 tabular-nums">
                    +{formatGNF(p.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
