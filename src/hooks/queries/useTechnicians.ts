import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import type { Technician } from '@/types'

/* Handles both plain arrays and paginated/wrapped responses */
function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data
  if (data?.results && Array.isArray(data.results)) return data.results
  if (data?.technicians && Array.isArray(data.technicians)) return data.technicians
  if (data?.data && Array.isArray(data.data)) return data.data
  return []
}

/*
 * FastAPI TechnicianProfileResponse does NOT include name/phone/avatar —
 * those live on the User model. NearbyTechnician DOES include name/phone.
 * After enrichment, the merged object contains all fields needed.
 */
async function enrichWithUserData(t: any): Promise<any> {
  if (t.name || !t.user_id) return t // NearbyTechnician already has name
  try {
    const { data: user } = await apiClient.get(API.USER_BY_ID(t.user_id))
    return {
      ...t,
      name:       user.name,
      email:      user.email,
      phone:      user.phone,
      avatar_url: user.avatar_url,
      latitude:   user.latitude,
      longitude:  user.longitude,
      is_online:  user.is_online,
      is_active:  user.is_active,
    }
  } catch {
    return t
  }
}

function normalizeTechnician(t: any): Technician {
  /* Services proviennent uniquement de l'API (aucune donnée fictive). */
  const resolvedServices: any[] = Array.isArray(t.services) && t.services.length > 0 ? t.services : []
  const professionFromServices = resolvedServices[0]?.name ?? null
  const rawProfession = t.profession ?? t.specialty ?? t.service_name ?? null
  const finalProfession = rawProfession || professionFromServices || null

  return {
    // NearbyTechnician has user_id (no id); TechnicianProfileResponse has both
    id:                  t.user_id ?? t.id,
    email:               t.email ?? '',
    phone:               t.phone,
    name:                t.name ?? t.full_name ?? (t.email ? t.email.split('@')[0] : 'Artisan'),
    role:                'technician',
    avatar_url:          t.avatar_url ?? t.profile_picture,
    latitude:            t.latitude,
    longitude:           t.longitude,
    is_active:           t.is_active ?? true,
    is_online:           t.is_online ?? false,
    is_email_verified:   t.is_email_verified ?? false,
    is_phone_verified:   t.is_phone_verified ?? false,
    created_at:          t.created_at ?? new Date().toISOString(),
    profession:          finalProfession,
    bio:                 t.bio,
    rating:              typeof t.rating === 'number' ? t.rating : 0,
    total_reviews:       t.total_reviews ?? t.reviews_count ?? 0,
    total_jobs_completed: t.total_jobs_completed ?? t.completed_jobs ?? 0,
    completion_rate:     t.completion_rate ?? 0,
    is_available:        t.is_available ?? true,
    is_verified:         t.is_verified ?? false,
    max_distance_km:     t.max_distance_km,
    hourly_rate:         t.hourly_rate,
    distance_km:         t.distance_km,
    services:            resolvedServices,
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
      /* 1. Service-specific endpoint when a filter is active */
      if (serviceId) {
        const { data } = await apiClient.get(API.SERVICE_TECHNICIANS(serviceId))
        const raw = extractArray(data)
        if (raw.length > 0) {
          const enriched = await Promise.all(raw.map(enrichWithUserData))
          return enriched.map(normalizeTechnician)
        }
      }

      /* 2. Nearby (returns NearbyTechnician — already has name/phone) */
      const { data } = await apiClient.get(API.TECHNICIANS_NEARBY, {
        params: { latitude: lat, longitude: lng, service_id: serviceId, radius_km: 50 },
      })
      const nearbyRaw = extractArray(data)
      if (nearbyRaw.length > 0) return nearbyRaw.map(normalizeTechnician)

      /* 3. All technicians — enrich each with GET /users/{user_id} */
      const { data: allData } = await apiClient.get(API.TECHNICIANS + '/')
      const allRaw = extractArray(allData)
      const enriched = await Promise.all(allRaw.map(enrichWithUserData))
      const normalized = enriched.map(normalizeTechnician)
      return serviceId
        ? normalized.filter((t) => t.services?.some((s: any) => s.id === serviceId))
        : normalized
    },
  })
}

export function useAllTechnicians() {
  return useQuery<Technician[]>({
    queryKey: ['technicians', 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get(API.TECHNICIANS + '/')
      const raw = extractArray(data)
      if (raw.length === 0) return []
      const enriched = await Promise.all(raw.map(enrichWithUserData))
      return enriched.map(normalizeTechnician)
    },
  })
}

/** Admin only — returns ALL technician users with or without a profile */
export function useAdminTechnicians() {
  return useQuery<Technician[]>({
    queryKey: ['technicians', 'admin', 'all'],
    retry: 1,
    queryFn: async () => {
      const { data } = await apiClient.get(API.ADMIN_TECHNICIANS_ALL)
      const raw = extractArray(data)
      return raw.map(normalizeTechnician)
    },
  })
}

export function useTechnician(id: number | string | undefined) {
  return useQuery<Technician | null>({
    queryKey: ['technician', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null
      try {
        /* Try technician profile endpoint first */
        const { data } = await apiClient.get<any>(API.TECHNICIAN_BY_ID(id))
        if (!data) throw new Error('empty')
        const enriched = await enrichWithUserData(data)
        return normalizeTechnician(enriched)
      } catch {
        /* Fall back: try user endpoint directly */
        try {
          const { data: userData } = await apiClient.get(API.USER_BY_ID(id))
          if (userData?.name) return normalizeTechnician({ ...userData, user_id: userData.id })
        } catch { /* ignore */ }
        return null
      }
    },
  })
}
