import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi, SERVICES as MOCK_SERVICES } from '@/lib/mock-data'
import type { Service } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

function resolveIcon(name: string): string {
  const match = MOCK_SERVICES.find(
    (m) =>
      m.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(m.name.toLowerCase())
  )
  return match?.icon ?? '🔧'
}

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (isMock) return mockApi.getServices()
      const { data } = await apiClient.get<any[]>(API.SERVICES)
      const list = Array.isArray(data) ? data : []

      // Si la DB est vide, utiliser les services mock en fallback
      if (list.length === 0) return MOCK_SERVICES

      // Mapper les champs backend → type Service frontend
      return list.map((s): Service => ({
        id: s.id,
        name: s.name,
        slug: s.slug ?? s.name.toLowerCase().replace(/\s+/g, '-'),
        description: s.description,
        category: s.category,
        // Backend renvoie icon_url (URL image), le frontend attend icon (emoji)
        icon: resolveIcon(s.name),
        color: s.color,
        estimated_price_min: s.estimated_price_min,
        estimated_price_max: s.estimated_price_max,
        average_duration: s.average_duration,
        is_emergency: s.is_emergency ?? false,
        is_active: s.is_active ?? true,
      }))
    },
    staleTime: 1000 * 60 * 10,
  })
}