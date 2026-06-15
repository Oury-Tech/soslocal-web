'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface CarouselProps {
  children: React.ReactNode
  /** Largeur fixe de chaque élément (classe Tailwind appliquée aux enfants via wrapper). */
  itemClassName?: string
  className?: string
  ariaLabel?: string
}

/**
 * Carrousel horizontal fluide : défilement tactile (scroll-snap) + flèches sur
 * desktop. Les flèches apparaissent uniquement quand un défilement est possible
 * dans la direction concernée.
 */
export function Carousel({ children, itemClassName, className, ariaLabel }: CarouselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: 'smooth' })
  }

  const childArray = Array.isArray(children) ? children : [children]

  return (
    <div className={cn('relative group/carousel', className)}>
      {/* Flèche gauche */}
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Précédent"
        className={cn(
          'absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-soft-lg text-[rgb(var(--fg))] transition-all hover:bg-brand-500 hover:text-white hover:border-brand-500',
          canLeft ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={ref}
        aria-label={ariaLabel}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {childArray.map((child, i) => (
          <div key={i} className={cn('snap-start shrink-0', itemClassName)}>
            {child}
          </div>
        ))}
      </div>

      {/* Flèche droite */}
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Suivant"
        className={cn(
          'absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-soft-lg text-[rgb(var(--fg))] transition-all hover:bg-brand-500 hover:text-white hover:border-brand-500',
          canRight ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
