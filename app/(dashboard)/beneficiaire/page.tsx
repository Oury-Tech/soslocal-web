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
import { CONAKRY_CENTER } from '@/lib/mock-data'
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
      {/* Hero header */}
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

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-sm text-brand-100 mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Bonjour, {user?.name?.split(' ')[0]}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
              Besoin d'un dépannage ? <br className="hidden sm:block" />
              <span className="text-accent-300">Nous trouvons l'artisan idéal.</span>
            </h1>
            <p className="mt-2 text-brand-100 text-sm max-w-md">
              {technicians.length} artisans certifiés disponibles autour de vous, à Conakry.
            </p>
          </div>
          <Link href="/beneficiaire/nouvelle">
            <Button size="lg" className="bg-white text-brand-800 hover:bg-brand-50 shadow-soft-lg group whitespace-nowrap">
              <Plus className="h-5 w-5" />
              Nouvelle demande
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Artisans proches', value: technicians.length, icon: Wrench, color: 'brand' },
          { label: 'En ligne', value: technicians.filter((t) => t.is_online).length, icon: TrendingUp, color: 'accent' },
          { label: 'Disponibles', value: technicians.filter((t) => t.is_available).length, icon: Star, color: 'amber' },
          { label: 'Délai moyen', value: '< 30s', icon: Clock, color: 'green' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between mb-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <div className={cn('h-2 w-2 rounded-full animate-pulse',
                  stat.color === 'brand' && 'bg-brand-500',
                  stat.color === 'accent' && 'bg-accent-500',
                  stat.color === 'amber' && 'bg-amber-500',
                  stat.color === 'green' && 'bg-green-500',
                )} />
              </div>
              <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
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
                <MapPin className="h-5 w-5 text-accent-600" />
                <span className="font-semibold">Artisans à proximité</span>
              </div>
              {/* Filtre services */}
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setFilterService(undefined)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors',
                    !filterService ? 'bg-brand-700 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                      filterService === s.id ? 'bg-brand-700 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    <span>{s.icon}</span>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[500px]">
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
                <h3 className="font-semibold">Artisans disponibles</h3>
                <p className="text-xs text-muted-foreground">{technicians.filter((t) => t.is_available).length} en ligne maintenant</p>
              </div>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto -mr-2 pr-2">
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
                    selectedTech?.id === tech.id ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20' : 'border-border'
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
                        <h4 className="font-semibold text-sm truncate">{tech.name}</h4>
                        {tech.is_verified && (
                          <Badge variant="primary" className="text-[10px] px-1.5 py-0">✓</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{tech.profession}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="flex items-center gap-0.5 text-amber-600">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-semibold tabular-nums">{tech.rating.toFixed(1)}</span>
                        </span>
                        <span className="text-muted-foreground">({tech.total_reviews} avis)</span>
                      </div>
                      {tech.hourly_rate && (
                        <div className="mt-1 text-xs text-accent-700 dark:text-accent-300 font-semibold">
                          {formatGNF(tech.hourly_rate)}/heure
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {!isLoading && technicians.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Aucun artisan trouvé pour ce filtre.
                </div>
              )}
            </div>

            {selectedTech && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
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
