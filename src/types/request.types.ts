import type { User } from './user.types'
import type { Service, Technician } from './technician.types'

export type RequestStatus =
  | 'pending'
  | 'matching'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed'

export type RequestPriority = 'low' | 'normal' | 'high' | 'emergency'

export interface ServiceRequest {
  id: number
  reference_number: string
  client_id: number
  client?: User
  technician_id?: number
  technician?: Technician
  service_id: number
  service?: Service
  status: RequestStatus
  priority: RequestPriority
  title: string
  description: string
  latitude: number
  longitude: number
  address?: string
  estimated_price?: number
  final_price?: number
  photos?: string[]
  scheduled_at?: string
  accepted_at?: string
  started_at?: string
  completed_at?: string
  cancelled_at?: string
  created_at: string
  updated_at?: string
}

export interface CreateRequestData {
  service_id: number
  title: string
  description: string
  latitude: number
  longitude: number
  address?: string
  priority?: RequestPriority
  photos?: string[]
}
