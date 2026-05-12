import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

/** Format un montant en GNF */
export function formatGNF(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '— GNF'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return '— GNF'
  return new Intl.NumberFormat('fr-GN', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(n) + ' GNF'
}

/** Format USD */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format une distance (m ou km) */
export function formatDistance(meters: number | undefined): string {
  if (meters === undefined || meters === null) return '—'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

/** Format une date complète */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd MMMM yyyy', { locale: fr })
}

/** Format date + heure */
export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd MMM yyyy à HH:mm', { locale: fr })
}

/** Format relatif type "il y a 2 heures" */
export function formatRelative(date: string | Date | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })
}

/** Format heure seule */
export function formatTime(date: string | Date | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'HH:mm', { locale: fr })
}

/** Format note moyenne (étoiles) */
export function formatRating(rating: number | undefined, total?: number): string {
  if (!rating) return '—'
  const stars = '★'.repeat(Math.round(rating))
  return total !== undefined ? `${rating.toFixed(1)} (${total} avis)` : `${rating.toFixed(1)} ${stars}`
}

/** Initiales d'un nom */
export function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Numéro de téléphone GN format */
export function formatPhone(phone: string | undefined): string {
  if (!phone) return '—'
  const clean = phone.replace(/\D/g, '')
  if (clean.startsWith('224')) {
    const local = clean.slice(3)
    return `+224 ${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`
  }
  return phone
}
