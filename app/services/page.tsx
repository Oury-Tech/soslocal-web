'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search as SearchIcon, Sparkles } from 'lucide-react'
import { PublicShell } from '@/components/marketplace/PublicShell'
import { SmartSearch } from '@/components/marketplace/SmartSearch'
import { ServiceCard } from '@/components/marketplace/ServiceCard'
import { useServices } from '@/hooks/queries/useServices'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'

function CatalogInner() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const { data: services = [], isLoading } = useServices()

  const [q, setQ] = useState(initialQ)
  const [category, setCategory] = useState<string | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(services.map((s) => s.category).filter(Boolean))) as string[],
    [services],
  )

  const term = q.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      services
        .filter((s) => s.is_active !== false)
        .filter((s) => (category ? s.category === category : true))
        .filter(
          (s) =>
            !term ||
            s.name.toLowerCase().includes(term) ||
            s.category?.toLowerCase().includes(term) ||
            s.description?.toLowerCase().includes(term),
        ),
    [services, category, term],
  )

  const popular = useMemo(
    () =>
      [...services]
        .filter((s) => s.is_active !== false)
        .sort(
          (a, b) =>
            (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) ||
            (b.popularity_score ?? 0) - (a.popularity_score ?? 0) ||
            (b.total_requests ?? 0) - (a.total_requests ?? 0),
        )
        .slice(0, 4),
    [services],
  )

  const showPopular = !term && !category && popular.length > 0

  return (
    <div className="container-app py-10 lg:py-14 space-y-10">
      {/* En-tête + recherche */}
      <header className="space-y-5 max-w-3xl">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--fg))]">
          Trouvez le bon service, <span className="text-brand-500">en quelques secondes.</span>
        </h1>
        <p className="text-[rgb(var(--muted-fg))]">
          Parcourez librement nos services et nos artisans certifiés. La mise en relation se fait
          après connexion.
        </p>
        <SmartSearch initialValue={initialQ} size="hero" />
      </header>

      {/* Filtres catégories */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setCategory(null)}
            className={cn(
              'whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
              category === null
                ? 'bg-brand-500 text-white'
                : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))]',
            )}
          >
            Tous
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory((prev) => (prev === c ? null : c))}
              className={cn(
                'whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize',
                category === c
                  ? 'bg-brand-500 text-white'
                  : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))]',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Populaires */}
      {showPopular && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-500" />
            <h2 className="text-lg font-bold text-[rgb(var(--fg))]">Les plus demandés</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>
      )}

      {/* Tous les services */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[rgb(var(--fg))]">
            {term || category ? 'Résultats' : 'Tous les services'}
          </h2>
          <span className="text-sm text-[rgb(var(--muted-fg))]">
            {filtered.length} service{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-dashed border-[rgb(var(--border))]">
            <SearchIcon className="h-8 w-8 text-[rgb(var(--muted-fg))] mb-3" />
            <p className="font-semibold text-[rgb(var(--fg))]">Aucun service ne correspond</p>
            <p className="text-sm text-[rgb(var(--muted-fg))] mt-1">Essayez un autre mot-clé ou retirez les filtres.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function ServicesCatalogPage() {
  return (
    <PublicShell>
      <Suspense fallback={<div className="container-app py-14"><Skeleton className="h-40 rounded-2xl" /></div>}>
        <CatalogInner />
      </Suspense>
    </PublicShell>
  )
}
