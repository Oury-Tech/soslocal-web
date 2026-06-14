import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi } from '@/lib/mock-data'
import type { ServiceRequest, CreateRequestData } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

/** Statuts terminaux : plus aucune transition attendue → on arrête de poller. */
const TERMINAL_STATUSES = ['completed', 'cancelled', 'rejected', 'expired']

/**
 * Intervalle de rafraîchissement adaptatif pour le suivi d'une demande.
 * - Tant que la demande est « en mouvement » (recherche d'artisan, intervention…)
 *   on poll vite (10 s) pour réduire le ressenti d'attente.
 * - Une fois la demande terminée (et payée), on coupe le polling.
 */
function requestRefetchInterval(req?: ServiceRequest | null): number | false {
  if (!req) return 10_000
  if (TERMINAL_STATUSES.includes(req.status)) {
    // Demande terminée : on garde un dernier poll seulement tant que le
    // paiement n'est pas réglé (l'artisan peut encore fixer le montant).
    return req.is_paid ? false : 20_000
  }
  return 10_000
}

export function useRequests() {
  return useQuery<ServiceRequest[]>({
    queryKey: ['requests'],
    queryFn: async () => {
      if (isMock) return mockApi.getRequests()
      const { data } = await apiClient.get<ServiceRequest[]>(API.REQUESTS)
      return Array.isArray(data) ? data : []
    },
  })
}

/** Missions assignées à l'artisan connecté */
export function useMyJobs(statusFilter?: string[]) {
  return useQuery<ServiceRequest[]>({
    queryKey: ['requests', 'my-jobs', statusFilter],
    queryFn: async () => {
      if (isMock) {
        const all = await mockApi.getRequests()
        return all.filter((r) =>
          ['accepted', 'in_progress', 'completed', 'cancelled'].includes(r.status)
        )
      }
      const params: Record<string, any> = {}
      if (statusFilter?.length) params.status = statusFilter
      const { data } = await apiClient.get<ServiceRequest[]>(API.REQUESTS_MY_JOBS, { params })
      return Array.isArray(data) ? data : []
    },
  })
}

export function useRequest(id?: number | string) {
  return useQuery<ServiceRequest | null>({
    queryKey: ['requests', id],
    enabled: !!id,
    refetchInterval: (query) => requestRefetchInterval(query.state.data),
    queryFn: async () => {
      if (!id) return null
      if (isMock) return mockApi.getRequest(Number(id))
      const { data } = await apiClient.get<ServiceRequest>(API.REQUEST_BY_ID(id))
      return data
    },
  })
}

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateRequestData) => {
      if (isMock) return mockApi.createRequest(data)
      const res = await apiClient.post<ServiceRequest>(API.REQUESTS, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}

/**
 * L'artisan accepte la demande ET fixe son prix dans le même geste.
 * Le prix est désormais fixé à l'acceptation (plus à la fin du travail).
 */
export function useAcceptRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, finalPrice }: { id: number; finalPrice?: number }) => {
      if (isMock) return { ok: true }
      const body = finalPrice != null ? { final_price: finalPrice } : {}
      const res = await apiClient.post(API.REQUEST_ACCEPT(id), body)
      return res.data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['requests', vars.id] })
      qc.invalidateQueries({ queryKey: ['artisan', 'pending-missions'] })
      qc.invalidateQueries({ queryKey: ['artisan', 'stats'] })
    },
  })
}

export function useStartRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      if (isMock) return { ok: true }
      const res = await apiClient.post(API.REQUEST_START(id))
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['artisan', 'stats'] })
    },
  })
}

export function useCompleteRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, finalPrice }: { id: number; finalPrice?: number }) => {
      if (isMock) return { ok: true }
      const body = finalPrice != null ? { final_price: finalPrice } : {}
      const res = await apiClient.post(API.REQUEST_COMPLETE(id), body)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['artisan', 'stats'] })
    },
  })
}

/**
 * L'artisan fixe / renégocie le montant à régler APRÈS la mission.
 * Le prix n'est jamais imposé à la création.
 */
export function useSetFinalPrice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, finalPrice, note }: { id: number; finalPrice: number; note?: string }) => {
      if (isMock) return { ok: true }
      const res = await apiClient.post(API.REQUEST_SET_PRICE(id), {
        final_price: finalPrice,
        note,
      })
      return res.data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['requests', vars.id] })
      qc.invalidateQueries({ queryKey: ['artisan', 'stats'] })
    },
  })
}

/**
 * Le client fait une contre-proposition de prix à l'artisan
 * (négociation bidirectionnelle). N'écrase pas le prix final tant que
 * l'artisan ne l'a pas re-validé via useSetFinalPrice.
 */
export function useProposePrice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, proposedPrice, note }: { id: number; proposedPrice: number; note?: string }) => {
      if (isMock) return { ok: true }
      const res = await apiClient.post(API.REQUEST_PROPOSE_PRICE(id), {
        proposed_price: proposedPrice,
        note,
      })
      return res.data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['requests', vars.id] })
    },
  })
}

/**
 * Suppression définitive d'une demande (propriétaire ou admin).
 * Le backend interdit la suppression d'une demande ACTIVE (acceptée/en cours) :
 * il faut d'abord l'annuler. Permet de nettoyer la liste quand elle est longue.
 */
export function useDeleteRequest() {
  const qc = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      if (isMock) return
      await apiClient.delete(API.REQUEST_BY_ID(id))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}

export function useCancelRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      reason = "Annulé par l'utilisateur",
    }: {
      id: number
      reason?: string
    }) => {
      if (isMock) return { ok: true }
      const res = await apiClient.post(API.REQUEST_CANCEL(id), {
        cancellation_reason: reason,
      })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
    },
  })
}
