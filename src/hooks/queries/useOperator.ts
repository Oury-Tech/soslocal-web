import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import {
  mockApi,
  type OperatorStats,
  type OperatorChartPoint,
  type OperatorActivity,
  type OperatorAlert,
  type InterventionStatus,
} from '@/lib/mock-data'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export function useOperatorStats() {
  return useQuery<OperatorStats>({
    queryKey: ['operator', 'stats'],
    queryFn: async () => {
      if (isMock) return mockApi.getOperatorStats()
      const { data } = await apiClient.get<OperatorStats>(API.OPERATOR_STATS)
      return data
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
