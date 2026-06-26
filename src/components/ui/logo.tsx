import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// On affiche UNIQUEMENT le pictogramme (pin maison + cloche), transparent. Le
// mot-symbole « SOSLOCAL » est rendu en texte plat (majuscules, 2 couleurs, sans
// dégradé) — l'asset complet contenait un « SosLocal » en casse mixte + dégradé.
const ICON_HEIGHTS = { sm: 28, md: 34, lg: 44, xl: 60 }
const ICON_RATIO = 0.866 // largeur / hauteur du pictogramme
const TEXT_SIZES = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl' }

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const h = ICON_HEIGHTS[size]
  const w = Math.round(h * ICON_RATIO)
  const textSize = TEXT_SIZES[size]

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Image
        src="/logo-icon.png"
        alt="SOSLOCAL"
        width={w}
        height={h}
        sizes={`${w}px`}
        className="flex-shrink-0 object-contain"
        style={{ height: h, width: 'auto' }}
        priority
      />
      {showText && (
        <span className={cn('font-display font-extrabold tracking-tight uppercase leading-none', textSize)}>
          <span className="text-brand-700 dark:text-brand-200">SOS</span>
          <span className="text-accent-600">LOCAL</span>
        </span>
      )}
    </div>
  )
}
