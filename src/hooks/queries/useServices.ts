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
      try {
        const { data } = await apiClient.get<any[]>(API.SERVICES)
        const list = Array.isArray(data) ? data : []
        if (list.length === 0) return MOCK_SERVICES
        return list.map((s): Service => ({
          id: s.id,
          name: s.name,
          slug: s.slug ?? s.name.toLowerCase().replace(/\s+/g, '-'),
          description: s.description,
          short_description: s.short_description,
          category: s.category,
          icon: resolveIcon(s.name),
          color: s.color,
          estimated_price_min: s.estimated_price_min,
          estimated_price_max: s.estimated_price_max,
          average_duration: s.average_duration,
          is_emergency: s.is_emergency ?? false,
          is_active: s.is_active ?? true,
          is_featured: s.is_featured ?? false,
          popularity_score: s.popularity_score ?? 0,
          total_requests: s.total_requests ?? 0,
          total_completed: s.total_completed ?? 0,
          average_rating: typeof s.average_rating === 'number' ? s.average_rating : undefined,
        }))
      } catch {
        return MOCK_SERVICES
      }
    },
    staleTime: 1000 * 60 * 10,
  })
}