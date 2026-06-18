import type { User } from './user.types'
import type { Service, Technician } from './technician.types'

export type RequestStatus =
  | 'pending'
  | 'matched'       // backend value (was 'matching')
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'      // backend value (was 'failed')
  | 'expired'       // backend value

export type RequestPriority = 'low' | 'normal' | 'high' | 'emergency'

export interface ServiceRequest {
  id: number
  reference_number?: string    // Optional — backend uses id as identifier
  client_id: number
  client?: User                // Nested object (mock data & some endpoints)
  client_name?: string         // Flat string (backend API responses)
  client_phone?: string
  technician_id?: number
  technician?: Technician      // Nested object (mock data)
  technician_name?: string     // Flat string (backend API responses)
  technician_phone?: string
  technician_rating?: number
  service_id: number
  service?: Service            // Nested object (mock data)
  service_name?: string        // Flat string (backend API responses)
  service_category?: string
  status: RequestStatus
  priority: RequestPriority
  title: string
  description: string
  latitude: number
  longitude: number
  address?: string
  estimated_price?: number
  final_price?: number
  // Prix indicatif : l'artisan a signalé que le montant peut évoluer ; le
  // client doit confirmer le montant final avant de pouvoir payer.
  price_may_vary?: boolean
  price_confirmed_by_client?: boolean
  price_confirmed_at?: string
  photos?: string[]
  media_urls?: string[]        // Backend field name for photos
  scheduled_at?: string
  accepted_at?: string
  started_at?: string
  completed_at?: string
  cancelled_at?: string
  created_at: string
  updated_at?: string
  distance_km?: number         // From nearby/available endpoints

  // Intervention (cf. diagramme « Demandes & Matching »)
  work_log?: string            // Travaux effectués
  parts_used?: PartUsed[]      // Pièces utilisées
  follow_up_at?: string        // Suivi planifié (follow-up)

  // Paiement
  is_paid?: boolean
  payment_id?: number
}

export interface PartUsed {
  name: string
  quantity: number
  unit_price: number           // GNF
}

export interface CompleteRequestData {
  final_price: number
  work_log?: string
  parts_used?: PartUsed[]
}

export interface RescheduleRequestData {
  scheduled_at: string
  reason?: string
}

export interface CreateRequestData {
  service_id: number
  technician_id?: number       // Pre-selected technician (optional)
  title: string
  description: string
  latitude: number
  longitude: number
  address?: string
  priority?: RequestPriority
  estimated_price?: number     // Optionnel : aucun montant n'est fixé à la création
  photos?: string[]
  media_urls?: string[]        // Backend field name for diagnostic photos
}
