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

  login: (credentials: LoginCredentials) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
}

const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

/** Normalise le rôle depuis différents champs backend possibles */
function resolveRole(data: any): User['role'] {
  const raw = data.role ?? data.user_role ?? data.user_type ?? ''
  if (raw === 'technician' || raw === 'artisan') return 'technician'
  if (raw === 'operator' || raw === 'admin' || raw === 'operateur') return 'operator'
  if (raw === 'client' || raw === 'beneficiaire') return 'client'
  return 'client'
}

/** Mock pour développement sans backend */
const mockLogin = async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
  await new Promise((r) => setTimeout(r, 600))
  const email = credentials.email.toLowerCase()
  const role: User['role'] =
    email.includes('artisan') || email.includes('tech')
      ? 'technician'
      : email.includes('operateur') || email.includes('admin') || email.includes('operator')
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

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          let result: { user: User; tokens: AuthTokens }
          if (isMockMode) {
            result = await mockLogin(credentials)
          } else {
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
          }
          tokenStorage.setTokens(result.tokens.access_token, result.tokens.refresh_token)
          set({ user: result.user, isAuthenticated: true, isLoading: false })
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
          } else {
            const { data: response } = await apiClient.post(API.REGISTER, data)
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
          }
          tokenStorage.setTokens(result.tokens.access_token, result.tokens.refresh_token)
          set({ user: result.user, isAuthenticated: true, isLoading: false })
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
        } catch {
          // ignore
        }
        tokenStorage.clearTokens()
        set({ user: null, isAuthenticated: false })
      },

      loadUser: async () => {
        if (!tokenStorage.hasTokens()) {
          set({ user: null, isAuthenticated: false })
          return
        }
        if (isMockMode) {
          const { user } = get()
          set({ isAuthenticated: !!user })
          return
        }
        set({ isLoading: true })
        try {
          const { data } = await apiClient.get(API.ME)
          set({
            user: {
              ...data,
              role: resolveRole(data),
              is_email_verified: data.is_verified ?? data.is_email_verified ?? false,
              is_phone_verified: data.is_phone_verified ?? false,
            },
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          tokenStorage.clearTokens()
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'soslocal-auth',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as Storage))),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
