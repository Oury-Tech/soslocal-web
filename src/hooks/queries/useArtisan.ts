import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import {
  mockApi,
  type ArtisanStats,
  type EarningDay,
  type EarningMonth,
  type Payout,
  type PendingMission,
} from '@/lib/mock-data'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export function useArtisanStats() {
  return useQuery<ArtisanStats>({
    queryKey: ['artisan', 'stats'],
    queryFn: async () => {
      if (isMock) return mockApi.getArtisanStats()
      const { data } = await apiClient.get<ArtisanStats>(API.ARTISAN_STATS)
      return data
    },
    staleTime: 1000 * 30,
  })
}

export function useArtisanWeekEarnings() {
  return useQuery<EarningDay[]>({
    queryKey: ['artisan', 'earnings', 'week'],
    queryFn: async () => {
      if (isMock) return mockApi.getArtisanWeekEarnings()
      const { data } = await apiClient.get<EarningDay[]>(API.ARTISAN_EARNINGS, {
        params: { period: 'week' },
      })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useArtisanMonthEarnings() {
  return useQuery<EarningMonth[]>({
    queryKey: ['artisan', 'earnings', 'month'],
    queryFn: async () => {
      if (isMock) return mockApi.getArtisanMonthEarnings()
      const { data } = await apiClient.get<EarningMonth[]>(API.ARTISAN_EARNINGS, {
        params: { period: 'month' },
      })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useArtisanPayouts() {
  return useQuery<Payout[]>({
    queryKey: ['artisan', 'payouts'],
    queryFn: async () => {
      if (isMock) return mockApi.getArtisanPayouts()
      const { data } = await apiClient.get<Payout[]>(API.ARTISAN_PAYOUTS)
      return data
    },
    staleTime: 1000 * 60 * 2,
  })
}

export function usePendingMissions() {
  return useQuery<PendingMission[]>({
    queryKey: ['artisan', 'pending-missions'],
    queryFn: async () => {
      if (isMock) return mockApi.getPendingMissions()
      const { data } = await apiClient.get<PendingMission[]>(API.ARTISAN_MISSIONS, {
        params: { status: 'pending' },
      })
      return data
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  })
}
