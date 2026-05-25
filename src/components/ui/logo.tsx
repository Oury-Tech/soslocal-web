import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const ICON_SIZES = { sm: 36, md: 48, lg: 64, xl: 80 }
const TEXT_SIZES = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl', xl: 'text-3xl' }

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
