'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, MapPin, Star, Wrench, Phone, MessageCircle, Filter, Sparkles, Clock, TrendingUp } from 'lucide-react'
import { DynamicMap } from '@/components/maps/dynamic-map'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useNearbyTechnicians } from '@/hooks/queries/useTechnicians'
import { useServices } from '@/hooks/queries/useServices'
import { useAuthStore } from '@/stores/auth.store'
import { CONAKRY_CENTER } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'
import { formatGNF, getInitials } from '@/lib/utils/format'
import type { Technician } from '@/types'

export default function BeneficiaireHome() {
  const { user } = useAuthStore()
  const userPos = user?.latitude && user?.longitude
    ? { lat: user.latitude, lng: user.longitude }
    : CONAKRY_CENTER

  const [selectedTech, setSelectedTech] = useState<Technician | null>(null)
  const [filterService, setFilterService] = useState<number | undefined>()

  const { data: services } = useServices()
  const { data: technicians = [], isLoading } = useNearbyTechnicians(userPos.lat, userPos.lng, filterService)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête épuré */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Bonjour, {user?.name?.split(' ')[0]}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--fg))]">
            Besoin d'un dépannage ?{' '}
            <span className="gradient-text">Nous trouvons l'artisan idéal.</span>
          </h1>
          <p className="mt-2 text-[rgb(var(--muted-fg))] text-sm">
            {technicians.length} artisans certifiés disponibles autour de vous, à Conakry.
          </p>
        </div>
        <Link href="/beneficiaire/nouvelle" className="flex-shrink-0">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors shadow-sm cursor-pointer whitespace-nowrap">
            <Plus className="h-4 w-4" />
            Nouvelle demande
          </span>
        </Link>
      </motion.div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Artisans proches', value: technicians.length,                              icon: Wrench,    dot: 'bg-brand-500' },
          { label: 'En ligne',         value: technicians.filter((t) => t.is_online).length,  icon: TrendingUp, dot: 'bg-green-500' },
          { label: 'Disponibles',      value: technicians.filter((t) => t.is_available).length, icon: Star,    dot: 'bg-amber-500' },
          { label: 'Délai moyen',      value: '< 30s',                                         icon: Clock,   dot: 'bg-blue-500'  },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between mb-2">
                <stat.icon className="h-5 w-5 text-[rgb(var(--muted-fg))]" />
                <span className={cn('h-2 w-2 rounded-full animate-pulse', stat.dot)} />
              </div>
              <div className="text-2xl font-bold tabular-nums text-[rgb(var(--fg))]">{stat.value}</div>
              <div className="text-xs text-[rgb(var(--muted-fg))]">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* MAP */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-500" />
                <span className="font-semibold text-[rgb(var(--fg))]">Artisans à proximité</span>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setFilterService(undefined)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors',
                    !filterService ? 'bg-brand-500 text-white' : 'bg-muted text-[rgb(var(--muted-fg))] hover:bg-muted/80'
                  )}
                >
                  Tous
                </button>
                {services?.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFilterService(s.id)}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors flex items-center gap-1',
                      filterService === s.id ? 'bg-brand-500 text-white' : 'bg-muted text-[rgb(var(--muted-fg))] hover:bg-muted/80'
                    )}
                  >
                    <span>{s.icon}</span>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[480px]">
              <DynamicMap
                userPosition={userPos}
                technicians={technicians}
                onTechnicianClick={setSelectedTech}
              />
            </div>
          </Card>
        </div>

        {/* SIDE PANEL */}
        <div>
          <Card className="p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[rgb(var(--fg))]">Artisans disponibles</h3>
                <p className="text-xs text-[rgb(var(--muted-fg))]">{technicians.filter((t) => t.is_available).length} en ligne maintenant</p>
              </div>
              <Filter className="h-4 w-4 text-[rgb(var(--muted-fg))]" />
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto -mr-2 pr-2">
              {isLoading && <div className="flex justify-center py-8"><Spinner /></div>}

              {technicians.map((tech, i) => (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedTech(tech)}
                  className={cn(
                    'p-3 rounded-xl border cursor-pointer transition-all hover:shadow-soft hover:-translate-y-0.5',
                    selectedTech?.id === tech.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-border'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar fallback={getInitials(tech.name)} size="md" />
                      {tech.is_online && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <h4 className="font-semibold text-sm truncate text-[rgb(var(--fg))]">{tech.name}</h4>
                        {tech.is_verified && (
                          <Badge variant="primary" className="text-[10px] px-1.5 py-0">✓</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[rgb(var(--muted-fg))] truncate">{tech.profession}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-semibold tabular-nums">{tech.rating.toFixed(1)}</span>
                        </span>
                        <span className="text-[rgb(var(--muted-fg))]">({tech.total_reviews} avis)</span>
                      </div>
                      {tech.hourly_rate && (
                        <div className="mt-1 text-xs text-brand-600 dark:text-brand-300 font-semibold">
                          {formatGNF(tech.hourly_rate)}/heure
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {!isLoading && technicians.length === 0 && (
                <div className="text-center py-8 text-sm text-[rgb(var(--muted-fg))]">
                  Aucun artisan trouvé pour ce filtre.
                </div>
              )}
            </div>

            {selectedTech && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4 border-t border-border space-y-2"
              >
                <Link href={`/beneficiaire/nouvelle?technician=${selectedTech.id}`} className="block">
                  <Button variant="accent" size="md" className="w-full">
                    <Plus className="h-4 w-4" />
                    Demander cet artisan
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                    Appeler
                  </Button>
                </div>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
