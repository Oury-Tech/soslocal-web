import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import {
  mockApi,
  SERVICES,
  type ArtisanStats,
  type EarningDay,
  type EarningMonth,
  type Payout,
  type PendingMission,
} from '@/lib/mock-data'
import { getInitials } from '@/lib/utils/format'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

function serviceIcon(name?: string): string {
  if (!name) return '🔧'
  const s = SERVICES.find(
    (sv) =>
      sv.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(sv.name.toLowerCase())
  )
  return s?.icon ?? '🔧'
}

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Il y a ${hrs}h`
  return `Il y a ${Math.floor(hrs / 24)}j`
}

function toPendingMission(req: any): PendingMission {
  return {
    id: req.id,
    ref: req.reference_number ?? `SOS-${req.id}`,
    title: req.title ?? 'Mission sans titre',
    client: {
      name: req.client_name ?? req.client?.name ?? 'Client',
      avatar: getInitials(req.client_name ?? req.client?.name ?? 'C'),
    },
    address: req.address ?? '',
    distance: req.distance_km ?? 0,
    priority: req.priority ?? 'normal',
    price: req.estimated_price ?? 0,
    time: relativeTime(req.created_at),
    service_icon: serviceIcon(req.service_name ?? req.service?.name),
    service_name: req.service_name ?? req.service?.name,
  }
}

export function useArtisanStats() {
  return useQuery<ArtisanStats>({
    queryKey: ['artisan', 'stats'],
    queryFn: async () => {
      if (isMock) return mockApi.getArtisanStats()
      const { data } = await apiClient.get(API.ARTISAN_STATS)
      return {
        todayEarnings: 0,
        weekEarnings: 0,
        monthEarnings: data.total_earnings ?? 0,
        rating: data.rating ?? 0,
        totalReviews: data.total_reviews ?? 0,
        completionRate: data.completion_rate ?? 0,
        pendingMissions: data.pending_requests ?? 0,
        completedToday: data.total_jobs_completed ?? 0,
        isAvailable: data.is_available ?? true,
      } satisfies ArtisanStats
    },
    staleTime: 1000 * 30,
  })
}

export function useArtisanWeekEarnings() {
  return useQuery<EarningDay[]>({
    queryKey: ['artisan', 'earnings', 'week'],
    queryFn: async () => {
      if (isMock) return mockApi.getArtisanWeekEarnings()
      try {
        const { data } = await apiClient.get<EarningDay[]>(API.ARTISAN_EARNINGS, {
          params: { period: 'week' },
        })
        return Array.isArray(data) ? data : []
      } catch {
        return []
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useArtisanMonthEarnings() {
  return useQuery<EarningMonth[]>({
    queryKey: ['artisan', 'earnings', 'month'],
    queryFn: async () => {
      if (isMock) return mockApi.getArtisanMonthEarnings()
      try {
        const { data } = await apiClient.get<EarningMonth[]>(API.ARTISAN_EARNINGS, {
          params: { period: 'month' },
        })
        return Array.isArray(data) ? data : []
      } catch {
        return []
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useArtisanPayouts() {
  return useQuery<Payout[]>({
    queryKey: ['artisan', 'payouts'],
    queryFn: async () => {
      if (isMock) return mockApi.getArtisanPayouts()
      try {
        const { data } = await apiClient.get<Payout[]>(API.ARTISAN_PAYOUTS)
        return Array.isArray(data) ? data : []
      } catch {
        return []
      }
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function usePendingMissions() {
  return useQuery<PendingMission[]>({
    queryKey: ['artisan', 'pending-missions'],
    queryFn: async () => {
      if (isMock) return mockApi.getPendingMissions()
      const { data } = await apiClient.get<any[]>(API.ARTISAN_MISSIONS)
      const list = Array.isArray(data) ? data : []
      return list.map(toPendingMission)
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  })
}
