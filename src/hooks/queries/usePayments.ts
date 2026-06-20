import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { providerToOperator } from '@/lib/utils/payment'
import type {
  Payment,
  InitiatePaymentData,
  PromoCode,
  Dispute,
  DjomyInitiateResponse,
  PaymentStatusResponse,
  MobileMoneyOperator,
} from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

// ── Données mock locales ──────────────────────────────────────
const MOCK_PROMOS: Record<string, Omit<PromoCode, 'id'>> = {
  BIENVENUE10: { code: 'BIENVENUE10', type: 'percentage', value: 10, is_active: true },
  SOS5000:     { code: 'SOS5000',     type: 'fixed',      value: 5000, is_active: true },
}

const mockPayments: Payment[] = [
  {
    id: 9001, request_id: 1001, amount: 150_000, total_amount: 150_000,
    method: 'mobile_money', provider: 'orange_money', status: 'completed',
    transaction_id: 'OM-8842193', created_at: new Date(Date.now() - 864e5 * 3).toISOString(),
    completed_at: new Date(Date.now() - 864e5 * 3).toISOString(),
  },
]

export function usePaymentHistory() {
  return useQuery<Payment[]>({
    queryKey: ['payments', 'history'],
    queryFn: async () => {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 300))
        return mockPayments
      }
      const { data } = await apiClient.get<Payment[]>(API.PAYMENT_HISTORY)
      return Array.isArray(data) ? data : []
    },
  })
}

/**
 * ADMIN — liste de TOUS les paiements de la plateforme.
 * Le backend `GET /payments` ne filtre pas par utilisateur quand le rôle est
 * admin : on récupère donc l'intégralité des transactions. Filtre de statut
 * optionnel + pagination simple.
 */
export function useAdminPayments(opts?: { status?: string; limit?: number }) {
  const { status, limit = 200 } = opts ?? {}
  return useQuery<Payment[]>({
    queryKey: ['admin', 'payments', status ?? 'all', limit],
    queryFn: async () => {
      if (isMock) return mockPayments
      const { data } = await apiClient.get<Payment[]>(API.ADMIN_PAYMENTS, {
        params: { limit, ...(status ? { payment_status: status } : {}) },
      })
      return Array.isArray(data) ? data : []
    },
    staleTime: 10_000,
  })
}

export function usePayment(id?: number | string) {
  return useQuery<Payment | null>({
    queryKey: ['payments', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null
      if (isMock) return mockPayments.find((p) => p.id === Number(id)) ?? null
      const { data } = await apiClient.get<Payment>(API.PAYMENT_BY_ID(id))
      return data
    },
  })
}

export function useValidatePromo() {
  return useMutation<PromoCode, Error, string>({
    mutationFn: async (code) => {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 400))
        const found = MOCK_PROMOS[code.toUpperCase()]
        if (!found) throw new Error('Code promo invalide')
        return { id: 1, ...found }
      }
      const { data } = await apiClient.post<PromoCode>(API.PROMO_VALIDATE, { code })
      return data
    },
  })
}

