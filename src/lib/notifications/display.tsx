import {
  Bell, Wrench, MessageCircle, CreditCard, Star,
  CheckCircle2, AlertTriangle, Gift, Info,
} from 'lucide-react'

/** Icône réelle + couleurs par type de notification (web). Partagé page + topbar. */
export const NOTIF_TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  request:   { icon: Wrench,        color: 'text-brand-600',        bg: 'bg-brand-100 dark:bg-brand-900/40'   },
  chat:      { icon: MessageCircle, color: 'text-purple-600',       bg: 'bg-purple-100 dark:bg-purple-900/40' },
  message:   { icon: MessageCircle, color: 'text-purple-600',       bg: 'bg-purple-100 dark:bg-purple-900/40' },
  payment:   { icon: CreditCard,    color: 'text-green-600',        bg: 'bg-green-100 dark:bg-green-900/40'   },
  review:    { icon: Star,          color: 'text-amber-600',        bg: 'bg-amber-100 dark:bg-amber-900/40'   },
  success:   { icon: CheckCircle2,  color: 'text-green-600',        bg: 'bg-green-100 dark:bg-green-900/40'   },
  warning:   { icon: AlertTriangle, color: 'text-amber-600',        bg: 'bg-amber-100 dark:bg-amber-900/40'   },
  error:     { icon: AlertTriangle, color: 'text-red-600',          bg: 'bg-red-100 dark:bg-red-900/40'       },
  promotion: { icon: Gift,          color: 'text-pink-600',         bg: 'bg-pink-100 dark:bg-pink-900/40'     },
  system:    { icon: Info,          color: 'text-muted-foreground', bg: 'bg-muted'                            },
  info:      { icon: Info,          color: 'text-muted-foreground', bg: 'bg-muted'                            },
}

export function notifCfg(type: string) {
  return NOTIF_TYPE_CONFIG[type] ?? NOTIF_TYPE_CONFIG.info
}

/** Retire un éventuel emoji de tête des anciens titres : l'icône typée porte déjà le sens. */
export function cleanNotifTitle(t?: string) {
  return (t ?? '').replace(/^[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\s]+/u, '').trim() || (t ?? '')
}
