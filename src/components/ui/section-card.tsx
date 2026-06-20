import * as React from 'react'
import { cn } from '@/lib/utils/cn'

interface SectionCardProps {
  title?: React.ReactNode
  description?: string
  /** Lucide icon shown beside the title. */
  icon?: React.ElementType
  /** Right-aligned header slot (badge, button, filter…). */
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Class applied to the body wrapper. */
  bodyClassName?: string
  /** Drop body padding (useful for tables, maps, lists with own padding). */
  flush?: boolean
}

/**
 * Conteneur de section unifié — carte avec en-tête net (icône + titre + action)
 * séparé du corps par une fine bordure. Cohérent sur tout le back-office.
 */
export function SectionCard({
  title, description, icon: Icon, action, children, className, bodyClassName, flush,
}: SectionCardProps) {
  const hasHeader = title || action
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card shadow-soft', className)}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                <Icon className="h-4 w-4 text-brand-500" aria-hidden />
              </div>
            )}
            <div className="min-w-0">
              {title && <h2 className="truncate font-semibold leading-tight text-[rgb(var(--fg))]">{title}</h2>}
              {description && <p className="truncate text-xs text-[rgb(var(--muted-fg))]">{description}</p>}
            </div>
          </div>
          {action && <div className="flex flex-shrink-0 items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cn(!flush && 'p-5', bodyClassName)}>{children}</div>
    </div>
  )
}
