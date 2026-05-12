import { cn } from '@/lib/utils/cn'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const iconSize = { sm: 28, md: 36, lg: 48 }[size]
  const textSize = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' }[size]

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden
      >
        {/* Pin de localisation */}
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1A3F7A" />
            <stop offset="100%" stopColor="#00A99D" />
          </linearGradient>
          <linearGradient id="logoGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E6FFFB" />
          </linearGradient>
        </defs>

        {/* Outer pin shape */}
        <path
          d="M32 4 C18.7 4, 8 14.7, 8 28 C8 44, 32 60, 32 60 C32 60, 56 44, 56 28 C56 14.7, 45.3 4, 32 4 Z"
          fill="url(#logoGrad)"
        />
        {/* Inner circle (white halo) */}
        <circle cx="32" cy="28" r="13" fill="url(#logoGradInner)" />
        {/* SOS dots/dashes - morse style */}
        <circle cx="24" cy="28" r="2.2" fill="#1A3F7A" />
        <rect x="29" y="25.8" width="6" height="4.5" rx="2" fill="#00A99D" />
        <circle cx="40" cy="28" r="2.2" fill="#1A3F7A" />

        {/* Pulse ring extérieur */}
        <circle cx="32" cy="28" r="20" stroke="#00A99D" strokeOpacity="0.3" strokeWidth="1" fill="none" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-display font-extrabold tracking-tight', textSize)}>
            <span className="text-brand-800 dark:text-brand-200">SOS</span>
            <span className="text-accent-600">Local</span>
          </span>
          {size === 'lg' && (
            <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase mt-0.5">
              Allô Maître · Guinée
            </span>
          )}
        </div>
      )}
    </div>
  )
}
