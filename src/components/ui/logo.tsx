import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const ICON_SIZES = { sm: 48, md: 64, lg: 88, xl: 112 }
const TEXT_SIZES = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl' }

export function Logo({ className, showText = false, size = 'md' }: LogoProps) {
  const iconSize = ICON_SIZES[size]
  const textSize = TEXT_SIZES[size]

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
        <span className={cn('font-display font-extrabold tracking-tight', textSize)}>
          <span className="text-brand-800 dark:text-brand-200">SOS</span>
          <span className="text-accent-600">Local</span>
        </span>
      )}
    </div>
  )
}
