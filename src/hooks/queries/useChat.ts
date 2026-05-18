import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { mockApi, type MockChatRoom, type MockChatMessage } from '@/lib/mock-data'

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

export function useChatRooms() {
  return useQuery<MockChatRoom[]>({
    queryKey: ['chat', 'rooms'],
    queryFn: async () => {
      if (isMock) return mockApi.getChatRooms()
      const { data } = await apiClient.get<MockChatRoom[]>(API.CHAT_ROOMS)
      return data
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
      const { data } = await apiClient.get<MockChatMessage[]>(
        API.CHAT_MESSAGES(roomId)
      )
      return data
    },
    staleTime: 1000 * 5,
  })
}

export function useSendMessage(roomId: string | undefined) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ senderId, content }: { senderId: number; content: string }) => {
      if (!roomId) throw new Error('No roomId')
      if (isMock) return mockApi.sendChatMessage(roomId, senderId, content)
      const { data } = await apiClient.post<MockChatMessage>(
        API.CHAT_MESSAGES(roomId),
        { content }
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', 'messages', roomId] })
      qc.invalidateQueries({ queryKey: ['chat', 'rooms'] })
    },
  })
}
