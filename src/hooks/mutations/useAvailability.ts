import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi } from '@/lib/mock-data'
import { toast } from 'sonner'
import type { ArtisanStats } from '@/lib/mock-data'

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

    // Mise à jour optimiste : l'UI réagit instantanément avant la réponse réseau
    onMutate: async (available: boolean) => {
      await qc.cancelQueries({ queryKey: ['artisan', 'stats'] })
      const previous = qc.getQueryData<ArtisanStats>(['artisan', 'stats'])
      qc.setQueryData<ArtisanStats>(['artisan', 'stats'], (old) =>
        old ? { ...old, isAvailable: available } : old
      )
      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(['artisan', 'stats'], context.previous)
      }
      toast.error('Impossible de modifier votre disponibilité.')
    },

    onSuccess: (data) => {
      toast.success(
        data.is_available
          ? 'Vous êtes maintenant disponible.'
          : 'Vous êtes passé hors ligne.'
      )
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['artisan', 'stats'] })
    },
  })
}
