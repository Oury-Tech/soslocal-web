'use client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginPayload, RegisterPayload, AuthResponse, User, AuthTokens } from '@/types'

// ── MOCK FORCÉ PAR DÉFAUT ─────────────────────────────────────────────────────
// Passe à false uniquement quand le backend FastAPI est prêt
const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH !== 'false'

const MOCK_USERS: Record<string, { role: 'beneficiaire' | 'artisan' | 'operateur'; name: string }> = {
  'beneficiaire@test.com': { role: 'beneficiaire', name: 'Mariama Diallo' },
  'artisan@test.com':      { role: 'artisan',       name: 'Ibrahima Sow'   },
  'operateur@test.com':    { role: 'operateur',     name: 'Fatoumata Barry'},
}

function makeMockResponse(email: string, name: string, role: 'beneficiaire' | 'artisan' | 'operateur'): AuthResponse {
  const user: User = {
    id:         'mock-' + Math.random().toString(36).slice(2),
    email,
    phone:      '+224 620 000 000',
    full_name:  name,
    role,
    status:     'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const tokens: AuthTokens = {
    access_token:  'mock_access_' + Date.now(),
    refresh_token: 'mock_refresh_' + Date.now(),
    token_type:    'bearer',
  }
  return { user, tokens }
}

async function mockLogin(payload: LoginPayload): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 700))
  const known = MOCK_USERS[payload.email]
  const role  = known?.role ?? 'beneficiaire'
  const name  = known?.name ?? payload.email.split('@')[0]
  return makeMockResponse(payload.email, name, role)
}

async function mockRegister(payload: RegisterPayload): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 800))
  return makeMockResponse(payload.email, payload.full_name, payload.role as 'beneficiaire' | 'artisan' | 'operateur')
}

async function apiCall(endpoint: string, payload: unknown): Promise<AuthResponse> {
  const { default: apiClient } = await import('@/lib/api/axios')
  const { data } = await apiClient.post<AuthResponse>(endpoint, payload)
  return data
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const router = useRouter()
  return useMutation({
    mutationFn: (p: LoginPayload) =>
      IS_MOCK ? mockLogin(p) : apiCall('/auth/login', p),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens)
      const routes: Record<string, string> = {
        beneficiaire: '/beneficiaire',
        artisan:      '/artisan',
        operateur:    '/operateur',
      }
      router.push(routes[data.user.role] ?? '/beneficiaire')
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const router = useRouter()
  return useMutation({
    mutationFn: (p: RegisterPayload) =>
      IS_MOCK ? mockRegister(p) : apiCall('/auth/register', p),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens)
      router.push(`/${data.user.role}`)
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const router = useRouter()
  return useMutation({
    mutationFn: async () => {
      if (!IS_MOCK) {
        const { default: apiClient } = await import('@/lib/api/axios')
        await apiClient.post('/auth/logout').catch(() => {})
      }
    },
    onSettled: () => {
      clearAuth()
      router.push('/')
    },
  })
}
