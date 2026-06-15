'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, ShieldCheck, Users } from 'lucide-react'
import { PublicShell } from '@/components/marketplace/PublicShell'
import { PublicTechnicianCard } from '@/components/marketplace/PublicTechnicianCard'
import { useNearbyTechnicians } from '@/hooks/queries/useTechnicians'
import { useServices } from '@/hooks/queries/useServices'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { CONAKRY_CENTER } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'

function ArtisansInner() {
  const searchParams = useSearchParams()
  const initialService = searchParams.get('service') ? Number(searchParams.get('service')) : undefined

  const [search, setSearch] = useState('')
  const [filterService, setFilterService] = useState<number | undefined>(initialService)

  const { data: services = [] } = useServices()
  const { data: technicians = [], isLoading } = useNearbyTechnicians(
    CONAKRY_CENTER.lat,
    CONAKRY_CENTER.lng,
    filterService,
  )

  const term = search.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      technicians.filter(
        (t) =>
          !term ||
          t.name.toLowerCase().includes(term) ||
          t.profession?.toLowerCase().includes(term),
      ),
    [technicians, term],
  )

  const availableCount = technicians.filter((t) => t.is_available).length

  return (
    <div className="container-app py-10 lg:py-14 space-y-8">
      <header className="space-y-4 max-w-3xl">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--fg))]">
          Nos artisans <span className="text-brand-500">certifiés.</span>
        </h1>
        <p className="text-[rgb(var(--muted-fg))]">
          Parcourez les profils, comparez notes et tarifs. Pour entrer en contact, il suffit de
          vous connecter.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-[rgb(var(--muted-fg))]">
            <Users className="h-4 w-4 text-brand-500" />
            <strong className="text-[rgb(var(--fg))]">{technicians.length}</strong> artisans
          </span>
          <span className="inline-flex items-center gap-1.5 text-[rgb(var(--muted-fg))]">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <strong className="text-[rgb(var(--fg))]">{availableCount}</strong> disponibles
          </span>
          <span className="inline-flex items-center gap-1.5 text-[rgb(var(--muted-fg))]">
            <ShieldCheck className="h-4 w-4 text-brand-500" /> Tous vérifiés
          </span>
        </div>
      </header>

      {/* Recherche */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--muted-fg))]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou spécialité…"
          aria-label="Rechercher un artisan"
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Effacer"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-lg text-[rgb(var(--muted-fg))] hover:bg-[rgb(var(--muted))]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filtre services */}
      {services.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilterService(undefined)}
            className={cn(
              'whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
              filterService === undefined
                ? 'bg-brand-500 text-white'
                : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))]',
            )}
          >
            Tous
          </button>
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterService((prev) => (prev === s.id ? undefined : s.id))}
              className={cn(
                'whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                filterService === s.id
                  ? 'bg-brand-500 text-white'
                  : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))]',
              )}
            >
              <ServiceIcon slug={s.slug} name={s.name} className="h-4 w-4" />
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Grille artisans */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-dashed border-[rgb(var(--border))]">
          <Users className="h-8 w-8 text-[rgb(var(--muted-fg))] mb-3" />
          <p className="font-semibold text-[rgb(var(--fg))]">Aucun artisan trouvé</p>
          <p className="text-sm text-[rgb(var(--muted-fg))] mt-1">Essayez un autre mot-clé ou changez de service.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => (
            <PublicTechnicianCard key={t.id} tech={t} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ArtisansDirectoryPage() {
  return (
    <PublicShell>
      <Suspense fallback={<div className="container-app py-14"><Skeleton className="h-40 rounded-2xl" /></div>}>
        <ArtisansInner />
      </Suspense>
    </PublicShell>
  )
}
