'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Tone = 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'

const TONES: Record<Tone, { wrap: string; icon: string }> = {
  brand:   { wrap: 'bg-brand-50 dark:bg-brand-900/20',   icon: 'text-brand-500' },
  accent:  { wrap: 'bg-accent-50 dark:bg-accent-900/20', icon: 'text-accent-500' },
  success: { wrap: 'bg-green-50 dark:bg-green-900/20',   icon: 'text-green-600 dark:text-green-400' },
  warning: { wrap: 'bg-amber-50 dark:bg-amber-900/20',   icon: 'text-amber-600 dark:text-amber-400' },
  danger:  { wrap: 'bg-red-50 dark:bg-red-900/20',       icon: 'text-red-600 dark:text-red-400' },
  neutral: { wrap: 'bg-muted',                            icon: 'text-muted-foreground' },
}

interface QuickLinkCardProps {
  /** Lucide icon component. */
  icon: React.ElementType
  title: string
  description?: string
  /** Destination — renders as a Next.js Link when provided. */
  href?: string
  /** Click handler — renders as a button when no href is given. */
  onClick?: () => void
  tone?: Tone
  /** Right-aligned slot (badge, count…). Replaces the default chevron when set. */
  trailing?: React.ReactNode
  className?: string
  /** Stagger delay (s) for the entrance animation. */
  delay?: number
}

/**
 * Carte d'accès rapide — icône teintée, titre, sous-titre et chevron.
 * Style SaaS épuré (HealthSecure) : surface nette, survol discret, sans dégradé.
 * S'utilise en grille (« Accès rapide ») et fonctionne en lien ou en bouton.
 */
export function QuickLinkCard({
  icon: Icon, title, description, href, onClick, tone = 'brand', trailing, className, delay = 0,
}: QuickLinkCardProps) {
  const t = TONES[tone]

  const inner = (
    <>
      <div className={cn('inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl', t.wrap)}>
        <Icon className={cn('h-5 w-5', t.icon)} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold leading-tight text-[rgb(var(--fg))]">{title}</div>
        {description && (
          <div className="mt-0.5 truncate text-sm text-[rgb(var(--muted-fg))]">{description}</div>
        )}
      </div>
      {trailing ?? (
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
      )}
    </>
  )

  const classes = cn(
    'group flex w-full items-center gap-3.5 rounded-2xl border border-border bg-card p-4 text-left shadow-soft',
    'transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft-lg dark:hover:border-brand-700',
    className,
  )

  const content = href ? (
    <Link href={href} className={classes}>{inner}</Link>
  ) : (
    <button type="button" onClick={onClick} className={classes}>{inner}</button>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  )
}
