import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi } from '@/lib/mock-data'
import { toast } from 'sonner'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export function useToggleAvailability() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (available: boolean) => {
      if (isMock) return mockApi.toggleAvailability(available)
      const { data } = await apiClient.patch<{ is_available: boolean }>(
        API.ARTISAN_AVAILABILITY,
        { is_available: available }
      )
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['artisan', 'stats'] })
      toast.success(
        data.is_available
          ? 'Vous êtes maintenant disponible pour des missions.'
          : 'Vous êtes passé hors ligne.'
      )
    },
    onError: () => {
      toast.error('Impossible de modifier votre disponibilité.')
    },
  })
}
