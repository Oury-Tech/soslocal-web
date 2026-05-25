import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:    'bg-muted text-muted-foreground',
        primary:    'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200',
        accent:     'bg-accent-100 text-accent-800 dark:bg-accent-900/40 dark:text-accent-200',
        success:    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
        warning:    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
        danger:     'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
        outline:    'border border-border text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

/** Avatar */
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' }

export function Avatar({ src, alt = '', fallback = '?', size = 'md', className, ...props }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-brand-500 text-white font-semibold overflow-hidden flex-shrink-0',
        sizeMap[size],
        className
      )}
      {...props}
    >
      {src && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setImgError(true)} />
      ) : (
        <span>{fallback.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  )
}

/** Spinner */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand-600', className)} />
}

/** Skeleton */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-md', className)} />
}
