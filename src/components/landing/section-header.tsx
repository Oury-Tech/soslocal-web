'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SectionHeaderProps {
  /** Libellé court (eyebrow) — affiché en petites majuscules, couleur marque. */
  eyebrow: string
  /** Conservé pour compatibilité d'API ; non rendu (style épuré, sans pastille). */
  icon?: LucideIcon
  /** Titre — peut contenir un <span className="text-brand-500"> pour l'accent. */
  title: React.ReactNode
  description?: string
  align?: 'center' | 'left'
  className?: string
}

/**
 * En-tête de section unifié pour la landing : un libellé discret en majuscules
 * surmontant un titre fort et un sous-titre. Style épuré, sans chip ni pastille,
 * pour une hiérarchie claire et calme sur toutes les sections.
 */
export function SectionHeader({
  eyebrow,
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
      <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
        {eyebrow}
      </span>

      <h2 className="mt-3 text-3xl sm:text-4xl lg:text-[2.625rem] font-extrabold leading-[1.12] tracking-tight text-[rgb(var(--fg))] text-balance">
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
