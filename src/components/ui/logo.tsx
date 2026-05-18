import Image from 'next/image'
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
      <Image
        src="/logo.png"
        alt="SOSLocal"
        width={iconSize}
        height={iconSize}
        className="rounded-xl flex-shrink-0 object-cover"
        priority
      />

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