export function useInitiatePayment() {
  const qc = useQueryClient()
  return useMutation<Payment, Error, InitiatePaymentData>({
    mutationFn: async (payload) => {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 900))
        const payment: Payment = {
          id: Date.now(),
          request_id: payload.request_id,
          amount: 150_000,
          total_amount: 150_000,
          method: payload.method,
          provider: payload.provider,
          status: 'completed',
          promo_code: payload.promo_code,
          transaction_id: `MOCK-${Math.floor(Math.random() * 1e7)}`,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        }
        mockPayments.unshift(payment)
        return payment
      }
      // Dispatch vers la bonne route backend selon la méthode de paiement
      if (payload.method === 'mobile_money') {
        const { data } = await apiClient.post<Payment>(API.PAYMENT_MOBILE_MONEY, {
          request_id: payload.request_id,
          phone_number: payload.phone,
          operator: (payload.provider || '').replace('_money', ''),
        })
        return data
      }
      if (payload.method === 'cash') {
        const { data } = await apiClient.post<Payment>(API.PAYMENT_CASH, {
          request_id: payload.request_id,
        })
        return data
      }
      // Carte bancaire (et autres) → route card
      const { data } = await apiClient.post<Payment>(API.PAYMENT_CARD, {
        request_id: payload.request_id,
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

// ──────────────────────────────────────────────────────────────────
// Hooks dédiés — alignés sur le flux mobile (app/payment/[id].tsx)
// Mobile Money → DjomyInitiateResponse (USSD + polling)
// Carte        → DjomyInitiateResponse (redirect_url)
// Espèces      → Payment (confirmé ensuite par le technicien)
// ──────────────────────────────────────────────────────────────────

/** Récupère le paiement existant lié à une demande (ou null). */
export function usePaymentByRequest(requestId?: number | string) {
  return useQuery<Payment | null>({
    queryKey: ['payments', 'by-request', requestId],
    enabled: !!requestId,
    retry: false,
    queryFn: async () => {
      if (!requestId) return null
      try {
        const { data } = await apiClient.get<Payment>(API.PAYMENT_BY_REQUEST(requestId))
        return data
      } catch {
        return null // 404 = aucun paiement encore
      }
    },
  })
}

/** Initie un paiement Mobile Money (Orange/MTN/Moov/Wave) via Djomy. */
export function useInitiateMobileMoney() {
  const qc = useQueryClient()
  return useMutation<
    DjomyInitiateResponse,
    Error,
    { request_id: number; phone_number: string; operator: MobileMoneyOperator | string; amount?: number }
  >({
    mutationFn: async ({ request_id, phone_number, operator, amount }) => {
      const { data } = await apiClient.post<DjomyInitiateResponse>(API.PAYMENT_MOBILE_MONEY, {
        request_id,
        phone_number,
        operator: providerToOperator(operator),
        ...(amount ? { amount } : {}),
        currency: 'GNF',
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })
}

/** Initie un paiement par carte via Djomy (renvoie un redirect_url). */
export function useInitiateCard() {
  const qc = useQueryClient()
  return useMutation<DjomyInitiateResponse, Error, { request_id: number; amount?: number }>({
    mutationFn: async ({ request_id, amount }) => {
      const { data } = await apiClient.post<DjomyInitiateResponse>(API.PAYMENT_CARD, {
        request_id,
        ...(amount ? { amount } : {}),
        currency: 'GNF',
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })
}

/** Enregistre un paiement en espèces (confirmé ensuite par le technicien). */
export function useConfirmCash() {
  const qc = useQueryClient()
  return useMutation<Payment, Error, { request_id: number; amount?: number }>({
    mutationFn: async ({ request_id, amount }) => {
      const { data } = await apiClient.post<Payment>(API.PAYMENT_CASH, {
        request_id,
        ...(amount ? { amount } : {}),
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

/**
 * Côté CLIENT : envoie une photo (reçu / billets) comme preuve du paiement en
 * espèces. Le paiement passe « en attente de validation » et l'artisan est
 * notifié pour vérifier puis confirmer la réception.
 */
export function useUploadCashProof() {
  const qc = useQueryClient()
  return useMutation<Payment, Error, { request_id: number; file: File }>({
    mutationFn: async ({ request_id, file }) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await apiClient.post<Payment>(
        API.PAYMENT_CASH_PROOF(request_id),
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return data
    },
    onSuccess: (_data, { request_id }) => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['payments', 'by-request', request_id] })
    },
  })
}

/**
 * Côté ARTISAN : confirme avoir reçu le paiement en espèces en main propre.
 * Cible la demande (request_id). Passe le paiement à COMPLETED côté backend,
 * ce qui bascule l'état du client sur « payé ».
 */
export function useConfirmCashReceived() {
  const qc = useQueryClient()
  return useMutation<Payment, Error, number>({
    mutationFn: async (requestId) => {
      const { data } = await apiClient.post<Payment>(API.PAYMENT_CONFIRM_CASH(requestId))
      return data
    },
    onSuccess: (_data, requestId) => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['requests', requestId] })
      qc.invalidateQueries({ queryKey: ['payments', 'by-request', requestId] })
    },
  })
}

/** Interroge le statut d'un paiement (polling Djomy côté backend). */
export async function fetchPaymentStatus(paymentId: number): Promise<PaymentStatusResponse> {
  const { data } = await apiClient.get<PaymentStatusResponse>(API.PAYMENT_STATUS(paymentId))
  return data
}

/** Supprime un paiement de l'historique (propriétaire ou admin). */
export function useDeletePayment() {
  const qc = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: async (paymentId) => {
      if (isMock) {
        const idx = mockPayments.findIndex((p) => p.id === paymentId)
        if (idx >= 0) mockPayments.splice(idx, 1)
        return
      }
      await apiClient.delete(API.PAYMENT_BY_ID(paymentId))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

export function useDisputes() {
  return useQuery<Dispute[]>({
    queryKey: ['disputes'],
    queryFn: async () => {
      if (isMock) return []
      const { data } = await apiClient.get<Dispute[]>(API.DISPUTES)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useCreateDispute() {
  const qc = useQueryClient()
  return useMutation<
    Dispute,
    Error,
    { payment_id: number; request_id: number; reason: string; description?: string }
  >({
    mutationFn: async (payload) => {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 600))
        return {
          id: Date.now(),
          ...payload,
          status: 'open',
          created_at: new Date().toISOString(),
        } as Dispute
      }
      const { data } = await apiClient.post<Dispute>(API.DISPUTES, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['disputes'] }),
  })
}
