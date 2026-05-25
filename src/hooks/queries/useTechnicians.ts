import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi, TECHNICIANS as MOCK_TECHNICIANS, SERVICES as MOCK_SERVICES } from '@/lib/mock-data'
import type { Technician } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

function normalizeTechnician(t: any): Technician {
  const matchedService = MOCK_SERVICES.find(
    (s) =>
      t.service_name &&
      (s.name.toLowerCase().includes(t.service_name.toLowerCase()) ||
        t.service_name.toLowerCase().includes(s.name.toLowerCase()))
  )
  return {
    id: t.id,
    email: t.email ?? '',
    phone: t.phone,
    name: t.name ?? t.full_name ?? 'Artisan',
    role: 'technician',
    avatar_url: t.avatar_url ?? t.profile_picture,
    latitude: t.latitude,
    longitude: t.longitude,
    is_active: t.is_active ?? true,
    is_online: t.is_online ?? false,
    is_email_verified: t.is_email_verified ?? false,
    is_phone_verified: t.is_phone_verified ?? false,
    created_at: t.created_at ?? new Date().toISOString(),
    profession: t.profession ?? t.specialty ?? t.service_name ?? 'Artisan',
    bio: t.bio,
    rating: typeof t.rating === 'number' ? t.rating : 0,
    total_reviews: t.total_reviews ?? t.reviews_count ?? 0,
    total_jobs_completed: t.total_jobs_completed ?? t.completed_jobs ?? 0,
    completion_rate: t.completion_rate ?? 0,
    is_available: t.is_available ?? false,
    is_verified: t.is_verified ?? false,
    max_distance_km: t.max_distance_km,
    hourly_rate: t.hourly_rate,
    distance_km: t.distance_km,
    services: t.services ?? (matchedService ? [matchedService] : []),
  } as Technician & { distance_km?: number }
}

export function useNearbyTechnicians(
  lat?: number,
  lng?: number,
  serviceId?: number
) {
  return useQuery<Technician[]>({
    queryKey: ['technicians', 'nearby', lat, lng, serviceId],
    enabled: lat !== undefined && lng !== undefined,
    queryFn: async () => {
      if (isMock) return mockApi.getNearbyTechnicians(lat, lng, serviceId)

      try {
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

        const raw: any[] = Array.isArray(data)
          ? data
          : (data?.technicians ?? data?.results ?? [])

        if (raw.length === 0) {
          /* Backend vide → afficher les mock disponibles */
          const fallback = serviceId
            ? MOCK_TECHNICIANS.filter((t) =>
                t.is_available && t.services?.some((s) => s.id === serviceId)
              )
            : MOCK_TECHNICIANS.filter((t) => t.is_available)
          return fallback
        }

        return raw.map(normalizeTechnician)
      } catch {
        /* Erreur réseau → mock complet */
        const fallback = serviceId
          ? MOCK_TECHNICIANS.filter((t) =>
              t.is_available && t.services?.some((s) => s.id === serviceId)
            )
          : MOCK_TECHNICIANS.filter((t) => t.is_available)
        return fallback
      }
    },
  })
}

export function useAllTechnicians() {
  return useQuery<Technician[]>({
    queryKey: ['technicians', 'all'],
    queryFn: async () => {
      if (isMock) return mockApi.getNearbyTechnicians()

      try {
        const { data } = await apiClient.get<any[]>(API.TECHNICIANS)
        const raw = Array.isArray(data) ? data : []
        if (raw.length === 0) return MOCK_TECHNICIANS
        return raw.map(normalizeTechnician)
      } catch {
        return MOCK_TECHNICIANS
      }
    },
  })
}

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

      try {
        const { data } = await apiClient.get<any>(
          API.TECHNICIAN_BY_ID(id)
        )
        if (!data) throw new Error('empty')
        return normalizeTechnician(data)
      } catch {
        return MOCK_TECHNICIANS.find((t) => t.id === Number(id)) ?? null
      }
    },
  })
}
