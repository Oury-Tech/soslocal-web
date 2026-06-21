'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SectionHeaderProps {
  /** Libellé court de la pastille (eyebrow) — en majuscules. */
  eyebrow: string
  /** Icône optionnelle affichée dans la pastille. */
  icon?: LucideIcon
  /** Titre — peut contenir un <span className="text-brand-500"> pour l'accent. */
  title: React.ReactNode
  description?: string
  align?: 'center' | 'left'
  className?: string
}

/**
 * En-tête de section unifié pour la landing : pastille « eyebrow » (icône +
 * libellé en chip bordé) surmontant un titre fort et un sous-titre. Donne une
 * signature visuelle cohérente et premium à toutes les sections.
 */
export function SectionHeader({
  eyebrow,
  icon: Icon,
  title,
  description,
  align = 'center',
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        align === 'center' ? 'text-center mx-auto max-w-2xl' : 'text-left max-w-xl',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--card))] py-1.5 shadow-soft',
          Icon ? 'pl-1.5 pr-3.5' : 'px-3.5',
        )}
      >
        {Icon && (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white">
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
          {eyebrow}
        </span>
      </span>

      <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[2.625rem] font-extrabold leading-[1.12] tracking-tight text-[rgb(var(--fg))] text-balance">
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            'mt-4 text-base sm:text-lg text-[rgb(var(--muted-fg))] text-balance',
            align === 'center' ? 'max-w-2xl mx-auto' : '',
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  )
}
