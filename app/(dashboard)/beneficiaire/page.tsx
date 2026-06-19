'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search, Star, X, Users, MessageCircle, ShieldCheck, Phone, MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Spinner, Avatar } from '@/components/ui/badge'
import { useNearbyTechnicians } from '@/hooks/queries/useTechnicians'
import { useServices } from '@/hooks/queries/useServices'
import { useCreateChatRoom } from '@/hooks/queries/useChat'
import { useAuthStore } from '@/stores/auth.store'
import { CONAKRY_CENTER } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { resolveTechnicianAvatar } from '@/lib/utils/technician-photos'
import { ServiceIcon } from '@/lib/utils/service-icons'
import type { Technician } from '@/types'

/* ── Conakry neighborhood lookup ──────────────────────────────────────── */
function getConakryZone(lat?: number, lng?: number): string | null {
  if (!lat || !lng) return null
  if (lat < 9.54 && lng > -13.70) return 'Kaloum'
  if (lat >= 9.54 && lat < 9.58 && lng > -13.72) return 'Matam'
  if (lat >= 9.54 && lat < 9.61 && lng > -13.68 && lng < -13.60) return 'Dixinn'
  if (lat >= 9.57 && lat < 9.64 && lng > -13.70 && lng < -13.64) return 'Matoto'
  if (lat >= 9.60 && lat < 9.67 && lng > -13.67 && lng < -13.57) return 'Ratoma'
  if (lat >= 9.62 && lng > -13.65 && lng < -13.54) return 'Kipé'
  return 'Conakry'
}

/* ── Distance label + color ───────────────────────────────────────────── */
function getDistanceInfo(km?: number | null) {
  if (km == null) return null
  if (km < 0.5)  return { label: 'Juste à côté',  km: `${Math.round(km * 1000)} m`, color: 'text-green-500',   dot: 'bg-green-500',   pulse: true }
  if (km < 2)    return { label: 'Tout près',      km: `${km.toFixed(1)} km`,        color: 'text-emerald-500', dot: 'bg-emerald-500', pulse: true }
  if (km < 5)    return { label: 'À proximité',    km: `${km.toFixed(1)} km`,        color: 'text-blue-500',    dot: 'bg-blue-400',    pulse: false }
  if (km < 10)   return { label: 'Dans votre zone',km: `${km.toFixed(1)} km`,        color: 'text-indigo-500',  dot: 'bg-indigo-400',  pulse: false }
  if (km < 20)   return { label: 'Proche',         km: `${km.toFixed(0)} km`,        color: 'text-purple-500',  dot: 'bg-purple-400',  pulse: false }
  return           { label: 'Plus loin',            km: `${km.toFixed(0)} km`,        color: 'text-muted-foreground', dot: 'bg-muted-foreground', pulse: false }
}

