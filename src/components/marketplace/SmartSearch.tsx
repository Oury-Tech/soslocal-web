'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react'
import { useServices } from '@/hooks/queries/useServices'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { formatGNF } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { Service } from '@/types'

interface Props {
  /** Valeur initiale (ex. reprise du paramètre ?q= sur /services). */
  initialValue?: string
  autoFocus?: boolean
  placeholder?: string
  /** `hero` = grande barre vitrine ; `compact` = barre d'en-tête de page. */
  size?: 'hero' | 'compact'
  className?: string
}

/**
 * Recherche intelligente : autocomplétion en direct sur le catalogue de
 * services (nom, catégorie, description), navigation clavier, et suggestions
 * des services les plus demandés quand le champ est vide. Sélectionner un
 * service ouvre sa page ; valider un texte libre ouvre /services?q=…
 */
export function SmartSearch({
  initialValue = '',
  autoFocus = false,
  placeholder = 'Quel service vous faut-il ? (plomberie, électricité…)',
  size = 'hero',
  className,
}: Props) {
  const router = useRouter()
  const { data: services = [] } = useServices()
  const [q, setQ] = useState(initialValue)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)

  const term = q.trim().toLowerCase()

  const matches = useMemo<Service[]>(() => {
    const activeServices = services.filter((s) => s.is_active !== false)
    if (!term) {
      // Suggestions : services les plus demandés / mis en avant.
      return [...activeServices]
        .sort(
          (a, b) =>
            (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) ||
            (b.popularity_score ?? 0) - (a.popularity_score ?? 0) ||
            (b.total_requests ?? 0) - (a.total_requests ?? 0),
        )
        .slice(0, 6)
    }
    return activeServices
      .filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.category?.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term),
      )
      .slice(0, 6)
  }, [services, term])

  useEffect(() => setActive(0), [term])

  // Fermeture au clic extérieur.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function go(href: string) {
    setOpen(false)
    router.push(href)
  }

  function submit() {
    if (open && matches[active]) return go(`/services/${matches[active].slug}`)
    const t = q.trim()
    go(`/services${t ? `?q=${encodeURIComponent(t)}` : ''}`)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const isHero = size === 'hero'

  return (
    <div ref={boxRef} className={cn('relative w-full', className)}>
      <div
        className={cn(
          'flex items-center gap-2 rounded-2xl border bg-[rgb(var(--card))] transition-all',
          open
            ? 'border-brand-500 ring-4 ring-brand-500/15'
            : 'border-[rgb(var(--border))] shadow-soft',
          isHero ? 'pl-4 pr-2 py-2' : 'pl-3 pr-1.5 py-1.5',
        )}
      >
        <Search className={cn('text-[rgb(var(--muted-fg))] flex-shrink-0', isHero ? 'h-5 w-5' : 'h-4 w-4')} aria-hidden />
        <input
          type="search"
          value={q}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Rechercher un service"
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none placeholder:text-[rgb(var(--muted-fg))] text-[rgb(var(--fg))]',
            isHero ? 'text-base' : 'text-sm',
          )}
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('')
              setOpen(true)
            }}
            aria-label="Effacer"
            className="flex-shrink-0 h-7 w-7 inline-flex items-center justify-center rounded-lg text-[rgb(var(--muted-fg))] hover:bg-[rgb(var(--muted))]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          className={cn(
            'flex-shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors',
            isHero ? 'px-5 py-2.5 text-sm' : 'px-3.5 py-2 text-sm',
          )}
        >
          <span className={isHero ? '' : 'hidden sm:inline'}>Rechercher</span>
          <ArrowRight className="h-4 w-4 sm:hidden" />
        </button>
      </div>

      {/* Dropdown suggestions */}
      {open && matches.length > 0 && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-soft-lg overflow-hidden animate-slide-down">
          {!term && (
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1 text-xs font-semibold text-[rgb(var(--muted-fg))]">
              <TrendingUp className="h-3.5 w-3.5 text-brand-500" />
              Services les plus demandés
            </div>
          )}
          <ul className="py-1">
            {matches.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(`/services/${s.slug}`)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    i === active ? 'bg-[rgb(var(--muted))]' : 'hover:bg-[rgb(var(--muted))]',
                  )}
                >
                  <span className="h-9 w-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center flex-shrink-0">
                    <ServiceIcon slug={s.slug} name={s.name} className="h-4 w-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-[rgb(var(--fg))] truncate">{s.name}</span>
                    <span className="block text-xs text-[rgb(var(--muted-fg))] truncate">
                      {s.category}
                      {s.estimated_price_min != null && ` · à partir de ${formatGNF(s.estimated_price_min)}`}
                    </span>
                  </span>
                  {s.is_emergency && (
                    <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      24/7
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={submit}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border-t border-[rgb(var(--border))] text-sm font-semibold text-brand-600 dark:text-brand-300 hover:bg-[rgb(var(--muted))] transition-colors"
          >
            Voir tous les services
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
