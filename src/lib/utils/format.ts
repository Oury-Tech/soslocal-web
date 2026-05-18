import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

/** Format un montant en GNF */
export function formatGNF(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '— GNF'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return '— GNF'

  return (
    new Intl.NumberFormat('fr-GN', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(n) + ' GNF'
  )
}

/** Format USD */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format distance */
export function formatDistance(meters: number | undefined | null): string {
  if (meters === undefined || meters === null) return '—'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

/** Format date simple */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—'
  return format(new Date(date), 'dd MMMM yyyy', { locale: fr })
}

/** Format date + heure */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy à HH:mm', { locale: fr })
}

/**
 * ✅ IMPORTANT FIX BUILD
 * Alias compatible avec ton code existant
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: fr,
  })
}

/** Version courte alternative */
export function formatRelative(date: string | Date | undefined | null): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: fr,
  })
}

/** Format heure */
export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return '—'
  return format(new Date(date), 'HH:mm', { locale: fr })
}

/** Séparateur de date pour le chat (Aujourd'hui / Hier / date) */
export function formatDateSeparator(date: string | Date): string {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dKey = format(d, 'yyyy-MM-dd')
  if (dKey === format(today, 'yyyy-MM-dd')) return "Aujourd'hui"
  if (dKey === format(yesterday, 'yyyy-MM-dd')) return 'Hier'
  return format(d, 'dd MMMM yyyy', { locale: fr })
}

/** Rating */
export function formatRating(rating: number | undefined, total?: number): string {
  if (!rating) return '—'
  const stars = '★'.repeat(Math.round(rating))
  return total !== undefined
    ? `${rating.toFixed(1)} (${total} avis)`
    : `${rating.toFixed(1)} ${stars}`
}

/** Initiales */
export function getInitials(name: string | undefined): string {
  if (!name) return '?'

  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Téléphone Guinée */
export function formatPhone(phone: string | undefined): string {
  if (!phone) return '—'

  const clean = phone.replace(/\D/g, '')

  if (clean.startsWith('224')) {
    const local = clean.slice(3)
    return `+224 ${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`
  }

  return phone
}