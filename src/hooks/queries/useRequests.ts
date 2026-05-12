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
      return data
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
      const { data } = await apiClient.get<ServiceRequest>(
        API.REQUEST_BY_ID(id)
      )
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
    },
  })
}

export function useCancelRequest() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      if (isMock) return { ok: true }

      const res = await apiClient.post(API.REQUEST_CANCEL(id))
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}