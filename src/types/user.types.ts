export type UserRole = 'client' | 'technician' | 'operator' | 'admin'

/** État du compte côté administration. */
export type AccountStatus = 'active' | 'suspended' | 'banned'

export interface User {
  id: number
  email: string
  phone: string
  name: string
  role: UserRole
  avatar_url?: string
  bio?: string
  address?: string
  latitude?: number
  longitude?: number
  is_active: boolean
  is_online: boolean
  is_email_verified: boolean
  is_phone_verified: boolean
  /** Défaut : 'active'. 'suspended' = accès bloqué temporairement, 'banned' = définitif. */
  account_status?: AccountStatus
  created_at: string
  updated_at?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  phone: string
  name: string
  password: string
  role: UserRole
  service_ids?: number[]
  profession?: string
  latitude?: number
  longitude?: number
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}
