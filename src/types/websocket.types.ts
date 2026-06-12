// ============================================================
// WebSocket event types — cohérent avec le backend FastAPI
// ============================================================

export type WsEventType =
  | 'request.matched'
  | 'request.accepted'
  | 'request.started'
  | 'request.completed'
  | 'request.cancelled'
  | 'technician.location_update'
  | 'chat.message'
  | 'notification.push'
  // Évènements réellement émis par le backend (/realtime/ws/notifications)
  | 'notification'
  | 'artisan_location'
  | 'ping'
  | 'pong'

export interface WsEvent<T = unknown> {
  type: WsEventType
  payload?: T
  timestamp?: string
  // Champs du backend `notification`
  event?: string | null
  title?: string
  body?: string
  entity_type?: string | null
  entity_id?: number | null
  data?: Record<string, unknown>
  // Champs du backend `artisan_location`
  request_id?: number
  technician_id?: number
  lat?: number
  lng?: number
}

export interface WsArtisanLocation {
  request_id: number
  technician_id: number
  lat: number
  lng: number
}

export interface WsTechnicianLocation {
  technician_id: string
  lat: number
  lng: number
}

export interface WsRequestUpdate {
  request_id: string
  status: string
  technician_id?: string
}

export type WsConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'