/* ── Artisan Card ─────────────────────────────────────────────────────── */
function TechCard({ tech, userLat, userLng }: {
  tech: Technician & { distance_km?: number | null }
  userLat?: number
  userLng?: number
}) {
  const router         = useRouter()
  const createRoom     = useCreateChatRoom()
  const distKm         = (tech as any).distance_km
  const dist           = getDistanceInfo(distKm)
  const zone           = getConakryZone((tech as any).latitude, (tech as any).longitude)
  const firstName      = tech.name.split(' ')[0]
  const servicesList: any[] = (tech as any).services ?? []

  const whatsappNumber = tech.phone?.replace(/\D/g, '')

  function handleCall()    { if (tech.phone) window.location.href = `tel:${tech.phone}` }
  function handleWhatsApp() {
    if (whatsappNumber) window.open(`https://wa.me/${whatsappNumber}`, '_blank')
  }
  async function handleMessage() {
    try {
      const room = await createRoom.mutateAsync({ artisanId: tech.id })
      router.push(`/chat/${room.id}`)
    } catch {
      router.push(`/chat/tech-${tech.id}`)
    }
  }

  return (
    <Card className={cn(
      'overflow-hidden transition-all hover:shadow-lg',
      tech.is_available
        ? 'hover:border-brand-400 dark:hover:border-brand-600'
        : 'opacity-70'
    )}>
      {/* Top bar: distance + availability */}
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        {/* Distance pill */}
        {dist ? (
          <div className={cn('flex items-center gap-1.5 text-[11px] font-bold', dist.color)}>
            {dist.pulse && (
              <span className="relative flex h-2 w-2">
                <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', dist.dot)} />
                <span className={cn('relative inline-flex rounded-full h-2 w-2', dist.dot)} />
              </span>
            )}
            {!dist.pulse && <span className={cn('inline-flex rounded-full h-2 w-2', dist.dot)} />}
            {dist.km} · {dist.label}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {zone ?? 'Conakry'}
          </div>
        )}

        {/* Availability */}
        {tech.is_available ? (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            Disponible
          </span>
        ) : (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            Indisponible
          </span>
        )}
      </div>

      <div className="p-4 pt-3 flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar
            src={resolveTechnicianAvatar(tech)}
            alt={tech.name}
            fallback={getInitials(tech.name)}
            className="h-14 w-14 text-lg rounded-xl"
          />
          <span className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-card',
            tech.is_available ? 'bg-green-500' : 'bg-gray-400',
          )} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name + verified + zone */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold text-sm truncate">{tech.name}</span>
            {tech.is_verified && (
              <ShieldCheck className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
            )}
          </div>

          {/* Profession + zone */}
          <div className="flex items-center gap-2 mb-2">
            {tech.profession ? (
              <p className="text-xs text-muted-foreground truncate">{tech.profession}</p>
            ) : null}
            {zone && dist && (
              <>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" />
                  {zone}
                </div>
              </>
            )}
          </div>

          {/* Services badges */}
          {servicesList.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {servicesList.slice(0, 3).map((s: any) => (
                <span
                  key={s.id ?? s.name}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                >
                  <ServiceIcon slug={s.slug} name={s.name} className="h-2.5 w-2.5" />
                  {s.name}
                </span>
              ))}
            </div>
          )}

          {/* Rating + tarif */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-3">
            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="h-3 w-3 fill-current" />
              {tech.rating > 0 ? tech.rating.toFixed(1) : '—'}
            </span>
            {tech.total_reviews > 0 && (
              <span className="text-muted-foreground">{tech.total_reviews} avis</span>
            )}
            {tech.total_jobs_completed > 0 && (
              <span className="text-muted-foreground">{tech.total_jobs_completed} missions</span>
            )}
            {tech.hourly_rate ? (
              <span className="ml-auto font-semibold text-accent-600 dark:text-accent-300">
                {formatGNF(tech.hourly_rate)}/h
              </span>
            ) : null}
          </div>

          {/* Phone number visible */}
          {tech.phone && (
            <div className="flex items-center gap-1.5 mb-2.5 text-xs text-muted-foreground min-w-0">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <button
                onClick={handleCall}
                className="font-mono truncate hover:text-brand-500 hover:underline transition-colors"
              >
                {tech.phone}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/beneficiaire/nouvelle?technician=${tech.id}`} className="flex-1">
              <Button
                variant="accent"
                size="sm"
                className="w-full text-xs font-bold"
                disabled={!tech.is_available}
              >
                Demander {firstName}
              </Button>
            </Link>

            {/* WhatsApp */}
            {whatsappNumber && (
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 px-2.5 text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={handleWhatsApp}
                title={`WhatsApp ${tech.name}`}
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </Button>
            )}

            {/* Message direct */}
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 px-2.5"
              onClick={handleMessage}
              disabled={createRoom.isPending}
              title={`Envoyer un message à ${tech.name}`}
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ── Main page ────────────────────────────────────────────────────────── */
export default function BeneficiaireHome() {
  const { user } = useAuthStore()
  const firstName = user?.name?.split(' ')[0] ?? 'vous'

  const userPos =
    user?.latitude && user?.longitude
      ? { lat: user.latitude, lng: user.longitude }
      : CONAKRY_CENTER

  const [search,        setSearch]        = useState('')
  const [filterService, setFilterService] = useState<number | undefined>()

  const { data: services }                    = useServices()
  const { data: technicians = [], isLoading } = useNearbyTechnicians(userPos.lat, userPos.lng, filterService)

  const filtered = useMemo(
    () =>
      technicians.filter(
        (t) =>
          !search ||
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.profession?.toLowerCase().includes(search.toLowerCase()) ||
          (t as any).services?.some((s: any) =>
            s.name.toLowerCase().includes(search.toLowerCase())
          )
      ),
    [technicians, search]
  )

  const availableCount = technicians.filter((t) => t.is_available).length
  const activeService  = services?.find((s) => s.id === filterService)

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-1">
          Bonjour, {firstName}
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight flex items-center gap-2">
          {activeService && (
            <span className="h-8 w-8 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <ServiceIcon slug={activeService.slug} name={activeService.name} className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </span>
          )}
          {activeService ? `Artisans — ${activeService.name}` : 'Artisans à proximité'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isLoading
            ? 'Recherche des artisans proches…'
            : `${technicians.length} artisan${technicians.length > 1 ? 's' : ''} · ${availableCount} disponible${availableCount > 1 ? 's' : ''} maintenant`}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher par nom, spécialité ou service…"
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

      {/* Service filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
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
            <ServiceIcon slug={s.slug} name={s.name} className="h-3.5 w-3.5" />
            {s.name}
          </button>
        ))}
      </div>

      {/* Count */}
      {!isLoading && search && filtered.length > 0 && (
        <p className="text-sm text-muted-foreground -mt-2">
          {filtered.length} artisan{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''} pour{' '}
          <strong>&laquo;&nbsp;{search}&nbsp;&raquo;</strong>
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
            {search
              ? `Aucun résultat pour « ${search} »`
              : filterService
              ? 'Aucun artisan enregistré pour ce service.'
              : 'Aucun artisan enregistré pour le moment.'}
          </p>
          {(search || filterService) && (
            <button
              onClick={() => { setSearch(''); setFilterService(undefined) }}
              className="mt-4 text-sm text-brand-500 hover:underline"
            >
              Effacer les filtres
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
                userLat={userPos.lat}
                userLng={userPos.lng}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
