import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, AuthTokens, LoginCredentials, RegisterData } from '@/types'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { tokenStorage } from '@/lib/auth/token'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  /** null = not yet checked, true = approved, false = pending approval */
  technicianApproved: boolean | null
  /** null = inconnu, true = profil complété (onboarding), false = à compléter */
  technicianProfileCompleted: boolean | null

  login: (credentials: LoginCredentials, remember?: boolean) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
  refreshTechnicianStatus: () => Promise<void>

  // Cas d'usage diagramme « Authentification »
  verifyEmail: (code: string) => Promise<void>
  resendVerificationCode: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  changeEmail: (newEmail: string, password: string) => Promise<void>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>
  updateLocation: (latitude: number, longitude: number) => Promise<void>
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>
  deleteAccount: () => Promise<void>
  registerPushToken: (token: string) => Promise<void>
}

/** Champs modifiables depuis la page Profil (l'email n'est pas modifiable). */
export interface ProfileUpdatePayload {
  name?: string
  phone?: string
  bio?: string
  address?: string
  latitude?: number
  longitude?: number
}

const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

function resolveRole(data: any): User['role'] {
  const raw = String(data.role ?? data.user_role ?? data.user_type ?? '').toLowerCase()
  if (raw === 'technician' || raw === 'artisan') return 'technician'
  if (raw === 'admin' || raw === 'administrateur') return 'admin'
  if (raw === 'operator' || raw === 'operateur') return 'operator'
  if (raw === 'client' || raw === 'beneficiaire') return 'client'
  return 'client'
}

async function fetchTechnicianApprovalStatus(_userId: number): Promise<{ approved: boolean; completed: boolean }> {
  try {
    const { data } = await apiClient.get(API.ARTISAN_ME)
    return { approved: data?.is_verified ?? false, completed: data?.profile_completed ?? false }
  } catch {
    return { approved: false, completed: false }
  }
}

