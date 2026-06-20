'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
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

interface StatCardProps {
  label: string
  value: React.ReactNode
  /** Lucide icon component. */
  icon: React.ElementType
  tone?: Tone
  sub?: string
  /** Optional trend pill, e.g. { value: '+12%', direction: 'up' }. */
  delta?: { value: string; direction?: 'up' | 'down' }
  loading?: boolean
  className?: string
  /** Stagger delay (s) for entrance animation when rendered in a grid. */
  delay?: number
}

/**
 * Carte KPI unifiée — style SaaS épuré : icône plate dans un carré teinté,
 * grand chiffre tabulaire, libellé discret, pastille de tendance optionnelle.
 * Compatible mode sombre, sans dégradé.
 */
export function StatCard({ label, value, icon: Icon, tone = 'brand', sub, delta, loading, className, delay = 0 }: StatCardProps) {
  const t = TONES[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={cn('rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-soft-lg sm:p-5', className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', t.wrap)}>
          <Icon className={cn('h-5 w-5', t.icon)} aria-hidden />
        </div>
        {delta && (
          <span className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            delta.direction === 'down'
              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
          )}>
            {delta.direction === 'down' ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {delta.value}
          </span>
        )}
      </div>
      {loading ? (
        <>
          <div className="h-7 w-24 rounded bg-muted animate-pulse" />
          <div className="mt-2 h-3 w-20 rounded bg-muted animate-pulse" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold tabular-nums tracking-tight text-[rgb(var(--fg))]">{value}</div>
          <div className="mt-1 text-sm text-[rgb(var(--muted-fg))]">{label}</div>
          {sub && <div className="mt-0.5 text-xs text-[rgb(var(--muted-fg))]">{sub}</div>}
        </>
      )}
    </motion.div>
  )
}
