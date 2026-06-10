import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { formatGNF } from '@/lib/utils/format'

// ── Types (auparavant importés depuis mock-data, désormais autonomes) ──────
export interface OperatorStats {
  activeArtisans: number
  newArtisansThisMonth: number
  activeMissions: number
  monthRevenue: number
  monthRevenueLabel: string
  satisfaction: number
  totalReviews: number
  satisfactionTrend: number
}

export interface OperatorChartPoint {
  day: string
  missions: number
  revenus: number
}

export interface InterventionStatus {
  name: string
  value: number
  color: string
}

export interface OperatorActivity {
  id: number
  title: string
  sub: string
  time: string
  amount?: number | null
}

export interface OperatorAlert {
  id: number
  type: 'warning' | 'info' | 'success'
  title: string
  sub: string
  time: string
}

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
      const { data } = await apiClient.get<OperatorChartPoint[]>(API.OPERATOR_CHART)
      return Array.isArray(data) ? data : []
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useInterventionStatus() {
  return useQuery<InterventionStatus[]>({
    queryKey: ['operator', 'intervention-status'],
    queryFn: async () => {
      const { data } = await apiClient.get<InterventionStatus[]>(API.OPERATOR_STATS + '/interventions')
      return Array.isArray(data) ? data : []
    },
    staleTime: 1000 * 30,
  })
}

export function useOperatorActivity() {
  return useQuery<OperatorActivity[]>({
    queryKey: ['operator', 'activity'],
    queryFn: async () => {
      const { data } = await apiClient.get<OperatorActivity[]>(API.OPERATOR_ACTIVITY)
      return Array.isArray(data) ? data : []
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  })
}

export function useOperatorAlerts() {
  return useQuery<OperatorAlert[]>({
    queryKey: ['operator', 'alerts'],
    queryFn: async () => {
      const { data } = await apiClient.get<OperatorAlert[]>(API.OPERATOR_ALERTS)
      return Array.isArray(data) ? data : []
    },
    staleTime: 1000 * 20,
    refetchInterval: 1000 * 45,
  })
}

// ── Statistiques approfondies (page /operateur/statistiques) ───────────────
export interface OperatorStatistics {
  kpis: {
    total_missions: number
    new_users: number
    total_revenue: number
    total_revenue_label: string
    avg_rating: number
    total_reviews: number
  }
  top_services: { service: string; missions: number; ca: number }[]
  zones: { centre: string; missions: number; artisans: number }[]
  monthly_trend: { month: string; missions: number; newUsers: number }[]
  satisfaction: { metric: string; value: number }[]
}

const EMPTY_STATISTICS: OperatorStatistics = {
  kpis: { total_missions: 0, new_users: 0, total_revenue: 0, total_revenue_label: '0 GNF', avg_rating: 0, total_reviews: 0 },
  top_services: [],
  zones: [],
  monthly_trend: [],
  satisfaction: [],
}

export function useOperatorStatistics() {
  return useQuery<OperatorStatistics>({
    queryKey: ['operator', 'statistics'],
    queryFn: async () => {
      const { data } = await apiClient.get<OperatorStatistics>(API.OPERATOR_STATISTICS)
      return { ...EMPTY_STATISTICS, ...data }
    },
    staleTime: 1000 * 60 * 5,
  })
}
