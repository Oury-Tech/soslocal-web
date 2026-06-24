import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { useAuthStore } from '@/stores/auth.store'

export interface UploadedMedia {
  id: number
  url: string
  mime_type?: string
  size?: number
  filename?: string
}

/**
 * Upload générique d'un fichier image vers le stockage persistant (DB).
 * Retourne l'objet média avec une URL absolue réutilisable partout.
 */
export function useUploadMedia() {
  return useMutation<UploadedMedia, Error, File>({
    mutationFn: async (file) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await apiClient.post<UploadedMedia>(API.MEDIA_UPLOAD, form, {
        headers: { 'Content-Type': false }, // laisse le navigateur poser la boundary multipart
      })
      return data
    },
  })
}

/**
 * Upload de la photo de profil. Persiste l'image en base, met à jour
 * `avatar_url` côté serveur ET dans le store d'authentification local.
 */
export function useUploadAvatar() {
  const { user, setUser } = useAuthStore()
  return useMutation<{ avatar_url: string }, Error, File>({
    mutationFn: async (file) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await apiClient.post<{ avatar_url: string }>(API.USER_AVATAR, form, {
        headers: { 'Content-Type': false }, // laisse le navigateur poser la boundary multipart
      })
      return data
    },
    onSuccess: (data) => {
      if (user && data?.avatar_url) {
        setUser({ ...user, avatar_url: data.avatar_url })
      }
    },
  })
}
