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
  | 'ping'
  | 'pong'

export interface WsEvent<T = unknown> {
  type: WsEventType
  payload: T
  timestamp: string
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
