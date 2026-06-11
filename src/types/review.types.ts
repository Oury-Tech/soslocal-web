import type { User } from './user.types'

export interface Review {
  id: number
  request_id: number
  client_id?: number
  reviewer_id?: number           // alias historique de client_id
  reviewer?: User
  client_name?: string
  client_avatar?: string
  technician_id: number
  rating: number                 // Note globale 1-5

  // Notes détaillées (cf. diagramme « Notes détaillées »)
  rating_quality?: number        // Qualité
  rating_punctuality?: number    // Ponctualité
  rating_price?: number          // Prix
  // Champs détaillés historiques (mock / backend)
  quality_rating?: number
  professionalism_rating?: number
  punctuality_rating?: number
  communication_rating?: number
  value_rating?: number
  would_recommend?: boolean

  comment?: string
  photos?: string[]              // alias historique
  images?: string[]              // Photos avant / après (backend)

  // Réponse du technicien
  technician_response?: string
  responded_at?: string

  // Votes utile / pas utile
  helpful_count?: number
  not_helpful_count?: number
  my_vote?: 'helpful' | 'not_helpful' | null

  is_reported?: boolean
  created_at: string
  updated_at?: string
  /** Fenêtre de modification de 7 jours — calculée côté client si absente. */
  editable_until?: string
}

export interface CreateReviewData {
  request_id: number
  technician_id?: number
  rating: number
  // Critères détaillés — noms alignés sur le backend (web↔mobile).
  quality_rating?: number
  professionalism_rating?: number
  punctuality_rating?: number
  communication_rating?: number
  value_rating?: number
  would_recommend?: boolean
  comment?: string
  /** Photos avant / après — URLs renvoyées par POST /media/upload. */
  images?: string[]
}

export type UpdateReviewData = Partial<
  Pick<
    CreateReviewData,
    | 'rating'
    | 'quality_rating'
    | 'professionalism_rating'
    | 'punctuality_rating'
    | 'communication_rating'
    | 'value_rating'
    | 'would_recommend'
    | 'comment'
    | 'images'
  >
>
