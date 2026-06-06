import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { normalizePhone } from '@/lib/utils/phone'
import type { User, UserRole, AccountStatus } from '@/types'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

// ── Jeu de données mock (inclut volontairement un doublon de téléphone
//    pour illustrer la détection) ─────────────────────────────────────
const now = () => new Date().toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 864e5).toISOString()

const mockUsers: User[] = [
  { id: 1,  name: 'Mamadou Oury Diallo', email: 'mamadou@example.com', phone: '+224627306060', role: 'client',     is_active: true,  is_online: true,  is_email_verified: true,  is_phone_verified: true,  account_status: 'active',    created_at: daysAgo(40) },
  { id: 2,  name: 'Aïssatou Barry',       email: 'aissatou@example.com', phone: '+224620111213', role: 'client',     is_active: true,  is_online: false, is_email_verified: true,  is_phone_verified: false, account_status: 'active',    created_at: daysAgo(22) },
  { id: 3,  name: 'Ousmane Camara',       email: 'ousmane@example.com',  phone: '+224664778899', role: 'technician', is_active: true,  is_online: true,  is_email_verified: true,  is_phone_verified: true,  account_status: 'active',    created_at: daysAgo(60) },
  { id: 4,  name: 'Fatoumata Sylla',      email: 'fatou@example.com',    phone: '+224655223344', role: 'technician', is_active: true,  is_online: false, is_email_verified: false, is_phone_verified: false, account_status: 'active',    created_at: daysAgo(8) },
  { id: 5,  name: 'Ibrahima Sow',         email: 'sow@example.com',      phone: '+224628990011', role: 'operator',   is_active: true,  is_online: true,  is_email_verified: true,  is_phone_verified: true,  account_status: 'active',    created_at: daysAgo(120) },
  { id: 6,  name: 'Admin SOSLocal',       email: 'admin@soslocal.gn',    phone: '+224600000001', role: 'admin',      is_active: true,  is_online: true,  is_email_verified: true,  is_phone_verified: true,  account_status: 'active',    created_at: daysAgo(200) },
  { id: 7,  name: 'Compte suspendu',      email: 'spam@example.com',     phone: '+224622334455', role: 'client',     is_active: false, is_online: false, is_email_verified: true,  is_phone_verified: true,  account_status: 'suspended', created_at: daysAgo(15) },
  // ⚠️ doublon de téléphone avec l'utilisateur #2 (anomalie à corriger)
  { id: 8,  name: 'Doublon Test',         email: 'doublon@example.com',  phone: '+224 620 11 12 13', role: 'client', is_active: true, is_online: false, is_email_verified: false, is_phone_verified: false, account_status: 'active', created_at: daysAgo(2) },
]

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
      if (isMock) { await new Promise((r) => setTimeout(r, 300)); return [...mockUsers] }

      // 1) Endpoint dédié s'il existe un jour côté backend.
      try {
        const { data } = await apiClient.get<any[]>(API.ADMIN_USERS)
        if (Array.isArray(data) && data.length) return data.map(mapToUser)
      } catch { /* pas encore implémenté côté backend */ }

      // 2) Repli : le backend n'expose aujourd'hui que la liste des techniciens.
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

/**
 * Indique si la liste complète des utilisateurs est disponible côté backend.
 * Aujourd'hui FAUX en prod : seul `/technicians/admin/all` existe — les
 * bénéficiaires/opérateurs ne sont pas listables tant qu'un endpoint
 * `GET /admin/users` n'est pas ajouté côté FastAPI.
 */
export const FULL_USER_LISTING_AVAILABLE = isMock

export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: UserRole }) => {
      if (isMock) {
        await new Promise((r) => setTimeout(r, 350))
        const u = mockUsers.find((x) => x.id === id); if (u) u.role = role
        return { ok: true }
      }
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
      if (isMock) {
        await new Promise((r) => setTimeout(r, 350))
        const u = mockUsers.find((x) => x.id === id)
        if (u) { u.account_status = status; u.is_active = status === 'active' }
        return { ok: true }
      }
      const { data } = await apiClient.patch(API.ADMIN_USER_STATUS(id), { status })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

/** Crée un utilisateur — refuse côté client un téléphone déjà utilisé. */
export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation<
    User,
    Error,
    { name: string; email: string; phone: string; role: UserRole; password: string }
  >({
    mutationFn: async (payload) => {
      const canonical = normalizePhone(payload.phone)
      if (isMock) {
        await new Promise((r) => setTimeout(r, 400))
        if (mockUsers.some((u) => normalizePhone(u.phone) === canonical)) {
          throw new Error('Ce numéro de téléphone est déjà utilisé par un autre compte.')
        }
        const created: User = {
          id: Date.now(), name: payload.name, email: payload.email, phone: canonical, role: payload.role,
          is_active: true, is_online: false, is_email_verified: false, is_phone_verified: false,
          account_status: 'active', created_at: now(),
        }
        mockUsers.unshift(created)
        return created
      }
      const { data } = await apiClient.post<User>(API.ADMIN_USERS, { ...payload, phone: canonical })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}
