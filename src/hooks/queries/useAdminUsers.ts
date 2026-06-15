import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { normalizePhone } from '@/lib/utils/phone'
import type { User, UserRole, AccountStatus } from '@/types'

/** Mappe une réponse backend (UserResponse / technicien) vers le type User du front. */
function mapToUser(raw: any): User {
  return {
    id: raw.id,
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    name: raw.name ?? '',
    role: raw.role ?? 'client',
    avatar_url: raw.avatar_url ?? undefined,
    latitude: raw.latitude ?? undefined,
    longitude: raw.longitude ?? undefined,
    is_active: raw.is_active ?? true,
    is_online: raw.is_online ?? false,
    is_email_verified: raw.is_verified ?? raw.is_email_verified ?? false,
    is_phone_verified: raw.is_phone_verified ?? false,
    account_status: (raw.account_status as any) ?? (raw.is_active === false ? 'suspended' : 'active'),
    created_at: raw.created_at ?? new Date().toISOString(),
  }
}

export function useAdminUsers() {
  return useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      // Endpoint admin dédié : liste complète des utilisateurs (tous rôles).
      try {
        const { data } = await apiClient.get<any[]>(API.ADMIN_USERS)
        if (Array.isArray(data)) return data.map(mapToUser)
      } catch { /* repli ci-dessous si l'endpoint est momentanément indisponible */ }

      // Repli : au minimum la liste des techniciens + le compte courant.
      const results = await Promise.allSettled([
        apiClient.get<any[]>(API.ADMIN_TECHNICIANS_ALL),
        apiClient.get<any>(API.ME),
      ])
      const out: User[] = []
      if (results[0].status === 'fulfilled' && Array.isArray(results[0].value.data)) {
        out.push(...results[0].value.data.map(mapToUser))
      }
      if (results[1].status === 'fulfilled' && results[1].value.data?.id) {
        const me = mapToUser(results[1].value.data)
        if (!out.some((u) => u.id === me.id)) out.unshift(me)
      }
      return out
    },
  })
}

/** Le backend expose `GET /admin/users` : la liste complète est disponible. */
export const FULL_USER_LISTING_AVAILABLE = true

export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: UserRole }) => {
      const { data } = await apiClient.patch(API.ADMIN_USER_ROLE(id), { role })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useSetUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: AccountStatus }) => {
      const { data } = await apiClient.patch(API.ADMIN_USER_STATUS(id), { status })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

/** Met à jour un utilisateur (nom, email, téléphone, rôle) — admin. */
export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation<
    User,
    Error,
    { id: number; name?: string; email?: string; phone?: string; role?: UserRole }
  >({
    mutationFn: async ({ id, ...patch }) => {
      const body: Record<string, unknown> = { ...patch }
      if (typeof body.phone === 'string' && body.phone) body.phone = normalizePhone(body.phone)
      const { data } = await apiClient.patch(API.ADMIN_USER_BY_ID(id), body)
      return mapToUser(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

/** Supprime définitivement un utilisateur — admin. */
export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation<{ deleted: boolean; mode: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await apiClient.delete(API.ADMIN_USER_BY_ID(id))
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

/**
 * Crée un utilisateur — refuse côté client un téléphone déjà utilisé.
 * L'admin ne définit PAS de mot de passe : le backend applique un mot de
 * passe par défaut que le nouvel utilisateur changera lui-même. Le défaut
 * est renvoyé (`default_password`) pour pouvoir le communiquer.
 */
export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation<
    User & { default_password?: string },
    Error,
    { name: string; email: string; phone: string; role: UserRole; password?: string }
  >({
    mutationFn: async (payload) => {
      const canonical = normalizePhone(payload.phone)
      const body: Record<string, unknown> = { ...payload, phone: canonical }
      // Pas de mot de passe saisi → on laisse le backend appliquer le défaut.
      if (!payload.password) delete body.password
      const { data } = await apiClient.post<any>(API.ADMIN_USERS, body)
      return { ...mapToUser(data), default_password: data?.default_password }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}
