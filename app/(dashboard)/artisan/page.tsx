'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Wrench, Wallet, Star, Clock, TrendingUp, Power,
  CheckCircle2, AlertCircle, ArrowRight, Award, MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge, Avatar } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

export default function ArtisanDashboard() {
  const { user } = useAuthStore()
  const [isAvailable, setIsAvailable] = useState(true)

  // Mock data
  const stats = {
    todayEarnings: 425000,
    weekEarnings: 2150000,
    monthEarnings: 8750000,
    rating: 4.9,
    totalReviews: 142,
    completionRate: 98.5,
    pendingMissions: 2,
    completedToday: 3,
  }

  const pendingMissions = [
    {
      id: 1, ref: 'SOS-2026-008', title: 'Court-circuit prise cuisine',
      client: { name: 'Aïssatou Bah', avatar: 'AB' },
      address: 'Quartier Dixinn, Cité des Nations',
      distance: 1.2, priority: 'high' as const,
      price: 120000, time: 'À l\'instant',
    },
    {
      id: 2, ref: 'SOS-2026-009', title: 'Installation prise extérieure',
      client: { name: 'Mohamed Diallo', avatar: 'MD' },
      address: 'Kaloum, Centre-ville',
      distance: 3.5, priority: 'normal' as const,
      price: 85000, time: 'Il y a 5 min',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero header avec toggle disponibilité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-accent-700 p-6 sm:p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-400/30 rounded-full filter blur-3xl animate-blob" />

        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar fallback={getInitials(user?.name)} size="xl" className="ring-4 ring-white/20" />
                {isAvailable && (
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-400 ring-4 ring-brand-700" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-accent-300" />
                  <span className="text-xs text-brand-100">Artisan certifié Allô Maître</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold">{user?.name}</h1>
                <div className="flex items-center gap-3 text-sm text-brand-100 mt-1">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {stats.rating} ({stats.totalReviews} avis)
                  </span>
                  <span>·</span>
                  <span>{stats.completionRate}% complétion</span>
                </div>
              </div>
            </div>

            {/* Toggle disponibilité */}
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={cn(
                'flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all whitespace-nowrap',
                isAvailable
                  ? 'bg-green-500 text-white shadow-glow-lg hover:bg-green-600'
                  : 'bg-white/10 text-white border-2 border-white/30 hover:bg-white/20'
              )}
            >
              <div className={cn('relative h-6 w-11 rounded-full transition-colors', isAvailable ? 'bg-white/30' : 'bg-white/10')}>
                <div className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all',
                  isAvailable ? 'left-5' : 'left-0.5'
                )} />
              </div>
              <span>{isAvailable ? 'Disponible' : 'Hors ligne'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Revenue stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Aujourd\'hui',    value: stats.todayEarnings,  icon: Wallet,     color: 'from-green-500 to-emerald-600',   trend: '+12%' },
          { label: 'Cette semaine',   value: stats.weekEarnings,   icon: TrendingUp, color: 'from-blue-500 to-brand-600',     trend: '+8%' },
          { label: 'Ce mois',         value: stats.monthEarnings,  icon: Award,      color: 'from-amber-500 to-orange-600',   trend: '+15%' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5 relative overflow-hidden">
              <div className={cn('absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br opacity-10', stat.color)} />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white', stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {stat.trend}
                  </Badge>
                </div>
                <div className="text-2xl font-bold tabular-nums mt-3">{formatGNF(stat.value)}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Missions en attente */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Nouvelles missions</h2>
                <p className="text-xs text-muted-foreground">Acceptez avant que d'autres artisans ne le fassent</p>
              </div>
              <Badge variant="accent" className="animate-pulse">
                {pendingMissions.length} en attente
              </Badge>
            </div>

            {pendingMissions.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucune nouvelle mission pour le moment</p>
                <p className="text-xs text-muted-foreground mt-1">Restez disponible, vous serez notifié dès qu'une demande arrive</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMissions.map((mission) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl border-2 border-border hover:border-accent-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{mission.title}</h3>
                          {mission.priority === 'high' && (
                            <Badge variant="warning" className="text-[10px]">
                              <AlertCircle className="h-2.5 w-2.5" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
                        <div className="text-xs text-muted-foreground mt-1">{mission.address}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-accent-700 dark:text-accent-300">
                          {formatGNF(mission.price)}
                        </div>
                        <div className="text-xs text-muted-foreground">Estimé</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Avatar fallback={mission.client.avatar} size="sm" />
                        <span className="text-sm font-medium">{mission.client.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Refuser</Button>
                        <Button variant="accent" size="sm">
                          Accepter
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Performances */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent-600" />
              Aujourd'hui
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Missions complétées</span>
                <span className="font-bold tabular-nums">{stats.completedToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">En attente</span>
                <span className="font-bold tabular-nums">{stats.pendingMissions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Note moyenne</span>
                <span className="font-bold flex items-center gap-1 tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  4.95
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3">Conseils du jour</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-accent-600">✓</span>
                <span className="text-muted-foreground">Activez votre disponibilité pour recevoir des missions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-600">✓</span>
                <span className="text-muted-foreground">Mettez à jour votre position GPS régulièrement</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-600">✓</span>
                <span className="text-muted-foreground">Répondez vite : les clients aiment la réactivité</span>
              </div>
            </div>
          </Card>

          <Link href="/artisan/revenus">
            <Card className="p-5 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Voir mes revenus</h3>
                  <p className="text-xs text-muted-foreground">Détails et historique</p>
                </div>
                <ArrowRight className="h-5 w-5" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
