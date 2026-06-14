'use client'

import { motion } from 'framer-motion'
import { Wallet, TrendingUp, Calendar, Download, Banknote, ArrowUpRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Spinner } from '@/components/ui/badge'
import { formatGNF } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { exportReportAsPdf } from '@/lib/utils/pdf'
import { useArtisanWeekEarnings, useArtisanMonthEarnings, useArtisanPayouts } from '@/hooks/queries/useArtisan'
import { COMMISSION_RATE } from '@/lib/constants'

export default function RevenusPage() {
  const { data: weekData = [], isLoading: weekLoading } = useArtisanWeekEarnings()
  const { data: monthData = [], isLoading: monthLoading } = useArtisanMonthEarnings()
  const { data: payouts = [], isLoading: payoutsLoading } = useArtisanPayouts()

  const totalMonth = monthData[monthData.length - 1]?.revenus ?? 0
  const totalWeek  = weekData.reduce((s, d) => s + d.revenus, 0)
  const totalCommissions = totalMonth * COMMISSION_RATE
  const totalNet = totalMonth - totalCommissions

  const isExporting = weekLoading || monthLoading || payoutsLoading

  function handleExport() {
    const now = new Date()
    const dateStr = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    const stamp = now.toISOString().slice(0, 10)

    exportReportAsPdf({
      title: 'Relevé de revenus',
      subtitle: `Généré le ${dateStr}`,
      filename: `soslocal-revenus-${stamp}`,
      stats: [
        { label: 'Revenus du mois (net)', value: formatGNF(totalNet) },
        { label: `Commission SOSLocal (${COMMISSION_RATE * 100}%)`, value: formatGNF(totalCommissions) },
        { label: 'Revenus de la semaine', value: formatGNF(totalWeek) },
      ],
      tables: [
        {
          heading: 'Versements récents',
          table: {
            columns: ['Date', 'Mission', 'Client', 'Méthode', 'Statut', 'Montant'],
            alignRight: [5],
            rows: payouts.map((p) => [
              new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
              p.mission,
              p.client,
              p.method,
              p.status === 'paid' ? 'Versé' : 'En attente',
              `+${formatGNF(p.amount)}`,
            ]),
          },
        },
      ],
      footer:
        "SOSLocal — Relevé indicatif. Les montants affichés sont nets, commission de la plateforme déjà déduite. " +
        'Les versements sont effectués sur votre Mobile Money sous 24h.',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Revenus</h1>
          <p className="text-muted-foreground mt-1">Suivi détaillé de votre activité financière.</p>
        </div>
        <Button variant="outline" size="md" onClick={handleExport} disabled={isExporting}>
          <Download className="h-4 w-4" />
          Exporter en PDF
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {monthLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="h-10 w-10 rounded-xl bg-muted animate-pulse mb-3" />
              <div className="h-7 w-32 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            </Card>
          ))
        ) : (
          [
            { label: 'Revenus du mois', value: totalMonth,       sub: '+15% vs mois dernier',       icon: Wallet,       iconBg: 'bg-brand-50 dark:bg-brand-900/20',  iconColor: 'text-brand-500'  },
            { label: 'Commissions',     value: totalCommissions, sub: `${COMMISSION_RATE * 100}% (SOSLocal)`, icon: Banknote,     iconBg: 'bg-amber-50 dark:bg-amber-900/20',  iconColor: 'text-amber-600 dark:text-amber-400' },
            { label: 'Net à recevoir',  value: totalNet,         sub: 'Solde disponible',            icon: ArrowUpRight, iconBg: 'bg-green-50 dark:bg-green-900/20',  iconColor: 'text-green-600 dark:text-green-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-5">
                <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3', stat.iconBg)}>
                  <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
                </div>
                <div className="text-2xl font-bold tabular-nums">{formatGNF(Math.abs(stat.value))}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                <div className="text-xs mt-1 text-green-600 dark:text-green-400 font-medium">{stat.sub}</div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cette semaine */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Cette semaine</h2>
            {weekLoading ? (
              <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
            ) : (
              <Badge variant="accent">
                <Calendar className="h-3 w-3" />
                {formatGNF(totalWeek)}
              </Badge>
            )}
          </div>
          {weekLoading ? (
            <div className="h-60 bg-muted/40 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                  formatter={(v: number) => formatGNF(v)}
                />
                <Bar dataKey="revenus" fill="#0078FF" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Évolution mensuelle */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Évolution mensuelle</h2>
            {monthLoading ? (
              <div className="h-6 w-28 bg-muted rounded-full animate-pulse" />
            ) : (
              <Badge variant="success">
                <TrendingUp className="h-3 w-3" />
                +82% sur {monthData.length} mois
              </Badge>
            )}
          </div>
          {monthLoading ? (
            <div className="h-60 bg-muted/40 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthData}>
                <defs>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0078FF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#0078FF" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--card))',
                    border: '1px solid rgb(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                  formatter={(v: number) => formatGNF(v)}
                />
                <Area type="monotone" dataKey="revenus" stroke="#0078FF" strokeWidth={2} fill="url(#colorRevenus)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Historique versements */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold">Versements récents</h2>
            <p className="text-xs text-muted-foreground">Les paiements sont versés sur votre Mobile Money sous 24h</p>
          </div>
        </div>

        {payoutsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
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
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3 text-sm">
                      {new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">{p.mission}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground hidden sm:table-cell">{p.client}</td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <Badge variant="default">{p.method}</Badge>
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-right text-brand-600 dark:text-brand-300 tabular-nums">
                      +{formatGNF(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
