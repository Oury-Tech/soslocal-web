import type { User } from './user.types'

export interface Service {
  id: number
  name: string
  slug: string
  description?: string
  category: string
  icon?: string
  color?: string
  estimated_price_min?: number
  estimated_price_max?: number
  average_duration?: number
  is_emergency: boolean
  is_active: boolean
}

export interface Technician extends User {
  profession: string
  bio?: string
  rating: number
  total_reviews: number
  total_jobs_completed: number
  completion_rate: number
  is_available: boolean
  is_verified: boolean
  max_distance_km: number
  hourly_rate?: number
  services?: Service[]
}

// Le type `Review` est désormais centralisé dans review.types.ts
