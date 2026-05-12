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
  content: string
  read: boolean
  created_at: string
}
