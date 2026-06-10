import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import type { Report, ActivityLog, ModerationAction, PromoCode } from '@/types'

export function useReports() {
  return useQuery<Report[]>({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const { data } = await apiClient.get<Report[]>(API.ADMIN_REPORTS)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useResolveReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action }: { id: number; action: ModerationAction }) => {
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
      const { data } = await apiClient.get<ActivityLog[]>(API.ADMIN_ACTIVITY_LOGS)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useAdminPromoCodes() {
  return useQuery<PromoCode[]>({
    queryKey: ['admin', 'promo-codes'],
    queryFn: async () => {
      const { data } = await apiClient.get<PromoCode[]>(API.PROMO_CODES)
      return Array.isArray(data) ? data : []
    },
  })
}

export function useCreatePromoCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<PromoCode, 'id' | 'used_count'>) => {
      const { data } = await apiClient.post<PromoCode>(API.PROMO_CODES, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'promo-codes'] }),
  })
}
