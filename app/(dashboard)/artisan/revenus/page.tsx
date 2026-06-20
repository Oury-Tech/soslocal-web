'use client'

import { Wallet, TrendingUp, Calendar, Download, Banknote, ArrowUpRight, Wallet as WalletIcon } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { SectionCard } from '@/components/ui/section-card'
import { StatCard } from '@/components/ui/StatCard'
import { formatGNF } from '@/lib/utils/format'
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
      <PageHeader
        title="Revenus"
        description="Suivi détaillé de votre activité financière."
        icon={WalletIcon}
      >
        <Button variant="outline" size="md" onClick={handleExport} disabled={isExporting}>
          <Download className="h-4 w-4" />
          Exporter en PDF
        </Button>
      </PageHeader>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Revenus du mois"
          value={formatGNF(Math.abs(totalMonth))}
          icon={Wallet}
          tone="brand"
          sub="+15% vs mois dernier"
          loading={monthLoading}
        />
        <StatCard
          label="Commissions"
          value={formatGNF(Math.abs(totalCommissions))}
          icon={Banknote}
          tone="warning"
          sub={`${COMMISSION_RATE * 100}% (SOSLocal)`}
          loading={monthLoading}
          delay={0.05}
        />
        <StatCard
          label="Net à recevoir"
          value={formatGNF(Math.abs(totalNet))}
          icon={ArrowUpRight}
          tone="success"
          sub="Solde disponible"
          loading={monthLoading}
          delay={0.1}
        />
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Cette semaine */}
        <SectionCard
          title="Cette semaine"
          icon={Calendar}
          action={
            weekLoading ? (
              <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
            ) : (
              <Badge variant="accent">{formatGNF(totalWeek)}</Badge>
            )
          }
        >
          {weekLoading ? (
            <div className="h-60 bg-muted rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  cursor={{ fill: 'rgb(var(--muted))', opacity: 0.4 }}
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
        </SectionCard>

        {/* Évolution mensuelle */}
        <SectionCard
          title="Évolution mensuelle"
          icon={TrendingUp}
          delay={0.05}
          action={
            monthLoading ? (
              <div className="h-6 w-28 bg-muted rounded-full animate-pulse" />
            ) : (
              <Badge variant="success">
                <TrendingUp className="h-3 w-3" />
                +82% sur {monthData.length} mois
              </Badge>
            )
          }
        >
          {monthLoading ? (
            <div className="h-60 bg-muted rounded-xl animate-pulse" />
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
        </SectionCard>
      </div>

      {/* Historique versements */}
      <SectionCard
        title="Versements récents"
        description="Les paiements sont versés sur votre Mobile Money sous 24h"
        icon={Banknote}
        delay={0.1}
        flush
      >
        {payoutsLoading ? (
          <div className="space-y-3 p-4 sm:p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
              <Banknote className="h-7 w-7 text-brand-500" />
            </div>
            <p className="mt-4 font-semibold text-[rgb(var(--fg))]">Aucun versement</p>
            <p className="mt-1 text-sm text-[rgb(var(--muted-fg))]">
              Vos paiements apparaîtront ici après vos premières missions terminées.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-[rgb(var(--muted-fg))]">
                  <th className="text-left font-medium px-4 sm:px-5 py-3">Date</th>
                  <th className="text-left font-medium px-4 sm:px-5 py-3">Mission</th>
                  <th className="text-left font-medium px-4 sm:px-5 py-3 hidden sm:table-cell">Client</th>
                  <th className="text-left font-medium px-4 sm:px-5 py-3 hidden md:table-cell">Méthode</th>
                  <th className="text-right font-medium px-4 sm:px-5 py-3">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 sm:px-5 py-3 text-sm whitespace-nowrap">
                      {new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-sm font-medium">{p.mission}</td>
                    <td className="px-4 sm:px-5 py-3 text-sm text-[rgb(var(--muted-fg))] hidden sm:table-cell">{p.client}</td>
                    <td className="px-4 sm:px-5 py-3 hidden md:table-cell">
                      <Badge variant="default">{p.method}</Badge>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-sm font-bold text-right text-brand-600 dark:text-brand-300 tabular-nums whitespace-nowrap">
                      +{formatGNF(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
