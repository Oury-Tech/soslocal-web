'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Star, Filter } from 'lucide-react'
import { DynamicMap } from '@/components/maps/dynamic-map'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, Spinner } from '@/components/ui/badge'
import { useNearbyTechnicians } from '@/hooks/queries/useTechnicians'
import { useServices } from '@/hooks/queries/useServices'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { useAuthStore } from '@/stores/auth.store'
import { CONAKRY_CENTER } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'
import { formatGNF, getInitials } from '@/lib/utils/format'
import type { Technician } from '@/types'

export default function CartePage() {
  const { user } = useAuthStore()

  const userPos = user?.latitude && user?.longitude
    ? { lat: user.latitude, lng: user.longitude }
    : CONAKRY_CENTER

  const [selected, setSelected]   = useState<Technician | null>(null)
  const [filterService, setFilter] = useState<number | undefined>()

  const { data: services = [] } = useServices()
  const { data: technicians = [], isLoading } = useNearbyTechnicians(userPos.lat, userPos.lng, filterService)

  const available = technicians.filter((t) => t.is_available)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-3xl font-extrabold">Carte</h1>
          <p className="text-muted-foreground mt-1">
            Artisans disponibles près de vous — Conakry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {available.length} disponibles
          </div>
          <Link href="/beneficiaire/nouvelle">
            <Button variant="accent" size="sm">
              <Plus className="h-4 w-4" />
              Nouvelle demande
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Filtres services */}
      <Card className="p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0 mr-1" />
          <button
            onClick={() => setFilter(undefined)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors font-medium',
              !filterService ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            Tous
          </button>
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors font-medium flex items-center gap-1',
                filterService === s.id ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <ServiceIcon slug={s.slug} name={s.name} className="h-3.5 w-3.5" />
              {s.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Layout: carte + liste */}
      <div className="grid lg:grid-cols-3 gap-4 lg:h-[calc(100vh-18rem)]">
        {/* Carte Leaflet */}
        <div className="lg:col-span-2 relative h-[55vh] lg:h-auto">
          <Card className="overflow-hidden h-full w-full">
            <DynamicMap
              userPosition={userPos}
              technicians={technicians}
              onTechnicianClick={setSelected}
            />
            {/* Légende */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-xl border border-border shadow-soft p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-3 w-3 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-muted-foreground">Disponible</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-3 w-3 rounded-full bg-gray-400 flex-shrink-0" />
                <span className="text-muted-foreground">Occupé</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-3 w-3 rounded-full bg-brand-600 flex-shrink-0" />
                <span className="text-muted-foreground">Votre position</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Liste artisans */}
        <Card className="flex flex-col overflow-hidden max-h-[70vh] lg:max-h-none">
          <div className="p-4 border-b border-border flex-shrink-0">
            <h3 className="font-semibold">Artisans proches</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? 'Chargement…' : `${technicians.length} trouvés`}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-7 w-7" />
              </div>
            ) : technicians.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucun artisan trouvé pour ce filtre.
              </div>
            ) : (
              technicians.map((tech) => (
                <motion.div
                  key={tech.id}
                  onClick={() => setSelected(tech)}
                  className={cn(
                    'p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                    selected?.id === tech.id && 'bg-accent-50 dark:bg-accent-900/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar fallback={getInitials(tech.name)} size="md" />
                      <span className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card',
                        tech.is_available ? 'bg-green-500' : 'bg-gray-400'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{tech.name}</div>
                      <div className="text-xs text-muted-foreground">{tech.profession}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="flex items-center gap-0.5 text-amber-600">
                          <Star className="h-3 w-3 fill-current" />
                          {tech.rating.toFixed(1)}
                        </span>
                        {tech.hourly_rate && (
                          <span className="text-accent-700 dark:text-accent-300 font-semibold">
                            {formatGNF(tech.hourly_rate)}/h
                          </span>
                        )}
                      </div>
                    </div>
                    {tech.is_available && (
                      <Link href={`/beneficiaire/nouvelle?technician=${tech.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button variant="accent" size="sm" className="text-xs">Demander</Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Panneau artisan sélectionné */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-border p-4 bg-accent-50/50 dark:bg-accent-900/10 flex-shrink-0"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <Avatar fallback={getInitials(selected.name)} size="sm" />
                  <span className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card',
                    selected.is_available ? 'bg-green-500' : 'bg-gray-400',
                  )} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{selected.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selected.profession} · {selected.is_available ? 'Disponible' : 'Occupé'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Soumettez une demande pour contacter cet artisan.
              </p>
              <Link href={`/beneficiaire/nouvelle?technician=${selected.id}`} className="block">
                <Button variant="accent" size="sm" className="w-full">
                  <Plus className="h-4 w-4" />
                  Faire une demande
                </Button>
              </Link>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  )
}
