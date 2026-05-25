'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Users, Star, Zap, Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useServices } from '@/hooks/queries/useServices'
import { useNearbyTechnicians } from '@/hooks/queries/useTechnicians'
import { useAuthStore } from '@/stores/auth.store'
import { CONAKRY_CENTER } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'
import { getInitials } from '@/lib/utils/format'

export default function BeneficiaireHome() {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] ?? 'vous'

  const userPos =
    user?.latitude && user?.longitude
      ? { lat: user.latitude, lng: user.longitude }
      : CONAKRY_CENTER

  const { data: services, isLoading: servicesLoading } = useServices()
  const { data: technicians = [], isLoading: techLoading } = useNearbyTechnicians(
    userPos.lat,
    userPos.lng
  )

  const available = technicians.filter((t) => t.is_available)

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-1">
              Bonjour, {firstName} 👋
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Quel artisan cherchez-vous ?
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {techLoading
                ? 'Recherche des artisans proches…'
                : `${available.length} artisan${available.length > 1 ? 's' : ''} disponible${available.length > 1 ? 's' : ''} autour de vous à Conakry.`}
            </p>
          </div>
          <Link href="/beneficiaire/artisans">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-brand-500 text-brand-500 font-semibold text-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors whitespace-nowrap">
              <Users className="h-4 w-4" />
              Tous les artisans
            </button>
          </Link>
        </div>
      </motion.div>

      {/* ── Services grid (entry points) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Choisissez un service</h2>
          <span className="text-xs text-muted-foreground">
            Sélectionnez pour voir les artisans disponibles
          </span>
        </div>

        {servicesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {services?.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/beneficiaire/artisans?service=${s.id}`}>
                  <div className={cn(
                    'group relative p-4 rounded-2xl border-2 border-border bg-card',
                    'hover:border-brand-400 hover:shadow-soft transition-all cursor-pointer',
                    'active:scale-[0.98]'
                  )}>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="font-semibold text-sm leading-tight">{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.category}</div>

                    {s.is_emergency && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-red-500">
                        <Zap className="h-2.5 w-2.5" /> Urgence 24h
                      </span>
                    )}

                    <ArrowRight className="absolute top-4 right-4 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Artisans disponibles maintenant ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Disponibles maintenant</h2>
          <Link href="/beneficiaire/artisans" className="text-sm font-medium text-brand-500 hover:underline">
            Voir tous →
          </Link>
        </div>

        {techLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : available.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">Aucun artisan disponible en ce moment</p>
            <p className="text-sm text-muted-foreground mt-1">Réessayez dans quelques instants.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {available.slice(0, 6).map((tech, i) => (
              <motion.div
                key={tech.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/beneficiaire/artisans?highlight=${tech.id}`}>
                  <Card className="p-4 hover:shadow-soft hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {tech.avatar_url ? (
                          <img
                            src={tech.avatar_url}
                            className="w-12 h-12 rounded-full object-cover"
                            alt={tech.name}
                          />
                        ) : (
                          <Avatar fallback={getInitials(tech.name)} size="md" />
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-semibold text-sm truncate">{tech.name}</span>
                          {tech.is_verified && (
                            <Shield className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{tech.profession}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-semibold">{tech.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({tech.total_reviews})</span>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
