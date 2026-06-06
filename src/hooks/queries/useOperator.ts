import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { formatGNF } from '@/lib/utils/format'
import {
  mockApi,
  type OperatorStats,
  type OperatorChartPoint,
  type OperatorActivity,
  type OperatorAlert,
  type InterventionStatus,
} from '@/lib/mock-data'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

const num = (...vals: any[]): number => {
  for (const v of vals) {
    const n = typeof v === 'string' ? parseFloat(v) : v
    if (typeof n === 'number' && !isNaN(n)) return n
  }
  return 0
}

/** Normalise la réponse backend (variantes snake_case + valeurs par défaut). */
function normalizeStats(raw: any): OperatorStats {
  const data = raw ?? {}
  const monthRevenue = num(data.monthRevenue, data.month_revenue, data.revenue_month, data.ca_month)
  return {
    activeArtisans: num(data.activeArtisans, data.active_artisans, data.active_technicians),
    newArtisansThisMonth: num(data.newArtisansThisMonth, data.new_artisans_this_month, data.new_artisans),
    activeMissions: num(data.activeMissions, data.active_missions, data.active_requests),
    monthRevenue,
    monthRevenueLabel: data.monthRevenueLabel ?? data.month_revenue_label ?? formatGNF(monthRevenue),
    satisfaction: num(data.satisfaction, data.avg_rating, data.average_rating),
    totalReviews: num(data.totalReviews, data.total_reviews, data.reviews_count),
    satisfactionTrend: num(data.satisfactionTrend, data.satisfaction_trend),
  }
}

export function useOperatorStats() {
  return useQuery<OperatorStats>({
    queryKey: ['operator', 'stats'],
    queryFn: async () => {
      if (isMock) return mockApi.getOperatorStats()
      const { data } = await apiClient.get(API.OPERATOR_STATS)
      return normalizeStats(data)
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  })
}

export function useOperatorChart() {
  return useQuery<OperatorChartPoint[]>({
    queryKey: ['operator', 'chart'],
    queryFn: async () => {
      if (isMock) return mockApi.getOperatorChart()
      const { data } = await apiClient.get<OperatorChartPoint[]>(API.OPERATOR_CHART)
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useInterventionStatus() {
  return useQuery<InterventionStatus[]>({
    queryKey: ['operator', 'intervention-status'],
    queryFn: async () => {
      if (isMock) return mockApi.getInterventionStatus()
      const { data } = await apiClient.get<InterventionStatus[]>(API.OPERATOR_STATS + '/interventions')
      return data
    },
    staleTime: 1000 * 30,
  })
}

export function useOperatorActivity() {
  return useQuery<OperatorActivity[]>({
    queryKey: ['operator', 'activity'],
    queryFn: async () => {
      if (isMock) return mockApi.getOperatorActivity()
      const { data } = await apiClient.get<OperatorActivity[]>(API.OPERATOR_ACTIVITY)
      return data
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  })
}

export function useOperatorAlerts() {
  return useQuery<OperatorAlert[]>({
    queryKey: ['operator', 'alerts'],
    queryFn: async () => {
      if (isMock) return mockApi.getOperatorAlerts()
      const { data } = await apiClient.get<OperatorAlert[]>(API.OPERATOR_ALERTS)
      return data
    },
    staleTime: 1000 * 20,
    refetchInterval: 1000 * 45,
  })
}
