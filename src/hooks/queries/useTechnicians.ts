import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi } from '@/lib/mock-data'
import type { Technician } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export function useNearbyTechnicians(lat?: number, lng?: number, serviceId?: number) {
  return useQuery({
    queryKey: ['technicians', 'nearby', lat, lng, serviceId],
    queryFn: async (): Promise<Technician[]> => {
      if (isMock) return mockApi.getNearbyTechnicians(lat, lng)
      const { data } = await apiClient.get<Technician[]>(API.TECHNICIANS_NEARBY, {
        params: { latitude: lat, longitude: lng, service_id: serviceId },
      })
      return data
    },
    enabled: lat !== undefined && lng !== undefined,
  })
}

export function useAllTechnicians() {
  return useQuery({
    queryKey: ['technicians', 'all'],
    queryFn: async (): Promise<Technician[]> => {
      if (isMock) return mockApi.getNearbyTechnicians()
      const { data } = await apiClient.get<Technician[]>(API.TECHNICIANS)
      return data
    },
  })
}
