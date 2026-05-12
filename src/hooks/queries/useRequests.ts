import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi } from '@/lib/mock-data'
import type { ServiceRequest, CreateRequestData } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: async (): Promise<ServiceRequest[]> => {
      if (isMock) return mockApi.getRequests()
      const { data } = await apiClient.get<ServiceRequest[]>(API.REQUESTS)
      return data
    },
  })
}

export function useRequest(id: number | string | undefined) {
  return useQuery({
    queryKey: ['requests', id],
    queryFn: async () => {
      if (!id) return null
      if (isMock) return mockApi.getRequest(Number(id))
      const { data } = await apiClient.get<ServiceRequest>(API.REQUEST_BY_ID(id))
      return data
    },
    enabled: !!id,
  })
}

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateRequestData): Promise<ServiceRequest> => {
      if (isMock) return mockApi.createRequest(data)
      const { data: result } = await apiClient.post<ServiceRequest>(API.REQUESTS, data)
      return result
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
      if (isMock) {
        await new Promise((r) => setTimeout(r, 500))
        return { ok: true }
      }
      const { data } = await apiClient.post(API.REQUEST_ACCEPT(id))
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

export function useCancelRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 400))
        return { ok: true }
      }
      const { data } = await apiClient.post(API.REQUEST_CANCEL(id))
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}
