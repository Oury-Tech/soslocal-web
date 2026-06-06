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

export function useAdminUsers() {
  return useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      if (isMock) { await new Promise((r) => setTimeout(r, 300)); return [...mockUsers] }
      const { data } = await apiClient.get<User[]>(API.ADMIN_USERS)
      return Array.isArray(data) ? data : []
    },
  })
}

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
