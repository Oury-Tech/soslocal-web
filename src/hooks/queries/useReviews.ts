import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi } from '@/lib/mock-data'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export function useCreateReview() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      request_id: number
      technician_id: number
      rating: number
      comment: string
    }) => {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 500))
        return { ok: true }
      }

      const { data: res } = await apiClient.post(API.REVIEWS, data)
      return res
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['technician'] })
    },
  })
}