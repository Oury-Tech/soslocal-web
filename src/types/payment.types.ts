// Méthodes de paiement — alignées sur le diagramme « Module Paiements »
export type PaymentMethod = 'mobile_money' | 'card' | 'cash' | 'bank_transfer'

// Fournisseurs / passerelles — Mobile Money (Orange/MTN/Moov/Wave),
// Carte (Stripe/Djomy), Espèces, Virement bancaire
export type PaymentProvider =
  | 'orange_money'
  | 'mtn_momo'
  | 'moov_money'
  | 'wave'
  | 'stripe'
  | 'djomy'
  | 'cash'
  | 'bank_transfer'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled'

// Opérateurs Mobile Money tels qu'attendus par le backend / Djomy.
export type MobileMoneyOperator = 'orange' | 'mtn' | 'moov' | 'wave'

// Réponse backend après initiation d'un paiement Djomy (Mobile Money ou Carte).
// Identique au schéma mobile `DjomyInitiateResponse` pour une cohérence totale.
export interface DjomyInitiateResponse {
  payment_id: number
  transaction_ref: string
  status: string                 // pending | processing
  amount: number
  currency: string
  method: PaymentMethod
  ussd_code?: string | null
  operator?: string | null
  phone_number?: string | null
  redirect_url?: string | null
  expires_at?: string | null
  sandbox?: boolean              // true = paiement simulé → sonder le statut
  message: string
}

// Réponse backend du polling de statut (GET /payments/{id}/status).
export interface PaymentStatusResponse {
  payment_id: number
  status: PaymentStatus
  transaction_ref?: string | null
  amount: number
  currency: string
  method: PaymentMethod
  completed_at?: string | null
  failure_reason?: string | null
}

export interface Payment {
  id: number
  request_id: number
  amount: number            // Montant de la prestation
  promo_discount?: number   // Réduction appliquée par code promo
  total_amount: number      // Montant réellement débité
  method: PaymentMethod
  provider: PaymentProvider
  status: PaymentStatus
  promo_code?: string
  transaction_id?: string
  receipt_url?: string
  cash_proof_url?: string        // Photo de preuve fournie par le client (espèces)
  cash_proof_uploaded_at?: string
  created_at: string
  completed_at?: string
}

export interface InitiatePaymentData {
  request_id: number
  method: PaymentMethod
  provider: PaymentProvider
  phone?: string            // Requis pour Mobile Money
  promo_code?: string
}

// Commission plateforme (10 %) — voir COMMISSION_RATE
export interface Commission {
  id: number
  payment_id: number
  technician_id: number
  commission_rate: number
  commission_amount: number
  technician_amount: number
  status: 'pending' | 'paid'
  created_at: string
}

export type PromoCodeType = 'percentage' | 'fixed'

export interface PromoCode {
  id: number
  code: string
  type: PromoCodeType
  value: number             // % ou montant fixe en GNF selon `type`
  min_amount?: number
  max_uses?: number
  used_count?: number
  expires_at?: string
  is_active: boolean
}

export type DisputeStatus = 'open' | 'in_review' | 'resolved' | 'rejected'

export interface Dispute {
  id: number
  payment_id: number
  request_id: number
  reason: string
  description?: string
  status: DisputeStatus
  resolution?: string
  created_at: string
  resolved_at?: string
}

export interface Payout {
  id: number
  technician_id: number
  amount: number
  status: 'pending' | 'processing' | 'paid' | 'failed'
  method: PaymentMethod
  reference?: string
  created_at: string
  paid_at?: string
}