const mockLogin = async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
  await new Promise((r) => setTimeout(r, 600))
  const email = credentials.email.toLowerCase()
  const role: User['role'] =
    email.includes('artisan') || email.includes('tech')
      ? 'technician'
      : email.includes('admin')
      ? 'admin'
      : email.includes('operateur') || email.includes('operator')
      ? 'operator'
      : 'client'
  return {
    user: {
      id: 1,
      email: credentials.email,
      phone: '+224 627 30 60 60',
      name: credentials.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role,
      avatar_url: undefined,
      latitude: 9.6412,
      longitude: -13.5784,
      is_active: true,
      is_online: true,
      is_email_verified: true,
      is_phone_verified: true,
      created_at: new Date().toISOString(),
    },
    tokens: { access_token: 'mock-access-token', refresh_token: 'mock-refresh-token', token_type: 'bearer' },
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      technicianApproved: null,
      technicianProfileCompleted: null,

      login: async (credentials, remember = true) => {
        set({ isLoading: true, error: null })
        try {
          let result: { user: User; tokens: AuthTokens }
          if (isMockMode) {
            result = await mockLogin(credentials)
            set({ user: result.user, isAuthenticated: true, isLoading: false, technicianApproved: true })
            return result.user
          }

          const { data } = await apiClient.post(API.LOGIN, credentials)
          result = {
            user: {
              ...data.user,
              role: resolveRole(data.user),
              is_email_verified: data.user.is_verified ?? data.user.is_email_verified ?? false,
              is_phone_verified: data.user.is_phone_verified ?? false,
            },
            tokens: {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              token_type: data.token_type ?? 'bearer',
            },
          }

          tokenStorage.setTokens(result.tokens.access_token, result.tokens.refresh_token, remember)
          set({ user: result.user, isAuthenticated: true, isLoading: false })

          // Check approval + onboarding status for artisans
          if (result.user.role === 'technician') {
            const { approved, completed } = await fetchTechnicianApprovalStatus(result.user.id)
            set({ technicianApproved: approved, technicianProfileCompleted: completed })
          } else {
            set({ technicianApproved: null, technicianProfileCompleted: null })
          }

          return result.user
        } catch (err: any) {
          const detail = err?.response?.data?.detail
          const message = Array.isArray(detail)
            ? detail.map((e: any) => e.msg).join(', ')
            : detail || err?.message || 'Erreur de connexion'
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          let result: { user: User; tokens: AuthTokens }
          if (isMockMode) {
            await new Promise((r) => setTimeout(r, 800))
            result = {
              user: {
                id: Date.now(),
                email: data.email,
                phone: data.phone,
                name: data.name,
                role: data.role,
                is_active: true,
                is_online: true,
                is_email_verified: false,
                is_phone_verified: false,
                created_at: new Date().toISOString(),
              },
              tokens: { access_token: 'mock-access-token', refresh_token: 'mock-refresh-token', token_type: 'bearer' },
            }
            set({ user: result.user, isAuthenticated: true, isLoading: false, technicianApproved: data.role === 'technician' ? false : null })
            return result.user
          }

          const { data: response } = await apiClient.post(API.REGISTER, {
            email: data.email,
            phone: data.phone,
            name: data.name,
            password: data.password,
            role: data.role,
            // L'inscription artisan crée directement le profil + les services côté backend
            // (cohérence mobile↔web). On envoie aussi la position si l'utilisateur l'a partagée.
            ...(data.role === 'technician' && {
              service_ids: data.service_ids ?? [],
              profession: data.profession ?? 'Artisan',
            }),
            ...(typeof data.latitude === 'number' && { latitude: data.latitude }),
            ...(typeof data.longitude === 'number' && { longitude: data.longitude }),
          })
          result = {
            user: {
              ...response.user,
              role: resolveRole(response.user),
              is_email_verified: response.user.is_verified ?? response.user.is_email_verified ?? false,
              is_phone_verified: response.user.is_phone_verified ?? false,
            },
            tokens: {
              access_token: response.access_token,
              refresh_token: response.refresh_token,
              token_type: response.token_type ?? 'bearer',
            },
          }

          tokenStorage.setTokens(result.tokens.access_token, result.tokens.refresh_token)

          if (data.role === 'technician') {
            // Le profil artisan (profession + services + position) est désormais créé
            // par l'endpoint /auth/register. On garde un filet de sécurité au cas où
            // un ancien backend ne le ferait pas encore.
            try {
              await apiClient.post(API.TECHNICIAN_PROFILE_CREATE, {
                profession: data.profession ?? 'Artisan',
                service_ids: data.service_ids ?? [],
                max_distance_km: 10,
              })
            } catch { /* déjà créé par /auth/register → non-fatal */ }
            // New artisans always start unapproved
            set({ user: result.user, isAuthenticated: true, isLoading: false, technicianApproved: false })
          } else {
            set({ user: result.user, isAuthenticated: true, isLoading: false, technicianApproved: null })
          }

          return result.user
        } catch (err: any) {
          const detail = err?.response?.data?.detail
          const message = Array.isArray(detail)
            ? detail.map((e: any) => e.msg).join(', ')
            : detail || err?.message || "Erreur d'inscription"
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      logout: async () => {
        try {
          if (!isMockMode) await apiClient.post(API.LOGOUT)
        } catch { /* ignore */ }
        tokenStorage.clearTokens()
        set({ user: null, isAuthenticated: false, technicianApproved: null })
      },

      loadUser: async () => {
        if (!tokenStorage.hasTokens()) {
          set({ user: null, isAuthenticated: false })
          return
        }
        if (isMockMode) {
          const { user } = get()
          set({ isAuthenticated: !!user, technicianApproved: user?.role === 'technician' ? true : null })
          return
        }
        set({ isLoading: true })
        try {
          const { data } = await apiClient.get(API.ME)
          const user: User = {
            ...data,
            role: resolveRole(data),
            is_email_verified: data.is_verified ?? data.is_email_verified ?? false,
            is_phone_verified: data.is_phone_verified ?? false,
          }
          set({ user, isAuthenticated: true, isLoading: false })

          if (user.role === 'technician') {
            const { approved, completed } = await fetchTechnicianApprovalStatus(user.id)
            set({ technicianApproved: approved, technicianProfileCompleted: completed })
          } else {
            set({ technicianApproved: null, technicianProfileCompleted: null })
          }
        } catch {
          tokenStorage.clearTokens()
          set({ user: null, isAuthenticated: false, isLoading: false, technicianApproved: null, technicianProfileCompleted: null })
        }
      },

      refreshTechnicianStatus: async () => {
        const { user } = get()
        if (!user || user.role !== 'technician') return
        const { approved, completed } = await fetchTechnicianApprovalStatus(user.id)
        set({ technicianApproved: approved, technicianProfileCompleted: completed })
      },

      verifyEmail: async (code) => {
        const { user } = get()
        if (isMockMode) {
          await new Promise((r) => setTimeout(r, 500))
          if (user) set({ user: { ...user, is_email_verified: true } })
          return
        }
        await apiClient.post(API.VERIFY_EMAIL, { email: user?.email, code })
        if (user) set({ user: { ...user, is_email_verified: true } })
      },

      resendVerificationCode: async () => {
        const { user } = get()
        if (isMockMode) {
          await new Promise((r) => setTimeout(r, 400))
          return
        }
        await apiClient.post(API.RESEND_CODE, user?.email ? { email: user.email } : {})
      },

      forgotPassword: async (email) => {
        if (isMockMode) {
          await new Promise((r) => setTimeout(r, 500))
          return
        }
        await apiClient.post(API.FORGOT_PASSWORD, { email })
      },

      changePassword: async (currentPassword, newPassword) => {
        if (isMockMode) {
          await new Promise((r) => setTimeout(r, 500))
          return
        }
        await apiClient.post(API.CHANGE_PASSWORD, {
          old_password: currentPassword,
          new_password: newPassword,
        })
      },

      changeEmail: async (newEmail, password) => {
        const { user } = get()
        if (isMockMode) {
          if (user) set({ user: { ...user, email: newEmail } })
          return
        }
        const { data } = await apiClient.post(API.CHANGE_EMAIL, {
          new_email: newEmail,
          password,
        })
        // Le backend renvoie le nouvel e-mail confirmé : on met à jour le profil local.
        if (user) set({ user: { ...user, email: data?.email ?? newEmail } })
      },

      resetPassword: async (email, code, newPassword) => {
        if (isMockMode) {
          await new Promise((r) => setTimeout(r, 500))
          return
        }
        await apiClient.post(API.RESET_PASSWORD, {
          email,
          code,
          new_password: newPassword,
        })
      },

      updateLocation: async (latitude, longitude) => {
        const { user } = get()
        if (user) set({ user: { ...user, latitude, longitude } })
        if (isMockMode) return
        try {
          await apiClient.post(API.USER_LOCATION, { latitude, longitude })
        } catch { /* non-fatal */ }
      },

      updateProfile: async (payload) => {
        const { user } = get()
        // Ne garder que les champs réellement renseignés (le backend ignore l'email).
        const body: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(payload)) {
          if (v !== undefined && v !== null) body[k] = v
        }
        if (isMockMode) {
          if (user) set({ user: { ...user, ...body } as User })
          return
        }
        const { data } = await apiClient.patch(API.PROFILE_UPDATE, body)
        // Le backend renvoie le profil à jour : on fusionne en conservant le rôle résolu.
        const merged: User = {
          ...(user as User),
          ...data,
          role: resolveRole({ ...user, ...data }),
          is_email_verified: data.is_verified ?? data.is_email_verified ?? user?.is_email_verified ?? false,
          is_phone_verified: data.is_phone_verified ?? user?.is_phone_verified ?? false,
        }
        set({ user: merged })
      },

      deleteAccount: async () => {
        if (!isMockMode) {
          await apiClient.delete(API.ACCOUNT_DELETE)
        }
        tokenStorage.clearTokens()
        set({ user: null, isAuthenticated: false, technicianApproved: null })
      },

      registerPushToken: async (token) => {
        if (isMockMode || !token) return
        try {
          await apiClient.post(API.PUSH_TOKEN, { token, platform: 'web' })
        } catch { /* non-fatal */ }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'soslocal-auth',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as Storage))),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        technicianApproved: state.technicianApproved,
      }),
    }
  )
)
