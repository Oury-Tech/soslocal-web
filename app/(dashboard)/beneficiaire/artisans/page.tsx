'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Star, MapPin, X, Users, Phone, MessageCircle,
  ShieldCheck, ArrowLeft, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, Spinner } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/page-header'
import { useNearbyTechnicians } from '@/hooks/queries/useTechnicians'
import { useServices } from '@/hooks/queries/useServices'
import { ServiceIcon, ServiceTag } from '@/lib/utils/service-icons'
import { useAuthStore } from '@/stores/auth.store'
import { CONAKRY_CENTER } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { resolveTechnicianAvatar } from '@/lib/utils/technician-photos'
import type { Technician } from '@/types'

/* ── Distance (flat, factual — shown only when the position is real) ────── */
function getDistanceInfo(km?: number | null) {
  if (km == null) return null
  const dist =
    km < 1 ? `${Math.round(km * 1000)} m`
    : km < 10 ? `${km.toFixed(1)} km`
    : `${Math.round(km)} km`
  const label =
    km < 0.5 ? 'à côté'
    : km < 2 ? 'tout près'
    : km < 5 ? 'à proximité'
    : null
  return { dist, label }
}

/* ── Tech card ──────────────────────────────────────────────── */
function TechCard({
  tech,
  selected,
  onSelect,
  hasRealPosition,
}: {
  tech: Technician & { distance_km?: number }
  selected: boolean
  onSelect: () => void
  hasRealPosition: boolean
}) {
  const dist = getDistanceInfo((tech as any).distance_km)
  const showDistance = hasRealPosition && dist != null

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
        <div className="relative flex-shrink-0">
          <Avatar
            src={resolveTechnicianAvatar(tech)}
            alt={tech.name}
            fallback={getInitials(tech.name)}
            className="h-14 w-14 text-base"
          />
          {tech.is_available && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold text-sm truncate">{tech.name}</span>
              {tech.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />}
            </div>
            <span className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
              tech.is_available
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
            )}>
              {tech.is_available ? 'Disponible' : 'Occupé'}
            </span>
          </div>

          <p className="text-xs text-muted-foreground truncate mb-1.5">{tech.profession}</p>

          {/* Badges métier — teintés par service */}
          {(tech as any).services?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {((tech as any).services as any[]).slice(0, 2).map((s) => (
                <ServiceTag key={s.id ?? s.name} slug={s.slug} name={s.name} size="sm" />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs mb-1.5">
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
              <Star className="h-3 w-3 fill-current" />
              {tech.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              {tech.total_reviews} avis · {tech.total_jobs_completed} missions
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {showDistance && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <MapPin className="h-3 w-3 text-brand-500" />
                <span className="font-semibold text-foreground">{dist!.dist}</span>
                {dist!.label ? ` · ${dist!.label}` : ''}
              </span>
            )}
            {tech.hourly_rate ? (
              <span className="text-xs font-semibold text-accent-600 dark:text-accent-300">
                {formatGNF(tech.hourly_rate)}/h
              </span>
            ) : null}
          </div>

          {/* Consulter la fiche complète (description, missions, avis) AVANT contact */}
          <Link
            href={`/artisans/${tech.id}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
          >
            <Eye className="h-3.5 w-3.5" /> Voir le profil complet
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Inner page (uses useSearchParams) ─────────────────────── */
function ArtisansInner() {
  const searchParams    = useSearchParams()
  const initialService  = searchParams.get('service') ? Number(searchParams.get('service')) : undefined

  const { user } = useAuthStore()

  const [geoPos, setGeoPos] = useState<{ lat: number; lng: number } | null>(null)
  useEffect(() => {
    if (user?.latitude && user?.longitude) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (p) => setGeoPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    )
  }, [user?.latitude, user?.longitude])

  const realPos =
    user?.latitude && user?.longitude
      ? { lat: user.latitude, lng: user.longitude }
      : geoPos
  const hasRealPosition = !!realPos
  const userPos = realPos ?? CONAKRY_CENTER

  const [search,        setSearch]        = useState('')
  const [filterService, setFilterService] = useState<number | undefined>(initialService)
  const [selected,      setSelected]      = useState<Technician | null>(null)

  const { data: services }                                  = useServices()
  const { data: technicians = [], isLoading }               = useNearbyTechnicians(userPos.lat, userPos.lng, filterService)

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

  /* URL to use when requesting a technician */
  const demanderHref = (techId: number) => {
    const params = new URLSearchParams({ technician: String(techId) })
    // Service: priorité au filtre actif, sinon 1er service de l'artisan lui-même.
    const tech = technicians.find((t) => t.id === techId)
    const svc = filterService ?? tech?.services?.[0]?.id
    if (svc) params.set('service', String(svc))
    return `/beneficiaire/nouvelle?${params.toString()}`
  }

  /* Active service name for header */
  const activeService = services?.find((s) => s.id === filterService)

  return (
    <div className="space-y-6 animate-fade-in pb-32">

      {/* Header */}
      <PageHeader
        icon={Users}
        title={activeService ? `Artisans — ${activeService.name}` : 'Artisans disponibles'}
        description={`${availableCount} artisan${availableCount > 1 ? 's' : ''} disponible${availableCount > 1 ? 's' : ''} autour de vous. Choisissez-en un, puis décrivez votre besoin.`}
      >
        <Link href="/beneficiaire">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
      </PageHeader>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par nom ou spécialité…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilterService(undefined)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
              !filterService ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                filterService === s.id ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <ServiceIcon slug={s.slug} name={s.name} className="h-4 w-4" />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} artisan{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          {search && <> pour « <strong>{search}</strong> »</>}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex gap-3">
                <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded-xl bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 rounded-xl bg-muted animate-pulse" />
                  <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
            <Users className="h-7 w-7 text-brand-500" />
          </div>
          <h3 className="mb-1.5 font-semibold text-lg">Aucun artisan trouvé</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {search ? `Aucun résultat pour « ${search} »` : 'Essayez un autre filtre ou revenez plus tard.'}
          </p>
          {search && (
            <Button variant="outline" size="sm" onClick={() => setSearch('')} className="mt-5">
              Effacer la recherche
            </Button>
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
                onSelect={() => setSelected(selected?.id === tech.id ? null : tech)}
                hasRealPosition={hasRealPosition}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Floating selection panel ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-50"
          >
            <Card className="p-4 shadow-2xl border-2 border-brand-500">
              {/* Tech summary */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={resolveTechnicianAvatar(selected)}
                    alt={selected.name}
                    fallback={getInitials(selected.name)}
                    size="md"
                  />
                  {selected.is_available && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm truncate">{selected.name}</p>
                    {selected.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />}
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

              {/* CTAs */}
              <div className="flex gap-2">
                <Link href={demanderHref(selected.id)} className="flex-1">
                  <Button variant="accent" size="md" className="w-full font-bold">
                    Demander {selected.name.split(' ')[0]}
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

/* ── Page export with Suspense ───────────────────────────────── */
export default function ArtisansPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
    }>
      <ArtisansInner />
    </Suspense>
  )
}
