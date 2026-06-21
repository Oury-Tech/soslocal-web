'use client'

import Link from 'next/link'
import { ShieldCheck, Star, Navigation, Briefcase } from 'lucide-react'
import { DynamicMap } from '@/components/maps/dynamic-map'
import { useAllTechnicians } from '@/hooks/queries/useTechnicians'
import { useIsUserOnline } from '@/stores/ws.store'
import { Avatar } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils/format'
import { resolveTechnicianAvatar } from '@/lib/utils/technician-photos'
import { CONAKRY_CENTER } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'

/**
 * Vitrine « carte temps réel » du héros — inspirée des landings SaaS produit
 * (cadre fenêtre + aperçu produit), mais avec une VRAIE carte Leaflet
 * (OpenStreetMap) centrée sur Conakry et les artisans réels géolocalisés.
 * L'artisan mis en avant en surimpression est réel (useAllTechnicians, trié
 * vérifié → note → avis). Aucun nom inventé : sans artisan, libellé neutre.
 */
export function MapShowcase() {
  const { data: technicians = [] } = useAllTechnicians()

  // Artisans réellement géolocalisés → marqueurs sur la carte.
  const located = technicians.filter((t) => t.latitude && t.longitude)

  const featured = [...technicians].sort(
    (a, b) =>
      (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0) ||
      (b.rating ?? 0) - (a.rating ?? 0) ||
      (b.total_reviews ?? 0) - (a.total_reviews ?? 0),
  )[0]

  const liveOnline = useIsUserOnline(featured?.id ?? -1)
  const online = featured ? (liveOnline ?? featured.is_online) : false

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Cadre « fenêtre d'application » */}
      <div className="relative rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-soft-lg overflow-hidden">
        {/* Barre de fenêtre */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]">
          <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--border))]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--border))]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--border))]" />
          <span className="ml-2 text-xs font-semibold text-[rgb(var(--muted-fg))]">
            SOSLocal · Conakry
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-600 dark:text-brand-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            En direct
          </span>
        </div>

        {/* Vraie carte (Leaflet / OpenStreetMap) */}
        <div className="relative h-[340px] sm:h-[380px] bg-[rgb(var(--muted))]">
          <DynamicMap
            center={[CONAKRY_CENTER.lat, CONAKRY_CENTER.lng]}
            zoom={13}
            technicians={located}
            scrollWheelZoom={false}
            hideZoomControl
            className="absolute inset-0 h-full w-full"
          />

          {/* Carte d'info flottante — artisan RÉEL (au-dessus de la carte) */}
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-[18rem] z-[1000]">
            {featured ? (
              <Link
                href={`/artisans/${featured.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]/95 backdrop-blur p-3 shadow-soft-lg transition-all hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700"
              >
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={resolveTechnicianAvatar(featured)}
                    alt={featured.name}
                    fallback={getInitials(featured.name)}
                    className="h-11 w-11 text-sm"
                  />
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-[rgb(var(--card))]',
                      online ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600',
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-[rgb(var(--fg))] truncate">
                      {featured.name}
                    </span>
                    {featured.is_verified && (
                      <ShieldCheck className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[rgb(var(--muted-fg))] truncate flex items-center gap-1">
                    <Briefcase className="h-2.5 w-2.5" />
                    {featured.profession || 'Artisan'}
                  </p>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    {featured.rating > 0 ? featured.rating.toFixed(1) : '—'}
                    <span className="text-[rgb(var(--muted-fg))] font-medium ml-0.5">
                      · {featured.total_reviews} avis
                    </span>
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]/95 backdrop-blur p-3 shadow-soft-lg">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-[rgb(var(--fg))]">Artisans vérifiés</p>
                  <p className="text-[11px] text-[rgb(var(--muted-fg))]">
                    En ligne près de vous à Conakry
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini-cartouche flottante — temps réel (style « widget » du shot) */}
      <div className="hidden sm:flex absolute -top-4 -right-4 z-[1000] items-center gap-2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3.5 py-2.5 shadow-soft-lg">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white">
          <Navigation className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-xs font-bold text-[rgb(var(--fg))]">Suivi en direct</p>
          <p className="text-[10px] text-[rgb(var(--muted-fg))]">Arrivée minute par minute</p>
        </div>
      </div>
    </div>
  )
}
