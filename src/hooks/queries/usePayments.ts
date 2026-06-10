import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import type {
  Payment,
  InitiatePaymentData,
  PromoCode,
  Dispute,
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
