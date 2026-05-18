import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi } from '@/lib/mock-data'
import type { ServiceRequest, CreateRequestData } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export function useRequests() {
  return useQuery<ServiceRequest[]>({
    queryKey: ['requests'],
    queryFn: async () => {
      if (isMock) return mockApi.getRequests()
      const { data } = await apiClient.get<ServiceRequest[]>(API.REQUESTS)
      return Array.isArray(data) ? data : []
    },
  })
}

/** Missions assignées à l'artisan connecté */
export function useMyJobs(statusFilter?: string[]) {
  return useQuery<ServiceRequest[]>({
    queryKey: ['requests', 'my-jobs', statusFilter],
    queryFn: async () => {
      if (isMock) {
        const all = await mockApi.getRequests()
        return all.filter((r) =>
          ['accepted', 'in_progress', 'completed', 'cancelled'].includes(r.status)
        )
      }
      const params: Record<string, any> = {}
      if (statusFilter?.length) params.status = statusFilter
      const { data } = await apiClient.get<ServiceRequest[]>(API.REQUESTS_MY_JOBS, { params })
      return Array.isArray(data) ? data : []
    },
  })
}

export function useRequest(id?: number | string) {
  return useQuery<ServiceRequest | null>({
    queryKey: ['requests', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null
      if (isMock) return mockApi.getRequest(Number(id))
      const { data } = await apiClient.get<ServiceRequest>(API.REQUEST_BY_ID(id))
      return data
    },
  })
}

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateRequestData) => {
      if (isMock) return mockApi.createRequest(data)
      const res = await apiClient.post<ServiceRequest>(API.REQUESTS, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

export function useAcceptRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      if (isMock) return { ok: true }
      const res = await apiClient.post(API.REQUEST_ACCEPT(id))
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['artisan', 'pending-missions'] })
      qc.invalidateQueries({ queryKey: ['artisan', 'stats'] })
    },
  })
}

export function useStartRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      if (isMock) return { ok: true }
      const res = await apiClient.post(API.REQUEST_START(id))
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['artisan', 'stats'] })
    },
  })
}

export function useCompleteRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, finalPrice }: { id: number; finalPrice?: number }) => {
      if (isMock) return { ok: true }
      const body = finalPrice != null ? { final_price: finalPrice } : {}
      const res = await apiClient.post(API.REQUEST_COMPLETE(id), body)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['artisan', 'stats'] })
    },
  })
}

export function useCancelRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      reason = "Annulé par l'utilisateur",
    }: {
      id: number
      reason?: string
    }) => {
      if (isMock) return { ok: true }
      const res = await apiClient.post(API.REQUEST_CANCEL(id), {
        cancellation_reason: reason,
      })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}
