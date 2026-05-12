import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi } from '@/lib/mock-data'
import type { Service } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (isMock) return mockApi.getServices()
      const { data } = await apiClient.get<Service[]>(API.SERVICES)
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}