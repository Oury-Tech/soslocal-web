'use client'

import { Check, X } from 'lucide-react'
import { PASSWORD_RULES } from '@/lib/validation/password'
import { cn } from '@/lib/utils/cn'

/** Liste vivante des règles de mot de passe (cf. diagramme Authentification). */
export function PasswordChecklist({ value }: { value: string }) {
  if (!value) return null
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value)
        return (
          <li
            key={rule.label}
            className={cn(
              'flex items-center gap-1.5 text-xs transition-colors',
              ok ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
            )}
          >
            {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-50" />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
