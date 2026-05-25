'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Star, MapPin, X, Users, Phone, MessageCircle, Plus,
  ShieldCheck, Zap,
} from 'lucide-react'
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

function getDistanceInfo(km?: number): { label: string; color: string; bg: string } | null {
  if (km == null) return null
  if (km < 0.3) return { label: 'Juste là',        color: 'text-green-700 dark:text-green-400',   bg: 'bg-green-100 dark:bg-green-900/30' }
  if (km < 1)   return { label: 'À deux pas',       color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' }
  if (km < 3)   return { label: 'Tout près',        color: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30' }
  if (km < 7)   return { label: 'À proximité',      color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' }
  if (km < 15)  return { label: 'Près de vous',     color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' }
  if (km < 30)  return { label: 'Dans votre zone',  color: 'text-amber-700 dark:text-amber-400',  bg: 'bg-amber-100 dark:bg-amber-900/30' }
  return          { label: 'Un peu plus loin',      color: 'text-muted-foreground',               bg: 'bg-muted' }
}

function TechCard({
  tech,
  selected,
  onSelect,
}: {
  tech: Technician & { distance_km?: number }
  selected: boolean
  onSelect: () => void
}) {
  const dist = getDistanceInfo((tech as any).distance_km)

  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-soft',
        selected
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-soft'
          : 'border-border bg-card hover:border-brand-300 dark:hover:border-brand-700'
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {tech.avatar_url ? (
            <img
              src={tech.avatar_url}
              className="w-14 h-14 rounded-full object-cover"
              alt={tech.name}
            />
          ) : (
            <Avatar fallback={getInitials(tech.name)} size="lg" />
          )}
          {tech.is_available && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name + badges */}
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-sm truncate text-foreground">{tech.name}</span>
              {tech.is_verified && (
                <ShieldCheck className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
                tech.is_available
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {tech.is_available ? 'Disponible' : 'Occupé'}
            </span>
          </div>

          {/* Profession */}
          <p className="text-xs text-muted-foreground truncate mb-1.5">{tech.profession}</p>

          {/* Rating + reviews */}
          <div className="flex items-center gap-2 text-xs mb-1.5">
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
              <Star className="h-3 w-3 fill-current" />
              {tech.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              {tech.total_reviews} avis · {tech.total_jobs_completed} missions
            </span>
          </div>

          {/* Distance + rate */}
          <div className="flex items-center gap-2 flex-wrap">
            {dist && (
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', dist.bg, dist.color)}>
                <MapPin className="h-2.5 w-2.5" />
                {dist.label}
              </span>
            )}
            {tech.hourly_rate ? (
              <span className="text-xs font-semibold text-accent-600 dark:text-accent-300">
                {formatGNF(tech.hourly_rate)}/h
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ArtisansPage() {
  const { user } = useAuthStore()
  const userPos =
    user?.latitude && user?.longitude
      ? { lat: user.latitude, lng: user.longitude }
      : CONAKRY_CENTER

  const [search, setSearch] = useState('')
  const [filterService, setFilterService] = useState<number | undefined>()
  const [selected, setSelected] = useState<Technician | null>(null)

  const { data: services } = useServices()
  const { data: technicians = [], isLoading } = useNearbyTechnicians(userPos.lat, userPos.lng, filterService)

  const filtered = useMemo(
    () =>
      technicians.filter(
        (t) =>
          !search ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.profession?.toLowerCase().includes(search.toLowerCase())
      ),
    [technicians, search]
  )

  const availableCount = technicians.filter((t) => t.is_available).length

  return (
    <div className="space-y-6 animate-fade-in pb-32">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold">Artisans disponibles</h1>
        <p className="text-muted-foreground mt-1">
          {availableCount} artisan{availableCount > 1 ? 's' : ''} disponible{availableCount > 1 ? 's' : ''} autour de vous à Conakry.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un artisan ou une profession…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Service filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilterService(undefined)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
              !filterService
                ? 'bg-brand-500 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            Tous
          </button>
          {services?.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterService(filterService === s.id ? undefined : s.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0',
                filterService === s.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <span>{s.icon}</span>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} artisan{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          {search && <> pour « <strong>{search}</strong> »</>}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Aucun artisan trouvé</h3>
          <p className="text-sm text-muted-foreground">
            {search ? `Aucun résultat pour « ${search} »` : 'Essayez un autre filtre ou revenez plus tard.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-sm text-brand-500 hover:underline"
            >
              Effacer la recherche
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((tech, i) => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <TechCard
                tech={tech}
                selected={selected?.id === tech.id}
                onSelect={() =>
                  setSelected(selected?.id === tech.id ? null : tech)
                }
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Floating selection panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-50"
          >
            <Card className="p-4 shadow-2xl border-2 border-brand-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  {selected.avatar_url ? (
                    <img
                      src={selected.avatar_url}
                      className="w-10 h-10 rounded-full object-cover"
                      alt={selected.name}
                    />
                  ) : (
                    <Avatar fallback={getInitials(selected.name)} size="md" />
                  )}
                  {selected.is_available && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm truncate">{selected.name}</p>
                    {selected.is_verified && (
                      <ShieldCheck className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{selected.profession}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="font-semibold">{selected.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({selected.total_reviews} avis)</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/beneficiaire/nouvelle?technician=${selected.id}`}
                  className="flex-1"
                >
                  <Button variant="accent" size="md" className="w-full">
                    <Plus className="h-4 w-4" />
                    Demander cet artisan
                  </Button>
                </Link>
                <Button variant="outline" size="md" className="flex-shrink-0">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="md" className="flex-shrink-0">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
