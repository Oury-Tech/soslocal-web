import type {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  DisputeStatus,
} from '@/types/payment.types'
import { COMMISSION_RATE } from '@/lib/constants'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mobile_money: 'Mobile Money',
  card: 'Carte bancaire',
  cash: 'Espèces',
  bank_transfer: 'Virement bancaire',
}

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  orange_money: 'Orange Money',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  wave: 'Wave',
  stripe: 'Stripe',
  djomy: 'Djomy',
  cash: 'Espèces',
  bank_transfer: 'Virement bancaire',
}

/** Fournisseurs disponibles pour une méthode donnée (cohérent avec le diagramme). */
export const PROVIDERS_BY_METHOD: Record<PaymentMethod, PaymentProvider[]> = {
  mobile_money: ['orange_money', 'mtn_momo', 'moov_money', 'wave'],
  card: ['stripe', 'djomy'],
  cash: ['cash'],
  bank_transfer: ['bank_transfer'],
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
}

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: 'Ouvert',
  in_review: 'En examen',
  resolved: 'Résolu',
  rejected: 'Rejeté',
}

/** Commission plateforme (taux unique défini dans constants). */
export function calcCommission(amount: number): number {
  return Math.round(amount * COMMISSION_RATE)
}

/** Net reversé au technicien après commission. */
export function calcTechnicianNet(amount: number): number {
  return amount - calcCommission(amount)
}

/** Applique une réduction promo (% ou montant fixe) et retourne le total dû. */
export function applyPromo(
  amount: number,
  promo?: { type: 'percentage' | 'fixed'; value: number } | null,
): { discount: number; total: number } {
  if (!promo) return { discount: 0, total: amount }
  const discount =
    promo.type === 'percentage'
      ? Math.round((amount * promo.value) / 100)
      : Math.min(promo.value, amount)
  return { discount, total: Math.max(0, amount - discount) }
}
