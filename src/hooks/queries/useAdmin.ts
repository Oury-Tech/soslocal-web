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

// ─── Réglages plateforme ─────────────────────────────────────────────────────
export interface PlatformSettings {
  platform_name: string
  support_email: string
  support_phone: string
  default_currency: string
  commission_rate: number
  commission_percent: number
  min_payout_amount: number
  maintenance_mode: boolean
  allow_new_registrations: boolean
  auto_assign_requests: boolean
  review_moderation: boolean
}

export function usePlatformSettings() {
  return useQuery<PlatformSettings>({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<PlatformSettings>(API.ADMIN_SETTINGS)
      return data
    },
  })
}

export function useUpdatePlatformSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<PlatformSettings>) => {
      const { data } = await apiClient.patch<PlatformSettings>(API.ADMIN_SETTINGS, payload)
      return data
    },
    onSuccess: (data) => qc.setQueryData(['admin', 'settings'], data),
  })
}

// ─── Export de données ───────────────────────────────────────────────────────
export interface ExportableEntity {
  entity: string
  label: string
  count: number | null
}

export function useExportableEntities() {
  return useQuery<ExportableEntity[]>({
    queryKey: ['admin', 'export-list'],
    queryFn: async () => {
      const { data } = await apiClient.get<ExportableEntity[]>(API.ADMIN_EXPORT_LIST)
      return Array.isArray(data) ? data : []
    },
  })
}

/** Télécharge le CSV d'une entité via le navigateur (Blob authentifié). */
export async function downloadEntityCsv(entity: string): Promise<void> {
  const res = await apiClient.get(API.ADMIN_EXPORT_ENTITY(entity), { responseType: 'blob' })
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const disposition = res.headers?.['content-disposition'] as string | undefined
  const match = disposition?.match(/filename="?([^"]+)"?/)
  const a = document.createElement('a')
  a.href = url
  a.download = match?.[1] ?? `soslocal-${entity}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
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
