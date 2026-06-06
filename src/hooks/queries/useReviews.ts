import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import type { Review, CreateReviewData, UpdateReviewData } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

/** Avis reçus par un technicien (page publique / vue artisan). */
export function useTechnicianReviews(technicianId?: number | string) {
  return useQuery<Review[]>({
    queryKey: ['reviews', 'technician', technicianId],
    enabled: !!technicianId,
    queryFn: async () => {
      if (!technicianId) return []
      if (isMock) {
        const { REVIEWS } = await import('@/lib/mock-data')
        const all = REVIEWS as Review[]
        const matched = all.filter((r) => r.technician_id === Number(technicianId))
        return matched.length ? matched : all
      }
      const { data } = await apiClient.get<Review[]>(API.TECHNICIAN_REVIEWS(technicianId))
      return Array.isArray(data) ? data : []
    },
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 500))
        return { ok: true }
      }
      const { data: res } = await apiClient.post(API.REVIEWS, data)
      return res
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['technician'] })
    },
  })
}

/** Modifier un avis (fenêtre de 7 jours — cf. diagramme « Modifier avis (7 jours) »). */
export function useUpdateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateReviewData }) => {
      if (isMock) { await new Promise((r) => setTimeout(r, 400)); return { ok: true } }
      const { data: res } = await apiClient.patch(API.REVIEW_BY_ID(id), data)
      return res
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  })
}

/** Voter utile / pas utile. */
export function useVoteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, vote }: { id: number; vote: 'helpful' | 'not_helpful' }) => {
      if (isMock) { await new Promise((r) => setTimeout(r, 300)); return { ok: true } }
      const { data } = await apiClient.post(API.REVIEW_HELPFUL(id), { vote })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  })
}

/** Réponse du technicien à un avis. */
export function useRespondReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, response }: { id: number; response: string }) => {
      if (isMock) { await new Promise((r) => setTimeout(r, 400)); return { ok: true } }
      const { data } = await apiClient.post(API.REVIEW_RESPOND(id), { response })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  })
}

/** Signaler un avis abusif. */
export function useReportReview() {
  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      if (isMock) { await new Promise((r) => setTimeout(r, 400)); return { ok: true } }
      const { data } = await apiClient.post(API.REVIEW_REPORT(id), { reason })
      return data
    },
  })
}

/** Fenêtre d'édition de 7 jours à partir de la création. */
export function isReviewEditable(review: Pick<Review, 'created_at' | 'editable_until'>): boolean {
  const deadline = review.editable_until
    ? new Date(review.editable_until)
    : new Date(new Date(review.created_at).getTime() + 7 * 864e5)
  return Date.now() < deadline.getTime()
}
