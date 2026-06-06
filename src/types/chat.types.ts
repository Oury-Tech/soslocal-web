export type ChatMessageType = 'text' | 'image' | 'video' | 'file' | 'location'

export interface ChatRoom {
  id: string
  request_id: string
  participants: string[]
  last_message?: ChatMessage
  unread_count: number
  created_at: string
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  type?: ChatMessageType        // défaut: 'text'
  content: string
  media_url?: string            // image / vidéo / fichier
  file_name?: string
  latitude?: number             // partage de localisation
  longitude?: number
  read: boolean
  created_at: string
}
