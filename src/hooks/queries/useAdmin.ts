import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import type { Report, ActivityLog, ModerationAction, PromoCode } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

const MOCK_REPORTS: Report[] = [
  { id: 1, target_type: 'review', target_id: 12, reporter_name: 'Aïssatou B.', reason: 'Propos diffamatoires', excerpt: 'Cet artisan est un voleur…', status: 'pending', created_at: new Date(Date.now() - 36e5 * 4).toISOString() },
  { id: 2, target_type: 'message', target_id: 88, reporter_name: 'Mamadou D.', reason: 'Spam / publicité', excerpt: 'Contactez-moi hors plateforme au +224…', status: 'pending', created_at: new Date(Date.now() - 36e5 * 26).toISOString() },
  { id: 3, target_type: 'user', target_id: 305, reporter_name: 'Fatou C.', reason: 'Comportement inapproprié', status: 'resolved', created_at: new Date(Date.now() - 864e5 * 3).toISOString() },
]

const MOCK_LOGS: ActivityLog[] = [
  { id: 1, actor_name: 'Admin Sow', action: 'a vérifié le technicien', target: 'Ousmane Barry', created_at: new Date(Date.now() - 36e5 * 2).toISOString() },
  { id: 2, actor_name: 'Admin Sow', action: 'a créé le code promo', target: 'BIENVENUE10', created_at: new Date(Date.now() - 36e5 * 5).toISOString() },
  { id: 3, actor_name: 'Système', action: 'a déclenché un payout', target: 'Mamadou Diallo — 135 000 GNF', created_at: new Date(Date.now() - 36e5 * 9).toISOString() },
  { id: 4, actor_name: 'Admin Camara', action: 'a banni le compte', target: 'spammeur@example.com', created_at: new Date(Date.now() - 864e5).toISOString() },
]

const MOCK_PROMOS: PromoCode[] = [
  { id: 1, code: 'BIENVENUE10', type: 'percentage', value: 10, used_count: 42, max_uses: 500, is_active: true },
  { id: 2, code: 'SOS5000', type: 'fixed', value: 5000, used_count: 11, is_active: true },
]

export function useReports() {
  return useQuery<Report[]>({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      if (isMock) { await new Promise((r) => setTimeout(r, 300)); return MOCK_REPORTS }
      const { data } = await apiClient.get<Report[]>(API.ADMIN_REPORTS)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useResolveReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action }: { id: number; action: ModerationAction }) => {
      if (isMock) { await new Promise((r) => setTimeout(r, 400)); return { ok: true } }
      const { data } = await apiClient.post(API.ADMIN_REPORT_ACTION(id), { action })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  })
}

export function useActivityLogs() {
  return useQuery<ActivityLog[]>({
    queryKey: ['admin', 'activity-logs'],
    queryFn: async () => {
      if (isMock) { await new Promise((r) => setTimeout(r, 300)); return MOCK_LOGS }
      const { data } = await apiClient.get<ActivityLog[]>(API.ADMIN_ACTIVITY_LOGS)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useAdminPromoCodes() {
  return useQuery<PromoCode[]>({
    queryKey: ['admin', 'promo-codes'],
    queryFn: async () => {
      if (isMock) { await new Promise((r) => setTimeout(r, 300)); return MOCK_PROMOS }
      const { data } = await apiClient.get<PromoCode[]>(API.PROMO_CODES)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useCreatePromoCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<PromoCode, 'id' | 'used_count'>) => {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 400))
        const created: PromoCode = { id: Date.now(), used_count: 0, ...payload }
        MOCK_PROMOS.unshift(created)
        return created
      }
      const { data } = await apiClient.post<PromoCode>(API.PROMO_CODES, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'promo-codes'] }),
  })
}
