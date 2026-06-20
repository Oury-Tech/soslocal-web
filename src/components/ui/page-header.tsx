import * as React from 'react'
import { cn } from '@/lib/utils/cn'

interface PageHeaderProps {
  title: string
  description?: string
  /** Lucide icon component shown in a soft tinted square (desktop only). */
  icon?: React.ElementType
  /** Right-aligned actions (buttons, badges…). */
  children?: React.ReactNode
  className?: string
}

/**
 * En-tête de page unifié pour tout le back-office.
 * Style SaaS épuré : carré d'icône discret, titre net, actions à droite.
 */
export function PageHeader({ title, description, icon: Icon, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-start gap-3.5 min-w-0">
        {Icon && (
          <div className="hidden sm:flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20 ring-1 ring-inset ring-brand-100 dark:ring-brand-900/40">
            <Icon className="h-5 w-5 text-brand-500" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[rgb(var(--fg))]">{title}</h1>
          {description && <p className="mt-1 text-sm text-[rgb(var(--muted-fg))]">{description}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 flex-shrink-0">{children}</div>}
    </div>
  )
}
