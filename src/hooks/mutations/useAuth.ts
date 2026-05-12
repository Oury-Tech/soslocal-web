'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginCredentials, RegisterData } from '@/types'

// ── MOCK FORCÉ PAR DÉFAUT ─────────────────────────────────────────────────────
const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_AUTH !== 'false'

export function useLogin() {
  const { login } = useAuthStore()  // ✅ Utiliser login au lieu de setAuth
  const router = useRouter()
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (user) => {
      const routes: Record<string, string> = {
        client:      '/beneficiaire',
        technician:  '/artisan',
        operator:    '/operateur',
        admin:       '/operateur',
      }
      router.push(routes[user.role] ?? '/beneficiaire')
    },
  })
}

export function useRegister() {
  const { register } = useAuthStore()  // ✅ Utiliser register au lieu de setAuth
  const router = useRouter()
  
  return useMutation({
    mutationFn: (data: RegisterData) => register(data),
    onSuccess: (user) => {
      const routes: Record<string, string> = {
        client:      '/beneficiaire',
        technician:  '/artisan',
        operator:    '/operateur',
        admin:       '/operateur',
      }
      router.push(routes[user.role] ?? '/beneficiaire')
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()  // ✅ Utiliser logout au lieu de clearAuth
  const router = useRouter()
  
  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      router.push('/')
    },
  })
}