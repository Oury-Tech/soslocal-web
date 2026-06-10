import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'

/* ════════════════════════════════════════════════════════════════════════
 * Back-office avancé — hooks TanStack Query
 * Catalogue de services · Finance & Promo · Modération · Contenu & Support
 * Tous les endpoints sont réservés aux rôles opérateur / administrateur.
 * ════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────── Types ───────────────────────────
export interface AdminService {
  id: number
  name: string
  slug: string
  description?: string | null
  short_description?: string | null
  category?: string | null
  subcategory?: string | null
  tags?: string | null
  icon_url?: string | null
  image_url?: string | null
  color?: string | null
  estimated_price_min?: number | null
  estimated_price_max?: number | null
  currency?: string | null
  average_duration?: number | null
  is_active: boolean
  is_featured: boolean
  is_emergency: boolean
  display_order: number
  popularity_score?: number | null
  total_requests?: number | null
  total_completed?: number | null
  average_rating?: number | null
  created_at?: string | null
}

export interface ServiceInput {
  name?: string
  description?: string | null
  short_description?: string | null
  category?: string | null
  subcategory?: string | null
  tags?: string | null
  icon_url?: string | null
  color?: string | null
  estimated_price_min?: number | null
  estimated_price_max?: number | null
  currency?: string | null
  average_duration?: number | null
  is_active?: boolean
  is_featured?: boolean
  is_emergency?: boolean
  display_order?: number
}

export interface Payout {
  id: number
  technician_id: number
  technician_name?: string | null
  amount: number
  currency?: string | null
  commission_ids?: string | null
  payout_method?: string | null
  payout_reference?: string | null
  status: string
  notes?: string | null
  created_at?: string | null
  completed_at?: string | null
}

export interface PendingPayout {
  technician_id: number
  technician_name?: string | null
  amount: number
  currency?: string | null
  commissions_count: number
}

export interface Refund {
  id: number
  payment_reference?: string | null
  user_id: number
  request_id?: number | null
  amount?: number | null
  refund_amount?: number | null
  refund_reason?: string | null
  status: string
  refunded_at?: string | null
  created_at?: string | null
}

export interface CommissionRate {
  rate: number
  percent: number
}

export interface AdminReview {
  id: number
  request_id?: number | null
  reviewer_id?: number | null
  reviewer_name?: string | null
  reviewed_id?: number | null
  reviewed_name?: string | null
  rating?: number | null
  title?: string | null
  comment?: string | null
  is_public: boolean
  is_flagged: boolean
  flag_reason?: string | null
  is_featured: boolean
  created_at?: string | null
}

export type ReviewAction = 'hide' | 'show' | 'flag' | 'unflag' | 'feature' | 'unfeature' | 'delete'

export interface AdminMessage {
  id: number
  chat_room_id: number
  sender_id?: number | null
  sender_name?: string | null
  message_type?: string | null
  content?: string | null
  media_url?: string | null
  is_deleted: boolean
  created_at?: string | null
}

export interface FAQCategory {
  id: number
  name: string
  description?: string | null
  icon?: string | null
  order: number
  is_active: boolean
}

export interface FAQItem {
  id: number
  category_id: number
  question: string
  answer: string
  order: number
  is_active: boolean
  for_clients: boolean
  for_technicians: boolean
  views_count?: number | null
  helpful_count?: number | null
  created_at?: string | null
}

export interface Subscription {
  id: number
  user_id: number
  user_name?: string | null
  user_email?: string | null
  plan?: string | null
  status?: string | null
  price?: number | null
  currency?: string | null
  billing_cycle?: string | null
  started_at?: string | null
  expires_at?: string | null
  auto_renew?: boolean | null
  is_trial?: boolean | null
}

// ═══════════════════════ 1) CATALOGUE DE SERVICES ═══════════════════════
const CATALOG_KEY = ['admin', 'catalog'] as const

export function useAdminServices() {
  return useQuery<AdminService[]>({
    queryKey: CATALOG_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminService[]>(API.ADMIN_SERVICES)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation<AdminService, Error, ServiceInput>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<AdminService>(API.ADMIN_SERVICES, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  })
}

export function useUpdateService() {
  const qc = useQueryClient()
  return useMutation<AdminService, Error, { id: number; patch: ServiceInput }>({
    mutationFn: async ({ id, patch }) => {
      const { data } = await apiClient.patch<AdminService>(API.ADMIN_SERVICE_BY_ID(id), patch)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation<{ deleted: boolean; mode: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(API.ADMIN_SERVICE_BY_ID(id))
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: CATALOG_KEY }),
  })
}

// ═══════════════════════ 2) FINANCE & PROMO ═══════════════════════
export function useCommissionRate() {
  return useQuery<CommissionRate>({
    queryKey: ['admin', 'commission-rate'],
    queryFn: async () => {
      const { data } = await apiClient.get<CommissionRate>(API.ADMIN_COMMISSION)
      return data
    },
  })
}

export function useSetCommissionRate() {
  const qc = useQueryClient()
  return useMutation<CommissionRate, Error, number>({
    mutationFn: async (percent) => {
      const { data } = await apiClient.patch<CommissionRate>(API.ADMIN_COMMISSION, { percent })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'commission-rate'] }),
  })
}

export function usePayouts() {
  return useQuery<Payout[]>({
    queryKey: ['admin', 'payouts'],
    queryFn: async () => {
      const { data } = await apiClient.get<Payout[]>(API.ADMIN_PAYOUTS)
      return Array.isArray(data) ? data : []
    },
  })
}

export function usePendingPayouts() {
  return useQuery<PendingPayout[]>({
    queryKey: ['admin', 'payouts', 'pending'],
    queryFn: async () => {
      const { data } = await apiClient.get<PendingPayout[]>(API.ADMIN_PAYOUTS_PENDING)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useTriggerPayout() {
  const qc = useQueryClient()
  return useMutation<
    Payout,
    Error,
    { technicianId: number; payout_method?: string; notes?: string }
  >({
    mutationFn: async ({ technicianId, ...body }) => {
      const { data } = await apiClient.post<Payout>(API.ADMIN_PAYOUT_TRIGGER(technicianId), body)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'payouts'] })
    },
  })
}

export function useRefunds() {
  return useQuery<Refund[]>({
    queryKey: ['admin', 'refunds'],
    queryFn: async () => {
      const { data } = await apiClient.get<Refund[]>(API.ADMIN_REFUNDS)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useCreateRefund() {
  const qc = useQueryClient()
  return useMutation<Refund, Error, { payment_id: number; amount?: number; reason?: string }>({
    mutationFn: async (body) => {
      const { data } = await apiClient.post<Refund>(API.ADMIN_REFUNDS, body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'refunds'] }),
  })
}

// ═══════════════════════ 3) MODÉRATION ═══════════════════════
export function useAdminReviews(filters?: { flagged?: boolean; hidden?: boolean; q?: string }) {
  return useQuery<AdminReview[]>({
    queryKey: ['admin', 'reviews', filters ?? {}],
    queryFn: async () => {
      const params: Record<string, unknown> = {}
      if (filters?.flagged) params.flagged = true
      if (filters?.hidden) params.hidden = true
      if (filters?.q) params.q = filters.q
      const { data } = await apiClient.get<AdminReview[]>(API.ADMIN_REVIEWS, { params })
      return Array.isArray(data) ? data : []
    },
  })
}

export function useModerateReview() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { id: number; action: ReviewAction; reason?: string }>({
    mutationFn: async ({ id, action, reason }) => {
      const { data } = await apiClient.post(API.ADMIN_REVIEW_MODERATE(id), { action, reason })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  })
}

export function useAdminMessages(filters?: { deleted?: boolean; q?: string; room_id?: number }) {
  return useQuery<AdminMessage[]>({
    queryKey: ['admin', 'chat-messages', filters ?? {}],
    queryFn: async () => {
      const params: Record<string, unknown> = {}
      if (filters?.deleted !== undefined) params.deleted = filters.deleted
      if (filters?.q) params.q = filters.q
      if (filters?.room_id) params.room_id = filters.room_id
      const { data } = await apiClient.get<AdminMessage[]>(API.ADMIN_CHAT_MESSAGES, { params })
      return Array.isArray(data) ? data : []
    },
  })
}

export function useModerateMessage() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, { id: number; action: 'delete' | 'restore' }>({
    mutationFn: async ({ id, action }) => {
      const { data } = await apiClient.post(API.ADMIN_CHAT_MODERATE(id), { action })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'chat-messages'] }),
  })
}

// ═══════════════════════ 4) CONTENU & SUPPORT ═══════════════════════
const FAQ_KEY = ['admin', 'faq'] as const

export function useAdminFaq() {
  return useQuery<{ categories: FAQCategory[]; questions: FAQItem[] }>({
    queryKey: FAQ_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get(API.ADMIN_FAQ)
      return {
        categories: Array.isArray(data?.categories) ? data.categories : [],
        questions: Array.isArray(data?.questions) ? data.questions : [],
      }
    },
  })
}

export function useCreateFaqCategory() {
  const qc = useQueryClient()
  return useMutation<
    FAQCategory,
    Error,
    { name: string; description?: string; icon?: string; order?: number }
  >({
    mutationFn: async (body) => {
      const { data } = await apiClient.post<FAQCategory>(API.ADMIN_FAQ_CATEGORIES, body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: FAQ_KEY }),
  })
}

export function useDeleteFaqCategory() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, number>({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(API.ADMIN_FAQ_CATEGORY_BY_ID(id))
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: FAQ_KEY }),
  })
}

export function useCreateFaq() {
  const qc = useQueryClient()
  return useMutation<
    FAQItem,
    Error,
    {
      category_id: number
      question: string
      answer: string
      order?: number
      is_active?: boolean
      for_clients?: boolean
      for_technicians?: boolean
    }
  >({
    mutationFn: async (body) => {
      const { data } = await apiClient.post<FAQItem>(API.ADMIN_FAQ, body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: FAQ_KEY }),
  })
}

export function useUpdateFaq() {
  const qc = useQueryClient()
  return useMutation<FAQItem, Error, { id: number; patch: Partial<FAQItem> }>({
    mutationFn: async ({ id, patch }) => {
      const { data } = await apiClient.patch<FAQItem>(API.ADMIN_FAQ_BY_ID(id), patch)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: FAQ_KEY }),
  })
}

export function useDeleteFaq() {
  const qc = useQueryClient()
  return useMutation<unknown, Error, number>({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(API.ADMIN_FAQ_BY_ID(id))
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: FAQ_KEY }),
  })
}

export function useBroadcast() {
  return useMutation<
    { sent: number; target: string },
    Error,
    { title: string; message: string; target?: string; priority?: string }
  >({
    mutationFn: async (body) => {
      const { data } = await apiClient.post(API.ADMIN_BROADCAST, body)
      return data
    },
  })
}

export function useSubscriptions(status?: string) {
  return useQuery<Subscription[]>({
    queryKey: ['admin', 'subscriptions', status ?? 'all'],
    queryFn: async () => {
      const params = status ? { status } : undefined
      const { data } = await apiClient.get<Subscription[]>(API.ADMIN_SUBSCRIPTIONS, { params })
      return Array.isArray(data) ? data : []
    },
  })
}

export function useUpdateSubscription() {
  const qc = useQueryClient()
  return useMutation<Subscription, Error, { id: number; status?: string; plan?: string }>({
    mutationFn: async ({ id, ...body }) => {
      const { data } = await apiClient.patch<Subscription>(API.ADMIN_SUBSCRIPTION_BY_ID(id), body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'subscriptions'] }),
  })
}
