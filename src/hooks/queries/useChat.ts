import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi, type MockChatRoom, type MockChatMessage } from '@/lib/mock-data'
import { getInitials } from '@/lib/utils/format'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

function normalizeRoom(room: any): MockChatRoom {
  const other = room.other_user ?? {}
  return {
    id: String(room.id),
    request_id: String(room.request_id),
    request_title: `Mission #${room.request_id}`,
    other_participant: {
      id: other.id ?? 0,
      name: other.name ?? 'Inconnu',
      avatar: other.name ? getInitials(other.name) : '?',
      is_online: other.is_online ?? false,
    },
    last_message: room.last_message
      ? {
          id: String(room.last_message.id),
          room_id: String(room.id),
          sender_id: room.last_message.sender_id,
          content: room.last_message.content,
          read: false,
          created_at:
            typeof room.last_message.created_at === 'string'
              ? room.last_message.created_at
              : new Date(room.last_message.created_at).toISOString(),
        }
      : undefined,
    unread_count: room.unread_count ?? 0,
    created_at:
      typeof room.created_at === 'string'
        ? room.created_at
        : new Date(room.created_at).toISOString(),
  }
}

function normalizeMessage(msg: any): MockChatMessage {
  return {
    id: String(msg.id),
    room_id: String(msg.chat_room_id),
    sender_id: msg.sender_id,
    content: msg.content,
    read: msg.is_read ?? false,
    created_at:
      typeof msg.created_at === 'string'
        ? msg.created_at
        : new Date(msg.created_at).toISOString(),
  }
}

export function useChatRooms() {
  return useQuery<MockChatRoom[]>({
    queryKey: ['chat', 'rooms'],
    queryFn: async () => {
      if (isMock) return mockApi.getChatRooms()
      const { data } = await apiClient.get<any[]>(API.CHAT_ROOMS)
      const list = Array.isArray(data) ? data : []
      return list.map(normalizeRoom)
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  })
}

export function useChatMessages(roomId: string | undefined) {
  return useQuery<MockChatMessage[]>({
    queryKey: ['chat', 'messages', roomId],
    enabled: !!roomId,
    queryFn: async () => {
      if (!roomId) return []
      if (isMock) return mockApi.getChatMessages(roomId)
      const { data } = await apiClient.get<any[]>(API.CHAT_MESSAGES(roomId))
      const list = Array.isArray(data) ? data : []
      return list.map(normalizeMessage)
    },
    staleTime: 1000 * 5,
  })
}

export function useCreateChatRoom() {
  const qc = useQueryClient()
  return useMutation<MockChatRoom, Error, number>({
    mutationFn: async (requestId: number) => {
      if (isMock) {
        return {
          id: String(requestId),
          request_id: String(requestId),
          request_title: `Mission #${requestId}`,
          other_participant: { id: 0, name: 'Artisan', avatar: 'A', is_online: false },
          unread_count: 0,
          created_at: new Date().toISOString(),
        }
      }
      const { data } = await apiClient.post<any>(API.CHAT_ROOMS, { request_id: requestId })
      return normalizeRoom(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'rooms'] })
    },
  })
}

export function useSendMessage(roomId: string | undefined) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ senderId, content }: { senderId: number; content: string }) => {
      if (!roomId) throw new Error('No roomId')
      if (isMock) return mockApi.sendChatMessage(roomId, senderId, content)
      const { data } = await apiClient.post<any>(API.CHAT_MESSAGES(roomId), { content })
      return normalizeMessage(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'messages', roomId] })
      qc.invalidateQueries({ queryKey: ['chat', 'rooms'] })
    },
  })
}
