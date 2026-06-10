import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi, TECHNICIANS as MOCK_TECHNICIANS, CHAT_ROOMS, type MockChatRoom, type MockChatMessage } from '@/lib/mock-data'
import { getInitials } from '@/lib/utils/format'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

function normalizeRoom(room: any): MockChatRoom {
  const other = room.other_user ?? {}
  /* Build a meaningful title: prefer "request_title" field, fallback to request_id */
  const reqTitle =
    room.request_title ??
    (room.request_id ? `Mission #${room.request_id}` : 'Discussion directe')

  return {
    id: String(room.id),
    request_id: String(room.request_id ?? ''),
    request_title: reqTitle,
    other_participant: {
      id: other.id ?? 0,
      name: other.name ?? (room.technician_name ?? room.client_name ?? 'Inconnu'),
      avatar: (other.name ?? room.technician_name ?? room.client_name)
        ? getInitials(other.name ?? room.technician_name ?? room.client_name)
        : '?',
      is_online: other.is_online ?? false,
      profession: other.profession ?? undefined,
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
    room_id: String(msg.chat_room_id ?? msg.room_id ?? ''),
    sender_id: msg.sender_id,
    content: msg.content ?? '',
    read: msg.is_read ?? msg.read ?? false,
    media_url: msg.media_url ?? null,
    message_type: msg.message_type ?? 'text',
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

type CreateRoomInput = { requestId: number } | { artisanId: number }

export function useCreateChatRoom() {
  const qc = useQueryClient()
  return useMutation<MockChatRoom, Error, CreateRoomInput>({
    mutationFn: async (input) => {
      if (isMock) {
        if ('artisanId' in input) {
          const tech = MOCK_TECHNICIANS.find((t) => t.id === input.artisanId)
          const room: MockChatRoom = {
            id: `direct-${input.artisanId}`,
            request_id: `tech-${input.artisanId}`,
            request_title: tech ? `Discussion avec ${tech.name}` : 'Discussion directe',
            other_participant: {
              id: input.artisanId,
              name: tech?.name ?? 'Artisan',
              avatar: tech?.name ? getInitials(tech.name) : 'A',
              is_online: (tech as any)?.is_available ?? false,
              profession: (tech as any)?.profession,
            },
            unread_count: 0,
            created_at: new Date().toISOString(),
          }
          if (!CHAT_ROOMS.find((r) => r.id === room.id)) CHAT_ROOMS.push(room)
          return room
        }
        return {
          id: String(input.requestId),
          request_id: String(input.requestId),
          request_title: `Mission #${input.requestId}`,
          other_participant: { id: 0, name: 'Artisan', avatar: 'A', is_online: false },
          unread_count: 0,
          created_at: new Date().toISOString(),
        }
      }

      if ('artisanId' in input) {
        const { data } = await apiClient.post<any>(API.CHAT_ROOMS, { artisan_id: input.artisanId })
        return normalizeRoom(data)
      }
      const { data } = await apiClient.post<any>(API.CHAT_ROOMS, { request_id: (input as any).requestId })
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
    mutationFn: async ({
      senderId,
      content,
      mediaUrl,
      messageType,
    }: {
      senderId: number
      content: string
      mediaUrl?: string | null
      messageType?: string
    }) => {
      if (!roomId) throw new Error('No roomId')
      if (isMock) return mockApi.sendChatMessage(roomId, senderId, content)
      const { data } = await apiClient.post<any>(API.CHAT_MESSAGES(roomId), {
        content,
        media_url: mediaUrl ?? undefined,
        message_type: messageType ?? 'text',
      })
      return normalizeMessage(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'messages', roomId] })
      qc.invalidateQueries({ queryKey: ['chat', 'rooms'] })
    },
  })
}

/** Upload d'une image de chat → renvoie l'URL persistante. */
export function useUploadChatMedia() {
  return useMutation<{ url: string; filename?: string }, Error, File>({
    mutationFn: async (file) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await apiClient.post<{ url: string; filename?: string }>(
        API.CHAT_UPLOAD,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return data
    },
  })
}
