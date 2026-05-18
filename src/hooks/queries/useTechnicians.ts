import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi } from '@/lib/mock-data'
import type { Technician } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export function useNearbyTechnicians(
  lat?: number,
  lng?: number,
  serviceId?: number
) {
  return useQuery<Technician[]>({
    queryKey: ['technicians', 'nearby', lat, lng, serviceId],
    enabled: lat !== undefined && lng !== undefined,
    queryFn: async () => {
      if (isMock) return mockApi.getNearbyTechnicians(lat, lng)

      const { data } = await apiClient.get(
        API.TECHNICIANS_NEARBY,
        {
          params: {
            latitude: lat,
            longitude: lng,
            service_id: serviceId,
          },
        }
      )

      // Backend returns { technicians: [...], total: N } or plain array
      return Array.isArray(data) ? data : (data.technicians ?? [])
    },
  })
}

export function useAllTechnicians() {
  return useQuery<Technician[]>({
    queryKey: ['technicians', 'all'],
    queryFn: async () => {
      if (isMock) return mockApi.getNearbyTechnicians()

      const { data } = await apiClient.get<Technician[]>(API.TECHNICIANS)
      return data
    },
  })
}

/**
 * ✅ FIX IMPORTANT
 * Ajout manquant pour corriger ton erreur build
 */
export function useTechnician(id: number | string | undefined) {
  return useQuery<Technician | null>({
    queryKey: ['technician', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null

      if (isMock) {
        const list = await mockApi.getNearbyTechnicians()
        return list.find((t: any) => t.id === Number(id)) ?? null
      }

      const { data } = await apiClient.get<Technician>(
        API.TECHNICIAN_BY_ID(id)
      )

      return data
    },
  })
}